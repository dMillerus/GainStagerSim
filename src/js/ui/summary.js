/**
 * summary.js - Summary panel and tone recommendation
 */

import { formatLevel } from '../core/gain-math.js';
import { getClippingStages, getHeavyClippingStages } from '../core/signal-chain.js';

/**
 * Update summary panel display
 * @param {Stage[]} stages - All calculated stages
 * @param {number} preampOutput - Level after preamp (dBV)
 * @param {number} finalOutput - Final output level (dBV)
 * @param {Object} state - Current application state
 */
export function updateSummary(stages, preampOutput, finalOutput, state) {
    const inputLevel = stages[0]?.level || -6;
    const totalGain = finalOutput - inputLevel;

    // Input level
    const inputEl = document.getElementById('summary-input');
    const inputDetailEl = document.getElementById('summary-input-detail');
    if (inputEl) {
        inputEl.textContent = `${formatLevel(inputLevel, 1)} dBV`;
    }
    if (inputDetailEl) {
        inputDetailEl.textContent = `${capitalize(state.pickup)} pickup`;
    }

    // Preamp output
    const preampEl = document.getElementById('summary-preamp');
    if (preampEl) {
        preampEl.textContent = `${formatLevel(preampOutput, 1)} dBV`;
    }

    // Final output
    const outputEl = document.getElementById('summary-output');
    if (outputEl) {
        outputEl.textContent = `${formatLevel(finalOutput, 1)} dBV`;
    }

    // Total gain
    const gainEl = document.getElementById('summary-gain');
    if (gainEl) {
        gainEl.textContent = `${formatLevel(totalGain, 1)} dB`;
    }

    // Generate tone recommendation
    generateToneRecommendation(stages, state);

    // Generate stage list
    generateStageList(stages);
}

/**
 * Generate tone recommendation text
 * @param {Stage[]} stages - All calculated stages
 * @param {Object} state - Current application state
 */
export function generateToneRecommendation(stages, state) {
    const s = state;
    const clippingStages = getClippingStages(stages);
    const heavyClipping = getHeavyClippingStages(stages);

    let tone = '';

    if (clippingStages.length === 0) {
        tone = 'Clean signal path — no tube saturation. Increase gain controls for preamp distortion.';
    } else if (heavyClipping.length > 3) {
        tone = `Heavily saturated tone with ${heavyClipping.length} stages in hard clipping. `;
        tone += 'Expect compressed dynamics and thick distortion. ';
        if (s.era === 'modern') tone += 'Modern voicing adds tight low-end definition.';
        else if (s.era === 'plexi') tone += 'Plexi voicing provides open, dynamic response.';
        else tone += "'80s voicing balances crunch with clarity.";
    } else if (clippingStages.length > 0) {
        tone = `${clippingStages.length} stage(s) in soft clipping — `;

        const preampClipping = clippingStages.filter(st =>
            ['V1a', 'V1b', 'V2a', 'V2b'].includes(st.name));
        const powerClipping = clippingStages.filter(st =>
            ['PI', 'Power'].includes(st.name));

        if (preampClipping.length > 0 && powerClipping.length > 0) {
            tone += 'blend of preamp grit and power section compression. Classic high-gain tone.';
        } else if (preampClipping.length > 0) {
            tone += 'preamp-driven distortion with clean power section. Tight and articulate.';
        } else {
            tone += 'power section breakup with clean preamp. Fat, dynamic crunch.';
        }
    }

    // Add presence/resonance info
    if (s.presence !== 5 || s.resonance !== 5) {
        tone += ` NFB shaping: `;
        if (s.presence > 5) tone += 'boosted highs';
        else if (s.presence < 5) tone += 'reduced highs';
        if (s.presence !== 5 && s.resonance !== 5) tone += ', ';
        if (s.resonance > 5) tone += 'boosted lows';
        else if (s.resonance < 5) tone += 'reduced lows';
        tone += '.';
    }

    if (s.loopEnabled && (s.sendBright || s.returnBright)) {
        tone += ' FX loop bright switches add presence to the signal.';
    }

    if (s.bright1 || s.bright2) {
        tone += ' Preamp bright switches engaged for added sparkle.';
    }

    const toneTextEl = document.getElementById('tone-text');
    if (toneTextEl) {
        toneTextEl.textContent = tone;
    }
}

/**
 * Generate stage list HTML
 * @param {Stage[]} stages - All calculated stages
 */
export function generateStageList(stages) {
    const listEl = document.getElementById('stage-list');
    if (!listEl) return;

    let html = '<strong>Signal Path:</strong> ';

    html += stages.map(s => {
        const levelStr = formatLevel(s.level, 0);
        if (s.drive > 3) {
            return `<span class="clipping">${s.name}(${levelStr}▲${s.drive.toFixed(0)})</span>`;
        } else if (s.drive > 0) {
            return `<span class="clipping">${s.name}(${levelStr})</span>`;
        }
        return `<span class="clean">${s.name}(${levelStr})</span>`;
    }).join(' → ');

    listEl.innerHTML = html;
}

/**
 * Capitalize first letter
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export default {
    updateSummary,
    generateToneRecommendation,
    generateStageList
};
