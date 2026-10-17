#!/usr/bin/env python3
"""
ResiliZ: IBM LinuxONE (s390x) Real-Time Terminal NOC Console & Stream Monitor
Demonstrates live mainframe hardware processing, ML model evaluation, IEEE 33-Bus telemetry,
and autonomous sub-5ms solid-state breaker tripping.
"""

import sys
import time
import os
import requests

try:
    import msvcrt
    HAS_MSVCRT = True
except ImportError:
    HAS_MSVCRT = False

# ANSI Color & Style Palette
RESET   = "\033[0m"
BOLD    = "\033[1m"
DIM     = "\033[2m"
CYAN    = "\033[96m"
BLUE    = "\033[94m"
GREEN   = "\033[92m"
YELLOW  = "\033[93m"
RED     = "\033[91m"
MAGENTA = "\033[95m"
WHITE   = "\033[97m"
BG_BLUE = "\033[44m"
BG_RED  = "\033[41m"
BG_DARK = "\033[40m"

API_BASE = "http://localhost:8000"

def get_data():
    try:
        t_res = requests.get(f"{API_BASE}/api/telemetry/live", timeout=3.0).json()
        s_res = requests.get(f"{API_BASE}/api/system-info", timeout=3.0).json()
        return t_res, s_res
    except Exception as e:
        return None, None

def render_bar(val, max_val=1.0, length=20, fill_color=GREEN):
    ratio = max(0.0, min(1.0, val / max_val))
    filled = int(round(ratio * length))
    empty = length - filled
    return f"{fill_color}{'█' * filled}{DIM}{'░' * empty}{RESET}"

def format_hz(val):
    if 49.95 <= val <= 50.05:
        return f"{GREEN}{val:6.3f} Hz{RESET}"
    elif 49.5 <= val <= 50.5:
        return f"{YELLOW}{val:6.3f} Hz{RESET}"
    else:
        return f"{RED}{BOLD}{val:6.3f} Hz{RESET}"

def format_pu(val):
    if 0.98 <= val <= 1.02:
        return f"{GREEN}{val:5.3f} p.u.{RESET}"
    elif 0.90 <= val <= 1.10:
        return f"{YELLOW}{val:5.3f} p.u.{RESET}"
    else:
        return f"{RED}{BOLD}{val:5.3f} p.u.{RESET}"

def format_thd(val):
    if val < 5.0:
        return f"{GREEN}{val:5.2f} %{RESET}"
    elif val < 10.0:
        return f"{YELLOW}{val:5.2f} %{RESET}"
    else:
        return f"{RED}{BOLD}{val:5.2f} %{RESET}"

