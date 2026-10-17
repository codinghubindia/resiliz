import sys
sys.path.insert(0, '/home/linux1/resiliz/backend')
import time, joblib, pandas as pd
from ml.model_service import model_service
from system.s390x_telemetry import telemetry_collector

telem = telemetry_collector.get_live_telemetry()
features = ["grid_freq_hz", "voltage_pu_bus14", "phase_unbalance_pct", "thd_inverter_bus18_pct", "active_power_mw", "reactive_power_mvar", "bus6_voltage_pu", "bus25_transformer_temp_c", "bus25_current_pu", "bus31_phase_drift_deg", "dp_laplace_noise_sigma", "breaker_trip_readiness_pct"]
raw_vals = [float(telem.get(f, 0.0)) for f in features]
X = pd.DataFrame([raw_vals], columns=features)
X_scaled = model_service.scaler.transform(X)

print("Exact unscaled raw execution times:")
for i in range(8):
    t0 = time.perf_counter_ns()
    s = model_service.isolation_forest.decision_function(X_scaled)
    p = model_service.fault_classifier.predict_proba(X_scaled)
    t1 = time.perf_counter_ns()
    print(f"Sample {i+1}: raw duration = {(t1 - t0) / 1_000_000:.3f} ms")
    time.sleep(0.05)
