import time
import subprocess
from typing import Dict, Any, List
from config import REMEDIATION_PLAYBOOKS

class AutonomousRemediationEngine:
    def __init__(self):
        self.history: List[Dict[str, Any]] = []
        self.auto_remediation_enabled = True

    def execute_playbook(self, fault_type: str, triggered_by: str = "AUTONOMOUS_AI_ENGINE") -> Dict[str, Any]:
        playbook = REMEDIATION_PLAYBOOKS.get(fault_type)
        if not playbook:
            return {
                "success": False,
                "error": f"No playbook defined for fault: {fault_type}",
                "timestamp": time.time()
            }

        start_time = time.time()
        command_logs = []
        
        # Execute safe Linux / sysctl tuning commands
        for cmd in playbook["commands"]:
            cmd_start = time.time()
            try:
                res = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=5)
                cmd_duration = round((time.time() - cmd_start) * 1000, 2)
                command_logs.append({
                    "command": cmd,
                    "returncode": res.returncode,
                    "duration_ms": cmd_duration,
                    "output": res.stdout.strip() or res.stderr.strip() or "OK"
                })
            except Exception as e:
                command_logs.append({
                    "command": cmd,
                    "returncode": -1,
                    "duration_ms": round((time.time() - cmd_start) * 1000, 2),
                    "output": str(e)
                })

        duration_sec = round(time.time() - start_time, 3)
        record = {
            "id": f"ACT-{int(time.time() * 1000)}",
            "timestamp": start_time,
            "fault_type": fault_type,
            "playbook_id": playbook["id"],
            "playbook_title": playbook["title"],
            "description": playbook["description"],
            "impact": playbook["impact"],
            "triggered_by": triggered_by,
            "execution_duration_sec": duration_sec,
            "status": "COMPLETED",
            "commands_executed": command_logs
        }
        self.history.insert(0, record)
        if len(self.history) > 50:
            self.history.pop()

        # Clear fault injection in telemetry collector if active
        try:
            from system.s390x_telemetry import telemetry_collector
            telemetry_collector.clear_fault_injection()
        except Exception:
            pass

        return record

    def get_history(self) -> List[Dict[str, Any]]:
        return self.history

    def set_auto_remediation(self, enabled: bool):
        self.auto_remediation_enabled = enabled

remediation_engine = AutonomousRemediationEngine()
