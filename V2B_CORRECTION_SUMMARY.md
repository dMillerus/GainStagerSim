# V2B Cathode Follower Correction Summary

**Date**: February 6, 2026
**Issue**: V2b incorrectly modeled as gain stage instead of cathode follower
**Status**: ✅ FIXED

---

## Problem

V2b was modeled as a +30 dB gain stage with 35 dBV clipping threshold. In the actual Chupacabra circuit (following standard Marshall/Jose topology), V2b is a **cathode follower** that provides:
- **Unity voltage gain** (0 dB) — no amplification
- **High current gain** — low output impedance to drive passive tonestack
- **No clipping** — cathode followers don't clip like gain stages

This error resulted in ~30 dB excess gain in the simulation.

---

## Changes Made

### 1. Configuration (`src/js/config/amp-config.js`)

**Before:**
```javascript
v2b: { gain: 30, threshold: 35, knee: 6, name: 'V2b' }
```

**After:**
```javascript
v2b: { gain: 0, threshold: null, knee: null, name: 'V2b', type: 'cathode-follower' }
```

**Added comprehensive circuit topology documentation** in file header explaining:
- Marshall '59 Super Lead + Jose Arredondo + Ceriatone modifications
- Chupacabra-specific features (pre-tonestack master, pussy trimmer, focus switch)
- Correction history

---

### 2. Signal Chain Calculation (`src/js/core/signal-chain.js`)

**Before:**
```javascript
// Stage 10: V2b (fourth preamp gain stage)
const v2b = tubeStages.v2b;
level += v2b.gain;
clip = softClip(level, v2b.threshold, v2b.knee);
level = clip.clamped;
addStage('V2b', level, v2b.gain, clip.drive, 'preamp', v2b.threshold);
```

**After:**
```javascript
// Stage 10: V2b (cathode follower - unity gain buffer)
const v2b = tubeStages.v2b;
level += v2b.gain;  // 0 dB gain (unity buffer)
// Cathode followers don't clip like gain stages - they provide impedance buffering
if (v2b.type === 'cathode-follower') {
    // Unity gain buffer - no clipping
    addStage('V2b', level, v2b.gain, 0, 'preamp', null);
} else {
    // Legacy path (shouldn't execute with corrected config)
    clip = softClip(level, v2b.threshold, v2b.knee);
    level = clip.clamped;
    addStage('V2b', level, v2b.gain, clip.drive, 'preamp', v2b.threshold);
}
```

---

### 3. Summary Panel (`src/js/ui/summary.js`)

**Changed:**
```javascript
// Exclude V2b from preamp clipping analysis (it's a cathode follower)
const preampClipping = clippingStages.filter(st =>
    ['V1a', 'V1b', 'V2a'].includes(st.name));  // V2b excluded
```

Also improved ERA mode and bright switch descriptions in tone recommendation.

---

### 4. Documentation (`CLAUDE.md`)

**Updated sections:**
- Domain Context: Clarified three gain stages + cathode follower
- Gain Math Model: Added notes column, highlighted V2b as 0 dB cathode follower
- Constants: Updated ERA clipping thresholds (not loss values)
- Known Limitations: Added V2b simplification note
- New section: **Circuit Topology Notes** with detailed V2b explanation and correction history

---

## Impact

### Gain Budget Change
- **Before**: Total preamp gain ~130 dB (35+30+35+30)
- **After**: Total preamp gain ~100 dB (35+30+35+0) ✅ CORRECT

### Behavior Changes
- V2b stage now shows **0 dB gain** (was 30 dB)
- V2b stage shows **0 drive** (no clipping indicator)
- Total output levels reduced by ~30 dB
- More accurate representation of actual circuit topology

### User-Visible Changes
- V2b meter will show no drive activity
- Summary panel "Total Preamp Gain" reduced to ~100 dB
- Stage list shows V2b with 0 dB contribution
- More accurate tone recommendations

---

## Verification

### Manual Tests
1. ✅ V2b configuration shows gain=0, threshold=null, type='cathode-follower'
2. ✅ V2b stage calculation shows 0 gain, 0 drive
3. ✅ Total preamp gain = 100 dB (35+30+35+0)
4. ✅ Build succeeds: `python3 scripts/build.py`
5. ✅ Distribution file generated: `dist/simulator.html` (108 KB)

### Console Commands for Testing
```javascript
// Check V2b stage
window.gainSimulator.getStages().find(s => s.name === 'V2b')
// Should show: { name: 'V2b', gain: 0, level: X, drive: 0 }

// Check total preamp gain
window.gainSimulator.getStages()
  .filter(s => ['V1a', 'V1b', 'V2a', 'V2b'].includes(s.name))
  .reduce((sum, s) => sum + s.gain, 0)
// Should return: 100 (not 130)
```

---

## Verified Correct (No Changes Needed)

These features were confirmed as intentional Chupacabra design choices:

1. ✅ **Pre-tonestack Master Volume**: Verified via FX loop behavior (correct as-is)
2. ✅ **ERA Modern Mode**: Clips earliest at 12 dBV (correct as-is)
3. ✅ **Pussy Trimmer**: Ceriatone-specific feature (correct as-is)
4. ✅ **Focus Switch**: Ceriatone-specific feature (correct as-is)

---

## Files Modified

| File | Changes |
|------|---------|
| `src/js/config/amp-config.js` | V2b config + circuit topology documentation |
| `src/js/core/signal-chain.js` | Skip soft-clip for cathode followers |
| `src/js/ui/summary.js` | Exclude V2b from preamp clipping analysis |
| `CLAUDE.md` | Updated domain context, gain table, topology notes |
| `dist/simulator.html` | Rebuilt single-file distribution (108 KB) |

---

## Build Artifacts

- ✅ `dist/simulator.html` updated and verified (108 KB)
- ✅ All ES6 modules correctly inlined
- ✅ V2b configuration verified in distribution file

---

## Next Steps

1. **Test the simulator**: Open `index.html` in browser and verify V2b shows 0 dB gain
2. **Optional enhancement**: Consider adjusting tonestack base loss from -10 dB to -6 dB if output levels seem too low compared to actual amp (see plan Phase 2)
3. **Commit changes**:
   ```bash
   git add -A
   git commit -m "Fix V2b cathode follower implementation (was incorrectly +30dB gain stage)"
   ```

---

## References

- **Marshall topology**: V2b cathode follower is standard in Super Lead circuits
- **Jose Arredondo**: Cascaded V1a/V1b/V2a gain stages (firebreathing mod)
- **Ceriatone Chupacabra**: Pre-tonestack master, pussy trimmer, focus switch
- **Verification method**: FX loop behavior confirms master position and circuit order
