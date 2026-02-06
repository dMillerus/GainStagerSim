# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive gain staging simulator for a Ceriatone Chupacabra 100W amplifier with Klein-ulator buffered FX loop. Models signal levels (dBV) through 21+ stages with soft-clip tube saturation modeling.

**Architecture**: Modular ES6 application with separate CSS and JavaScript files. Single-file distribution built via `scripts/build.py`.

## File Structure

```
GainStagerSim/
├── index.html                    # Entry point (~440 lines HTML only)
├── src/
│   ├── css/
│   │   ├── variables.css         # CSS custom properties (colors, sizes)
│   │   ├── base.css              # Reset, body, typography
│   │   ├── layout.css            # Sections, panels, rows, view modes
│   │   ├── controls.css          # Knobs, switches, selectors
│   │   ├── meters.css            # Meter panel components
│   │   ├── summary.css           # Summary panel, analysis
│   │   └── responsive.css        # Media queries
│   │
│   └── js/
│       ├── main.js               # App entry point, GainStagingSimulator class
│       ├── config/
│       │   └── amp-config.js     # tubeStages, eraLoss, pickupLevels, defaults
│       ├── core/
│       │   ├── gain-math.js      # softClip, logTaper, linearTaper (pure functions)
│       │   ├── signal-chain.js   # calculateSignalChain(), stage traversal
│       │   └── state.js          # State management, controlToStateKey mapping
│       ├── ui/
│       │   ├── meters.js         # createMeterStrips, updateMeters
│       │   ├── summary.js        # updateSummary, toneRecommendation
│       │   └── signal-flow.js    # updateSignalFlowIndicators
│       └── controls/
│           ├── knobs.js          # Knob drag interaction
│           ├── switches.js       # Switch toggle handlers
│           ├── selectors.js      # Pickup, ERA, Captor selectors
│           └── view-toggle.js    # View mode, meter panel toggles
│
├── scripts/
│   └── build.py                  # Bundles to single HTML for distribution
├── dist/
│   └── simulator.html            # Built single-file output
├── chupacabra_kleinulator_interactive_v5.html  # Legacy single-file (archived)
└── CLAUDE.md                     # This file
```

## Domain Context

