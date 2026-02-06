/**
 * switches.js - Switch control handling
 */

/**
 * Switch configuration
 * Maps switch IDs to their state keys
 */
const switchConfig = {
    'loop-bypass': { stateKey: 'loopEnabled', default: true },
    'send-bright': { stateKey: 'sendBright', default: false },
    'return-bright': { stateKey: 'returnBright', default: false },
    'focus': { stateKey: 'focus', default: false },
    'bright1': { stateKey: 'bright1', default: false },
    'bright2': { stateKey: 'bright2', default: false }
};

/**
 * Setup switch controls
 * @param {Function} onUpdate - Callback when switch state changes
 * @returns {Function} Cleanup function
 */
export function setupSwitches(onUpdate) {
    const cleanupFns = [];

    // Setup main switches
    Object.entries(switchConfig).forEach(([id, config]) => {
        const el = document.getElementById(id);
        if (!el) return;

        // Set initial state
        if (config.default) {
            el.classList.add('active');
            el.dataset.state = 'ON';
        }

        const handleClick = () => {
            const currentState = el.classList.contains('active');
            const newState = !currentState;

            // Sync both main and SF versions
            syncSwitch(id, newState);

            // Notify state change
            onUpdate(config.stateKey, newState);
        };

        el.addEventListener('click', handleClick);
        cleanupFns.push(() => el.removeEventListener('click', handleClick));
    });

    // Setup mirrored SF switches
    document.querySelectorAll('.switch-sf').forEach(sw => {
        const mirrorId = sw.dataset.mirror;
        if (!mirrorId || !switchConfig[mirrorId]) return;

        const config = switchConfig[mirrorId];

        const handleClick = () => {
            const mainEl = document.getElementById(mirrorId);
            if (!mainEl) return;

            const currentState = mainEl.classList.contains('active');
            const newState = !currentState;

            // Sync both versions
            syncSwitch(mirrorId, newState);

            // Notify state change
            onUpdate(config.stateKey, newState);
        };

        sw.addEventListener('click', handleClick);
        cleanupFns.push(() => sw.removeEventListener('click', handleClick));
    });

    return () => cleanupFns.forEach(fn => fn());
}

/**
 * Sync switch state between main and SF versions
 * @param {string} baseId - Base switch ID (without -sf)
 * @param {boolean} state - New state
 */
export function syncSwitch(baseId, state) {
    const mainEl = document.getElementById(baseId);
    const sfEl = document.getElementById(`${baseId}-sf`);

    [mainEl, sfEl].forEach(el => {
        if (el) {
            el.dataset.state = state ? 'ON' : 'OFF';
            el.classList.toggle('active', state);
        }
    });
}

/**
 * Get current switch state
 * @param {string} id - Switch ID
 * @returns {boolean} Current state
 */
export function getSwitchState(id) {
    const el = document.getElementById(id);
    return el ? el.classList.contains('active') : false;
}

/**
 * Set switch state programmatically
 * @param {string} id - Switch ID
 * @param {boolean} state - New state
 */
export function setSwitchState(id, state) {
    syncSwitch(id, state);
}

export default {
    setupSwitches,
    syncSwitch,
    getSwitchState,
    setSwitchState,
    switchConfig
};
