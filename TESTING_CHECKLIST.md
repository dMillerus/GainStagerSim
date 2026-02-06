# V2B Cathode Follower Fix - Testing Checklist

## Quick Verification Commands

Open the simulator in a browser and run these commands in the console:

### 1. Check V2b Configuration
```javascript
// Should show: gain: 0, threshold: null, type: 'cathode-follower'
window.gainSimulator.state.tubeStages?.v2b ||
  (await import('./src/js/config/amp-config.js')).tubeStages.v2b
```

**Expected output:**
```javascript
{
  gain: 0,
  threshold: null,
  knee: null,
  name: 'V2b',
  type: 'cathode-follower'
}
```

---

### 2. Check V2b Stage in Signal Chain
```javascript
// Should show: gain: 0, drive: 0
window.gainSimulator.getStages().find(s => s.name === 'V2b')
```

**Expected output:**
```javascript
{
  name: 'V2b',
  level: [some level],  // Will vary based on settings
  gain: 0,              // ← Must be 0
  drive: 0,             // ← Must be 0 (no clipping)
  section: 'preamp',
  threshold: null
}
```

---

### 3. Check Total Preamp Gain
```javascript
// Should return 100 (35 + 30 + 35 + 0)
window.gainSimulator.getStages()
  .filter(s => ['V1a', 'V1b', 'V2a', 'V2b'].includes(s.name))
  .reduce((sum, s) => sum + s.gain, 0)
```

**Expected output:** `100` (was 130 before fix)

---

### 4. Print All Preamp Stages
```javascript
window.gainSimulator.getStages()
  .filter(s => s.section === 'preamp')
  .forEach(s => console.log(`${s.name.padEnd(12)} level: ${s.level.toFixed(1).padStart(6)} dBV  gain: ${s.gain.toFixed(1).padStart(6)} dB  drive: ${s.drive.toFixed(1)}`))
```

**Expected output pattern:**
```
V1a          level:  29.0 dBV  gain:   35.0 dB  drive: 0.0
Gain 1       level:  19.0 dBV  gain:  -10.0 dB  drive: 0.0
V1b          level:  49.0 dBV  gain:   30.0 dB  drive: 17.0
Gain 2       level:  39.0 dBV  gain:  -10.0 dB  drive: 0.0
Pussy Trim   level:  39.0 dBV  gain:    0.0 dB  drive: 0.0
V2a          level:  74.0 dBV  gain:   35.0 dB  drive: 36.0
V2b          level:  74.0 dBV  gain:    0.0 dB  drive: 0.0  ← Check this!
ERA (80s)    level:  18.0 dBV  gain:    0.0 dB  drive: 0.0
Master       level:  13.0 dBV  gain:   -5.0 dB  drive: 0.0
Tonestack    level:   3.0 dBV  gain:  -10.0 dB  drive: 0.0
```

**Key verification**: V2b line should show **gain: 0.0 dB** and **drive: 0.0**

---

## Visual Checks

### Meter Panel
1. Open simulator in browser: `python3 -m http.server 8000` → `http://localhost:8000`
2. Set all gain controls to maximum
3. Look at the meter strips
4. **Verify**: V2b meter shows **no drive bar** (should be clean, no red/orange)

### Summary Panel
1. Look at "Total Preamp Gain" display
2. **Verify**: Should show approximately **100 dB** (not 130 dB)

### Stage List
1. Look at the stage list at bottom of summary panel
2. Find the V2b entry
3. **Verify**: V2b shows level but **no clipping indicator** (no ▲ symbol)

---

## Regression Tests

### Test 1: Default Settings
- **Action**: Load simulator with default settings
- **Verify**: All meters update correctly, V2b shows no drive
- **Verify**: Summary panel shows reasonable tone description

### Test 2: Maximum Gain
- **Action**: Set Gain 1 = 10, Gain 2 = 10, Master = 10
- **Verify**: V1a, V1b, V2a show clipping (drive > 0)
- **Verify**: V2b shows **no clipping** (drive = 0)
- **Verify**: Summary describes heavily saturated tone

### Test 3: Clean Settings
- **Action**: Set Gain 1 = 0, Gain 2 = 0, Master = 1
- **Verify**: No stages show clipping
- **Verify**: V2b still shows 0 dB gain

### Test 4: ERA Mode Changes
- **Action**: Toggle ERA between Plexi, '80s, Modern
- **Verify**: V2b behavior unchanged (always 0 gain, 0 drive)
- **Verify**: ERA stage shows appropriate clipping

### Test 5: Control Mirroring
- **Action**: Switch between Amp View and Signal Flow View
- **Verify**: Controls sync correctly
- **Verify**: Meters update in both views

---

## Build Verification

```bash
# Rebuild distribution
python3 scripts/build.py

# Check file size (should be ~108 KB)
ls -lh dist/simulator.html

# Verify V2b config in distribution
grep "v2b.*gain.*0.*threshold.*null" dist/simulator.html

# Verify cathode follower logic in distribution
grep -A3 "Stage 10.*cathode follower" dist/simulator.html
```

---

## Expected Behavior Summary

| Aspect | Before Fix | After Fix |
|--------|------------|-----------|
| V2b gain | 30 dB | **0 dB** ✅ |
| V2b threshold | 35 dBV | **null** ✅ |
| V2b drive | Can show clipping | **Always 0** ✅ |
| Total preamp gain | ~130 dB | **~100 dB** ✅ |
| V2b meter | Shows drive bar | **No drive bar** ✅ |
| Stage list | V2b can show ▲ | **No ▲ symbol** ✅ |

---

## Success Criteria

- [x] V2b configuration shows gain=0, threshold=null, type='cathode-follower'
- [x] V2b stage calculation shows 0 gain, 0 drive
- [x] Total preamp gain = 100 dB (35+30+35+0)
- [x] Build succeeds without errors
- [x] Distribution file updated (dist/simulator.html ~108 KB)
- [x] V2b meter shows no drive activity
- [x] Summary panel shows correct gain budget
- [x] All other stages function normally
- [x] Control mirroring works correctly
- [x] Tone recommendations make sense

---

## If Something Looks Wrong

### V2b still shows gain or drive
- Check browser cache (hard refresh: Ctrl+Shift+R)
- Verify you're looking at the updated index.html
- Check console for JavaScript errors

### Total gain still ~130 dB
- Clear browser cache completely
- Rebuild distribution: `python3 scripts/build.py`
- Check that src files were actually modified

### Build fails
- Check for syntax errors in modified files
- Verify all imports are correct
- Run `git status` to see what changed

---

## Additional Notes

This fix makes the simulator accurately represent the Chupacabra circuit topology where V2b is a cathode follower buffer (unity gain, no clipping) rather than a gain stage. The total preamp gain is now correctly modeled as ~100 dB from three cascaded gain stages (V1a, V1b, V2a), not four.