- **Chupacabra 100**: Jose Arredondo-inspired high-gain Marshall derivative. 4×EL34 power section, three cascaded ECC83 preamp gain stages (V1a/V1b/V2a) + V2b cathode follower buffer, dual gain controls, ERA switch (Plexi/'80s/Modern voicing), **pre-tonestack master volume** (controls drive into EQ section), buffered FX loop.
- **Klein-ulator**: Standalone buffered FX loop unit with SEND/RETURN/RECOVERY controls. Adds ~+2.5 dB net gain at default settings. Taps from tonestack output.
- **Signal chain**: 21+ metered stages from guitar pickup through Captor X reactive load.
- **Circuit topology**: V1a → V1b → V2a → **V2b (cathode follower)** → ERA → **Master** → Tonestack → [FX Loop] → PI → Power
- **Chupacabra-specific features**: Pre-tonestack Master (differs from some Jose kits), Modern ERA clips earliest (verified correct), Pussy Trimmer (Ceriatone feature), Focus switch (Ceriatone feature)

## Gain Math Model

All levels in dBV. Reference: -6 dBV (bridge humbucker).

| Stage | Gain | Clip Threshold | Notes |
|-------|------|----------------|-------|
| V1a | 35 dB | 38 dBV | First gain stage |
| V1b | 30 dB | 32 dBV | Second gain stage |
| V2a | 35 dB | 38 dBV | Third gain stage |
| V2b | **0 dB** | **N/A** | **Cathode follower** (unity gain buffer, drives tonestack) |
| PI | 20 dB | 40 dBV | Phase inverter |
| Power | 26 dB | 44 dBV | 4×EL34 output section |

**Key formulas** (in `src/js/core/gain-math.js`):
- `softClip(level, threshold, knee=6)` — tanh compression above onset
- `logTaper(value)` — audio pot curve: `20 * log10((v/10)²)`
- `linearTaper(value)` — linear pot: -10 to +10 dB range
- `nfbGain(value)` — presence/resonance: ±3 dB range
- `tonestackMod(bass, mid, treble)` — EQ insertion loss modification

**Constants** (in `src/js/config/amp-config.js`):
- ERA clipping thresholds: Plexi (bypass), '80s 18 dBV, Modern 12 dBV
- Bright boosts: Subtle +1.5 dB, Aggressive +2.5 dB
- Cable loss: 0.5 dB
- Recovery compensation: +2.5 dB at noon
- Tonestack base loss: -10 dB (with ±1.5 dB EQ modification)

## Development Workflow

### Running locally
```bash
cd /home/dave/GainStagerSim
python3 -m http.server 8000
# Open http://localhost:8000
```

ES6 modules require HTTP server — `file://` won't work.

### Building single-file distribution
```bash
python3 scripts/build.py
# Outputs: dist/simulator.html
```

The build script inlines all CSS and JS (with import resolution) into a single HTML file.

## Code Conventions

### JavaScript
- ES6 modules with `import`/`export`
- Pure functions in `core/gain-math.js` (no DOM, no state)
- Configuration constants in `config/amp-config.js`
- Signal chain calculation in `core/signal-chain.js`
- UI updates in `ui/` modules
- Event handlers in `controls/` modules
- Main app class `GainStagingSimulator` in `main.js`
- Global access via `window.gainSimulator`

### CSS
- CSS custom properties in `variables.css`
- Use `var(--color-accent)` etc. throughout
- Component-based organization

### State Management
- State object in `GainStagingSimulator.state`
- Control IDs map to state keys via `getStateKey()` in `state.js`
- `scheduleUpdate()` debounces at 50ms for smooth interaction

### Control Mirroring
- Amp View and Signal Flow View share controls
- `-sf` suffix indicates Signal Flow duplicate
- `data-mirror` attribute links mirrored controls
- State updates sync both versions automatically

## Testing Changes

When modifying gain math:

1. **Manual test at key settings**:
   - Default: all controls at nominal
   - Max gain: all gain/volume at 10
   - Clean: all gain at 0, master at 1

2. **Verify stage levels**:
   ```javascript
   window.gainSimulator.getStages().forEach(s =>
     console.log(`${s.name}: ${s.level} dBV, drive: ${s.drive}`)
   );
   ```

3. **Check for regressions**:
   - All meters update correctly
   - Knob/switch interactions sync between views
   - Summary panel shows accurate analysis

## Version Control

```bash
# After changes
git add -A
git commit -m "Description of change"

# Build distribution
python3 scripts/build.py
git add dist/simulator.html
git commit -m "Build: update single-file distribution"
```

## Known Limitations

1. BRIGHT switches are broadband — not frequency-dependent (real circuits use capacitor-based high-pass)
2. V2b cathode follower simplified (real circuit has slight impedance loading effects)
3. ERA diode clipping uses soft threshold model (real diodes have sharper knee)
4. No frequency-domain modeling (broadband amplitude only)
5. FX loop assumes unity gain from external pedals
6. Simplified tonestack interaction modeling (component value interactions not modeled)
7. Speaker output runs ~2dB hot vs theoretical 100W/8Ω

## Circuit Topology Notes

**V2b Cathode Follower**: In the actual Chupacabra circuit (following standard Marshall topology), V2b is a cathode follower that provides:
- **Unity voltage gain** (0 dB) — no amplification
- **High current gain** — low output impedance to drive passive tonestack
- **No clipping** — cathode followers don't clip like gain stages
- Total preamp gain: ~100 dB (V1a 35 dB + V1b 30 dB + V2a 35 dB)

**Corrected February 2026**: Earlier versions incorrectly modeled V2b as a +30 dB gain stage with 35 dBV clipping threshold. This has been corrected to accurately represent the cathode follower topology.

**UI Signal Flow Corrected February 2026**: Signal Flow View previously showed incorrect signal order (V2b after tonestack, Master after FX loop). Now correctly displays: V2a → V2b (CF) → ERA → Master → Tonestack → FX Loop → Power. Amp View retains physical panel grouping but includes note that Master is pre-tonestack in signal path.

## Quick Reference

| Task | File(s) |
|------|---------|
| Change tube stage params | `src/js/config/amp-config.js` |
| Modify gain calculations | `src/js/core/gain-math.js` |
| Change signal chain order | `src/js/core/signal-chain.js` |
| Update meter display | `src/js/ui/meters.js` |
| Change knob behavior | `src/js/controls/knobs.js` |
| Add CSS variable | `src/css/variables.css` |
| Change layout | `src/css/layout.css` |
| Add HTML elements | `index.html` |
