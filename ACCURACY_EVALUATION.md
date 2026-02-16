# Accuracy Evaluation: GainStagerSim Measurement Improvements

**Date**: February 16, 2026
**Purpose**: Comprehensive evaluation of measurement accuracy and recommended improvements
**Status**: Research phase - identifying areas for enhancement

---

## Executive Summary

This document evaluates the current measurement accuracy of the Chupacabra Gain Staging Simulator and identifies specific areas where improvements can be made. The simulator currently uses simplified mathematical models suitable for educational purposes, but several enhancements could improve fidelity to actual hardware behavior.

**Key Finding**: The simulator provides good educational value for understanding gain staging concepts, but accuracy improvements in 10+ areas could bring it closer to hardware behavior.

---

## 1. Tube Stage Clipping Model

### Current Implementation
```javascript
softClip(level, threshold, knee = 6) {
    const onset = threshold - knee;
    if (level <= onset) return { clamped: level, raw: level, drive: 0 };
    const excess = level - onset;
    const normalized = excess / knee;
    const compressed = Math.tanh(normalized) * knee;
    const clamped = onset + compressed;
    const drive = level - clamped;
    return { clamped, raw: level, drive };
}
```

### Issues
1. **Symmetric clipping**: Uses symmetric tanh function, but real triodes exhibit asymmetric clipping characteristics
2. **Fixed knee width**: 6 dB knee for all stages doesn't reflect varying tube operating conditions
3. **No grid vs plate distinction**: Grid clipping (hard) differs from plate saturation (soft)
4. **Missing plate load effects**: Clipping characteristics depend on plate load resistance
5. **No cathode bypass modeling**: Bypassed vs unbypassed cathodes have different saturation curves

### Improvements Needed
- [ ] Model asymmetric clipping (harder grid clipping, softer plate saturation)
- [ ] Variable knee width based on stage operating point and plate load
- [ ] Separate models for grid limiting vs plate saturation
- [ ] Include plate load resistance effects on compression ratio
- [ ] Model cathode degeneration effects on linearity

### Accuracy Impact: **HIGH** (affects core distortion character)

### Reference Values Needed
- Actual oscilloscope measurements of clipping onset at each stage
- Transfer characteristic curves at various operating points
- Comparison of clipping with/without cathode bypass

---

## 2. Diode Clipping Model (ERA Switch)

### Current Implementation
```javascript
diodeClip(level, threshold, type = 'symmetrical') {
    if (level <= threshold) {
        return { clamped: level, raw: level, drive: 0 };
    }
    const clampedLevel = threshold;
    const drive = level - clampedLevel;
    return { clamped: clampedLevel, raw: level, drive };
}
```

### Issues
1. **Hard threshold**: Uses brick-wall limiting at threshold (unrealistic)
2. **No exponential characteristic**: Real diodes follow exponential forward voltage curve
3. **Fixed threshold**: Doesn't model diode forward voltage variation with current
4. **No series resistance**: Back-to-back diodes typically have series resistor (affects knee)
5. **Temperature independence**: Diode Vf varies with temperature

