/**
 * meters.js - Meter panel rendering
 */

import { stageCounts } from '../config/amp-config.js';
import { getClipState, meterBarHeight, formatLevel } from '../core/gain-math.js';
import { getStagesBySection } from '../core/signal-chain.js';

/**
 * Create meter strip elements in the DOM
 * @param {Object} containers - Map of section names to container elements
 */
export function createMeterStrips(containers) {
    // Clear existing
    Object.values(containers).forEach(el => {
        if (el) el.innerHTML = '';
    });

    // Create placeholder meters based on max possible stages
    Object.entries(stageCounts).forEach(([section, count]) => {
        const container = containers[section];
        if (!container) return;

        for (let i = 0; i < count; i++) {
            const meter = document.createElement('div');
            meter.className = 'meter';
            meter.dataset.section = section;
            meter.dataset.index = i;
            meter.innerHTML = `
                <span class="meter-name">--</span>
                <div class="clip-led"></div>
                <div class="meter-bar-container">
                    <div class="meter-bar" style="height: 0%"></div>
                </div>
                <span class="meter-value">--</span>
                <span class="meter-drive"></span>
            `;
            container.appendChild(meter);
        }
    });
}

/**
 * Get meter container elements by ID
 * @returns {Object} Map of section names to container elements
 */
export function getMeterContainers() {
    return {
        input: document.getElementById('meter-group-input'),
        preamp: document.getElementById('meter-group-preamp'),
        fxloop: document.getElementById('meter-group-fxloop'),
        power: document.getElementById('meter-group-power'),
        output: document.getElementById('meter-group-output')
    };
}

/**
 * Update all meter displays
 * @param {Stage[]} stages - Calculated stage results
 */
export function updateMeters(stages) {
    const sections = ['input', 'preamp', 'fxloop', 'power', 'output'];

    sections.forEach(section => {
        const container = document.getElementById(`meter-group-${section}`);
        if (!container) return;

        const meters = container.querySelectorAll('.meter');
        const sectionStages = getStagesBySection(stages, section);

        meters.forEach((meter, i) => {
            if (i < sectionStages.length) {
                const stage = sectionStages[i];
                meter.style.display = 'flex';

                // Update name
                meter.querySelector('.meter-name').textContent = stage.name;

                // Update LED
                const led = meter.querySelector('.clip-led');
                led.className = 'clip-led';
                const clipState = getClipState(stage.drive, stage.level, stage.threshold || 50);
                if (clipState) led.classList.add(clipState);

                // Update bar
                const barHeight = meterBarHeight(stage.level);
                meter.querySelector('.meter-bar').style.height = `${barHeight}%`;

                // Update value
                meter.querySelector('.meter-value').textContent = formatLevel(stage.level, 1);

                // Update drive indicator
                const driveEl = meter.querySelector('.meter-drive');
                driveEl.textContent = stage.drive > 0 ? `▲${stage.drive.toFixed(1)}` : '';
            } else {
                meter.style.display = 'none';
            }
        });
    });
}

/**
 * Initialize meter panel with containers
 */
export function initMeters() {
    const containers = getMeterContainers();
    createMeterStrips(containers);
}

export default {
    createMeterStrips,
    getMeterContainers,
    updateMeters,
    initMeters
};
