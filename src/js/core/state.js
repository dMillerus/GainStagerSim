/**
 * state.js - Application state management
 */

import { defaultState } from '../config/amp-config.js';

/**
 * Create a fresh copy of the default state
 * @returns {Object} New state object
 */
export function createInitialState() {
    return { ...defaultState };
}

/**
 * State manager class
 * Provides controlled access to application state with change notification
 */
export class StateManager {
    constructor(initialState = null) {
        this._state = initialState || createInitialState();
        this._listeners = [];
    }

    /**
     * Get current state (read-only copy)
     */
    get state() {
        return { ...this._state };
    }

    /**
     * Get a specific state value
     * @param {string} key - State key
     * @returns {*} State value
     */
    get(key) {
        return this._state[key];
    }

    /**
     * Set a state value
     * @param {string} key - State key
     * @param {*} value - New value
     */
    set(key, value) {
        const oldValue = this._state[key];
        if (oldValue !== value) {
            this._state[key] = value;
            this._notifyListeners(key, value, oldValue);
        }
    }

    /**
     * Update multiple state values at once
     * @param {Object} updates - Key-value pairs to update
     */
    update(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            this.set(key, value);
        });
    }

    /**
     * Toggle a boolean state value
     * @param {string} key - State key
     * @returns {boolean} New value
     */
    toggle(key) {
        const newValue = !this._state[key];
        this.set(key, newValue);
        return newValue;
    }

    /**
     * Reset state to defaults
     */
    reset() {
        this._state = createInitialState();
        this._notifyListeners('*', this._state, null);
    }

    /**
     * Subscribe to state changes
     * @param {Function} listener - Callback function(key, newValue, oldValue)
     * @returns {Function} Unsubscribe function
     */
    subscribe(listener) {
        this._listeners.push(listener);
        return () => {
            const index = this._listeners.indexOf(listener);
            if (index > -1) {
                this._listeners.splice(index, 1);
            }
        };
    }

    /**
     * Notify all listeners of a state change
     * @private
     */
    _notifyListeners(key, newValue, oldValue) {
        this._listeners.forEach(listener => {
            try {
                listener(key, newValue, oldValue);
            } catch (e) {
                console.error('State listener error:', e);
            }
        });
    }
}

/**
 * Map control IDs to state keys
 * Handles kebab-case to camelCase conversion
 */
export const controlToStateKey = {
    'guitar-volume': 'guitarVolume',
    'pussy-trimmer': 'pussyTrimmer',
    'loop-bypass': 'loopEnabled',
    'send-bright': 'sendBright',
    'return-bright': 'returnBright',
    'gain1': 'gain1',
    'gain2': 'gain2',
    'bright1': 'bright1',
    'bright2': 'bright2',
    'send': 'send',
    'return': 'return',
    'recovery': 'recovery',
    'master': 'master',
    'focus': 'focus',
    'presence': 'presence',
    'resonance': 'resonance',
    'bass': 'bass',
    'middle': 'middle',
    'treble': 'treble'
};

/**
 * Get state key from control ID
 * @param {string} controlId - DOM element ID
 * @returns {string} State key
 */
export function getStateKey(controlId) {
    // Remove -sf suffix for signal flow controls
    const baseId = controlId.replace(/-sf$/, '');

    // Check explicit mapping first
    if (controlToStateKey[baseId]) {
        return controlToStateKey[baseId];
    }

    // Convert kebab-case to camelCase
    return baseId.replace(/-([a-z])/g, (m, c) => c.toUpperCase());
}

export default StateManager;