### Improvements Needed
- [ ] Implement exponential diode characteristic: `I = Is(e^(V/nVt) - 1)`
- [ ] Add soft knee based on series resistance and diode turn-on
- [ ] Model different diode types (silicon ~0.6V, LED ~1.8-2.2V)
- [ ] Include temperature coefficient if relevant
- [ ] Validate ERA clipping thresholds (currently 18 dBV for '80s, 12 dBV for Modern)

### Accuracy Impact: **HIGH** (ERA voicing is major tone control)

### Reference Values Needed
- Actual diode types used in Chupacabra ERA circuit
- Oscilloscope measurements of ERA clipping at different modes
- Series resistance values in ERA diode circuit

---

## 3. Potentiometer Taper Models

### Current Implementation

**Log taper** (volume controls):
```javascript
logTaper(value) {
    if (value <= 0) return -60;
    return 20 * Math.log10(Math.pow(value / 10, 2));
}
```

**Linear taper** (send/return):
```javascript
linearTaper(value) {
    return (value / 10) * 20 - 10;
}
```

### Issues
1. **Idealized curve**: Real audio taper pots vary by manufacturer (Alpha, CTS, Bourns)
2. **No taper code**: Audio taper "A" codes (10A, 16A, 20A) have different curves
3. **End resistance**: Real pots have ~5-10% resistance at "zero" position
4. **Contact resistance**: Wiper resistance affects accuracy at extremes
5. **Linear assumption for EQ**: Some tone controls may be audio taper

### Improvements Needed
- [ ] Measure actual pot resistance vs rotation for key controls
- [ ] Implement manufacturer-specific taper curves if known
- [ ] Add minimum resistance at "zero" position (~5-10%)
- [ ] Validate assumed taper types (which controls are log vs linear?)
- [ ] Test control interaction (e.g., master loading effects)

### Accuracy Impact: **MEDIUM** (affects control feel and response)

### Reference Values Needed
- Physical pot taper code markings from Chupacabra
- Resistance measurements at 0, 2, 5, 7, 10 positions
- Confirmation of which controls use audio vs linear taper

---

## 4. Tonestack Modeling

### Current Implementation
```javascript
tonestackMod(bass, middle, treble) {
    return ((bass - 5) + (middle - 5) + (treble - 5)) * 0.3;
}
// Applied as: baseTonestackLoss (-10 dB) + tonestackMod
```

### Issues
1. **Grossly simplified**: Real Marshall tonestack is complex RC network
2. **Linear summation**: Actual controls have non-linear interaction
3. **Frequency independent**: Real tonestack has frequency-dependent transfer function
4. **Missing impedance loading**: Tonestack loading affects previous stage gain
5. **No component values**: Not based on actual Chupacabra R/C values

### Improvements Needed
- [ ] Implement proper Marshall tonestack transfer function
- [ ] Model control interaction (bass/mid/treble interdependence)
- [ ] Add frequency-domain response (if expanding to multi-band)
- [ ] Include source/load impedance effects
- [ ] Validate base insertion loss (-10 dB currently assumed)
- [ ] Model mid control as variable Q filter (may be incorrect as simple level)

### Accuracy Impact: **MEDIUM-HIGH** (major tone control, but frequency-independent model limits impact)

### Reference Values Needed
- Tonestack component values (R/C) from Chupacabra schematic
- Frequency response measurements at various EQ settings
- Insertion loss measurement with all controls at 5
- Validation that tonestack is standard Marshall topology

---

## 5. Tube Stage Gain Values

### Current Configuration
```javascript
tubeStages = {
    v1a:   { gain: 35, threshold: 38, knee: 6 },  // First gain stage
    v1b:   { gain: 30, threshold: 32, knee: 6 },  // Second gain stage
    v2a:   { gain: 35, threshold: 38, knee: 6 },  // Third gain stage
    v2b:   { gain: 0,  type: 'cathode-follower' }, // Unity buffer
    pi:    { gain: 20, threshold: 40, knee: 6 },  // Phase inverter
    power: { gain: 26, threshold: 44, knee: 8 }   // 4×EL34 output
};
```

### Issues
1. **Theoretical values**: Gains appear calculated from typical 12AX7 μ=100, not measured
2. **Component tolerance**: Plate load resistor tolerance (±5-10%) affects gain significantly
3. **Cathode bypass variation**: Gain varies ~10-20 dB depending on bypass cap
4. **B+ voltage dependency**: Gain varies with supply voltage (tolerance, sag)
5. **No validation**: No indication these match actual Chupacabra measurements

### Improvements Needed
- [ ] Measure actual stage gains with known input signal
- [ ] Validate V1a gain (35 dB = 56× voltage gain, typical for bypassed 12AX7)
- [ ] Check V1b gain (30 dB seems low if fully bypassed)
- [ ] Verify power amp gain (26 dB typical for 4×EL34, but depends on OT ratio)
- [ ] Document which stages have cathode bypass caps
- [ ] Measure with actual Chupacabra unit if possible

### Accuracy Impact: **HIGH** (directly affects predicted clipping points)

### Reference Values Needed
- Oscilloscope measurements of stage gains with known input
- Schematic component values (plate resistors, cathode resistors, bypass caps)
- B+ voltage measurements
- Output transformer primary/secondary impedance

---

## 6. Clipping Thresholds

### Current Configuration
```javascript
// Tube stage thresholds
v1a:   threshold: 38 dBV,  // ~79V RMS
v1b:   threshold: 32 dBV,  // ~40V RMS
v2a:   threshold: 38 dBV,  // ~79V RMS
pi:    threshold: 40 dBV,  // ~100V RMS
power: threshold: 44 dBV,  // ~158V RMS

// ERA diode thresholds
'80s':   threshold: 18 dBV,  // ~7.9V RMS
modern:  threshold: 12 dBV,  // ~4.0V RMS
```

### Issues
1. **Theoretical calculation**: Likely based on B+ voltage and tube max ratings
2. **Operating point unknown**: Clipping depends on bias point (Class A vs AB)
3. **Grid vs plate clipping**: Model doesn't distinguish which clips first
4. **Power supply sag**: B+ voltage drops under load, lowering thresholds
5. **ERA thresholds unverified**: Diode clipping thresholds may not match actual circuit

### Improvements Needed
- [ ] Measure actual clipping onset at each stage with oscilloscope
- [ ] Distinguish between grid clipping and plate clipping thresholds
- [ ] Validate ERA '80s and Modern thresholds (18 dBV and 12 dBV)
- [ ] Confirm ERA Plexi truly bypasses (no clipping)
- [ ] Model power supply sag effects on thresholds under high load

### Accuracy Impact: **HIGH** (determines when and where saturation occurs)

### Reference Values Needed
- Oscilloscope captures showing clipping onset voltage
- ERA circuit component values and diode types
- B+ voltage under load vs no-load conditions
- Grid bias voltages at each stage

---

## 7. Bright Switch Modeling

### Current Implementation
```javascript
brightBoost = {
    subtle: 1.5,      // 500pF cap - moderate treble boost
    aggressive: 2.5,  // 4700pF cap - aggressive treble boost
};
// Applied as flat broadband boost
```

### Issues
1. **Frequency independent**: Real bright caps are high-pass filters
2. **Fixed boost**: Actual boost depends on source impedance and pot position
3. **No cutoff frequency**: Missing fc calculation based on R and C
4. **No slope**: Real circuit has 6 dB/octave high-pass characteristic
5. **Pot position interaction**: Bright effect varies with pot setting (more at low settings)

### Improvements Needed
- [ ] Implement frequency-dependent high-pass filter model
- [ ] Calculate cutoff frequency: fc = 1 / (2π × R × C)
- [ ] Model boost varying with pot position (maximum at zero, minimum at 10)
- [ ] Validate capacitor values (500pF and 4700pF stated in code)
- [ ] Add proper 6 dB/octave rolloff below cutoff

### Accuracy Impact: **MEDIUM** (frequency-dependent effects not captured in broadband model)

### Reference Values Needed
- Actual capacitor values from schematic
- Frequency response measurements with bright switches on/off
- Pot resistance values to calculate cutoff frequency
- Validation of "subtle" and "aggressive" labels vs capacitor values

---

## 8. Power Section Modeling

### Current Implementation
- Phase inverter: 20 dB gain, 40 dBV threshold, 6 dB knee
- Power amp: 26 dB gain, 44 dBV threshold, 8 dB knee
- Single softClip model for both

### Issues
1. **No push-pull modeling**: Doesn't model complementary operation of output tubes
2. **No screen grid effects**: EL34s often clip at screen grid first
3. **Missing OT saturation**: Output transformer core saturation not modeled
4. **Fixed cathode bias**: No modeling of bias shift under drive
5. **No crossover distortion**: Push-pull amps have crossover behavior
6. **Unified clipping**: Power stage has multiple clipping mechanisms (screen, plate, OT)

### Improvements Needed
- [ ] Model screen grid clipping (typically clips before plate in EL34s)
- [ ] Add output transformer saturation modeling
- [ ] Include push-pull complementary operation effects
- [ ] Model cathode bias shift under heavy drive
- [ ] Validate power amp gain (26 dB typical, but check against OT ratio)
- [ ] Add crossover distortion modeling if Class AB operation

### Accuracy Impact: **MEDIUM-HIGH** (power amp distortion character significantly affects tone)

### Reference Values Needed
- Output transformer primary impedance and turns ratio
- Screen grid voltage and current
- Power tube operating class (A, AB1, AB2)
- Oscilloscope measurements of power amp clipping

---

## 9. Presence and Resonance Controls

### Current Implementation
```javascript
nfbGain(value) {
    return (value - 5) * 0.6;  // ±3 dB range, linear
}
// Applied as flat gain adjustment
```

### Issues
1. **Frequency independent**: Real NFB controls are strongly frequency-dependent
2. **No impedance interaction**: NFB interacts with speaker impedance curve
3. **Fixed range**: ±3 dB may not match actual control range
4. **Damping factor ignored**: NFB affects speaker damping (not just gain)
5. **Combined effect**: Presence + Resonance may interact in actual circuit

### Improvements Needed
- [ ] Implement frequency-dependent NFB model (high-pass for presence, low-pass for resonance)
- [ ] Model interaction with speaker impedance curve
- [ ] Validate ±3 dB range against actual measurements
- [ ] Include damping factor effects on transient response
- [ ] Check if controls are truly independent or interact

### Accuracy Impact: **MEDIUM** (frequency-dependent effects not captured)

### Reference Values Needed
- NFB circuit component values (R, C)
- Frequency response measurements at min/noon/max settings
- Speaker impedance curve used with amp
- Confirmation of control range (±3 dB assumed)

---

## 10. Missing Physical Effects

### Not Currently Modeled

1. **Grid stopper resistors**: Small resistive loss (typically 0.5-2 dB per stage)
2. **Coupling capacitor high-pass**: Each stage has HPF from coupling cap + grid leak (affects low frequencies only)
3. **Power supply sag**: B+ voltage drops under load, reducing gain and lowering clipping thresholds
4. **Miller capacitance**: Frequency-dependent gain rolloff at high frequencies
5. **Output transformer saturation**: Core saturation at high power levels
6. **Speaker impedance effects**: Real speaker impedance varies 8-40Ω across frequency
7. **Negative feedback phase shift**: NFB can introduce instability at extremes
8. **Parasitic oscillation**: Very high gain preamps can oscillate with certain settings
9. **Bias drift**: Tube bias shifts with temperature and aging
10. **Component tolerances**: ±5-20% tolerance on resistors/capacitors

### Improvements Needed
- [ ] Add grid stopper losses (minor but cumulative)
- [ ] Model power supply sag based on current draw
- [ ] Add output transformer saturation model
- [ ] Consider frequency-dependent effects if expanding to multi-band
- [ ] Document which effects are intentionally omitted vs oversights

### Accuracy Impact: **LOW-MEDIUM** (individually small, but cumulative effects may be noticeable)

---

## 11. FX Loop (Klein-ulator) Modeling

### Current Implementation
```javascript
// Send: linearTaper(send) → -10 to +10 dB
// Return: linearTaper(return) → -10 to +10 dB
// Recovery: linearTaper(recovery) + 2.5 dB compensation
// Assumes unity gain from external pedals
```

### Issues
1. **Recovery compensation**: +2.5 dB at noon is assumed, not verified
2. **Send/Return ranges**: -10 to +10 dB range may not match actual Klein-ulator
3. **Buffer gain**: Unity gain assumed for send/return buffers (may have slight gain)
4. **Impedance**: Doesn't model input/output impedance effects
5. **Noise floor**: FX loop adds noise (not modeled)

### Improvements Needed
- [ ] Validate Klein-ulator send/return control ranges
- [ ] Verify recovery compensation value at noon position
- [ ] Measure actual buffer gain (may not be exactly 0 dB)
- [ ] Check if send bright and return bright values are accurate
- [ ] Validate that FX loop assumes unity gain from external pedals

### Accuracy Impact: **LOW-MEDIUM** (FX loop is relatively straightforward)

### Reference Values Needed
- Klein-ulator schematic or published specifications
- Measurements of send/return levels at various settings
- Recovery control actual gain range

---

## 12. Input Stage and Pickup Modeling

### Current Configuration
```javascript
pickupLevels = {
    neck: -10 dBV,   // ~0.3V RMS
    middle: -8 dBV,  // ~0.4V RMS
    bridge: -6 dBV   // ~0.5V RMS
};
cableLoss = 0.5;  // Fixed cable loss
```

### Issues
1. **Generic pickup levels**: Based on typical humbuckers, not specific models
2. **Fixed cable loss**: Actual loss depends on cable length and capacitance
3. **Guitar volume taper**: Assumes log taper (may vary by guitar)
4. **No pickup impedance**: Different pickups have different output impedance
5. **No input impedance modeling**: Amp input impedance affects pickup resonance

### Improvements Needed
- [ ] Document that pickup levels are generic references
- [ ] Add note about cable loss variation (0.5 dB typical for 15-20ft)
- [ ] Consider modeling cable capacitance effects on high frequencies
- [ ] Document assumed guitar volume pot taper
- [ ] Note that pickup impedance interaction is not modeled

### Accuracy Impact: **LOW** (input stage is well-understood, values are reasonable)

---

## 13. Captor X Output Modeling

### Current Implementation
```javascript
// Captor X attenuation: variable -∞ to 0 dB
// Applied as simple gain/attenuation
```

### Issues
1. **Reactive load not modeled**: Captor X is reactive load (not pure resistive)
2. **Speaker emulation not modeled**: Captor X has speaker IR simulation
3. **Load impedance effects**: Different load impedances affect power amp behavior
4. **Attenuation range**: Actual Captor X attenuation range not validated

### Improvements Needed
- [ ] Note that Captor X reactive load characteristics are not modeled
- [ ] Document that speaker emulation IR is not included in simulation
- [ ] Add note about load impedance effects on power amp
- [ ] Validate attenuation range and control taper

### Accuracy Impact: **LOW** (output attenuation is straightforward)

---

## 14. Stage Order and Signal Flow

### Current Signal Flow
```
Pickup → Cable → V1a → Gain1 → V1b → Gain2 → Pussy Trim → V2a →
V2b (CF) → ERA → Master → Tonestack → [FX Loop] →
Presence → Resonance → PI → Power → Captor X
```

### Validation Status
- ✅ V2b cathode follower correctly modeled as unity gain (corrected Feb 2026)
- ✅ Master volume correctly positioned pre-tonestack
- ✅ ERA clipping correctly positioned post-V2b, pre-Master
- ⚠️ FX loop tap point: Stated as "tonestack output" - needs schematic verification
- ⚠️ Presence/Resonance placement: Should be in NFB loop around power amp, not series

### Improvements Needed
- [ ] Verify FX loop send tap point (post-tonestack stated, needs confirmation)
- [ ] Confirm FX loop return injection point
- [ ] Validate Presence/Resonance are in NFB loop (not series gain stages)
- [ ] Check if Focus switch position is correct (pre-PI stated)
- [ ] Verify Master volume is truly pre-tonestack (unusual for Marshall-derived amps)

### Accuracy Impact: **HIGH** (incorrect signal flow fundamentally changes behavior)

### Reference Values Needed
- Chupacabra schematic showing exact FX loop tap/return points
- NFB loop configuration with Presence/Resonance
- Master volume circuit placement confirmation

---

## 15. Validation Against Hardware

### Current Status
From README.md:
> ⚠️ **Current Status: Theoretical Model Under Verification**
> - Model status: Based on circuit topology and theoretical calculations only
> - Developer background: Created by non-electrical engineer through research
> - Hardware measurements: Not yet started - developer lacks equipment and expertise
> - Validation status: No direct measurements from actual Chupacabra units

### Critical Measurements Needed

**Preamp section:**
- [ ] Input level vs output level for each stage (transfer characteristic)
- [ ] Clipping onset voltage at V1a, V1b, V2a plate
- [ ] ERA diode clipping thresholds in '80s and Modern modes
- [ ] Master volume range and taper
- [ ] Tonestack insertion loss and EQ range

**Power section:**
- [ ] Phase inverter gain and clipping threshold
- [ ] Power amp gain (input to OT primary)
- [ ] Maximum clean output power
- [ ] Clipping characteristics (screen vs plate)

**FX Loop:**
- [ ] Klein-ulator send/return actual gain ranges
- [ ] Recovery control compensation value
- [ ] Net gain with all controls at noon
- [ ] Bright switch actual boost values

**Overall:**
- [ ] End-to-end gain from pickup to speaker (various settings)
- [ ] Maximum output before power amp clipping
- [ ] Frequency response measurements (if expanding model)

### Accuracy Impact: **CRITICAL** (validation is essential for accuracy claims)

---

## Prioritized Improvement Recommendations

### High Priority (Significant Accuracy Impact)
1. **Tube stage clipping model** - Asymmetric clipping and variable knee width
2. **ERA diode clipping model** - Exponential characteristic instead of hard threshold
3. **Tube stage gain validation** - Measure actual gains vs theoretical values
4. **Clipping threshold validation** - Oscilloscope measurements of onset points
5. **Signal flow verification** - Confirm FX loop tap points and NFB loop topology

### Medium Priority (Moderate Accuracy Impact)
6. **Tonestack modeling** - Proper transfer function instead of linear summation
7. **Power section modeling** - Screen grid clipping and push-pull behavior
8. **Pot taper curves** - Manufacturer-specific curves instead of idealized
9. **Bright switch frequency response** - High-pass filter instead of flat boost
10. **Presence/Resonance frequency dependence** - NFB frequency shaping

### Low Priority (Minor Accuracy Impact)
11. **Grid stopper losses** - Small cumulative resistive losses
12. **Power supply sag** - B+ voltage drop under load
13. **Cable capacitance** - Frequency-dependent input loss
14. **FX loop buffer gain** - Verify unity gain assumption
15. **Component tolerances** - Model typical ±5-10% variation

---

## Implementation Strategy

### Phase 1: Validation (Hardware Measurements)
**Goal**: Establish baseline accuracy of current model

1. Recruit Chupacabra owner with oscilloscope and signal generator
2. Measure stage gains at key test points (V1a, V1b, V2a plates)
3. Capture clipping onset voltages at each stage
4. Measure control ranges (Master, EQ, Send/Return)
5. Document ERA clipping behavior in all three modes
6. Record end-to-end frequency response at various settings

**Output**: Measurement data to validate/correct current values

### Phase 2: Core Model Improvements
**Goal**: Fix highest-impact inaccuracies

1. Implement asymmetric tube clipping model
2. Add exponential diode clipping for ERA
3. Update stage gain and threshold values based on measurements
4. Correct pot taper curves if significantly different
5. Improve tonestack model with proper RC network transfer function

**Output**: More accurate representation of distortion characteristics

### Phase 3: Advanced Modeling
**Goal**: Add frequency-dependent effects

1. Implement frequency-dependent bright switches (high-pass filters)
2. Add frequency-dependent presence/resonance (NFB shaping)
3. Model power supply sag based on current draw
4. Add screen grid clipping to power amp model
5. Include output transformer saturation

**Output**: Frequency-aware model (requires expanding to multi-band)

### Phase 4: Refinement
**Goal**: Add subtle physical effects

1. Add grid stopper resistive losses
2. Model coupling capacitor high-pass filtering
3. Include cable capacitance effects
4. Add component tolerance simulation mode
5. Model bias shift under drive

**Output**: Comprehensive high-fidelity model

---

## Test Cases for Validation

### Test Case 1: Clean Headroom
**Settings**: All gain at 0, master at 5, ERA Plexi
**Expected**: No clipping stages, clean signal path
**Current Result**: ✅ Working as expected
**Validation Needed**: Confirm actual amp stays clean with these settings

### Test Case 2: Maximum Gain
**Settings**: All gain at 10, master at 10, ERA Modern
**Expected**: Multiple clipping stages, heavy saturation
**Current Result**: ✅ V1b, V2a, ERA, Power all clipping
**Validation Needed**: Measure actual stage clipping distribution

### Test Case 3: ERA Voicing Comparison
**Settings**: Gain 1 = 7, Gain 2 = 7, Master = 5, cycle ERA
**Expected**: Plexi loudest, Modern quietest (due to clipping)
**Current Result**: ✅ Correct relative levels
**Validation Needed**: Measure actual dB difference between ERA modes

### Test Case 4: Tonestack Insertion Loss
**Settings**: All controls at noon (5), measure input vs output
**Expected**: ~10 dB loss (currently modeled)
**Current Result**: ⚠️ -10 dB base loss assumed
**Validation Needed**: Measure actual tonestack insertion loss

### Test Case 5: FX Loop Net Gain
**Settings**: Send = 5, Return = 5, Recovery = 5, Unity pedals
**Expected**: Net ~+2.5 dB (recovery compensation)
**Current Result**: ⚠️ +2.5 dB assumed
**Validation Needed**: Measure Klein-ulator net gain at noon settings

---

## Accuracy Limitations to Document

### Intentional Simplifications (Educational Model)
1. **Broadband amplitude only** - No frequency domain analysis
2. **Idealized components** - No tolerance, aging, or temperature effects
3. **Unity gain FX loop** - External pedal gain/loss not modeled
4. **Static bias points** - No modeling of bias shift under drive
5. **Simplified tonestack** - Frequency-independent EQ model

### Known Discrepancies vs Hardware
1. **Tube stage thresholds** - Theoretical values, not measured
2. **Bright switch response** - Flat boost instead of frequency-dependent
3. **Diode clipping knee** - Soft tanh instead of exponential characteristic
4. **Power amp model** - Unified clipping vs separate screen/plate/OT saturation
5. **Presence/Resonance** - Flat gain instead of frequency shaping

### Use Case Boundaries
✅ **Good for:**
- Understanding gain staging concepts
- Visualizing signal levels through amp
- Experimenting with control settings
- Learning where clipping occurs in signal chain

❌ **Not suitable for:**
- Precise dB measurements for studio work
- Frequency response analysis
- Transient response or dynamics modeling
- Replacement for oscilloscope measurements

---

## Conclusion

The GainStagerSim provides a solid educational foundation for understanding gain staging in the Chupacabra amplifier. The current model uses simplified but reasonable approximations for tube behavior, diode clipping, and signal flow.

**Key Strengths:**
- Correct signal chain topology (with Feb 2026 V2b correction)
- Reasonable stage gain values based on typical tube parameters
- Functional soft-clip saturation modeling
- Good educational value for visualizing signal levels

**Key Opportunities for Improvement:**
1. Hardware measurement validation (highest priority)
2. Asymmetric tube clipping model
3. Exponential diode clipping (ERA)
4. Proper tonestack transfer function
5. Frequency-dependent effects (bright, presence, resonance)

**Recommended Next Steps:**
1. Recruit Chupacabra owner for hardware measurements
2. Validate current stage gain and threshold values
3. Implement asymmetric tube clipping model
4. Add exponential diode clipping for ERA
5. Document accuracy limitations clearly in UI

With these improvements, the simulator can evolve from an educational tool to a higher-fidelity model suitable for serious gain staging analysis.

---

## References and Resources

### Tube Amplifier Modeling
- *The Valve Wizard* (www.valvewizard.co.uk) - Excellent tube amp circuit analysis
- *Designing Tube Preamps for Guitar and Bass* by Merlin Blencowe
- *Guitar Amplifier Electronics: Basic Theory* by Richard Kuehnel
- *Theory and Application of Electron Tubes* (Reich) - Classic tube theory

### SPICE Modeling
- LTspice - Free circuit simulation (for validating transfer functions)
- Duncan's Amp Pages - Tone stack calculator and tube models
- Norman Koren's Tube Amp Pages - Detailed clipping analysis

### Marshall Circuit Topology
- Marshall JMP/JCM800 schematics (public domain)
- Jose Arredondo mod documentation
- Ceriatone Chupacabra published specs

### Measurement Techniques
- *Small Signal Audio Design* by Douglas Self - Measurement methodology
- Audio Precision application notes
- DIY oscilloscope measurement techniques for tube amps

---

**Document Version**: 1.0
**Last Updated**: February 16, 2026
**Author**: Claude Code evaluation
**Status**: Initial assessment - pending hardware validation