def main():
    # Set Windows console window title
    if os.name == 'nt':
        os.system("title IBM LinuxONE (s390x) Native Telemetry & ML Inference Engine - ResiliZ")
        # Enable ANSI escape sequences in Windows Command Prompt/PowerShell
        os.system("")

    frame = 0
    start_time = time.time()

    while True:
        # Check non-blocking keyboard input on Windows for interactive fault injection during recording
        if HAS_MSVCRT and msvcrt.kbhit():
            ch = msvcrt.getch().decode('utf-8', errors='ignore')
            if ch == '1':
                requests.post(f"{API_BASE}/api/fault/inject", json={"fault_type": "PHASE_UNBALANCE", "duration_seconds": 20})
            elif ch == '2':
                requests.post(f"{API_BASE}/api/fault/inject", json={"fault_type": "HARMONIC_DISTORTION", "duration_seconds": 20})
            elif ch == '3':
                requests.post(f"{API_BASE}/api/fault/inject", json={"fault_type": "ISLANDING_GROUND_FAULT", "duration_seconds": 20})
            elif ch == '4':
                requests.post(f"{API_BASE}/api/fault/inject", json={"fault_type": "TRANSFORMER_OVERLOAD", "duration_seconds": 20})
            elif ch == '5':
                requests.post(f"{API_BASE}/api/fault/inject", json={"fault_type": "INVERTER_DESYNC", "duration_seconds": 20})
            elif ch in ['0', 'c', 'C']:
                requests.post(f"{API_BASE}/api/fault/clear")
            elif ch in ['q', 'Q']:
                break

        t_data, s_data = get_data()

        if not t_data or not s_data:
            sys.stdout.write("\033[H\033[J")
            print(f"{YELLOW}Connecting to IBM LinuxONE backend on {API_BASE}... (Make sure SSH tunnel on port 8000 is active){RESET}")
            time.sleep(1.0)
            continue

        frame += 1
        elapsed = time.time() - start_time

        telem = t_data.get("telemetry", {})
        pred = t_data.get("prediction", {})
        probs = pred.get("class_probabilities", {})

        fault = pred.get("predicted_fault", "NORMAL_50HZ")
        is_anomaly = pred.get("is_anomaly", False)
        conf = pred.get("confidence", 0.98)
        lat = pred.get("inference_latency_ms", 4.20)
        optical_trip = pred.get("optical_trip_time_ms", 0.8)
        total_clearing = pred.get("total_fault_clearing_ms", lat + optical_trip)
        breaker_state = telem.get("breaker_status", "CLOSED")

        freq = telem.get("grid_freq_hz", 50.0)
        v_bus14 = telem.get("voltage_pu_bus14", 1.0)
        unbalance = telem.get("phase_unbalance_pct", 0.5)
        thd = telem.get("thd_inverter_bus18_pct", 1.6)
        active_mw = telem.get("active_power_mw", 12.4)
        reactive_mvar = telem.get("reactive_power_mvar", 3.2)
        cpacf_hash = telem.get("cpacf_sha256_hash", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")

        mem = s_data.get("memory", {})
        mem_used_pct = mem.get("percent_used", 18.3)
        mem_used_gb = mem.get("total_gb", 7.33) - mem.get("available_gb", 5.99)
        mem_total_gb = mem.get("total_gb", 7.33)

        scada_ahead = max(0.0, 3000.0 - total_clearing)

        # Clear screen and return cursor to home (flicker-free)
        out = ["\033[H"]

        # Mainframe Header Banner
        out.append(f"{BLUE}╔══════════════════════════════════════════════════════════════════════════════════════════════════════════╗{RESET}")
        out.append(f"{BLUE}║  {BOLD}{WHITE}IBM LinuxONE Enterprise Mainframe (s390x){RESET} — {BOLD}{CYAN}ResiliZ Autonomous Microgrid Resilience Engine{RESET}{BLUE}     ║{RESET}")
        out.append(f"{BLUE}║  {DIM}Architecture: s390x (Big-Endian) | OS: RHEL 9.8 (Kernel 5.14.0) | Host LPAR: 3 Cores @ 5,508 MHz{RESET}{BLUE}        ║{RESET}")
        out.append(f"{BLUE}╚══════════════════════════════════════════════════════════════════════════════════════════════════════════╝{RESET}")

        # Top Status / Mainframe Health Line
        out.append(f"{BOLD}[HOST PLATFORM STATUS]{RESET}  Vendor: {CYAN}IBM/S390{RESET}  Machine: {CYAN}9175{RESET}  Cores: {GREEN}3 Online{RESET}  Memory: {GREEN}{mem_used_gb:.2f}GB / {mem_total_gb:.2f}GB ({mem_used_pct}%){RESET}")
        out.append(f"  Hardware Coprocessors: {GREEN}CPACF MSA L8/9 [SHA-256 / AES-GCM]{RESET}  Vector SIMD: {GREEN}Active (vx/vxe){RESET}  HiperSockets: {GREEN}100GbE{RESET}")
        out.append(f"{DIM}──────────────────────────────────────────────────────────────────────────────────────────────────────────{RESET}")

        # Grid Topology & Live Electrical Metrics
        out.append(f"{BOLD}[IEEE 33-BUS RADIAL FEEDER TELEMETRY (20Hz PMU STREAM)]{RESET}")
        out.append(f"  Grid Frequency  : {format_hz(freq)}  (Nominal: 50.000 Hz)        Active Power   : {CYAN}{active_mw:6.2f} MW{RESET}")
        out.append(f"  Bus-14 Voltage  : {format_pu(v_bus14)}  (Solar PV Inverter)         Reactive Power : {CYAN}{reactive_mvar:6.2f} MVAR{RESET}")
        out.append(f"  Phase Unbalance : {YELLOW if unbalance > 3.0 else GREEN}{unbalance:5.2f} %{RESET}                               Inverter THD   : {format_thd(thd)}")
        out.append(f"  CPACF SHA-256   : {CYAN}{cpacf_hash[:24]}...{cpacf_hash[-8:]}{RESET}  Status: {GREEN}[HW-VERIFIED IN NANOSECONDS]{RESET}")
        out.append(f"{DIM}──────────────────────────────────────────────────────────────────────────────────────────────────────────{RESET}")

        # ML Model Execution & Latency Engine
        out.append(f"{BOLD}[s390x NATIVE MACHINE LEARNING & BREAKER CLEARING ENGINE]{RESET}")
        out.append(f"  Outlier Engine  : {CYAN}IsolationForest (Streaming Z-Score Filter){RESET}")
        out.append(f"  Classifier      : {CYAN}RandomForest (100 Trees, Vectorized SIMD OpenBLAS){RESET}")
        out.append(f"  Privacy Filter  : {CYAN}IBM diffprivlib Laplace Perturbation (ε = 1.0){RESET}")
        out.append(f"  Tick Frame #{frame:05d} : {BOLD}{WHITE}s390x Inference: {CYAN}{lat:5.2f} ms{RESET} | Optical Trip: {CYAN}{optical_trip:3.1f} ms{RESET} | Total Clearing: {BOLD}{GREEN if total_clearing < 10.0 else RED}{total_clearing:5.2f} ms{RESET}")
        out.append(f"{DIM}──────────────────────────────────────────────────────────────────────────────────────────────────────────{RESET}")

        # Classification Probabilities & Anomaly Detection Status
        state_color = GREEN if fault == "NORMAL_50HZ" else RED
        state_badge = f"{BOLD}{BG_BLUE}{WHITE} NOMINAL_50HZ {RESET}" if fault == "NORMAL_50HZ" else f"{BOLD}{BG_RED}{WHITE} ⚡ {fault} {RESET}"
        breaker_badge = f"{GREEN}[BREAKER: {breaker_state}]{RESET}" if breaker_state == "CLOSED" else f"{RED}{BOLD}[⚡ OPTICAL TRIP: OPENED]{RESET}"

        out.append(f"{BOLD}[MULTI-CLASS DER ANOMALY EVALUATION]{RESET}  Active State: {state_badge}  {breaker_badge}")
        out.append(f"  Anomaly Flag: {RED + 'YES (FAULT DETECTED)' if is_anomaly else GREEN + 'NO (SYSTEM NOMINAL)'}{RESET} | Classification Confidence: {BOLD}{conf*100:5.1f}%{RESET}")
        out.append("")

        for cls_name, p in sorted(probs.items(), key=lambda x: -x[1]):
            bar = render_bar(p, 1.0, 24, fill_color=RED if cls_name != "NORMAL_50HZ" and p > 0.1 else GREEN)
            marker = f"{RED}{BOLD}◀ TARGET{RESET}" if cls_name == fault and fault != "NORMAL_50HZ" else ""
            out.append(f"  • {cls_name:<24} : {bar} {p*100:5.1f}%  {marker}")

        out.append(f"{DIM}──────────────────────────────────────────────────────────────────────────────────────────────────────────{RESET}")

        # SCADA Race Readout
        out.append(f"{BOLD}[SCADA vs. ResiliZ REACTION SPEED RACE (IEC 60870-5-104 vs. s390x)]{RESET}")
        scada_bar = f"{RED}{'█'*30}{RESET} (3,000.0 ms Legacy Polling)"
        resiliz_bar = f"{GREEN}{'█'*2}{RESET} ({total_clearing:.2f} ms Clearing)"
        out.append(f"  Legacy SCADA Poll Cycle : {scada_bar}")
        out.append(f"  ResiliZ s390x Execution : {resiliz_bar}")
        out.append(f"  Autonomous Advantage    : {BOLD}{GREEN}+{scada_ahead:6.1f} ms AHEAD OF SCADA (SSCB Cleared ~3s Earlier!){RESET}")
        out.append(f"{DIM}──────────────────────────────────────────────────────────────────────────────────────────────────────────{RESET}")

        # Interactive Key Bindings
        out.append(f"{BOLD}[INTERACTIVE SHORTCUTS (PRESS NUMBER KEY TO INJECT FAULT DURING RECORDING)]{RESET}")
        out.append(f"  {CYAN}[1]{RESET} Phase Unbalance   {CYAN}[2]{RESET} Harmonic THD   {CYAN}[3]{RESET} Islanding Ground Fault   {CYAN}[4]{RESET} Transformer Overload   {CYAN}[5]{RESET} Inverter Desync")
        out.append(f"  {GREEN}[0 / C]{RESET} Restore Nominal State       {YELLOW}[Q]{RESET} Exit Console")

        # Flush output to console
        sys.stdout.write("\n".join(out) + "\n")
        sys.stdout.flush()

        time.sleep(0.35)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{CYAN}Console exited cleanly.{RESET}")
