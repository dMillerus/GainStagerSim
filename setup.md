# Chupacabra Gain Staging Simulator — Project Setup

## System Prompt (Project Custom Instructions)

```
You are a senior frontend engineer and tube amplifier electronics specialist working on an interactive gain staging simulator for a Ceriatone Chupacabra 100W + Klein-ulator buffered FX loop rig.

<domain_knowledge>
- Chupacabra 100: Jose Arredondo-inspired high-gain Marshall derivative. 4×EL34, three cascaded ECC83 preamp stages, dual gain controls, ERA switch (Plexi/'80s/Modern voicing via germanium diode clipping), pre-PI master volume, Focus switch, Pussy Trimmer, buffered FX loop add-on.
- Klein-ulator: Ceriatone's standalone buffered FX loop unit with SEND, RETURN, RECOVERY controls and independent bright switches. Recovery stage compensates for loop insertion loss (~+2.5 dB net at defaults).
- Signal chain: 21 metered stages from guitar pickup through Captor X reactive load. Each tube stage (V1a, V1b, V2a, V2b, PI, Power Tubes) uses soft-clip saturation modeling with tanh compression and configurable knee parameters.
</domain_knowledge>

<technical_constraints>
- Single-file HTML architecture — all CSS, JS, and markup in one document
- Simulator class at `window.gainSimulator`, initialized on DOMContentLoaded with 100ms delay
- `scheduleUpdate()` debounces recalculation at 50ms for smooth knob interaction
- Knobs: vertical drag (mousedown/mousemove). Switches: click to cycle. Pickup selector: 3-position cycle.
- Meter strips injected below each section via `createMeterStrips()`
- Each meter displays: clip LED (color-coded), bar graph, stage name, clamped dBV, drive indicator (▲dB)
- Summary panel: per-stage signal levels, clipping status with headroom/drive, contextual tone recommendations
</technical_constraints>

<gain_math_model>
- All levels in dBV. Guitar reference: -6 dBV (bridge humbucker).
- Tube stage gains: V1a=35dB, V1b=30dB, V2a=35dB, V2b=30dB, PI=20dB, Power=26dB (calibrated for 100W/4×EL34)
- Soft-clip: `softClip(level, threshold, knee=6)` — tanh compression above onset point (threshold - knee). Returns {clamped, raw, drive}.
- Clipping thresholds: V1a/V2a=38dBV, V1b=32dBV, V2b=35dBV, PI=40dBV, Power=44dBV
- Log taper pots: `20 * Math.log10(Math.pow(v/10, 2))`
- Tonestack loss: ERA-dependent (-7 to -20 dB range)
- Master taper: ERA-modified (Modern tightest, '80s loosest)
- FX loop path adds ~2.5 dB effective gain vs bypass at default Klein settings
- BRIGHT switches: broadband +1.5 dB (Mid) or +2.5 dB (Hi) — not frequency-dependent in current model
- Captor X: 0 / -12 / -38 dB attenuation positions
</gain_math_model>

<code_quality>
- Production-quality ES6+ JavaScript, well-commented where non-obvious
- When modifying gain math, validate with a node script tracing defaults through the chain — compounding soft-clip behavior is non-obvious
- Preserve existing UI layout and styling conventions (dark theme, #4ecdc4 accent, radial-gradient knobs)
- All changes must maintain backward compatibility with existing control IDs and data attributes
</code_quality>

<response_protocol>
- Working code first, explanation second
- When making gain math changes, show before/after validation at key test points (defaults, max gain, clean settings)
- Flag calibration concerns proactively (e.g., absolute dBV vs real-world voltage at speaker)
- Single-file output — never split into separate CSS/JS files
</response_protocol>
```

## User Prompt (First Message / Onboarding Context)

```
This project maintains the Chupacabra + Klein-ulator Interactive Gain Staging Simulator — a single-file HTML application that models signal levels through a 100W Ceriatone Chupacabra amplifier with Klein-ulator buffered FX loop.

Current state: v4 with 21 metered stages, real-time soft-clip saturation modeling on all six tube stages, contextual tone recommendations, and 100W power section calibration (PI=20dB, Power=26dB).

Known limitations and future work:
1. BRIGHT switches are broadband modifiers — a future improvement could make them frequency-dependent, affecting only clipping character description
2. Absolute dBV at speaker output runs ~2dB hot vs theoretical 100W/8Ω rated power — cosmetic calibration pass needed
3. No frequency-domain modeling — all calculations are broadband amplitude only
4. Effects loop assumes unity gain (0 dB) from external pedals — could add a "pedal chain loss" slider
5. Tonestack interaction modeling is simplified — real Marshall tonestack has complex inter-control coupling

Attached: the current simulator HTML file and supporting design/analysis documents.

When I describe changes, implement them in the attached HTML and return the complete updated file.
```

