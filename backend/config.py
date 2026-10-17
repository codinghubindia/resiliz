import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "ml" / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

BENCHMARK_PATH = MODELS_DIR / "benchmark_metrics.json"
ISOLATION_FOREST_PATH = MODELS_DIR / "isolation_forest.joblib"
FAULT_CLASSIFIER_PATH = MODELS_DIR / "fault_classifier.joblib"
SCALER_PATH = MODELS_DIR / "feature_scaler.joblib"
LABEL_ENCODER_PATH = MODELS_DIR / "label_encoder.joblib"

# Telemetry features for IEEE 33-Bus Renewable Microgrid
TELEMETRY_FEATURES = [
    "grid_freq_hz",
    "voltage_pu_bus14",
    "phase_unbalance_pct",
    "thd_inverter_bus18_pct",
    "active_power_mw",
    "reactive_power_mvar",
    "bus6_voltage_pu",
    "bus25_transformer_temp_c",
    "bus25_current_pu",
    "bus31_phase_drift_deg",
    "dp_laplace_noise_sigma",
    "breaker_trip_readiness_pct",
]

# 6 Classification States (Normal 50Hz + 5 Signature DER Faults)
FAULT_CLASSES = [
    "NORMAL_50HZ",
    "PHASE_UNBALANCE",
    "HARMONIC_DISTORTION",
    "ISLANDING_GROUND_FAULT",
    "TRANSFORMER_OVERLOAD",
    "INVERTER_DESYNC",
]

REMEDIATION_PLAYBOOKS = {
    "PHASE_UNBALANCE": {
        "id": "PLAYBOOK-DER-01",
        "title": "Bus-14 STATCOM Reactive Compensation & Phase Balancer",
        "description": "Engages dynamic fast VAR injection on Phase A and activates neutral current suppression via IEEE 1547.4 smart inverter control.",
        "commands": [
            "gridctl statcom --bus 14 --inject-var-phaseA 180kvar",
            "gridctl inverter-balance --feeder IEEE33-F2 --auto-dampen",
        ],
        "estimated_recovery_sec": 0.008,
        "impact": "Restores 3-phase voltage balance from 8.4% imbalance to <0.6% within 8ms."
    },
    "HARMONIC_DISTORTION": {
        "id": "PLAYBOOK-DER-02",
        "title": "Bus-18 Solar Inverter APF Harmonic Notch Filtering",
        "description": "Tunes Active Power Filter (APF) IGBT notch filters to eliminate 5th and 7th harmonic orders emitted by solar PV inverter PWM saturation.",
        "commands": [
            "gridctl apf --bus 18 --notch-filter 250hz,350hz --gain 1.8",
            "gridctl pv-inverter --der 4 --pwm-frequency 16khz",
        ],
        "estimated_recovery_sec": 0.012,
        "impact": "Drops Inverter THD from 14.8% back to <1.8%, complying with IEEE 519 standards."
    },
    "ISLANDING_GROUND_FAULT": {
        "id": "PLAYBOOK-DER-03",
        "title": "Bus-6 Ultra-Fast Solid-State Circuit Breaker (SSCB) Trip",
        "description": "Fires ultra-fast optical gate pulse to solid-state circuit breaker (SSCB), severing grounded branch and isolating microgrid island before arc flash.",
        "commands": [
            "gridctl sscb --bus 6 --trip-breaker-instantaneous",
            "gridctl microgrid --mode islanding --isochronous-gov ON",
        ],
        "estimated_recovery_sec": 0.004,
        "impact": "Isolates fault in 4.3ms (versus 3,000ms legacy SCADA delay), preventing transformer damage."
    },
    "TRANSFORMER_OVERLOAD": {
        "id": "PLAYBOOK-DER-04",
        "title": "Bus-25 BESS Peak Shaving & DER Smart Curtailment",
        "description": "Dispatches 450kW battery storage discharge on Bus-25 and ramps down non-critical EV charging loads to cool substation distribution transformer.",
        "commands": [
            "gridctl bess --bus 25 --discharge-rate 450kw --ramp 100ms",
            "gridctl load-shed --curtail-ev-bus25 40pct",
        ],
        "estimated_recovery_sec": 0.025,
        "impact": "Relieves current surge from 1.62 p.u. to 0.78 p.u., stabilizing transformer thermal headroom."
    },
    "INVERTER_DESYNC": {
        "id": "PLAYBOOK-DER-05",
        "title": "Bus-31 Wind Inverter PLL Virtual Synchronous Machine Re-lock",
        "description": "Resets Phase-Locked Loop (PLL) state machine and switches wind turbine grid-forming inverter to Virtual Synchronous Generator (VSG) mode.",
        "commands": [
            "gridctl pll-reset --der wind-bus31 --sync-source reference-bus1",
            "gridctl inverter-mode --bus 31 --type grid-forming-vsg",
        ],
        "estimated_recovery_sec": 0.015,
        "impact": "Eliminates 38° phase drift, restoring tight phase coherence to grid reference within 15ms."
    },
}
