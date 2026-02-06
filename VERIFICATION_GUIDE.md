# Verification Guide for Schematic-Based Fixes

## Changes Implemented

### ✅ Phase 1: ERA Switch Restructure
- **Location**: Post-V2b, Pre-Master (Stage 12)
- **Behavior**: Diode clipping (not passive attenuation)
- **Modes**:
  - **Plexi (60s)**: Bypasses diodes → cleanest signal
  - **80s**: Orange diodes → moderate clipping
  - **Modern**: Purple diodes → heavy clipping

### ✅ Phase 2: Bright Switches (3-Position)
- **Positions**: Off → Subtle (500pF) → Aggressive (4700pF)
- **Boost Values**: 0 dB → +1.5 dB → +2.5 dB
- **Visual**: Different glow colors per position

---

## Quick Verification Tests

### Test 1: ERA Switch Behavior

**Setup:**
1. Open `http://localhost:8000` in browser
2. Set all gain controls to 10 (max)
3. Set Master to 5

**Test:**
- Switch ERA from **Plexi** → **80s** → **Modern**
- **Expected**: Signal level **DECREASES** (not increases!)
- **Verify**: Check meter on "ERA" stage shows increasing drive

**Before (WRONG):**
- Plexi: Lowest output (-7 dB loss)
- Modern: Highest output (-20 dB loss made tonestack brighter)

**After (CORRECT):**
- Plexi: Highest output (bypass, no clipping)
- Modern: Lowest output (heavy clipping compression)

### Test 2: Bright Switch 3-Position

**Setup:**
1. Locate Bright 1 switch
2. Click repeatedly

**Expected Cycle:**
1. **OFF** → gray/dark, no glow
2. **SUBTLE** → greenish glow, "SUBTLE" label
3. **AGGRESSIVE** → orange glow, "AGGRESSIVE" label
4. **OFF** (cycle repeats)

**Verify:**
- Check signal level increases at Gain 1 stage
- Summary panel shows "(500pF)" or "(4700pF)"

### Test 3: Summary Panel Descriptions

**Setup:**
1. Set Gain 1 = 10, Gain 2 = 10
2. Set ERA to Modern
3. Set Bright 1 to Aggressive

**Expected Summary Text:**
- Mentions "Modern voicing with heavy diode compression"
- Shows "Bright 1 aggressive (4700pF)"
- May show "ERA purple diodes heavily clipping"

### Test 4: Stage Count

**Verify:**
- Open browser console (F12)
- Type: `window.gainSimulator.getStages().length`
- **Expected**: 25 stages (was 24)

**Find ERA stage:**
```javascript
window.gainSimulator.getStages().find(s => s.name.startsWith('ERA'))
```
- Should show drive > 0 when ERA is 80s or Modern
- Should show drive = 0 when ERA is Plexi

---

## Visual Indicators

### ERA Switch Meter Indicators

| ERA Mode | Signal Level | Drive Amount | LED Color |
|----------|-------------|--------------|-----------|
| **Plexi (60s)** | Highest | 0 dB | Green/Yellow |
| **80s** | Medium | 3-8 dB | Orange |
| **Modern** | Lowest | 8-15 dB | Red |

### Bright Switch Visual States

| Position | Background | Glow | Label |
|----------|-----------|------|-------|
| **Off** | Dark gray | None | "OFF" |
| **Subtle** | Greenish | Soft green | "SUBTLE" |
| **Aggressive** | Orange-brown | Warm orange | "AGGRESSIVE" |

---

## Common Issues to Check

### ❌ If ERA still acts backwards:
- Check browser cache (Ctrl+Shift+R to hard refresh)
- Verify `src/js/config/amp-config.js` has `eraClipping` (not `eraLoss`)
- Check console for JS errors

### ❌ If bright switches don't cycle:
- Check browser console for errors
- Verify `src/js/controls/switches.js` has `cycleThreePosition()`
- Try clicking slowly (should cycle: off → subtle → aggressive → off)

### ❌ If build fails:
- Check all imports are updated (no `eraLoss` references)
- Verify `diodeClip` is exported from `gain-math.js`
- Run: `python3 scripts/build.py` and check output

---

## Expected Signal Chain Order

```
Input Section (3 stages):
1. Pickup
2. Gtr Vol
3. Input (cable loss)

Preamp Section (9 stages):
4. V1a (tube)
5. Gain 1 + Bright 1
6. V1b (tube)
7. Gain 2 + Bright 2
8. Pussy Trim
9. V2a (tube)
10. Tonestack (fixed loss + EQ)
11. V2b (tube)
12. ERA Diode Clipping ← NEW STAGE

FX Loop Section (6 stages):
13. Send
14. Send Brt (optional)
15. Loop Out
16. Return
17. Ret Brt (optional)
18. Recovery

Power Section (6 stages):
19. Master
20. Focus (optional)
21. Presence
22. Resonance
23. PI (tube)
24. Power (tube)

Output Section (1 stage):
25. Captor X
```

---

## Browser Console Tests

Paste into console after loading simulator:

```javascript
// Test ERA config
console.log('ERA Config:', window.gainSimulator.state.era);

// Test bright switch state
console.log('Bright 1:', window.gainSimulator.state.bright1);
console.log('Bright 2:', window.gainSimulator.state.bright2);

// Get all stages
const stages = window.gainSimulator.getStages();
console.log('Total stages:', stages.length);

// Find ERA stage
const eraStage = stages.find(s => s.name.startsWith('ERA'));
console.log('ERA Stage:', eraStage);

// Check for drive
console.log('Clipping stages:', stages.filter(s => s.drive > 0));
```

---

## Success Criteria

Implementation is correct when:
- ✅ ERA Plexi has **highest** output (bypass mode)
- ✅ ERA Modern has **lowest** output (heavy clipping)
- ✅ ERA shows **drive amount** on 80s/Modern
- ✅ Bright switches cycle through **3 positions**
- ✅ Summary panel shows **cap values** (500pF/4700pF)
- ✅ Total of **25 stages** (not 24)
- ✅ ERA stage appears **after V2b**, before Master
- ✅ Build succeeds: `dist/simulator.html` works standalone

---

## Rollback (If Needed)

If implementation has issues:

```bash
# Revert to previous commit
git log --oneline  # Find commit before changes
git revert <commit-hash>

# Or restore from backup
git stash
```

Original behavior:
- ERA: Plexi -7dB, 80s -12dB, Modern -20dB (passive loss)
- Bright: Simple on/off boolean toggles
