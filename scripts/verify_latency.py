import time
import requests

url = "http://localhost:8000/api/telemetry/live"

print("--- VERIFYING LIVE INFERENCE LATENCY ENGINE ON IBM LinuxONE (s390x) ---")
for i in range(5):
    res = requests.get(url).json()
    pred = res.get("prediction", {})
    telem = res.get("telemetry", {})
    lat = pred.get("inference_latency_ms")
    rolling = telem.get("live_inference_ms")
    print(f"Frame #{i+1}: prediction.inference_latency_ms = {lat} ms | telemetry.live_inference_ms = {rolling} ms")
    time.sleep(0.3)

print("\n--- TESTING FAULT INJECTION LATENCY LOCK-IN (POST /api/fault/inject) ---")
inject_res = requests.post(
    "http://localhost:8000/api/fault/inject",
    json={"fault_type": "ISLANDING_GROUND_FAULT", "duration_seconds": 10}
).json()

print(f"Status: {inject_res.get('status')}")
print(f"Active Fault: {inject_res.get('active_fault')}")
print(f"Fault Detection Latency (Locked): {inject_res.get('fault_detection_latency_ms')} ms")
print(f"Total Remediation Time: {inject_res.get('remediation_time_ms')} ms")
print(f"ResiliZ Locked ms: {inject_res.get('resiliz_locked_ms')} ms")
print(f"SCADA Ahead ms: {inject_res.get('scada_race', {}).get('scada_ahead_ms')} ms")

# Clear fault
requests.post("http://localhost:8000/api/fault/clear")
print("Fault cleared. Nominal state restored.")
