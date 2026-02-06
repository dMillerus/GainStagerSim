/**
 * amp-config.js - Amplifier configuration constants
 * Ceriatone Chupacabra 100W + Klein-ulator settings
 *
 * CIRCUIT TOPOLOGY: Marshall '59 Super Lead + Jose Arredondo + Ceriatone Mods
 * ----------------------------------------------------------------------------
 * - V1a, V1b, V2a: Cascaded gain stages (Jose "firebreathing" mod)
 * - V2b: CATHODE FOLLOWER (unity gain buffer, drives tone stack)
 * - ERA: Switchable diode clipping (Plexi/80s/Modern voicing)
 * - Master: PRE-tonestack gain control (Chupacabra-specific design)
 * - Tonestack: Passive EQ network
 * - FX Loop: Taps from tonestack output (Klein-ulator buffered loop)
 * - PI: Long-tail pair phase inverter
 * - Power: 4×EL34 cathode-biased output section
 *
 * CHUPACABRA-SPECIFIC FEATURES:
 * - Pre-tonestack Master (differs from some Jose kits, verified via FX loop behavior)
 * - Modern ERA mode clips earliest (12 dBV), Plexi loosest (bypass)
 * - Pussy Trimmer: Grid shunt attenuator between Gain2 and V2a (Ceriatone feature)
 * - Focus Switch: +1.0 dB boost pre-PI (Ceriatone feature)
 *
 * CORRECTIONS MADE:
 * - V2b corrected to cathode follower (was incorrectly modeled as +30dB gain stage)
 */

/**
 * Tube stage configurations
 * Each stage has gain (dB), threshold (dBV), knee (dB), name, and optional type
 */
export const tubeStages = {
    v1a:   { gain: 35, threshold: 38, knee: 6, name: 'V1a' },
    v1b:   { gain: 30, threshold: 32, knee: 6, name: 'V1b' },
    v2a:   { gain: 35, threshold: 38, knee: 6, name: 'V2a' },
    v2b:   { gain: 0,  threshold: null, knee: null, name: 'V2b', type: 'cathode-follower' },  // Unity gain buffer
    pi:    { gain: 20, threshold: 40, knee: 6, name: 'PI' },
    power: { gain: 26, threshold: 44, knee: 8, name: 'Power' }
};

/**
 * ERA switch diode clipping configuration
 * Located POST-V2b, PRE-Master volume
 * Back-to-back diode pairs to ground for symmetrical clipping
 */
export const eraClipping = {
    plexi: { enabled: false, threshold: 0 },    // Bypass - no diodes, straight through
    '80s': { enabled: true, threshold: 18.0 },  // Orange diodes - moderate clipping
    modern: { enabled: true, threshold: 12.0 }  // Purple diodes - heavy clipping
};

/**
 * Base tonestack loss (dB)
 * Fixed insertion loss independent of ERA switch
 */
export const baseTonestackLoss = -10;

/**
 * Pickup output levels (dBV)
 * Reference levels for different pickup positions
 */
export const pickupLevels = {
    neck: -10,
    middle: -8,
    bridge: -6
};

/**
 * Cable loss constant (dB)
 */
export const cableLoss = 0.5;

/**
 * Bright switch boost values (dB)
 * Three-position switches: Off / Subtle (500pF) / Aggressive (4700pF)
 */
export const brightBoost = {
    subtle: 1.5,      // 500pF cap - moderate high-frequency boost
    aggressive: 2.5,  // 4700pF cap - aggressive high-frequency boost
    mid: 1.5,         // Send Bright (legacy)
    high: 2.5         // Return Bright (legacy)
};

/**
 * FX Loop recovery compensation (dB at noon)
 */
export const recoveryCompensation = 2.5;

/**
 * Meter display constants
 */
export const meterConfig = {
    minLevel: -60,  // dBV
    maxLevel: 50,   // dBV
    range: 110      // total range for bar calculation
};

/**
 * Stage counts per section (for meter strip creation)
 */
export const stageCounts = {
    input: 3,
    preamp: 10,  // V1a, Gain1, V1b, Gain2, Pussy Trim, V2a, V2b, ERA, Master, Tonestack
    fxloop: 6,   // Send, Send Brt (optional), Loop Out, Return, Ret Brt (optional), Recovery
    power: 5,    // Focus (optional), Presence, Resonance, PI, Power
    output: 1    // Captor X
};

/**
 * Default state values
 */
export const defaultState = {
    pickup: 'bridge',
    guitarVolume: 10,
    gain1: 5,
    bright1: 'off',  // 'off' | 'subtle' | 'aggressive'
    gain2: 5,
    bright2: 'off',  // 'off' | 'subtle' | 'aggressive'
    era: '80s',
    bass: 5,
    middle: 5,
    treble: 5,
    loopEnabled: true,
    send: 5,
    sendBright: false,
    return: 5,
    returnBright: false,
    recovery: 5,
    master: 3,
    focus: false,
    presence: 5,
    resonance: 5,
    pussyTrimmer: 10,
    captorAtten: 0,
    meterPanelVisible: true,
    viewMode: 'amp'
};

/**
 * Combined config export for convenience
 */
export const AmpConfig = {
    tubeStages,
    eraClipping,
    baseTonestackLoss,
    pickupLevels,
    cableLoss,
    brightBoost,
    recoveryCompensation,
    meterConfig,
    stageCounts,
    defaultState
};

export default AmpConfig;
