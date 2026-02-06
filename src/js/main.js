/**
 * main.js - Application entry point
 * Gain Staging Simulator v5
 * Ceriatone Chupacabra 100W + Klein-ulator Buffered FX Loop
 */

// Config
import { defaultState } from './config/amp-config.js';

// Core
import { calculateSignalChain } from './core/signal-chain.js';

// UI
import { initMeters, updateMeters } from './ui/meters.js';
import { updateSummary } from './ui/summary.js';
import { updateSignalFlowIndicators } from './ui/signal-flow.js';

// Controls
import { setupKnobs } from './controls/knobs.js';
import { setupSwitches } from './controls/switches.js';
import { setupPickupSelector, setupEraSwitches, setupCaptorSwitches } from './controls/selectors.js';
import { setupViewToggle, setupMeterPanelToggle } from './controls/view-toggle.js';

/**
 * GainStagingSimulator class
 * Main application controller
 */
class GainStagingSimulator {
    constructor() {
        // Initialize state from defaults
        this.state = { ...defaultState };

        // Stage results storage
        this.stages = [];

        // Debounce timer
        this.updateTimer = null;

        // Cleanup functions for event listeners
        this.cleanupFns = [];

        this.init();
    }

    /**
     * Initialize the simulator
     */
    init() {
        // Setup controls with state update callback
        const onStateUpdate = (key, value) => {
            this.state[key] = value;
            this.scheduleUpdate();
        };

        // Setup all control handlers
        this.cleanupFns.push(setupKnobs(onStateUpdate));
        this.cleanupFns.push(setupSwitches(onStateUpdate));
        this.cleanupFns.push(setupPickupSelector(onStateUpdate));
        this.cleanupFns.push(setupEraSwitches(onStateUpdate));
        this.cleanupFns.push(setupCaptorSwitches(onStateUpdate));
        this.cleanupFns.push(setupViewToggle(onStateUpdate));
        this.cleanupFns.push(setupMeterPanelToggle(onStateUpdate));

        // Initialize meter strips
        initMeters();

        // Initial calculation
        this.calculate();
    }

    /**
     * Schedule a debounced update
     */
    scheduleUpdate() {
        if (this.updateTimer) clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(() => this.calculate(), 50);
    }

    /**
     * Calculate signal chain and update UI
     */
    calculate() {
        // Calculate signal chain
        const result = calculateSignalChain(this.state);
        this.stages = result.stages;

        // Update all UI components
        updateMeters(this.stages);
        updateSignalFlowIndicators(this.stages);
        updateSummary(this.stages, result.preampOutput, result.finalOutput, this.state);
    }

    /**
     * Get current state (read-only copy)
     * @returns {Object}
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Get current stages (read-only copy)
     * @returns {Array}
     */
    getStages() {
        return [...this.stages];
    }

    /**
     * Cleanup all event listeners
     */
    destroy() {
        this.cleanupFns.forEach(fn => {
            if (typeof fn === 'function') fn();
        });
        this.cleanupFns = [];

        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
            this.updateTimer = null;
        }
    }
}

// Initialize - modules are deferred so DOM is already ready
function init() {
    console.log('init() called, readyState:', document.readyState);
    setTimeout(() => {
        try {
            console.log('Creating GainStagingSimulator...');
            window.gainSimulator = new GainStagingSimulator();
            console.log('GainStagingSimulator initialized successfully');
        } catch (e) {
            console.error('Failed to initialize:', e);
        }
    }, 100);
}

// Handle both cases: DOM already ready or still loading
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

export default GainStagingSimulator;
