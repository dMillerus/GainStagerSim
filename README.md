# Chupacabra + Klein-ulator Gain Staging Simulator

An interactive web-based gain staging simulator for the **Ceriatone Chupacabra 100W** high-gain amplifier with **Klein-ulator buffered FX loop**. Visualize signal levels through 21+ stages with real-time soft-clip tube saturation modeling.

![Version](https://img.shields.io/badge/version-5.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

---

## 🎯 About

The Chupacabra Gain Staging Simulator is an educational tool designed to help guitarists and amp enthusiasts understand how signal levels evolve through a high-gain amplifier's signal chain. Watch in real-time as your control settings affect gain staging, saturation, and tone across the preamp, power amp, and FX loop.

**What it models:**
- **Ceriatone Chupacabra 100W**: Jose Arredondo-inspired high-gain Marshall derivative with three cascaded ECC83 preamp stages, dual gain controls, ERA voicing switch, and 4×EL34 power section
- **Klein-ulator FX Loop**: Standalone buffered FX loop with SEND/RETURN/RECOVERY controls
- **Signal chain**: 21+ metered stages from guitar pickup through Captor X reactive load
- **Tube saturation**: Soft-clip algorithm modeling progressive tube compression

This simulator is based on circuit topology analysis and theoretical modeling, with corrections applied in February 2026 to model the V2b cathode follower stage and signal flow topology. **Accuracy verification against actual hardware is ongoing work.**

---

## ✨ Features

### Interactive Controls
- **Dual Gain Controls**: Gain 1 + Gain 2 with BRIGHT switches (Subtle/Aggressive modes)
- **Pussy Trimmer**: Ceriatone-specific grid shunt attenuator (0-10 range)
- **ERA Switch**: Three voicing modes (Plexi bypass, '80s 18 dBV clip, Modern 12 dBV clip)
- **Master Volume**: Pre-tonestack gain control (Chupacabra-specific placement)
- **Tonestack**: Bass, Mid, Treble controls with passive EQ modeling
- **FX Loop**: Klein-ulator SEND/RETURN/RECOVERY controls
- **Power Section**: Presence, Resonance, and negative feedback modeling
- **Focus Switch**: +1.0 dB pre-PI boost (Ceriatone-specific feature)

### Real-Time Visualization
- **Signal Level Meters**: Track dBV levels at every stage
- **Drive Indicators**: Show percentage of tube compression (0-100%)
- **Color-Coded Display**: Clean (green), soft-clip (yellow), hard-clip (red)
- **Summary Panel**: Tone recommendations, headroom warnings, gain distribution analysis

### Two View Modes
- **Amp View**: Controls organized by physical panel layout (front/rear/Klein-ulator)
- **Signal Flow View**: Controls arranged in actual signal chain order
- **Synchronized Controls**: Changes in one view instantly update the other

### Educational Tools
- **Stage-by-Stage Breakdown**: Visualize theoretical gain and clipping at every tube stage
- **Pickup Selection**: Model typical Bridge/Middle/Neck humbucker output levels
- **Captor X Integration**: Visualize speaker load and attenuation
- **Comprehensive Analysis**: Explore where saturation is predicted to occur and why

---

## 🚀 Getting Started

### Quick Start (Recommended for End Users)

The easiest way to use the simulator is with the pre-built single-file version:

1. **Download** `dist/simulator.html` from this repository
2. **Double-click** to open in any modern web browser
3. **Start experimenting** with the controls!

No installation, no server, no dependencies—just open and use.

### Development Version

If you want to explore the source code or make modifications:

```bash
# Clone the repository
git clone https://github.com/yourusername/GainStagerSim.git
cd GainStagerSim

# Start a local HTTP server (required for ES6 modules)
python3 -m http.server 8000

# Open in your browser
# Navigate to http://localhost:8000
```

**Why HTTP server?** The development version uses ES6 modules (`import`/`export`), which require HTTP protocol. Opening `index.html` directly with `file://` won't work.

---

## 📖 Usage

### Basic Operation

1. **Select your pickup**: Click the pickup selector (neck/middle/bridge) to set input level
2. **Adjust gain controls**: Turn GAIN 1 and GAIN 2 knobs to dial in preamp saturation
3. **Choose ERA voicing**: Switch between Plexi (bypass), '80s, or Modern clipping modes
4. **Set Master volume**: Control drive into the tonestack (pre-EQ placement)
5. **Shape your tone**: Adjust Bass, Mid, Treble controls
6. **Watch the meters**: Observe signal levels and drive percentages in real-time

### Reading the Meters

Each stage shows two values:
- **Level (dBV)**: Absolute signal voltage in decibels relative to 1 volt RMS
- **Drive (%)**: Percentage of tube compression/saturation (0% = clean, 100% = maximum clipping)

**Color codes:**
- 🟢 **Green**: Clean signal, no clipping
- 🟡 **Yellow**: Soft-clip region, progressive tube saturation
- 🔴 **Red**: Hard-clip region, maximum compression

### Understanding the Summary Panel

The summary panel provides theoretical analysis based on the current model:
- **Tone recommendations**: Suggested EQ adjustments based on modeled gain staging
- **Headroom warnings**: Alerts when modeled stages predict clipping or insufficient drive
- **Gain distribution**: Shows where theoretical gain and clipping occur in the signal chain
- **Overall assessment**: Predicted tone characteristics like "Warm overdrive," "Heavy saturation," "Clean headroom," etc.

### View Modes

Toggle between two organizational layouts:

- **Amp View** (default): Mimics the physical amplifier layout—controls grouped by front panel, rear panel, and Klein-ulator unit
- **Signal Flow View**: Arranges controls in actual electrical signal order—great for understanding how signal progresses through the circuit

**Pro tip**: Use Amp View when dialing in settings like you would on the real amp. Use Signal Flow View when learning how the circuit stages interact.

---

## 🛠️ Development

### Development Note

This entire project has been created by a **non-electrical engineer** through iterative sessions with Claude Code (claude.ai/code). The codebase, architecture, documentation, and corrections have all been developed through AI-assisted pair programming sessions. This includes:
- Initial circuit modeling and gain math implementation
- Modular ES6 architecture design
- UI/UX design and responsive layouts
- Bug fixes and accuracy corrections (including the February 2026 V2b cathode follower fix)
- All documentation (README, CLAUDE.md, memory files)

This transparent acknowledgment reflects both the collaborative nature of modern software development and the reason expert validation is needed—the project was built through research and AI assistance, not formal electrical engineering training. **Community contributions from EE professionals and amp technicians are essential to improving model accuracy.**

### Prerequisites

- **Python 3**: For running the build script
- **Modern web browser**: Chrome, Firefox, Safari, or Edge (ES6 support required)
- **HTTP server**: For development (Python's built-in server works great)

### Project Structure

```
GainStagerSim/
├── index.html              # Main entry point
├── src/
│   ├── css/                # Modular stylesheets
│   │   ├── variables.css   # CSS custom properties
│   │   ├── layout.css      # Sections, panels, views
│   │   ├── controls.css    # Knobs, switches, selectors
│   │   ├── meters.css      # Meter displays
│   │   └── ...
│   └── js/                 # Modular ES6 JavaScript
│       ├── main.js         # Application entry point
│       ├── config/         # Amp configuration constants
│       ├── core/           # Gain math, signal chain, state
│       ├── ui/             # Meters, summary, indicators
│       └── controls/       # Knob/switch event handlers
├── scripts/
│   └── build.py            # Single-file build script
├── dist/
│   └── simulator.html      # Built single-file distribution
└── docs/                   # Technical documentation
```

### Building the Distribution

To generate the single-file `dist/simulator.html`:

```bash
python3 scripts/build.py
```

The build script:
1. Reads `index.html` as the template
2. Inlines all CSS from `src/css/` (resolving `@import` statements)
3. Inlines all JavaScript from `src/js/` (resolving ES6 `import` statements)
4. Outputs a standalone HTML file with no external dependencies

### Code Architecture

**Modular ES6 design:**
- **Pure functions** in `core/gain-math.js` (no side effects, no DOM access)
- **Configuration constants** in `config/amp-config.js` (tube stage parameters, defaults)
- **Signal chain calculation** in `core/signal-chain.js` (traverses stages, applies gain math)
- **UI updates** in `ui/` modules (meters, summary, signal flow indicators)
- **Event handlers** in `controls/` modules (knobs, switches, selectors)

**State management:**
- Centralized state object in `GainStagingSimulator.state`
- Control IDs map to state keys via `getStateKey()` helper
- Debounced updates at 50ms for smooth interaction

### Testing Your Changes

After modifying the code:

1. **Verify the build succeeds:**
   ```bash
   python3 scripts/build.py
   ```

2. **Test key scenarios:**
   - Default settings (all controls at nominal positions)
   - Maximum gain (all gain/volume controls at 10)
   - Clean tone (all gain controls at 0, master at 1)

3. **Check the console for errors:**
   ```javascript
   window.gainSimulator.getStages().forEach(s =>
     console.log(`${s.name}: ${s.level.toFixed(1)} dBV, ${s.drive.toFixed(1)}% drive`)
   );
   ```

4. **Verify UI synchronization:**
   - Changes in Amp View update Signal Flow View
   - Meters update correctly
   - Summary panel shows accurate analysis

---

## 🔬 Technical Details

### Signal Chain Topology

The simulator models the actual Chupacabra circuit topology:

```
Pickup → Cable Loss → V1a (Gain 1) → V1b (Gain 2) → Pussy Trimmer → V2a →
V2b (Cathode Follower) → ERA Clipping → Master Volume → Tonestack →
[FX Loop: Send → Return → Recovery] → Phase Inverter → Focus →
Power Amp (4×EL34) → NFB → Captor X
```

**Key stages:**
- **V1a, V1b, V2a**: Cascaded gain stages (35 dB, 30 dB, 35 dB)
- **V2b**: Cathode follower (0 dB, unity gain buffer that drives passive tonestack)
- **ERA**: Switchable diode clipping (Plexi bypass, '80s 18 dBV, Modern 12 dBV)
- **Master**: Pre-tonestack gain control (Chupacabra-specific placement)
- **Tonestack**: Passive EQ network with -10 dB base insertion loss
- **PI**: Long-tail pair phase inverter (20 dB gain)
- **Power**: 4×EL34 cathode-biased output section (26 dB gain)

### Gain Math Fundamentals

All signal levels are expressed in **dBV** (decibels relative to 1 volt RMS).

**Reference levels:**
- Bridge humbucker: **-6 dBV** (0.5V RMS, typical output)
- Middle position: **-8 dBV** (0.4V RMS)
- Neck humbucker: **-10 dBV** (0.3V RMS)

**Soft-clip algorithm:**
```javascript
softClip(level, threshold, knee=6) {
  if (level < threshold - knee) return level;  // Clean
  const excess = level - (threshold - knee);
  const compressed = knee * tanh(excess / knee);
  return (threshold - knee) + compressed;      // Saturated
}
```

**Pot tapers:**
- **Log taper** (volume controls): `20 * log10((value/10)²)` — mimics audio pot response
- **Linear taper** (EQ controls): -10 dB to +10 dB range

### Modeling Simplifications

This is an educational tool, not a SPICE-level circuit simulation. Known simplifications:

1. **Frequency-independent**: Models amplitude only (no frequency domain analysis)
2. **Broadband BRIGHT switches**: Real circuits use capacitor-based high-pass filtering
3. **Simplified cathode follower**: V2b doesn't model impedance loading effects
4. **Soft-knee diode clipping**: Real ERA diodes have sharper threshold transitions
5. **Unity-gain FX loop assumption**: Doesn't model external pedal gain/loss
6. **Simplified tonestack**: Passive EQ network simplified to insertion loss + modifier
7. **No parasitic effects**: Doesn't model miller capacitance, lead dress, etc.

The simulator aims to provide educational insight into gain staging behavior and help users understand where saturation occurs in the signal chain. Ongoing work includes verification against actual hardware measurements to improve model accuracy.

---

## ✅ Accuracy Notes

### ⚠️ Current Status: Theoretical Model Under Verification

This simulator is an **active development project** with ongoing accuracy verification work:

- **Model status**: Based on circuit topology and theoretical calculations only
- **Developer background**: Created by a non-electrical engineer through research and modeling
- **Hardware measurements**: Not yet started - developer lacks equipment and expertise for accurate measurements
- **Validation status**: No direct measurements from actual Chupacabra units have been taken
- **Known discrepancies**: Expected until comprehensive hardware validation is completed by community experts
- **Use case**: Educational tool for understanding gain staging concepts, not a precision measurement instrument

**One of the primary reasons for making this project public is to recruit help from the community** - especially electrical engineers, amp techs, and Chupacabra owners who can provide measurements, circuit analysis, or corrections to improve model accuracy. Your expertise is critically needed!

### Recent Corrections (February 2026)

**V2b Cathode Follower Fix:**
- Earlier versions incorrectly modeled V2b as a +30 dB gain stage with 35 dBV clipping
- Corrected to accurately represent the cathode follower topology (0 dB gain, no clipping)
- Total preamp gain reduced from ~130 dB to ~100 dB, matching actual circuit behavior

**Signal Flow UI Fix:**
- Corrected Signal Flow View to show proper stage order
- V2b cathode follower now positioned correctly after V2a (before ERA/Master)
- Master volume now shown before tonestack (verified circuit topology)

**Verified Chupacabra-specific features:**
- Pre-tonestack Master Volume ✅ (verified via FX loop tap point)
- ERA Modern mode clips earliest at 12 dBV ✅ (tightest compression)
- Pussy Trimmer grid shunt attenuator ✅ (Ceriatone-specific)
- Focus switch +1.0 dB boost ✅ (Ceriatone-specific)

### Model Development and Verification Status

The simulator is based on:
- Standard Marshall/Jose circuit topology references (verified from public sources)
- Ceriatone documentation and specifications (verified from public sources)
- Klein-ulator FX loop published specifications (verified from public sources)
- Theoretical tube stage gain calculations based on typical ECC83/12AX7 parameters
- **Hardware measurements**: None taken - awaiting community contributions from those with measurement equipment and expertise

This is an **educational model** attempting to represent the amplifier's behavior. Differences from actual hardware are expected due to:
- Component tolerances (resistors, capacitors)
- Tube-to-tube variations (gain, threshold, compression characteristics)
- Build variations between individual amplifiers
- Frequency-dependent effects not modeled
- Simplified representations of complex circuit interactions

**Accuracy is ongoing work.** Specific areas under verification include:
- Actual tube stage gain values in the Chupacabra (vs. theoretical calculations)
- Clipping threshold levels at various stages
- ERA switch diode clipping characteristics (actual knee sharpness and threshold)
- Master volume interaction with tonestack loading
- FX loop recovery control gain range
- Power section saturation characteristics with EL34s

Feedback and measurements from Chupacabra owners are welcomed to improve the model. Ideal measurements include:
- Signal levels (RMS voltage) at test points with known control settings
- Oscilloscope captures showing clipping onset at various stages
- Frequency response measurements of bright switches and tonestack
- Comparisons between simulator predictions and actual amp behavior

---

## 🤝 Contributing

**Help Needed!** This project was created by a non-electrical engineer and needs community expertise to improve accuracy. Contributions are especially welcome from:

- **Electrical engineers**: Circuit analysis, tube stage calculations, validation of modeling assumptions
- **Amp technicians**: Real-world measurements, oscilloscope captures, bench testing data
- **Chupacabra owners**: Signal level measurements, A/B comparisons between simulator and actual amp behavior
- **Software developers**: Code improvements, bug fixes, feature additions
- **Documentation writers**: Clarity improvements, tutorial content, technical corrections

**Types of contributions:**
- Report inaccuracies or bugs (with measurements if possible)
- Provide circuit analysis or corrections to gain stage modeling
- Share oscilloscope captures or voltage measurements from actual amps
- Suggest feature improvements
- Add support for other Ceriatone models
- Improve the documentation

**Please:**
1. Open an issue first to discuss significant changes
2. For accuracy corrections, include supporting evidence (measurements, scope captures, circuit analysis)
3. Follow the existing code style (see `CLAUDE.md` for conventions)
4. Test your changes thoroughly before submitting PRs
5. Update documentation as needed

For detailed developer guidance, see:
- **CLAUDE.md**: Codebase architecture, conventions, domain context
- **src/js/**: Modular code organization with inline comments

---

## 📄 License

This project is licensed under the **MIT License**—see [LICENSE.txt](LICENSE.txt) for details.

**In short:** Free to use, modify, and distribute. No warranty provided.

---

## 🙏 Acknowledgments

- **Ceriatone**: For the outstanding Chupacabra 100W amplifier design
- **Klein-ulator**: For the buffered FX loop design
- **Marshall / Jose Arredondo**: For the foundational circuit topology
- **The tube amp community**: For shared knowledge and circuit analysis resources
- **Claude Code (Anthropic)**: AI-assisted development tool used to create this entire project through iterative pair programming sessions

---

## 📚 Additional Documentation

- **[CLAUDE.md](CLAUDE.md)**: Detailed developer guide (architecture, conventions, domain context)
- **[QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)**: Fast-track guide for sending to Ceriatone
- **[docs/](docs/)**: Technical documentation, implementation notes, testing checklists

---

## 🎸 About the Ceriatone Chupacabra 100W

The Chupacabra is a boutique high-gain amplifier based on the legendary Jose Arredondo modifications to Marshall amplifiers, famously used by artists like James Hetfield of Metallica. The Ceriatone implementation adds modern refinements like the ERA voicing switch, Pussy Trimmer attenuator, and Focus boost—all modeled in this simulator.

**Learn more:** [https://ceriatone.com/](https://ceriatone.com/)

---

## 📧 Contact

Questions, suggestions, or feedback? Open an issue on GitHub or contact the developer.

**Enjoy exploring the gain staging simulator!** 🎚️🎛️🎸
