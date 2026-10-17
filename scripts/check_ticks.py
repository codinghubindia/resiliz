import sys
sys.path.insert(0, '/home/linux1/resiliz/backend')

import time
from ml.model_service import model_service
from system.s390x_telemetry import telemetry_collector

print("Raw timing test directly on s390x:")
for i in range(5):
    telem = telemetry_collector.get_live_telemetry()
    res = model_service.predict(telem)
    print(f"Tick {i+1}: inference_latency_ms = {res['inference_latency_ms']} ms")
    time.sleep(0.1)
