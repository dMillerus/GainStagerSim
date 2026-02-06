/**
 * switches.js - Switch control handling
 */

/**
 * Switch configuration
 * Maps switch IDs to their state keys
 * type: 'toggle' for boolean switches, 'three-position' for bright switches
 */
const switchConfig = {
    'loop-bypass': { stateKey: 'loopEnabled', default: true, type: 'toggle' },
    'send-bright': { stateKey: 'sendBright', default: false, type: 'toggle' },
    'return-bright': { stateKey: 'returnBright', default: false, type: 'toggle' },
    'focus': { stateKey: 'focus', default: false, type: 'toggle' },
    'bright1': { stateKey: 'bright1', default: 'off', type: 'three-position' },
    'bright2': { stateKey: 'bright2', default: 'off', type: 'three-position' }
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
        if (config.type === 'toggle') {
            if (config.default) {
                el.classList.add('active');
                el.dataset.state = 'ON';
            }
        } else if (config.type === 'three-position') {
            el.dataset.state = config.default.toUpperCase();
        }

        const handleClick = () => {
            if (config.type === 'toggle') {
                const currentState = el.classList.contains('active');
                const newState = !currentState;

                // Sync both main and SF versions
                syncSwitch(id, newState);

                // Notify state change
                onUpdate(config.stateKey, newState);
            } else if (config.type === 'three-position') {
                const currentState = el.dataset.state?.toLowerCase() || 'off';
                const nextState = cycleThreePosition(currentState);

                // Sync both main and SF versions
                syncThreePosition(id, nextState);

                // Notify state change
                onUpdate(config.stateKey, nextState);
            }
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

            if (config.type === 'toggle') {
                const currentState = mainEl.classList.contains('active');
                const newState = !currentState;

                // Sync both versions
                syncSwitch(mirrorId, newState);

                // Notify state change
                onUpdate(config.stateKey, newState);
            } else if (config.type === 'three-position') {
                const currentState = mainEl.dataset.state?.toLowerCase() || 'off';
                const nextState = cycleThreePosition(currentState);

                // Sync both versions
                syncThreePosition(mirrorId, nextState);

                // Notify state change
                onUpdate(config.stateKey, nextState);
            }
        };

        sw.addEventListener('click', handleClick);
        cleanupFns.push(() => sw.removeEventListener('click', handleClick));
    });

    return () => cleanupFns.forEach(fn => fn());
}

/**
 * Cycle through three-position switch states
 * @param {string} currentState - Current state ('off', 'subtle', 'aggressive')
 * @returns {string} Next state
 */
function cycleThreePosition(currentState) {
    const states = ['off', 'subtle', 'aggressive'];
    const currentIndex = states.indexOf(currentState);
    const nextIndex = (currentIndex + 1) % states.length;
    return states[nextIndex];
}

/**
 * Sync three-position switch state between main and SF versions
 * @param {string} baseId - Base switch ID (without -sf)
 * @param {string} state - New state ('off', 'subtle', 'aggressive')
 */
export function syncThreePosition(baseId, state) {
    const mainEl = document.getElementById(baseId);
    const sfEl = document.getElementById(`${baseId}-sf`);

    [mainEl, sfEl].forEach(el => {
        if (el) {
            el.dataset.state = state.toUpperCase();
            // Add visual classes based on state
            el.classList.toggle('active', state !== 'off');
            el.classList.toggle('subtle', state === 'subtle');
            el.classList.toggle('aggressive', state === 'aggressive');
        }
    });
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
