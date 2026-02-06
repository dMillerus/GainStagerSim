/**
 * knobs.js - Knob interaction handling
 */

import { getStateKey } from '../core/state.js';

/**
 * Setup knob controls
 * @param {Function} onUpdate - Callback when knob value changes
 * @returns {Function} Cleanup function
 */
export function setupKnobs(onUpdate) {
    const knobs = document.querySelectorAll('.knob');
    const cleanupFns = [];

    knobs.forEach(knob => {
        let isDragging = false;
        let startY, startValue;

        const updateKnob = (value, fromMirror = false) => {
            const min = parseFloat(knob.dataset.min);
            const max = parseFloat(knob.dataset.max);
            value = Math.max(min, Math.min(max, value));
            knob.dataset.value = value;

            // Rotate indicator (-135° to 135° for 0-10)
            const rotation = -135 + (value / max) * 270;
            knob.style.setProperty('--knob-rotation', `${rotation}deg`);

            // Update display value
            const valueEl = document.getElementById(`${knob.id}-value`);
            if (valueEl) valueEl.textContent = value.toFixed(value % 1 === 0 ? 0 : 1);

            // Mirror to paired control
            if (!fromMirror && knob.dataset.mirror) {
                const mirrorKnob = document.getElementById(knob.dataset.mirror);
                if (mirrorKnob) {
                    mirrorKnob.dataset.value = value;
                    const mirrorRotation = -135 + (value / max) * 270;
                    mirrorKnob.style.setProperty('--knob-rotation', `${mirrorRotation}deg`);
                    const mirrorValueEl = document.getElementById(`${knob.dataset.mirror}-value`);
                    if (mirrorValueEl) mirrorValueEl.textContent = value.toFixed(value % 1 === 0 ? 0 : 1);
                }
            } else if (!fromMirror) {
                // Check if this is the main control and update SF version
                const sfKnob = document.getElementById(`${knob.id}-sf`);
                if (sfKnob) {
                    sfKnob.dataset.value = value;
                    const sfRotation = -135 + (value / max) * 270;
                    sfKnob.style.setProperty('--knob-rotation', `${sfRotation}deg`);
                    const sfValueEl = document.getElementById(`${knob.id}-sf-value`);
                    if (sfValueEl) sfValueEl.textContent = value.toFixed(value % 1 === 0 ? 0 : 1);
                }
            }

            // Notify state change
            const stateKey = getStateKey(knob.id);
            onUpdate(stateKey, value);
        };

        // Set initial rotation
        const initialValue = parseFloat(knob.dataset.value);
        const max = parseFloat(knob.dataset.max);
        const rotation = -135 + (initialValue / max) * 270;
        knob.style.setProperty('--knob-rotation', `${rotation}deg`);

        const handleMouseDown = (e) => {
            isDragging = true;
            startY = e.clientY;
            startValue = parseFloat(knob.dataset.value);
            e.preventDefault();
        };

        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const deltaY = startY - e.clientY;
            const sensitivity = 0.05;
            const newValue = startValue + deltaY * sensitivity;
            updateKnob(newValue);
        };

        const handleMouseUp = () => {
            isDragging = false;
        };

        const handleDoubleClick = () => {
            updateKnob(5);
        };

        knob.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        knob.addEventListener('dblclick', handleDoubleClick);

        cleanupFns.push(() => {
            knob.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            knob.removeEventListener('dblclick', handleDoubleClick);
        });
    });

    // Add CSS for knob rotation
    addKnobStyles();

    return () => cleanupFns.forEach(fn => fn());
}

/**
 * Add knob rotation CSS
 */
function addKnobStyles() {
    if (document.getElementById('knob-rotation-styles')) return;

    const style = document.createElement('style');
    style.id = 'knob-rotation-styles';
    style.textContent = `
        .knob::after {
            transform: translateX(-50%) rotate(var(--knob-rotation, 0deg));
        }
    `;
    document.head.appendChild(style);
}

/**
 * Set knob value programmatically
 * @param {string} knobId - Knob element ID
 * @param {number} value - New value
 */
export function setKnobValue(knobId, value) {
    const knob = document.getElementById(knobId);
    if (!knob) return;

    const max = parseFloat(knob.dataset.max);
    knob.dataset.value = value;
    const rotation = -135 + (value / max) * 270;
    knob.style.setProperty('--knob-rotation', `${rotation}deg`);

    const valueEl = document.getElementById(`${knobId}-value`);
    if (valueEl) valueEl.textContent = value.toFixed(value % 1 === 0 ? 0 : 1);
}

export default {
    setupKnobs,
    setKnobValue
};
