/**
 * gain-math.js - Pure math functions for gain calculations
 * All levels in dBV
 */

/**
 * Log taper pot simulation
 * Simulates the response curve of an audio (logarithmic) taper potentiometer
 * @param {number} value - Pot position (0-10)
 * @returns {number} Attenuation in dB
 */
export function logTaper(value) {
    if (value <= 0) return -60;
    return 20 * Math.log10(Math.pow(value / 10, 2));
}

/**
 * Linear taper pot simulation
 * Used for certain controls like send/return levels
 * @param {number} value - Pot position (0-10)
 * @returns {number} Gain in dB (-10 to +10 range)
 */
export function linearTaper(value) {
    return (value / 10) * 20 - 10;
}

/**
 * Soft clip function with tanh compression
 * Models tube saturation behavior
 * @param {number} level - Input level in dBV
 * @param {number} threshold - Clipping threshold in dBV
 * @param {number} knee - Knee width in dB (default 6)
 * @returns {Object} { clamped: output level, raw: input level, drive: compression amount }
 */
export function softClip(level, threshold, knee = 6) {
    const onset = threshold - knee;

    if (level <= onset) {
        return { clamped: level, raw: level, drive: 0 };
    }

    const excess = level - onset;
    const normalized = excess / knee;
    const compressed = Math.tanh(normalized) * knee;
    const clamped = onset + compressed;
    const drive = level - clamped;

    return { clamped, raw: level, drive };
}

/**
 * Asymmetric soft clip for EL34 cathode-biased output stage
 * EL34 power tubes clip asymmetrically — positive and negative half-cycles
 * compress at different rates due to cathode bias operating point.
 * @param {number} level - Input level in dBV
 * @param {number} threshold - Nominal clipping threshold in dBV
 * @param {number} knee - Knee width in dB (default 8)
 * @param {number} asymmetry - Fractional threshold offset per half-cycle (default 0.15)
 * @returns {Object} { clamped, raw, drive }
 */
export function asymSoftClip(level, threshold, knee = 8, asymmetry = 0.15) {
    // Positive peaks clip ~15% earlier; negative peaks clip ~15% later
    const adjustedThreshold = level >= 0
        ? threshold * (1 - asymmetry)
        : threshold * (1 + asymmetry);
    return softClip(level, adjustedThreshold, knee);
}

/**
 * Get clipping state for LED color
 * @param {number} drive - Amount of compression/drive in dB
 * @param {number} level - Current level in dBV
 * @param {number} threshold - Stage threshold in dBV
 * @returns {string} LED state: 'red', 'orange', 'yellow', 'green', or ''
 */
export function getClipState(drive, level, threshold) {
    if (drive > 6) return 'red';
    if (drive > 3) return 'orange';
    if (drive > 0.5) return 'yellow';
    if (level > threshold - 10) return 'green';
    return '';
}

/**
 * Calculate tonestack modification based on EQ settings
 * @param {number} bass - Bass control (0-10)
 * @param {number} middle - Middle control (0-10)
 * @param {number} treble - Treble control (0-10)
 * @returns {number} Modification in dB
 */
export function tonestackMod(bass, middle, treble) {
    const bassEffect   = (bass   - 5) * 0.3;  // ±1.5 dB — broad shelf, moderate level impact
    const midEffect    = (middle - 5) * 1.0;  // ±5.0 dB — Marshall mid scoop dominates level
    const trebleEffect = (treble - 5) * 0.4;  // ±2.0 dB — treble presence
    return bassEffect + midEffect + trebleEffect;
}

/**
 * Calculate presence/resonance gain modification
 * @param {number} value - Control value (0-10)
 * @returns {number} Gain in dB (±3 range)
 */
export function nfbGain(value) {
    // Real NFB networks have diminishing returns at extremes — tanh provides
    // the same ±3 dB range as the old linear formula but compresses at the limits.
    const normalized = (value - 5) / 5;  // -1.0 to +1.0
    return Math.tanh(normalized) * 3;    // ±3 dB range, compressed at extremes (~±2.76 dB at 0/10)
}

/**
 * @deprecated ERA diodes are upstream of the master volume pot and do not
 * affect its taper curve. This function has no circuit basis and is no longer
 * called. Retained for API compatibility only.
 * @param {number} masterTaper - Base master taper value
 * @param {string} era - ERA switch position (ignored)
 * @returns {number} masterTaper unchanged
 */
export function eraModifiedTaper(masterTaper, era) {
    return masterTaper;
}

/**
 * Diode clipping model for back-to-back diode pairs
 * Models hard clipping behavior of diodes to ground (ERA switch)
 * @param {number} level - Input level in dBV
 * @param {number} threshold - Diode forward voltage threshold in dBV
 * @param {string} type - 'symmetrical' or 'asymmetrical' (default symmetrical)
 * @returns {Object} { clamped: output level, raw: input level, drive: clipping amount }
 */
export function diodeClip(level, threshold, type = 'symmetrical') {
    // Silicon diodes have an exponential knee — knee=2 gives snappier character
    // than tube stages (knee=6) while remaining softer than a hard brick-wall clip.
    // The `type` parameter is retained for API compatibility but not used.
    return softClip(level, threshold, 2);
}

/**
 * Pussy Trim taper - variable resistor to ground on V2a grid
 * At 10: 0 dB (signal passes through)
 * At 0: Full cut (-40 dB, effectively silent)
 * Uses log curve since it's a voltage divider with pot to ground
 * @param {number} value - Pot position (0-10)
 * @returns {number} Attenuation in dB (0 to -40)
 */
export function pussyTrimTaper(value) {
    if (value <= 0) return -40;  // Full cut
    if (value >= 10) return 0;   // No cut
    // Log taper for voltage divider behavior
    return 20 * Math.log10(value / 10);
}

/**
 * Round to one decimal place
 * @param {number} value
 * @returns {number}
 */
export function roundLevel(value) {
    return Math.round(value * 10) / 10;
}

/**
 * Format level for display
 * @param {number} level - Level in dBV
 * @param {number} decimals - Number of decimal places (default 1)
 * @returns {string} Formatted string with sign
 */
export function formatLevel(level, decimals = 1) {
    const formatted = level.toFixed(decimals);
    return level >= 0 ? `+${formatted}` : formatted;
}

/**
 * Calculate meter bar height percentage
 * @param {number} level - Level in dBV
 * @param {number} minLevel - Minimum display level (default -60)
 * @param {number} range - Total display range (default 110)
 * @returns {number} Height percentage (0-100)
 */
export function meterBarHeight(level, minLevel = -60, range = 110) {
    return Math.max(0, Math.min(100, ((level - minLevel) / range) * 100));
}
