import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Set up canvas with 16:9 4K-ready dimensions
fig, ax = plt.subplots(figsize=(16, 9), dpi=200)
fig.patch.set_facecolor('#090d16')
ax.set_facecolor('#090d16')
ax.set_xlim(0, 160)
ax.set_ylim(0, 90)
ax.axis('off')

# Title Bar
ax.text(80, 85.5, "RESILIZ // IEEE-33 MICROGRID SYSTEM ARCHITECTURE & DATA FLOW", 
        color="#f8fafc", fontsize=15, fontweight='bold', ha='center', va='center', fontfamily='monospace')
ax.text(80, 82.5, "End-to-End Autonomous Zero-Day Protection Pipeline on IBM LinuxONE (s390x / RHEL 9.8)", 
        color="#38bdf8", fontsize=10, ha='center', va='center', fontfamily='monospace')

def draw_box(x, y, w, h, bg, border, title="", title_color="#38bdf8", border_w=1.5):
    rect = patches.FancyBboxPatch((x, y), w, h, boxstyle="square,pad=0",
                                  linewidth=border_w, edgecolor=border, facecolor=bg)
    ax.add_patch(rect)
    if title:
        header_h = 3.5
        hdr = patches.Rectangle((x, y + h - header_h), w, header_h,
                                linewidth=border_w, edgecolor=border, facecolor="#131c2e")
        ax.add_patch(hdr)
        ax.text(x + w/2, y + h - header_h/2, title,
                color=title_color, fontsize=8.5, fontweight='bold', ha='center', va='center', fontfamily='monospace')

# 1. Left Column: Physical Grid Layer (x: 5 to 45)
draw_box(5, 8, 42, 70, "#0f172a", "#334155", "1. IEEE 33-BUS MICROGRID LAYER")

grid_items = [
    ("SUBSTATION 12.66 kV (Slack Bus 1)", "Main Utility Intertie & MV Transformer", "#10b981"),
    ("BUS 14: SOLAR PV FARM", "Phase A Inverter Sag & Unbalance (0.865 pu)", "#f59e0b"),
    ("BUS 18: PV INVERTER FILTER", "5th/7th Harmonic THD Surge (>14.8%)", "#ef4444"),
    ("BUS 6: CRITICAL LATERAL FEEDER", "Islanding & Ground Fault Transient (<48.5 Hz)", "#ef4444"),
    ("BUS 25: DISTRIBUTION XFMR", "500kW BESS & Thermal Surge Overload (>95°C)", "#f59e0b"),
    ("BUS 31: WIND TURBINE GENERATOR", "PLL Inverter Phase Drift & Frequency Desync", "#38bdf8"),
    ("OPTICAL SOLID-STATE BREAKERS", "SSCB Fast Thyristor Trigger (<0.80 ms)", "#10b981"),
]

for idx, (title, sub, col) in enumerate(grid_items):
    y_pos = 65 - (idx * 8.0)
    p = patches.Rectangle((7, y_pos), 38, 6.5, linewidth=1, edgecolor=col, facecolor="#090d16")
    ax.add_patch(p)
    ax.text(9, y_pos + 4.3, title, color="#f8fafc", fontsize=7.5, fontweight='bold', fontfamily='monospace')
    ax.text(9, y_pos + 1.8, sub, color="#94a3b8", fontsize=6.2, fontfamily='monospace')

# 2. Middle Column: IBM LinuxONE Mainframe Platform (x: 52 to 108)
draw_box(52, 8, 56, 70, "#0b111e", "#0f62fe", "2. IBM LINUXONE ENTERPRISE ENGINE (s390x)", "#38bdf8", 2.0)

# Sub-compartments in Mainframe
# A. CPACF & Hardware Acceleration (Top)
draw_box(54, 58, 52, 16, "#0f172a", "#1e293b", "HARDWARE ACCELERATION ENCLAVE")
ax.text(56, 68.5, "• CPACF MSA SHA-256 Co-Processor: >1.8 GB/s wire-speed cryptographic sealing", color="#cbd5e1", fontsize=6.5, fontfamily='monospace')
ax.text(56, 65.5, "• z14/z15 SIMD Vector Extensions (-march=z14 -mtune=z15 -O3 native C math)", color="#cbd5e1", fontsize=6.5, fontfamily='monospace')
ax.text(56, 62.5, "• Internal HiperSockets 100GbE + CEX8S Hardware Security Module partition", color="#cbd5e1", fontsize=6.5, fontfamily='monospace')
ax.text(56, 59.5, "• Differential Privacy: Laplace Mechanism (ε=1.0) masking raw facility loads", color="#a855f7", fontsize=6.5, fontweight='bold', fontfamily='monospace')

# B. Dual-Stage AIOps Engine (Middle)
draw_box(54, 33, 52, 22, "#0f172a", "#1e293b", "AIOPS NANOSECOND SCORING PIPELINE")
# Model boxes
p1 = patches.Rectangle((56, 42), 23, 9, linewidth=1, edgecolor="#38bdf8", facecolor="#131c2e")
ax.add_patch(p1)
ax.text(67.5, 48.0, "ISOLATION FOREST", color="#38bdf8", fontsize=7.5, fontweight='bold', ha='center', fontfamily='monospace')
ax.text(67.5, 44.5, "Zero-Day Outlier Scoring\n(0.045s Native C Train)", color="#94a3b8", fontsize=6.0, ha='center', fontfamily='monospace')

