/**
 * selectors.js - Pickup, ERA, and Captor selector handling
 */

/**
 * Setup pickup selector
 * @param {Function} onUpdate - Callback when pickup changes
 * @returns {Function} Cleanup function
 */
export function setupPickupSelector(onUpdate) {
    const cleanupFns = [];

    // Setup both AMP and SF pickup selectors
    ['pickup-selector', 'pickup-selector-sf'].forEach(selectorId => {
        const selector = document.getElementById(selectorId);
        if (!selector) return;

        const positions = selector.querySelectorAll('.pickup-pos');

        positions.forEach(pos => {
            const handleClick = () => {
                // Update all pickup selectors
                document.querySelectorAll('.pickup-selector .pickup-pos').forEach(p =>
                    p.classList.remove('active'));
                document.querySelectorAll(`.pickup-pos[data-pos="${pos.dataset.pos}"]`).forEach(p =>
                    p.classList.add('active'));

                const pickup = pos.dataset.pos;
                const label = capitalize(pickup);

                // Update labels
                const mainLabel = document.getElementById('pickup-value');
                const sfLabel = document.getElementById('pickup-value-sf');
                if (mainLabel) mainLabel.textContent = label;
                if (sfLabel) sfLabel.textContent = label;

                onUpdate('pickup', pickup);
            };

            pos.addEventListener('click', handleClick);
            cleanupFns.push(() => pos.removeEventListener('click', handleClick));
        });
    });

    return () => cleanupFns.forEach(fn => fn());
}

/**
 * Setup ERA switches
 * @param {Function} onUpdate - Callback when ERA changes
 * @returns {Function} Cleanup function
 */
export function setupEraSwitches(onUpdate) {
    const cleanupFns = [];

    // Setup both AMP and SF era switches
    ['era-switch', 'era-switch-sf'].forEach(containerId => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const positions = container.querySelectorAll('.era-pos');

        positions.forEach(pos => {
            const handleClick = () => {
                // Update all era switches
                document.querySelectorAll('.era-switch .era-pos').forEach(p =>
                    p.classList.remove('active'));
                document.querySelectorAll(`.era-pos[data-era="${pos.dataset.era}"]`).forEach(p =>
                    p.classList.add('active'));

                onUpdate('era', pos.dataset.era);
            };

            pos.addEventListener('click', handleClick);
            cleanupFns.push(() => pos.removeEventListener('click', handleClick));
        });
    });

    return () => cleanupFns.forEach(fn => fn());
}

/**
 * Setup Captor X attenuation switches
 * @param {Function} onUpdate - Callback when attenuation changes
 * @returns {Function} Cleanup function
 */
export function setupCaptorSwitches(onUpdate) {
    const cleanupFns = [];

    // Setup both AMP and SF captor switches
    ['captor-atten', 'captor-atten-sf'].forEach(containerId => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const positions = container.querySelectorAll('.captor-pos');

        positions.forEach(pos => {
            const handleClick = () => {
                // Update all captor switches
                document.querySelectorAll('.captor-switch .captor-pos').forEach(p =>
                    p.classList.remove('active'));
                document.querySelectorAll(`.captor-pos[data-atten="${pos.dataset.atten}"]`).forEach(p =>
                    p.classList.add('active'));

                onUpdate('captorAtten', parseFloat(pos.dataset.atten));
            };

            pos.addEventListener('click', handleClick);
            cleanupFns.push(() => pos.removeEventListener('click', handleClick));
        });
    });

    return () => cleanupFns.forEach(fn => fn());
}

/**
 * Set pickup selection programmatically
 * @param {string} pickup - 'neck', 'middle', or 'bridge'
 */
export function setPickup(pickup) {
    document.querySelectorAll('.pickup-selector .pickup-pos').forEach(p =>
        p.classList.remove('active'));
    document.querySelectorAll(`.pickup-pos[data-pos="${pickup}"]`).forEach(p =>
        p.classList.add('active'));

    const label = capitalize(pickup);
    const mainLabel = document.getElementById('pickup-value');
    const sfLabel = document.getElementById('pickup-value-sf');
    if (mainLabel) mainLabel.textContent = label;
    if (sfLabel) sfLabel.textContent = label;
}

/**
 * Set ERA selection programmatically
 * @param {string} era - 'plexi', '80s', or 'modern'
 */
export function setEra(era) {
    document.querySelectorAll('.era-switch .era-pos').forEach(p =>
        p.classList.remove('active'));
    document.querySelectorAll(`.era-pos[data-era="${era}"]`).forEach(p =>
        p.classList.add('active'));
}

/**
 * Set Captor attenuation programmatically
 * @param {number} atten - 0, -12, or -38
 */
export function setCaptorAtten(atten) {
    document.querySelectorAll('.captor-switch .captor-pos').forEach(p =>
        p.classList.remove('active'));
    document.querySelectorAll(`.captor-pos[data-atten="${atten}"]`).forEach(p =>
        p.classList.add('active'));
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
    setupPickupSelector,
    setupEraSwitches,
    setupCaptorSwitches,
    setPickup,
    setEra,
    setCaptorAtten
};