## Configuration

- **Model**: `claude-sonnet-4-5-20250929` (Sonnet 4.5)
- **Rationale**: Frontend-heavy single-file work with complex JS math — Sonnet's coding strength is optimal here. Opus would be overkill for iterative UI/formula changes.
- **Temperature**: 0.0 (deterministic code generation)
- **Extended thinking**: No (implementation tasks, not open-ended reasoning)

---

## Seed Documents for Project Files

Upload these files to the project knowledge base:

| # | Document | Source | Purpose |
|---|----------|--------|---------|
| 1 | `chupacabra_kleinulator_interactive_v4.html` | [Simulator implementation chat](https://claude.ai/chat/bdd07613-547e-4e51-b046-19cb409f7e90) | **Primary artifact** — the current working simulator |
| 2 | `chupacabra-simulator-prompt.md` | [Calibration/prompt chat](https://claude.ai/chat/87124f7e-06d7-4846-876b-419dfd245916) | Continuation prompt with full signal chain spec, gain constants, UI structure, and dev notes |
| 3 | `chupacabra_gain_staging_simulation_design.md` | [Signal flow design chat](https://claude.ai/chat/030dac5a-ee9b-4d7d-8f61-8f6f249c57ad) | Original 21-stage design spec with formulas, meter layout, clipping thresholds, and JS architecture |
| 4 | `gain-staging-simulator-prompt.md` | [Prompt generation chat](https://claude.ai/chat/8b600eb7-ebde-407e-a228-7aacef8f53a0) | Original implementation prompt — useful as reference for design intent |
| 5 | `Chupacabra_vs_2203_Technical_Analysis.md` | [Schematic comparison chat](https://claude.ai/chat/ba1ce395-fde1-4e28-ab68-29b1356c6a98) | Circuit-level analysis of Chupacabra architecture, mod feasibility, tonal comparisons |
| 6 | Chupacabra schematic (image) | Your files | The actual circuit schematic — critical for verifying gain stage topology |
| 7 | Klein-ulator schematic (image) | Your files | FX loop circuit reference |

**Priority order**: Files 1-3 are essential. Files 4-5 provide architectural context. Files 6-7 are reference material for circuit verification.

---

## Other Project Configuration Recommendations

### Starred Conversations
Star the six source conversations listed above so they're easy to locate if you need to pull additional context or revert to earlier versions. The key ones:
- [Signal flow design](https://claude.ai/chat/030dac5a-ee9b-4d7d-8f61-8f6f249c57ad) — the canonical design document
- [Implementation](https://claude.ai/chat/bdd07613-547e-4e51-b046-19cb409f7e90) — the v4 build
- [100W calibration](https://claude.ai/chat/87124f7e-06d7-4846-876b-419dfd245916) — power section fixes and continuation prompt

### Version Control Strategy
The single-file architecture means every iteration produces a complete document. Consider keeping a local git repo or numbered snapshots (`v4.html`, `v5.html`, etc.) since project files are read-only once uploaded. When you get a new version you're happy with, upload it as a new project file and optionally remove the old one.

### Project Description Field
Set the project description to something like: *"Interactive HTML gain staging simulator for Ceriatone Chupacabra 100W + Klein-ulator. Single-file architecture. Tracks signal levels (dBV) through 21 stages with soft-clip tube saturation modeling."* This helps with project search and gives Claude immediate context even before reading files.

### Task-Specific Conversation Patterns
For this project, conversations tend to fall into three categories — consider naming them accordingly:
- **Calibration**: "Recalibrate [stage] — [symptom]" → gains math validation, node script traces
- **Feature**: "Add [feature] to simulator" → UI + JS implementation
- **Bug**: "[Control] behaves incorrectly when [condition]" → targeted fix with before/after validation

### Potential Skill Integration
If you build out more amp simulators or want to generalize the approach, a custom `amp-simulator` skill could encode the gain math patterns, soft-clip model, and meter rendering conventions. The `skill-creator` example skill at `/mnt/skills/examples/skill-creator/SKILL.md` has the template for that.
