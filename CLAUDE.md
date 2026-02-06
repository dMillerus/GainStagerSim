# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive gain staging simulator for a Ceriatone Chupacabra 100W amplifier with Klein-ulator buffered FX loop. Models signal levels (dBV) through 21 stages with soft-clip tube saturation modeling.

**Architecture**: Single-file HTML application — all CSS, JS, and markup in one document. Never split into separate files.

## Domain Context

- **Chupacabra 100**: Jose Arredondo-inspired high-gain Marshall derivative. 4×EL34 power section, three cascaded ECC83 preamp stages, dual gain controls, ERA switch (Plexi/'80s/Modern voicing), PPIMV, buffered FX loop.
- **Klein-ulator**: Standalone buffered FX loop unit with SEND/RETURN/RECOVERY controls. Adds ~+2.5 dB net gain at default settings.
- **Signal chain**: 21 metered stages from guitar pickup through Captor X reactive load.

## Gain Math Model

All levels in dBV. Reference: -6 dBV (bridge humbucker).

| Stage | Gain | Clip Threshold |
|-------|------|----------------|
| V1a | 35 dB | 38 dBV |
| V1b | 30 dB | 32 dBV |
| V2a | 35 dB | 38 dBV |
| V2b | 30 dB | 35 dBV |
| PI | 20 dB | 40 dBV |
| Power | 26 dB | 44 dBV |

**Key formulas**:
- Soft-clip: `softClip(level, threshold, knee=6)` — tanh compression above onset (threshold - knee). Returns `{clamped, raw, drive}`.
- Log taper pots: `20 * Math.log10(Math.pow(v/10, 2))`
- Tonestack loss: ERA-dependent (-7 to -20 dB range)
- BRIGHT switches: broadband +1.5 dB (Mid) or +2.5 dB (Hi)
- Captor X attenuation: 0 / -12 / -38 dB positions

## Code Conventions

- Simulator class at `window.gainSimulator`, initialized on DOMContentLoaded with 100ms delay
- `scheduleUpdate()` debounces recalculation at 50ms for smooth knob interaction
- Knobs: vertical drag (mousedown/mousemove). Switches: click to cycle.
- Meter strips injected via `createMeterStrips()`
- Each meter: clip LED, bar graph, stage name, clamped dBV, drive indicator (▲dB)
- Dark theme, #4ecdc4 accent, radial-gradient knobs
- Maintain backward compatibility with existing control IDs and data attributes

## Validation

When modifying gain math, validate with a node script tracing defaults through the chain. Show before/after values at test points:
- Default settings
- Maximum gain
- Clean settings

## Version Control Workflow

Repository uses git with enforcement hooks to ensure all HTML changes are tracked.

**Commit after each simulator change**:
```bash
git add chupacabra_kleinulator_interactive_v4.html
git commit -m "Description of change"
```

**Pre-commit hook enforcement**: Commits are rejected if the HTML file has unstaged changes. This prevents partial commits where simulator modifications slip through untracked.

**Version naming**: Major revisions increment the filename version (v4 → v5). Minor changes are tracked via commit history within the same version.

## Known Limitations

1. BRIGHT switches are broadband — not frequency-dependent
2. Speaker output runs ~2dB hot vs theoretical 100W/8Ω
3. No frequency-domain modeling (broadband amplitude only)
4. FX loop assumes unity gain from external pedals
5. Simplified tonestack interaction modeling
