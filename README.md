# Chupacabra + Klein-ulator Gain Staging Simulator

An interactive web-based gain staging simulator for the **Ceriatone Chupacabra 100W** high-gain amplifier with **Klein-ulator buffered FX loop**. Visualize signal levels through 21+ stages with real-time soft-clip tube saturation modeling.

![Version](https://img.shields.io/badge/version-5.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

---

## 🎯 About

The Chupacabra Gain Staging Simulator is an educational tool that helps guitarists and amp enthusiasts understand how signal levels evolve through a high-gain amplifier's signal chain. Watch in real-time as your control settings affect gain staging, saturation, and tone across the preamp, power amp, and FX loop.

**What it models:**
- **Ceriatone Chupacabra 100W**: Jose Arredondo-inspired high-gain Marshall derivative with three cascaded ECC83 preamp stages, dual gain controls, ERA voicing switch, and 4×EL34 power section
- **Klein-ulator FX Loop**: Standalone buffered FX loop with SEND/RETURN/RECOVERY controls
- **Signal chain**: 21+ metered stages from guitar pickup through Captor X reactive load
- **Tube saturation**: Soft-clip algorithm modeling progressive tube compression

This simulator is based on careful circuit analysis and measurements from actual Chupacabra units, with corrections applied in February 2026 to accurately model the V2b cathode follower stage and signal flow topology.

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
- **Stage-by-Stage Breakdown**: See gain and clipping at every tube stage
- **Pickup Selection**: Model Bridge/Middle/Neck humbucker output levels
- **Captor X Integration**: Visualize speaker load and attenuation
- **Comprehensive Analysis**: Understand where saturation occurs and why

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

The summary panel provides:
- **Tone recommendations**: Suggested EQ adjustments based on your settings
- **Headroom warnings**: Alerts when stages are running too hot or too cold
- **Gain distribution**: Shows where gain and clipping occur in the signal chain
- **Overall assessment**: "Warm overdrive," "Heavy saturation," "Clean headroom," etc.

### View Modes

Toggle between two organizational layouts:

- **Amp View** (default): Mimics the physical amplifier layout—controls grouped by front panel, rear panel, and Klein-ulator unit
- **Signal Flow View**: Arranges controls in actual electrical signal order—great for understanding how signal progresses through the circuit

**Pro tip**: Use Amp View when dialing in settings like you would on the real amp. Use Signal Flow View when learning how the circuit stages interact.

---

## 🛠️ Development

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

Despite these simplifications, the simulator provides accurate insight into gain staging behavior and helps users understand where saturation occurs in the signal chain.

---

## ✅ Accuracy Notes

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

### Circuit Analysis Sources

The simulator is based on:
- Owner measurements from actual Chupacabra units
- Standard Marshall/Jose circuit topology references
- Ceriatone-provided schematics and documentation
- Comparative analysis with Klein-ulator FX loop specifications

While every effort has been made to ensure accuracy, this is an **educational model** and may differ from individual amplifier units due to component tolerances, tube variations, and build differences.

---

## 🤝 Contributing

Contributions are welcome! Whether you want to:
- Report inaccuracies or bugs
- Suggest feature improvements
- Add support for other Ceriatone models
- Improve the documentation

**Please:**
1. Open an issue first to discuss significant changes
2. Follow the existing code style (see `CLAUDE.md` for conventions)
3. Test your changes thoroughly before submitting PRs
4. Update documentation as needed

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
