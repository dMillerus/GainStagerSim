/**
 * signal-chain.js - Signal chain calculation
 * Traces signal through all 21+ stages
 */

import { tubeStages, eraLoss, pickupLevels, cableLoss, brightBoost, recoveryCompensation } from '../config/amp-config.js';
import { logTaper, linearTaper, softClip, tonestackMod, nfbGain, eraModifiedTaper, roundLevel } from './gain-math.js';

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
    if (s.bright1) {
        level += brightBoost.mid;
    }
    addStage('Gain 1', level, gain1Atten + (s.bright1 ? brightBoost.mid : 0), 0, 'preamp');

    // Stage 6: V1b (second gain stage)
    const v1b = tubeStages.v1b;
    level += v1b.gain;
    clip = softClip(level, v1b.threshold, v1b.knee);
    level = clip.clamped;
    addStage('V1b', level, v1b.gain, clip.drive, 'preamp', v1b.threshold);

    // Stage 7: Gain 2 pot + Bright 2 switch
    const gain2Atten = logTaper(s.gain2);
    level += gain2Atten;
    if (s.bright2) {
        level += brightBoost.high;
    }
    addStage('Gain 2', level, gain2Atten + (s.bright2 ? brightBoost.high : 0), 0, 'preamp');

    // Stage 8: V2a (third gain stage)
    const v2a = tubeStages.v2a;
    level += v2a.gain;
    clip = softClip(level, v2a.threshold, v2a.knee);
    level = clip.clamped;
    addStage('V2a', level, v2a.gain, clip.drive, 'preamp', v2a.threshold);

    // Stage 9: Tonestack (ERA-dependent loss)
    const tonestackLoss = eraLoss[s.era];
    const toneMod = tonestackMod(s.bass, s.middle, s.treble);
    const totalToneLoss = tonestackLoss + toneMod;
    level += totalToneLoss;
    addStage('Tonestack', level, totalToneLoss, 0, 'preamp');

    // Stage 10: V2b (fourth gain stage / recovery)
    const v2b = tubeStages.v2b;
    level += v2b.gain;
    clip = softClip(level, v2b.threshold, v2b.knee);
    level = clip.clamped;
    addStage('V2b', level, v2b.gain, clip.drive, 'preamp', v2b.threshold);

    const preampOutput = level;

    // FX Loop Section (Klein-ulator)
    if (s.loopEnabled) {
        // Stage 11: FX Send level
        const sendLevel = linearTaper(s.send);
        level += sendLevel;
        addStage('Send', level, sendLevel, 0, 'fxloop');

        // Stage 12: Send bright switch
        if (s.sendBright) {
            level += brightBoost.mid;
            addStage('Send Brt', level, brightBoost.mid, 0, 'fxloop');
        }

        // Stage 13: FX Loop out (to pedals) - assume unity gain external
        addStage('Loop Out', level, 0, 0, 'fxloop');

        // Stage 14: FX Return level
        const returnLevel = linearTaper(s.return);
        level += returnLevel;
        addStage('Return', level, returnLevel, 0, 'fxloop');

        // Stage 15: Return bright switch
        if (s.returnBright) {
            level += brightBoost.high;
            addStage('Ret Brt', level, brightBoost.high, 0, 'fxloop');
        }

        // Stage 16: Recovery stage (compensation at noon)
        const recoveryGain = linearTaper(s.recovery) + recoveryCompensation;
        level += recoveryGain;
        addStage('Recovery', level, recoveryGain, 0, 'fxloop');
    }

    // Power Section

    // Stage 17: Master volume
    let masterTaper = logTaper(s.master);
    masterTaper = eraModifiedTaper(masterTaper, s.era);
    level += masterTaper;
    addStage('Master', level, masterTaper, 0, 'power');

    // Stage 18: Focus switch (slight presence boost)
    if (s.focus) {
        level += 1.0;
        addStage('Focus', level, 1.0, 0, 'power');
    }

    // Stage 19: Presence - high frequency negative feedback
    const presenceGain = nfbGain(s.presence);
    level += presenceGain;
    addStage('Presence', level, presenceGain, 0, 'power');

    // Stage 20: Resonance - low frequency negative feedback
    const resonanceGain = nfbGain(s.resonance);
    level += resonanceGain;
    addStage('Resonance', level, resonanceGain, 0, 'power');

    // Stage 21: Phase Inverter
    const pi = tubeStages.pi;
    level += pi.gain;
    clip = softClip(level, pi.threshold, pi.knee);
    level = clip.clamped;
    addStage('PI', level, pi.gain, clip.drive, 'power', pi.threshold);

    // Stage 22: Power tubes (4×EL34)
    const power = tubeStages.power;
    const pussyMod = (s.pussyTrimmer - 10) * 0.2;
    level += power.gain + pussyMod;
    clip = softClip(level, power.threshold, power.knee);
    level = clip.clamped;
    addStage('Power', level, power.gain + pussyMod, clip.drive, 'power', power.threshold);

    // Stage 23: Captor X output
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
