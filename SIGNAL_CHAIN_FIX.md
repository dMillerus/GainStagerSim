# Signal Chain Fix - Master Volume and FX Loop Position

## Date: 2026-02-06

## Problem
The signal chain had Master Volume and FX Loop in incorrect positions relative to the tonestack, based on analysis of the Ceriatone Chupacabra schematic.

### Incorrect Order (Before)
```
V2a → Tonestack → V2b → ERA → [FX Loop] → Master → PI
```

### Correct Order (After)
```
V2a → V2b → ERA → Master → Tonestack → [FX Loop] → PI
```

## Changes Made

### 1. File: `src/js/core/signal-chain.js`

**Reordered stages 10-13:**
- **Stage 10**: V2b (moved from stage 11)
  - Updated comment from "fourth gain stage / recovery" to "fourth preamp gain stage"
  - No longer "recovering" from tonestack loss since master is now pre-tonestack

- **Stage 11**: ERA Diode Clipping (unchanged position)
  - Already correctly positioned post-V2b, pre-Master

- **Stage 12**: Master volume (moved from stage 19)
  - Now pre-tonestack (controls drive INTO EQ section)
  - Changed section from `'power'` to `'preamp'`
  - Updated comment to "pre-tonestack master"

- **Stage 13**: Tonestack (moved from stage 10)
  - Now receives signal from Master
  - Remains in `'preamp'` section

**Moved preampOutput marker:**
- Now set after Tonestack (stage 13), before FX Loop
- Previously was after ERA (old stage 12)

**Renumbered FX Loop stages:**
- Stage 14: FX Send level (was 13)
- Stage 15: Send bright switch (was 14)
- Stage 16: FX Loop out (was 15)
- Stage 17: FX Return level (was 16)
- Stage 18: Return bright switch (was 17)
- Stage 19: Recovery stage (was 18)

**Removed duplicate Master from power section:**
- Old stage 19 (Master in power section) completely removed

**Power section stages (unchanged functionality):**
- Stage 20: Focus switch
- Stage 21: Presence
- Stage 22: Resonance
- Stage 23: Phase Inverter
- Stage 24: Power tubes
- Stage 25: Captor X

### 2. File: `src/js/config/amp-config.js`

**Updated `stageCounts`:**
```javascript
{
    input: 3,    // Unchanged
    preamp: 10,  // Was 9 - now includes Master
    fxloop: 6,   // Unchanged
    power: 5,    // Was 6 - Master moved to preamp
    output: 1    // Unchanged
}
```

Added detailed comment explaining each section's stages.

### 3. File: `CLAUDE.md`

**Updated Domain Context section:**
- Emphasized that Master is **pre-tonestack** (unusual but correct for Chupacabra)
- Added circuit topology diagram: `V2a → V2b → ERA → Master → Tonestack → [FX Loop] → PI → Power`
- Noted that FX Loop taps from tonestack output
- Clarified Master controls drive INTO the EQ section

## Technical Impact

### Signal Flow Changes

1. **Master now controls tonestack drive:**
   - Before: Master controlled post-EQ output level
   - After: Master controls how hard the signal hits the tonestack
   - Effect: Tonestack EQ may interact differently at various master settings (this is correct behavior)

2. **FX Send level reflects post-tonestack signal:**
   - FX Send now receives signal that has passed through tonestack
   - Send level will be ~10dB lower than before (due to tonestack loss)
   - This matches the actual circuit topology

3. **Preamp output marker moved:**
   - Now marks the output after tonestack (last true preamp stage)
   - Before FX loop or power section begins

### User-Visible Changes

- Master control behavior may feel different (affects EQ interaction)
- Overall gain structure more accurately represents the actual amplifier
- Signal levels in meters will shift slightly but reflect true circuit behavior

## Schematic Evidence

Based on user analysis of Chupacabra schematic:
- V2 pin 8 → ERA switch → Master pot lug 3 (input)
- Master pot lug 2 (output) → Tonestack input (splits to Treble/Middle/Bass pots)
- FX Send taps from Treble pot lug 2 (tonestack output)
- FX Return goes to V3 pin 2 (Phase Inverter grid input)

**Key insight**: Master Volume is PRE-tonestack, controlling drive INTO the EQ section.

## Testing

The changes were verified by:
1. Code inspection - confirmed correct stage order
2. Section assignment - Master now in `'preamp'` section
3. Stage counts updated - preamp +1, power -1
4. Build successful - single-file distribution builds without errors

## Files Modified

- `src/js/core/signal-chain.js` - Signal chain reordering
- `src/js/config/amp-config.js` - Stage counts updated
- `CLAUDE.md` - Documentation updated
- `dist/simulator.html` - Rebuilt distribution

## Backward Compatibility

This is a **breaking change** in terms of behavior but represents a **bug fix** to match the actual circuit:
- Users may notice different tonal behavior with Master control
- Signal levels in meters will be more accurate
- Overall gain structure correctly represents the real amplifier

## Notes

- Pure reordering of existing calculations - no new math added
- All existing gain calculations and soft-clipping remain unchanged
- FX Loop abstraction (Klein-ulator on/off toggle) unchanged
- Pussy Trim position confirmed correct (stage 8, before V2a) - no changes needed