p2 = patches.Rectangle((81, 42), 23, 9, linewidth=1, edgecolor="#10b981", facecolor="#131c2e")
ax.add_patch(p2)
ax.text(92.5, 48.0, "RANDOM FOREST", color="#10b981", fontsize=7.5, fontweight='bold', ha='center', fontfamily='monospace')
ax.text(92.5, 44.5, "6-Class DER Attribution\nMacro F1: 96.72% (Verified)", color="#94a3b8", fontsize=6.0, ha='center', fontfamily='monospace')

# Latency timing
p3 = patches.Rectangle((56, 35.5), 48, 5.0, linewidth=1, edgecolor="#f59e0b", facecolor="#181e2e")
ax.add_patch(p3)
ax.text(80, 38.0, "REAL TIMING: t0=perf_counter_ns() -> t1 => 4.20ms (p50) / 4.81ms (p95)", 
        color="#f59e0b", fontsize=6.8, fontweight='bold', ha='center', va='center', fontfamily='monospace')

# C. Remediation Engine (Bottom)
draw_box(54, 11, 52, 19, "#0f172a", "#1e293b", "AUTONOMOUS REMEDIATION & BREAKER DISPATCH")
ax.text(56, 23.5, "• Fault Clearance Engine: 4.20ms Inference + 0.80ms Optical Trip = 5.00ms Total", color="#10b981", fontsize=6.8, fontweight='bold', fontfamily='monospace')
ax.text(56, 20.5, "• Legacy SCADA Polling Gap: 3,000ms RTU Cycle -> SAVES GRID 2,995ms AHEAD", color="#ef4444", fontsize=6.8, fontweight='bold', fontfamily='monospace')
ax.text(56, 17.5, "• Automated Breaker Directive Dispatch: SVC Shunt, APF Harmonic, BESS Shave", color="#cbd5e1", fontsize=6.5, fontfamily='monospace')
ax.text(56, 14.5, "• Circular Immutable Audit Trail with nanosecond UTC timestamps & signatures", color="#94a3b8", fontsize=6.5, fontfamily='monospace')

# 3. Right Column: Industrial Grid Control Room Console (x: 115 to 155)
draw_box(115, 8, 40, 70, "#0f172a", "#334155", "3. INDUSTRIAL NOC CONSOLE")

noc_panels = [
    ("HARDWARE TELEMETRY RIBBON", "IBM LinuxONE Host, 2,840 fps, Live ms", "#38bdf8"),
    ("COMMAND BAR & INJECTOR", "6 Feeder Push-Buttons (50Hz Reset to Fault)", "#f59e0b"),
    ("IEEE 33-BUS TOPOLOGY SLD", "Orthogonal 90° Feeder Map & [X] / [/] Breakers", "#10b981"),
    ("3-PHASE 50Hz OSCILLOSCOPE", "Real-Time Va, Vb, Vc & Harmonic THD Ripple", "#38bdf8"),
    ("SCADA VS. RESILIZ RACE BAR", "Track A (Sub-5ms) vs. Track B (3,000ms SCADA)", "#ef4444"),
    ("DISPATCH LOG TERMINAL", "Monospace Audit Table: UTC, Bus, Directive", "#10b981"),
    ("CONFIDENTIAL CPACF AUDIT", "DP Redacted kW & 64-char SHA-256 Signatures", "#a855f7"),
]

for idx, (title, sub, col) in enumerate(noc_panels):
    y_pos = 65 - (idx * 8.0)
    p = patches.Rectangle((117, y_pos), 36, 6.5, linewidth=1, edgecolor=col, facecolor="#090d16")
    ax.add_patch(p)
    ax.text(119, y_pos + 4.3, title, color="#f8fafc", fontsize=7.2, fontweight='bold', fontfamily='monospace')
    ax.text(119, y_pos + 1.8, sub, color="#94a3b8", fontsize=6.0, fontfamily='monospace')

# Connecting Flow Arrows
def draw_arrow(x1, y1, x2, y2, color="#38bdf8", label=""):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="-|>", color=color, lw=2.0, mutation_scale=14))
    if label:
        ax.text((x1 + x2)/2, (y1 + y2)/2 + 1.5, label, color=color, fontsize=6.8,
                fontweight='bold', ha='center', va='center', fontfamily='monospace',
                bbox=dict(boxstyle="square,pad=0.2", facecolor="#090d16", edgecolor=color, lw=0.8))

# Grid -> LinuxONE
draw_arrow(47, 48, 52, 48, "#38bdf8", "20Hz PMU Telemetry")
# LinuxONE -> Grid (Breaker trip)
draw_arrow(52, 18, 47, 18, "#10b981", "SSCB Trip (0.8ms)")
# LinuxONE -> NOC Console
draw_arrow(108, 48, 115, 48, "#a855f7", "WebSocket Stream")

plt.tight_layout()
plt.savefig('assets/architecture-flowchart.png', dpi=200, bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
print("Successfully generated assets/architecture-flowchart.png")
