/**
 * signal-chain.js - Signal chain calculation
 * Traces signal through all 21+ stages
 */

import { tubeStages, eraClipping, baseTonestackLoss, pickupLevels, cableLoss, brightBoost, recoveryCompensation } from '../config/amp-config.js';
import { logTaper, linearTaper, softClip, asymSoftClip, diodeClip, tonestackMod, nfbGain, eraModifiedTaper, roundLevel, pussyTrimTaper } from './gain-math.js';

/**
 * Stage data structure
 * @typedef {Object} Stage
 * @property {string} name - Stage name
 * @property {number} level - Output level in dBV
 * @property {number} gain - Stage gain in dB
 * @property {number} drive - Compression/drive amount
 * @property {string} section - Section: 'input', 'preamp', 'fxloop', 'power', 'output'
 * @property {number|null} threshold - Clipping threshold if tube stage
 */

/**
 * Calculate the full signal chain
 * @param {Object} state - Current application state
 * @returns {Object} { stages: Stage[], preampOutput: number, finalOutput: number }
 */
export function calculateSignalChain(state) {
    const stages = [];
    const s = state;

    /**
     * Add a stage to the results
     */
    function addStage(name, level, gain, drive, section, threshold = null) {
        stages.push({
            name,
            level: roundLevel(level),
            gain: roundLevel(gain),
            drive: roundLevel(drive),
            section,
            threshold
        });
    }

    // Stage 1: Guitar pickup output
    let level = pickupLevels[s.pickup];
    addStage('Pickup', level, 0, 0, 'input');

    // Stage 2: Guitar volume pot
    const guitarVolAtten = logTaper(s.guitarVolume);
    level += guitarVolAtten;
    addStage('Gtr Vol', level, guitarVolAtten, 0, 'input');

    // Stage 3: Input jack (cable loss)
    level -= cableLoss;
    addStage('Input', level, -cableLoss, 0, 'input');

    // Stage 4: V1a (first gain stage)
    const v1a = tubeStages.v1a;
    level += v1a.gain;
    let clip = softClip(level, v1a.threshold, v1a.knee);
    level = clip.clamped;
    addStage('V1a', level, v1a.gain, clip.drive, 'preamp', v1a.threshold);

    // Stage 5: Gain 1 pot + Bright 1 switch
    const gain1Atten = logTaper(s.gain1);
    level += gain1Atten;
    let bright1Boost = 0;
    if (s.bright1 === 'subtle') bright1Boost = brightBoost.subtle;
    if (s.bright1 === 'aggressive') bright1Boost = brightBoost.aggressive;
    level += bright1Boost;
    addStage('Gain 1', level, gain1Atten + bright1Boost, 0, 'preamp');

    // Stage 6: V1b (second gain stage)
    const v1b = tubeStages.v1b;
    level += v1b.gain;
    clip = softClip(level, v1b.threshold, v1b.knee);
    level = clip.clamped;
    addStage('V1b', level, v1b.gain, clip.drive, 'preamp', v1b.threshold);

    // Stage 7: Gain 2 pot + Bright 2 switch
    const gain2Atten = logTaper(s.gain2);
    level += gain2Atten;
    let bright2Boost = 0;
    if (s.bright2 === 'subtle') bright2Boost = brightBoost.subtle;
    if (s.bright2 === 'aggressive') bright2Boost = brightBoost.aggressive;
    level += bright2Boost;
    addStage('Gain 2', level, gain2Atten + bright2Boost, 0, 'preamp');

    // Stage 8: Pussy Trim (V2a grid shunt - variable resistor to ground)
    const pussyTrimAtten = pussyTrimTaper(s.pussyTrimmer);
    level += pussyTrimAtten;
    addStage('Pussy Trim', level, pussyTrimAtten, 0, 'preamp');

    // Stage 9: V2a (third gain stage)
    const v2a = tubeStages.v2a;
    level += v2a.gain;
    clip = softClip(level, v2a.threshold, v2a.knee);
    level = clip.clamped;
    addStage('V2a', level, v2a.gain, clip.drive, 'preamp', v2a.threshold);

    // Stage 10: V2b (cathode follower - unity gain buffer)
    const v2b = tubeStages.v2b;
    level += v2b.gain;  // 0 dB gain (unity buffer)
    // Cathode followers don't clip like gain stages - they provide impedance buffering
    if (v2b.type === 'cathode-follower') {
        // Unity gain buffer - no clipping
        addStage('V2b', level, v2b.gain, 0, 'preamp', null);
    } else {
        // Legacy path (shouldn't execute with corrected config)
        clip = softClip(level, v2b.threshold, v2b.knee);
        level = clip.clamped;
        addStage('V2b', level, v2b.gain, clip.drive, 'preamp', v2b.threshold);
    }

    // Stage 11: ERA Diode Clipping (post-V2b, pre-Master)
    const eraConfig = eraClipping[s.era];
    if (eraConfig.enabled) {
        const eraClip = diodeClip(level, eraConfig.threshold, 'symmetrical');
        level = eraClip.clamped;
        const eraLabel = s.era === '80s' ? 'ERA (80s)' : 'ERA (Mod)';
        addStage(eraLabel, level, 0, eraClip.drive, 'preamp');
    } else {
        // Plexi mode - bypass (no clipping)
        addStage('ERA (60s)', level, 0, 0, 'preamp');
    }

    // Stage 12: Master volume (pre-tonestack master)
    const masterTaper = logTaper(s.master);
    level += masterTaper;
    addStage('Master', level, masterTaper, 0, 'preamp');

    // Stage 13: Tonestack (fixed base loss + EQ modification)
    const toneMod = tonestackMod(s.bass, s.middle, s.treble);
    const totalToneLoss = baseTonestackLoss + toneMod;
    level += totalToneLoss;
    addStage('Tonestack', level, totalToneLoss, 0, 'preamp');

    // Preamp output marker (after tonestack, before FX loop)
    const preampOutput = level;

    // FX Loop Section (Klein-ulator)
    if (s.loopEnabled) {
        // Stage 14: FX Send level
        const sendLevel = linearTaper(s.send);
        level += sendLevel;
        addStage('Send', level, sendLevel, 0, 'fxloop');

        // Stage 15: Send bright switch
        if (s.sendBright) {
            level += brightBoost.mid;
            addStage('Send Brt', level, brightBoost.mid, 0, 'fxloop');
        }

        // Stage 16: FX Loop out (to pedals) - assume unity gain external
        addStage('Loop Out', level, 0, 0, 'fxloop');

        // Stage 17: FX Return level
        const returnLevel = linearTaper(s.return);
        level += returnLevel;
        addStage('Return', level, returnLevel, 0, 'fxloop');

        // Stage 18: Return bright switch
        if (s.returnBright) {
            level += brightBoost.high;
            addStage('Ret Brt', level, brightBoost.high, 0, 'fxloop');
        }

        // Stage 19: Recovery stage (compensation at noon)
        const recoveryGain = linearTaper(s.recovery) + recoveryCompensation;
        level += recoveryGain;
        addStage('Recovery', level, recoveryGain, 0, 'fxloop');
    }

    // Power Section

    // Stage 20: Focus switch (slight presence boost)
    if (s.focus) {
        level += 1.0;
        addStage('Focus', level, 1.0, 0, 'power');
    }

    // Stage 21: Presence - high frequency negative feedback
    const presenceGain = nfbGain(s.presence);
    level += presenceGain;
    addStage('Presence', level, presenceGain, 0, 'power');

    // Stage 22: Resonance - low frequency negative feedback
    const resonanceGain = nfbGain(s.resonance);
    level += resonanceGain;
    addStage('Resonance', level, resonanceGain, 0, 'power');

    // Stage 23: Phase Inverter
    const pi = tubeStages.pi;
    level += pi.gain;
    clip = softClip(level, pi.threshold, pi.knee);
    level = clip.clamped;
    addStage('PI', level, pi.gain, clip.drive, 'power', pi.threshold);

    // Stage 24: Power tubes (4×EL34) — cathode-biased, asymmetric clipping
    const power = tubeStages.power;
    level += power.gain;
    clip = asymSoftClip(level, power.threshold, power.knee);
    level = clip.clamped;
    addStage('Power', level, power.gain, clip.drive, 'power', power.threshold);

    // Stage 25: Captor X output
    level += s.captorAtten;
    addStage('Captor X', level, s.captorAtten, 0, 'output');

    return {
        stages,
        preampOutput,
        finalOutput: level
    };
}

/**
 * Get stages for a specific section
 * @param {Stage[]} stages - All stages
 * @param {string} section - Section name
 * @returns {Stage[]} Filtered stages
 */
export function getStagesBySection(stages, section) {
    return stages.filter(s => s.section === section);
}

/**
 * Get all clipping stages
 * @param {Stage[]} stages - All stages
 * @returns {Stage[]} Stages with drive > 0
 */
export function getClippingStages(stages) {
    return stages.filter(s => s.drive > 0);
}

/**
 * Get heavily clipping stages
 * @param {Stage[]} stages - All stages
 * @returns {Stage[]} Stages with drive > 3
 */
export function getHeavyClippingStages(stages) {
    return stages.filter(s => s.drive > 3);
}

/**
 * Find a stage by name
 * @param {Stage[]} stages - All stages
 * @param {string} name - Stage name
 * @returns {Stage|undefined}
 */
export function findStage(stages, name) {
    return stages.find(s => s.name === name);
}

export default calculateSignalChain;
