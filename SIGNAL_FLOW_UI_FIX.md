# Signal Flow UI Fix - Master and V2b Positioning

**Date**: February 6, 2026
**Issue**: UI layout didn't match actual signal chain order
**Status**: ✅ FIXED

---

## Problem

The UI layout (especially Signal Flow View) showed incorrect signal order:

**WRONG (before fix):**
```
ERA → Tonestack → V2b → FX Loop → Master → PI → Power
```

**CORRECT (after fix):**
```
V2a → V2b → ERA → Master → Tonestack → FX Loop → Focus → Presence → Resonance → PI → Power
```

### Specific Issues

1. **V2b positioned after Tonestack** (should be before ERA)
2. **Master positioned after FX Loop** (should be before Tonestack)
3. **Amp View had no indication** that Master is pre-tonestack despite being on rear panel

---

## Changes Made

### 1. Signal Flow View - Preamp Section

**Before:**
- ERA → Tonestack → V2b indicator

**After:**
- V2b (CF) → ERA → Master → Tonestack

Now correctly shows:
- V2b cathode follower immediately after V2a
- ERA diode clipping stage
- Master volume control (pre-tonestack)
- Tonestack (Bass/Mid/Treble)

### 2. Signal Flow View - Power Section

**Before:**
- Master (with Focus) → PI stage

**After:**
- Focus → PI stage

Removed Master from Power Section (moved to Preamp section where it belongs in signal path).

### 3. Amp View - Section Titles and Notes

**Before:**
- "Preamp — Chupacabra 100 (Front Panel)"
- "Power Section — Chupacabra 100 (Rear Panel)"
- No indication of signal order

**After:**
- "Front Panel Controls — Chupacabra 100"
- "Rear Panel Controls — Chupacabra 100"
- **Added note**: "Note: Master is pre-tonestack in signal path. See Signal Flow View for signal order."

This clarifies that Amp View groups by physical location, not signal order.

### 4. CSS Styling

Added `.section-note` class for informational notes:
```css
.section-note {
    font-size: 0.85rem;
    color: var(--color-text-dim);
    font-style: italic;
    margin: -10px 0 15px 0;
    padding: 8px 12px;
    background: rgba(255, 165, 0, 0.05);
    border-left: 2px solid var(--color-accent);
    border-radius: 4px;
}
```

---

## Correct Signal Chain Order

### Complete Signal Path (as now shown in Signal Flow View)

1. **Input Stage**: Pickup → Guitar Vol → Input
2. **Preamp Stages**:
   - V1a (Gain 1 + Bright 1)
   - V1b (Gain 2 + Bright 2)
   - Pussy Trim
   - V2a
   - **V2b (Cathode Follower)** ← Unity gain buffer
   - ERA (Plexi/80s/Modern)
   - **Master** ← Pre-tonestack position
   - Tonestack (Bass/Mid/Treble)
3. **FX Loop**: Send → Return → Recovery
4. **Power Section**:
   - Focus
   - Presence
   - Resonance
   - PI (Phase Inverter)
   - Power (4×EL34)
5. **Output**: Captor X

---

## Why This Matters

### V2b Position
- V2b is a **cathode follower** (unity gain buffer)
- Must come **after V2a** (third gain stage)
- Must come **before ERA** (diode clipping)
- Provides low impedance to drive the tonestack

### Master Position
- Master is **pre-tonestack** in Chupacabra design
- Controls drive **into** the EQ section, not after it
- This is different from post-PI master volumes
- Verified by FX loop behavior (Master doesn't affect FX Return signal)

### User Understanding
- Signal Flow View should match actual signal path
- Amp View can group by physical layout, but needs notes
- Prevents confusion about where clipping happens

---

## Files Modified

| File | Changes |
|------|---------|
| `index.html` | Restructured Signal Flow View, added section notes |
| `src/css/layout.css` | Added `.section-note` styling |
| `dist/simulator.html` | Rebuilt distribution (110 KB) |

---

## Visual Changes

### Signal Flow View (Key Change)
```
OLD: ...V2a → ERA → Tonestack → V2b → FX Loop → Master → PI...
NEW: ...V2a → V2b(CF) → ERA → Master → Tonestack → FX Loop → Focus → PI...
```

### Amp View (Added Note)
```
Rear Panel Controls — Chupacabra 100
Note: Master is pre-tonestack in signal path. See Signal Flow View for signal order.

[Master] [Focus] [Presence] [Resonance] [Pussy Trim]
```

---

## Testing

1. **Open simulator** in browser
2. **Switch to Signal Flow View**
3. **Verify order**: Should see V2b → ERA → Master → Tonestack
4. **Switch to Amp View**
5. **Check note**: Should see pre-tonestack note under "Rear Panel Controls"

---

## Notes

- **Amp View** continues to group controls by physical panel location (front vs rear), which is appropriate for mimicking the actual amp layout
- **Signal Flow View** now accurately represents signal chain order for technical understanding
- V2b labeled as "(CF)" to indicate Cathode Follower
- Master remains mirrored between both views (controls stay synced)

---

## Related Changes

This fix complements the V2b cathode follower correction (commit 2272601) where V2b gain was corrected from 30 dB to 0 dB. Now both the **calculation** and the **UI layout** accurately represent the Chupacabra circuit topology.

---

## Success Criteria

- [x] V2b appears before ERA in Signal Flow View
- [x] Master appears before Tonestack in Signal Flow View
- [x] Master removed from Power Section in Signal Flow View
- [x] Focus properly positioned in Power Section
- [x] Amp View has explanatory note about Master position
- [x] Section note styling added and displays correctly
- [x] Build succeeds without errors
- [x] Distribution updated (110 KB)
