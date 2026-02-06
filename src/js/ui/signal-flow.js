/**
 * signal-flow.js - Signal flow view indicators
 */

import { formatLevel } from '../core/gain-math.js';
import { findStage } from '../core/signal-chain.js';

/**
 * Map of stage names to signal flow indicator element IDs
 */
const stageElementMap = {
    'Input': 'sf-level-input',
    'V1a': 'sf-level-v1a',
    'V1b': 'sf-level-v1b',
    'Pussy Trim': 'sf-level-pt',
    'V2a': 'sf-level-v2a',
    'V2b': 'sf-level-v2b',
    'Master': 'sf-level-master',
    'Tonestack': 'sf-level-tonestack',
    'Loop Out': 'sf-level-loopout',
    'Recovery': 'sf-level-recovery',
    'PI': 'sf-level-pi',
    'Power': 'sf-level-power',
    'Captor X': 'sf-level-captor'
};

/**
 * Get level class based on dBV value
 * @param {number} level - dBV level
 * @returns {string} CSS class name
 */
function getLevelClass(level) {
    if (level < 20) return 'clean';
    if (level < 35) return 'warm';
    if (level < 40) return 'hot';
    return 'clipping';
}

/**
 * Update signal flow view stage indicators
 * @param {Stage[]} stages - Calculated stage results
 */
export function updateSignalFlowIndicators(stages) {
    stages.forEach(stage => {
        const elId = stageElementMap[stage.name];
        if (elId) {
            const el = document.getElementById(elId);
            if (el) {
                el.textContent = formatLevel(stage.level, 0);
                // Apply color coding based on level
                el.className = 'dbv-level ' + getLevelClass(stage.level);
            }
        }
    });
}

/**
 * Get indicator element for a stage
 * @param {string} stageName - Stage name
 * @returns {HTMLElement|null}
 */
export function getIndicatorElement(stageName) {
    const elId = stageElementMap[stageName];
    return elId ? document.getElementById(elId) : null;
}

/**
 * Clear all signal flow indicators
 */
export function clearSignalFlowIndicators() {
    Object.values(stageElementMap).forEach(elId => {
        const el = document.getElementById(elId);
        if (el) {
            el.textContent = '--';
        }
    });
}

export default {
    updateSignalFlowIndicators,
    getIndicatorElement,
    clearSignalFlowIndicators,
    stageElementMap
};
