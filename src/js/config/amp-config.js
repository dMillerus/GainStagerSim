/**
 * amp-config.js - Amplifier configuration constants
 * Ceriatone Chupacabra 100W + Klein-ulator settings
 */

/**
 * Tube stage configurations
 * Each stage has gain (dB), threshold (dBV), knee (dB), and name
 */
export const tubeStages = {
    v1a:   { gain: 35, threshold: 38, knee: 6, name: 'V1a' },
    v1b:   { gain: 30, threshold: 32, knee: 6, name: 'V1b' },
    v2a:   { gain: 35, threshold: 38, knee: 6, name: 'V2a' },
    v2b:   { gain: 30, threshold: 35, knee: 6, name: 'V2b' },
    pi:    { gain: 20, threshold: 40, knee: 6, name: 'PI' },
    power: { gain: 26, threshold: 44, knee: 8, name: 'Power' }
};

/**
 * ERA switch tonestack loss (dB)
 * Controls the amount of signal loss through the tonestack
 */
export const eraLoss = {
    plexi: -7,
    '80s': -12,
    modern: -20
};

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
 */
export const brightBoost = {
    mid: 1.5,   // Bright 1, Send Bright
    high: 2.5   // Bright 2, Return Bright
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
    preamp: 8,  // Added Pussy Trim between Gain 2 and V2a
    fxloop: 6,
    power: 6,
    output: 1
};

/**
 * Default state values
 */
export const defaultState = {
    pickup: 'bridge',
    guitarVolume: 10,
    gain1: 5,
    bright1: false,
    gain2: 5,
    bright2: false,
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
    eraLoss,
    pickupLevels,
    cableLoss,
    brightBoost,
    recoveryCompensation,
    meterConfig,
    stageCounts,
    defaultState
};

export default AmpConfig;
