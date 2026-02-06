/**
 * view-toggle.js - View mode and meter panel toggle handling
 */

/**
 * Setup view mode toggle
 * @param {Function} onUpdate - Callback when view mode changes
 * @returns {Function} Cleanup function
 */
export function setupViewToggle(onUpdate) {
    const toggle = document.getElementById('view-toggle');
    if (!toggle) return () => {};

    const options = toggle.querySelectorAll('.view-option');
    const cleanupFns = [];

    options.forEach(opt => {
        const handleClick = () => {
            options.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');

            const viewMode = opt.dataset.view;
            document.body.dataset.view = viewMode;

            onUpdate('viewMode', viewMode);
        };

        opt.addEventListener('click', handleClick);
        cleanupFns.push(() => opt.removeEventListener('click', handleClick));
    });

    return () => cleanupFns.forEach(fn => fn());
}

/**
 * Setup meter panel toggle
 * @param {Function} onUpdate - Callback when panel visibility changes
 * @returns {Function} Cleanup function
 */
export function setupMeterPanelToggle(onUpdate) {
    const toggle = document.getElementById('meter-panel-toggle');
    const panel = document.getElementById('meter-panel');

    if (!toggle || !panel) return () => {};

    const handleClick = () => {
        const isVisible = toggle.classList.contains('active');
        const newVisibility = !isVisible;

        toggle.dataset.state = newVisibility ? 'ON' : 'OFF';
        toggle.classList.toggle('active', newVisibility);
        panel.classList.toggle('hidden', !newVisibility);
        document.body.classList.toggle('meter-panel-hidden', !newVisibility);

        onUpdate('meterPanelVisible', newVisibility);
    };

    toggle.addEventListener('click', handleClick);

    return () => toggle.removeEventListener('click', handleClick);
}

/**
 * Set view mode programmatically
 * @param {string} mode - 'amp' or 'signal'
 */
export function setViewMode(mode) {
    const toggle = document.getElementById('view-toggle');
    if (!toggle) return;

    const options = toggle.querySelectorAll('.view-option');
    options.forEach(o => o.classList.remove('active'));

    const targetOption = toggle.querySelector(`.view-option[data-view="${mode}"]`);
    if (targetOption) {
        targetOption.classList.add('active');
    }

    document.body.dataset.view = mode;
}

/**
 * Set meter panel visibility programmatically
 * @param {boolean} visible - Whether panel should be visible
 */
export function setMeterPanelVisible(visible) {
    const toggle = document.getElementById('meter-panel-toggle');
    const panel = document.getElementById('meter-panel');

    if (toggle) {
        toggle.dataset.state = visible ? 'ON' : 'OFF';
        toggle.classList.toggle('active', visible);
    }

    if (panel) {
        panel.classList.toggle('hidden', !visible);
    }

    document.body.classList.toggle('meter-panel-hidden', !visible);
}

/**
 * Get current view mode
 * @returns {string} 'amp' or 'signal'
 */
export function getViewMode() {
    return document.body.dataset.view || 'amp';
}

/**
 * Get meter panel visibility
 * @returns {boolean}
 */
export function isMeterPanelVisible() {
    const toggle = document.getElementById('meter-panel-toggle');
    return toggle ? toggle.classList.contains('active') : true;
}

export default {
    setupViewToggle,
    setupMeterPanelToggle,
    setViewMode,
    setMeterPanelVisible,
    getViewMode,
    isMeterPanelVisible
};
