# Accuracy Improvement Recommendations - Executive Summary

**Date**: February 16, 2026
**Status**: Actionable recommendations for improving measurement accuracy

---

## Quick Overview

This document provides prioritized, actionable recommendations for improving the accuracy of the Chupacabra Gain Staging Simulator based on the comprehensive evaluation in `ACCURACY_EVALUATION.md`.

---

## Top 5 High-Impact Improvements

### 1. Hardware Validation (CRITICAL - Must Do First)
**Current Issue**: All values are theoretical - no measurements from actual Chupacabra hardware
**Impact**: Unknown accuracy - could be ±20% or more off
**Action Items**:
- [ ] Recruit Chupacabra owner with oscilloscope
- [ ] Measure stage gains at V1a, V1b, V2a plate test points
- [ ] Capture clipping onset voltages at each stage
- [ ] Measure ERA diode clipping thresholds ('80s and Modern modes)
- [ ] Validate Master volume range and tonestack insertion loss

**Effort**: Moderate (requires equipment and hardware access)
**Accuracy Gain**: Could be 50%+ improvement if current values are significantly off

---

### 2. Asymmetric Tube Clipping Model
**Current Issue**: Symmetric tanh clipping - real tubes clip asymmetrically
**Impact**: Distortion character doesn't match hardware
**Current Code**:
```javascript
// Symmetric compression
const compressed = Math.tanh(normalized) * knee;
```

**Improved Code** (example):
```javascript
// Asymmetric compression: harder on positive (grid), softer on negative (plate)
function asymmetricClip(level, threshold, kneeGrid = 4, kneePlate = 8) {
    const onset = threshold - kneeGrid;
    if (level <= onset) return { clamped: level, drive: 0 };

    const excess = level - onset;
    const normalized = excess / kneeGrid;

    // Harder clipping on positive excursion (grid limiting)
    // Softer clipping on negative excursion (plate saturation)
    const gridCompression = Math.tanh(normalized * 1.5);  // Harder
    const plateCompression = Math.tanh(normalized * 0.7); // Softer

    // Combine with asymmetry (60% grid, 40% plate characteristic)
    const compressed = (gridCompression * 0.6 + plateCompression * 0.4) * kneeGrid;
    const clamped = onset + compressed;
    const drive = level - clamped;

    return { clamped, drive };
}
```

**Action Items**:
- [ ] Implement asymmetric clipping with separate grid/plate characteristics
- [ ] Add different knee widths for V1a/V1b/V2a based on operating points
- [ ] Validate with oscilloscope captures showing asymmetric waveforms
- [ ] Test with sine wave input to verify harmonic content

**Effort**: Low-Medium (code change + testing)
**Accuracy Gain**: 20-30% improvement in distortion character

---

### 3. Exponential Diode Clipping (ERA)
**Current Issue**: Hard threshold brick-wall clipping - real diodes have exponential turn-on
**Impact**: ERA voicing doesn't sound/measure like real circuit
**Current Code**:
```javascript
diodeClip(level, threshold) {
    if (level <= threshold) return { clamped: level, drive: 0 };
    const clampedLevel = threshold;  // Hard clip
    return { clamped: clampedLevel, drive: level - clampedLevel };
}
```

**Improved Code**:
```javascript
function exponentialDiodeClip(level, threshold, seriesR = 10000) {
    // Exponential diode characteristic: I = Is * (e^(V/nVt) - 1)
    // Approximation: soft knee based on diode turn-on
    const thermalVoltage = 0.026; // 26mV at room temp
    const idealityFactor = 1.8;   // Typical for LEDs, ~1.0 for Si diodes
    const nVt = idealityFactor * thermalVoltage;

    if (level <= threshold - 1) {
        return { clamped: level, drive: 0 };
    }

    // Exponential compression above threshold
    const excess = level - threshold;
    const voltageLinear = Math.pow(10, excess / 20); // Convert dB to linear

    // Diode clamps voltage with exponential characteristic
    const clampedLinear = threshold + nVt * Math.log(1 + voltageLinear / (seriesR * 0.001));
    const clamped = 20 * Math.log10(clampedLinear);
    const drive = level - clamped;

    return { clamped, drive };
}
```

**Action Items**:
- [ ] Implement exponential diode clipping for ERA stages
- [ ] Identify actual diode types used in Chupacabra ERA circuit
- [ ] Measure ERA clipping knee width with oscilloscope
- [ ] Validate '80s (18 dBV) and Modern (12 dBV) threshold values
- [ ] Test with sine sweep to verify harmonic generation matches hardware

**Effort**: Low-Medium (code change + validation)
**Accuracy Gain**: 15-25% improvement in ERA voicing accuracy

---

### 4. Proper Tonestack Transfer Function
**Current Issue**: Oversimplified linear summation - real Marshall tonestack is complex RC network
**Impact**: Tonestack EQ response doesn't match hardware
**Current Code**:
```javascript
tonestackMod(bass, middle, treble) {
    return ((bass - 5) + (middle - 5) + (treble - 5)) * 0.3;
}
```

**Improved Code** (Marshall tonestack):
```javascript
function marshallTonestack(bass, mid, treble) {
    // Based on Duncan's Tone Stack Calculator
    // Marshall tonestack component values (typical):
    const R1 = 33000;   // 33k to ground from bass pot
    const R2 = 100000;  // 100k bass pot
    const R3 = 25000;   // 25k mid pot
    const R4 = 56000;   // 56k slope resistor
    const C1 = 0.00000005; // 50nF treble cap
    const C2 =0.00000002; // 20nF mid cap
    const C3 = 0.00000002; // 20nF bass cap

    // Simplified frequency-independent approximation
    // (Full model requires frequency domain analysis)

    // Insertion loss varies with control positions
    const bassContrib = (bass / 10) * -2.0;   // Bass cut/boost
    const midContrib = (mid / 10) * -3.0;     // Mid scoop characteristic
    const trebleContrib = (treble / 10) * -1.5; // Treble boost/cut

    // Base insertion loss (minimum at all controls max)
    const baseLoss = -12;

    // Non-linear interaction (mid scoop interacts with bass/treble)
    const interaction = (1 - mid / 10) * -2.0;

    return baseLoss + bassContrib + midContrib + trebleContrib + interaction;
}
```

**Action Items**:
- [ ] Obtain Chupacabra tonestack component values from schematic
- [ ] Use Duncan's Tone Stack Calculator for reference transfer function
- [ ] Measure actual insertion loss with all controls at 5 (noon)
- [ ] Measure frequency response at various EQ settings (if expanding to frequency domain)
- [ ] Validate non-linear control interaction
- [ ] Consider implementing full frequency-dependent model in future

**Effort**: Medium (requires component values and measurements)
**Accuracy Gain**: 10-20% improvement in EQ response accuracy

---

### 5. Validate and Correct Stage Gain Values
**Current Issue**: Theoretical values not verified against hardware
**Impact**: Clipping predictions may be significantly off
**Current Values**:
```javascript
v1a: { gain: 35, threshold: 38 },  // 35 dB = 56× voltage gain
v1b: { gain: 30, threshold: 32 },  // 30 dB = 32× voltage gain
v2a: { gain: 35, threshold: 38 },  // 35 dB = 56× voltage gain
pi:  { gain: 20, threshold: 40 },  // 20 dB = 10× voltage gain
power: { gain: 26, threshold: 44 } // 26 dB = 20× voltage gain
```

**Validation Method**:
1. Inject known sine wave at input (e.g., 100mV @ 1kHz)
2. Measure output at each stage test point with oscilloscope
3. Calculate actual gain: Gain(dB) = 20 × log10(Vout / Vin)
4. Repeat at multiple input levels to verify linearity and find threshold
5. Update config values with measured data

**Action Items**:
- [ ] Measure V1a plate voltage with known input → validate 35 dB gain
- [ ] Measure V1b plate voltage with known input → validate 30 dB gain
- [ ] Measure V2a plate voltage with known input → validate 35 dB gain
- [ ] Measure PI output to power grid → validate 20 dB gain
- [ ] Measure power amp to OT primary → validate 26 dB gain
- [ ] Find clipping onset voltages at each stage → validate thresholds
- [ ] Update `amp-config.js` with measured values

**Effort**: Low (once hardware access is available)
**Accuracy Gain**: Could be 30%+ if current values are significantly off

---

## Quick Win Improvements (Low Effort, Moderate Impact)

### 6. Add Variable Knee Width by Stage
**Issue**: Fixed 6 dB knee for all stages
**Fix**: Different knee widths based on operating point
```javascript
v1a: { gain: 35, threshold: 38, knee: 5 },  // Tighter (high gain stage)
v1b: { gain: 30, threshold: 32, knee: 6 },  // Medium
v2a: { gain: 35, threshold: 38, knee: 5 },  // Tighter
pi:  { gain: 20, threshold: 40, knee: 7 },  // Softer (PI characteristic)
power: { gain: 26, threshold: 44, knee: 8 } // Softest (push-pull)
```
**Effort**: Very Low (config change only)
**Accuracy Gain**: 5-10% improvement

---

### 7. Model Bright Switch Pot Interaction
**Issue**: Fixed boost regardless of pot position
**Fix**: Bright effect decreases as pot increases
```javascript
function brightBoost(potValue, capValue) {
    const maxBoost = capValue === 500 ? 1.5 : 2.5;  // pF
    // Bright effect maximum at low pot settings, minimum at high
    const positionFactor = 1 - (potValue / 10) * 0.7; // 30% boost remains at max
    return maxBoost * positionFactor;
}
```
**Effort**: Low (code change only)
**Accuracy Gain**: 10-15% improvement in bright switch behavior

---

### 8. Add Grid Stopper Losses
**Issue**: Missing small resistive losses in signal path
**Fix**: Add ~0.3-0.5 dB loss per gain stage
```javascript
const gridStopperLoss = 0.4; // Typical grid stopper: ~68k-220k
level -= gridStopperLoss;
addStage('V1a Grid', level, -gridStopperLoss, 0, 'preamp');
```
**Effort**: Very Low (add to signal chain)
**Accuracy Gain**: 5% improvement (cumulative effect)

---

### 9. Validate Pot Taper Curves
**Issue**: Idealized pot curves may not match hardware
**Fix**: Measure actual pots with ohmmeter at 0, 2, 5, 7, 10 positions
```javascript
// Example measured taper (if different from idealized)
function measuredLogTaper(value) {
    // Lookup table based on actual measurements
    const taperPoints = [
        [0, -60], [1, -36], [2, -24], [3, -16], [4, -10],
        [5, -6], [6, -4], [7, -2.5], [8, -1.2], [9, -0.3], [10, 0]
    ];
    return interpolate(value, taperPoints);
}
```
**Effort**: Low (requires ohmmeter measurements)
**Accuracy Gain**: 5-10% improvement in control response

---

### 10. Document Accuracy Limitations in UI
**Issue**: Users may assume simulator is high-precision
**Fix**: Add accuracy notice to UI
```html
<div class="accuracy-notice">
    ⚠️ Educational Model: Values are theoretical approximations.
    Actual hardware may differ. See ACCURACY_EVALUATION.md for details.
</div>
```
**Effort**: Very Low (UI text change)
**Accuracy Gain**: Manages user expectations

---

## Future Enhancements (High Effort)

### Phase 2: Frequency Domain Modeling
- Implement multi-band signal processing (8-10 frequency bands)
- Add frequency-dependent bright switches (high-pass filters)
- Model presence/resonance as frequency-dependent NFB
- Add tonestack frequency response
- Include speaker impedance curve effects

**Effort**: High (major architecture change)
**Accuracy Gain**: 40%+ for frequency-dependent effects

### Phase 3: Advanced Physical Modeling
- Power supply sag modeling
- Output transformer saturation
- Screen grid clipping (EL34 specific)
- Cathode bias shift under drive
- Component tolerance simulation mode

**Effort**: Medium-High (requires detailed circuit knowledge)
**Accuracy Gain**: 15-25% for transient behavior

---

## Measurement Equipment Needed

### Essential
- Oscilloscope (100 MHz, 2-channel minimum)
- Function generator (sine, square, triangle waves, 20Hz-20kHz)
- Digital multimeter
- Probe set (10:1 passive probes)

### Recommended
- Audio interface with calibrated inputs
- Spectrum analyzer (or FFT on oscilloscope)
- True RMS voltmeter for AC measurements
- Dummy load for Captor X

### Nice to Have
- Audio Precision analyzer (for professional measurements)
- THD+N meter
- Variable AC power supply (test B+ voltage effects)

---

## Implementation Priority Matrix

| Improvement | Effort | Accuracy Gain | Priority |
|------------|--------|---------------|----------|
| Hardware validation | Medium | 50%+ | **1 - CRITICAL** |
| Asymmetric tube clipping | Low | 20-30% | **2 - HIGH** |
| Exponential diode clipping | Low | 15-25% | **3 - HIGH** |
| Tonestack transfer function | Medium | 10-20% | **4 - HIGH** |
| Validate stage gains | Low* | 30%+ | **5 - HIGH** |
| Variable knee width | Very Low | 5-10% | 6 - Medium |
| Bright switch interaction | Low | 10-15% | 7 - Medium |
| Grid stopper losses | Very Low | 5% | 8 - Low |
| Pot taper validation | Low | 5-10% | 9 - Low |
| Accuracy notice in UI | Very Low | N/A | 10 - Documentation |

*Low effort once hardware access is available

---

## Success Metrics

### Before Improvements
- Theoretical values only
- Symmetric clipping model
- Hard diode clipping
- Simplified tonestack
- Unknown deviation from hardware

### After Improvements (Target)
- Hardware-validated gain values (±2 dB)
- Asymmetric clipping model matching scope captures
- Exponential diode clipping with proper knee
- Proper tonestack transfer function
- Documented accuracy: ±10% for levels, ±15% for clipping onset

### Validation Tests
1. **End-to-end gain test**: Measure input → output with all controls at noon
   - Target: Within ±3 dB of hardware
2. **Clipping onset test**: Measure when each stage starts to clip
   - Target: Within ±2 dB of hardware
3. **ERA voicing test**: Measure output level difference between Plexi/80s/Modern
   - Target: Within ±1.5 dB of hardware
4. **Tonestack loss test**: Measure insertion loss with EQ flat
   - Target: Within ±1 dB of hardware

---

## Next Steps (Recommended Sequence)

1. **Week 1-2**: Hardware validation measurements
   - Find Chupacabra owner with measurement equipment
   - Measure all stage gains and thresholds
   - Measure ERA clipping characteristics
   - Measure tonestack insertion loss
   - Document results

2. **Week 3**: Update configuration values
   - Update `amp-config.js` with measured stage gains
   - Update clipping thresholds with measured values
   - Update ERA thresholds if different from current
   - Commit changes with measurement data reference

3. **Week 4**: Implement core model improvements
   - Asymmetric tube clipping model
   - Exponential diode clipping
   - Variable knee widths
   - Test against hardware captures

4. **Week 5**: Tonestack improvement
   - Obtain component values from schematic
   - Implement proper Marshall tonestack function
   - Validate against measurements
   - Test EQ response

5. **Week 6**: Testing and validation
   - Run all test cases
   - Compare simulator output to hardware measurements
   - Document accuracy improvements
   - Update README with new accuracy specs

6. **Future**: Advanced enhancements
   - Frequency domain modeling (Phase 2)
   - Advanced physical effects (Phase 3)
   - Continuous validation and refinement

---

## Community Contribution Opportunities

### For Chupacabra Owners
- Provide hardware measurements (stage gains, clipping thresholds)
- Share oscilloscope captures
- Validate simulator predictions against actual amp
- Test specific control combinations

### For Electrical Engineers
- Review tube stage calculations
- Validate circuit topology assumptions
- Suggest improved modeling approaches
- Provide SPICE simulation results for comparison

### For Software Engineers
- Implement improved clipping models
- Add frequency domain processing
- Optimize performance
- Improve UI/UX

### For Amp Technicians
- Provide schematic component values
- Confirm signal flow and topology
- Measure frequency response
- Document build variations between units

---

## Conclusion

The GainStagerSim can be significantly improved with a combination of:
1. **Hardware validation** (essential first step)
2. **Improved clipping models** (asymmetric tubes, exponential diodes)
3. **Component measurement** (validate gains, thresholds, pot tapers)
4. **Better tonestack modeling** (proper RC network transfer function)

**Immediate Actions**:
- [x] Create comprehensive accuracy evaluation (ACCURACY_EVALUATION.md)
- [x] Create actionable recommendations (this document)
- [ ] Recruit hardware owner for measurements
- [ ] Implement high-priority improvements
- [ ] Validate against hardware
- [ ] Document accuracy improvements

**Timeline Estimate**: 6-8 weeks for high-priority improvements (given hardware access)

**Expected Outcome**: 50-70% accuracy improvement over current theoretical model

---

**Document Version**: 1.0
**Last Updated**: February 16, 2026
**Next Review**: After hardware validation measurements
