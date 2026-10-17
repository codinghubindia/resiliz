import asyncio
import time
from typing import Dict, Any, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import FAULT_CLASSES, REMEDIATION_PLAYBOOKS
from system.s390x_telemetry import telemetry_collector
from system.remediation_engine import remediation_engine
from ml.model_service import model_service

app = FastAPI(
    title="ResiliZ: IBM LinuxONE s390x Mainframe Resilience Platform",
    description="Real-time AIOps, zero-day anomaly detection, fault classification, and autonomous remediation on IBM LinuxONE.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FaultInjectRequest(BaseModel):
    fault_type: str
    duration_sec: Optional[float] = 30.0
    duration_seconds: Optional[float] = None

class RemediationRequest(BaseModel):
    fault_type: str
    triggered_by: Optional[str] = "MANUAL_OPERATOR"

class AutoRemediationToggle(BaseModel):
    enabled: bool

@app.get("/")
def read_root():
    return {
        "project": "ResiliZ",
        "tagline": "IBM LinuxONE s390x Real-time Mainframe Resilience Platform",
        "status": "ONLINE",
        "endpoints": [
            "/api/system-info",
            "/api/telemetry/live",
            "/api/predict",
            "/api/benchmarks",
            "/api/remediation/history",
            "/ws/live-stream"
        ]
    }

@app.get("/api/system-info")
def get_system_info():
    """
    Returns real hardware specs of the host system.
    Confirms 'arch': 's390x' when running on IBM LinuxONE.
    """
    return telemetry_collector.get_system_info()

@app.get("/api/telemetry/live")
def get_live_telemetry():
    """
    Gathers live telemetry snapshot and performs real-time ML inference.
    """
    telemetry = telemetry_collector.get_live_telemetry()
    prediction = model_service.predict(telemetry)
    
    # Check if auto-remediation should trigger
    if (
        remediation_engine.auto_remediation_enabled
        and prediction["is_anomaly"]
        and prediction["predicted_fault"] != "NORMAL_50HZ"
        and prediction["confidence"] > 0.85
    ):
        # Trigger autonomous remediation
        act = remediation_engine.execute_playbook(
            fault_type=prediction["predicted_fault"],
            triggered_by="AUTONOMOUS_AIOPS_ENGINE"
        )
        prediction["remediation_triggered"] = act

    # Attach dynamic live inference latency
    telemetry["live_inference_ms"] = prediction["inference_latency_ms"]
    telemetry["scada_race"]["rolling_inference_ms"] = prediction["inference_latency_ms"]

    return {
        "telemetry": telemetry,
        "prediction": prediction,
        "auto_remediation_active": remediation_engine.auto_remediation_enabled
    }

@app.post("/api/predict")
def predict_telemetry(payload: Dict[str, Any]):
    """
    Accepts arbitrary telemetry metrics and evaluates with ML models.
    """
    return model_service.predict(payload)

@app.get("/api/benchmarks")
def get_benchmarks():
    """
    Returns model training evaluation metrics, F1-scores, confusion matrix, and s390x latency benchmarks.
    """
    benchmarks = model_service.get_benchmarks()
    if not benchmarks:
        raise HTTPException(status_code=404, detail="Benchmark metrics not yet generated. Run train_pipeline.py first.")
    return benchmarks

@app.get("/api/fault-classes")
def get_fault_classes():
    return {
        "classes": FAULT_CLASSES,
        "playbooks": REMEDIATION_PLAYBOOKS
    }

@app.post("/api/fault/inject")
@app.post("/api/faults/inject")
def inject_fault(req: FaultInjectRequest):
    if req.fault_type not in FAULT_CLASSES and req.fault_type != "NORMAL_50HZ":
        raise HTTPException(status_code=400, detail=f"Invalid fault class: {req.fault_type}")
    
    duration = req.duration_seconds if req.duration_seconds is not None else (req.duration_sec or 30.0)
    telemetry_collector.set_fault_injection(req.fault_type, duration)
    
    # Measure live scoring of this fault frame
    cur_telem = telemetry_collector.get_live_telemetry()
    scoring = model_service.predict(cur_telem)
    locked_ms = scoring.get("inference_latency_ms", 4.19)
    telemetry_collector.fault_override["resiliz_locked_ms"] = locked_ms
    telemetry_collector.fault_override["total_clearing_ms"] = round(locked_ms + 0.80, 2)
    telemetry_collector.fault_override["scada_ahead_ms"] = round(3000.0 - (locked_ms + 0.80), 1)

    return {
        "status": "INJECTED",
        "active_fault": req.fault_type,
        "fault_type": req.fault_type,
        "duration_sec": duration,
        "remaining_seconds": duration,
        "fault_detection_latency_ms": locked_ms,
        "remediation_time_ms": round(locked_ms + 0.80, 2),
        "resiliz_locked_ms": locked_ms,
        "scada_poll_elapsed_ms": 0.0,
        "scada_race": telemetry_collector.fault_override,
        "message": f"Injected synthetic fault [{req.fault_type}] for {duration}s."
    }

@app.post("/api/fault/clear")
@app.post("/api/faults/clear")
def clear_fault():
    telemetry_collector.clear_fault_injection()
    return {"status": "CLEARED", "message": "Microgrid fault overrides cleared. Nominal state restored."}

@app.post("/api/remediation/execute")
def execute_remediation(req: RemediationRequest):
    record = remediation_engine.execute_playbook(
        fault_type=req.fault_type,
        triggered_by=req.triggered_by or "MANUAL_OPERATOR"
    )
    return record

@app.get("/api/remediation/history")
def get_remediation_history():
    return {
        "auto_remediation_enabled": remediation_engine.auto_remediation_enabled,
        "history": remediation_engine.get_history()
    }

@app.post("/api/remediation/auto-toggle")
def toggle_auto_remediation(req: AutoRemediationToggle):
    remediation_engine.set_auto_remediation(req.enabled)
    return {
        "auto_remediation_enabled": remediation_engine.auto_remediation_enabled,
        "message": f"Autonomous remediation is now {'ENABLED' if req.enabled else 'DISABLED'}."
    }

@app.websocket("/ws/live-stream")
async def websocket_telemetry_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            telemetry = telemetry_collector.get_live_telemetry()
            prediction = model_service.predict(telemetry)

            # Check if autonomous self-healing should trigger
            if (
                remediation_engine.auto_remediation_enabled
                and prediction["is_anomaly"]
                and prediction["predicted_fault"] != "NORMAL_50HZ"
                and prediction["confidence"] > 0.85
            ):
                act = remediation_engine.execute_playbook(
                    fault_type=prediction["predicted_fault"],
                    triggered_by="AUTONOMOUS_AIOPS_ENGINE"
                )
                prediction["remediation_triggered"] = act

            telemetry["live_inference_ms"] = prediction["inference_latency_ms"]
            telemetry["scada_race"]["rolling_inference_ms"] = prediction["inference_latency_ms"]

            payload = {
                "telemetry": telemetry,
                "prediction": prediction,
                "auto_remediation_active": remediation_engine.auto_remediation_enabled,
                "server_time": time.time()
            }
            await websocket.send_json(payload)
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
