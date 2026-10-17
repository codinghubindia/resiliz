import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import CommandBar from './components/CommandBar';
import GridTopologyMap from './components/GridTopologyMap';
import WaveformChart from './components/WaveformChart';
import ScadaRaceWidget from './components/ScadaRaceWidget';
import DispatchLog from './components/DispatchLog';
import ConfidentialTelemetryPanel from './components/ConfidentialTelemetryPanel';
import BenchmarkModal from './components/BenchmarkModal';

export default function App() {
  const [systemInfo, setSystemInfo] = useState({
    arch: 's390x',
    os: 'Linux 5.14.0-503.48.1.el9_5.s390x',
    distro: 'Red Hat Enterprise Linux 9.8 (Plow)',
    cpacf_active: true,
  });
  const [telemetry, setTelemetry] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [benchmarks, setBenchmarks] = useState(null);
  const [remediationHistory, setRemediationHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);

  const wsRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Fetch initial info
  useEffect(() => {
    fetch('/api/system-info')
      .then(res => res.json())
      .then(data => setSystemInfo(data))
      .catch(err => console.error('Error fetching system info:', err));

    fetch('/api/benchmarks')
      .then(res => res.json())
      .then(data => setBenchmarks(data))
      .catch(err => console.warn('Benchmarks not yet available:', err));

    fetch('/api/remediation/history')
      .then(res => res.json())
      .then(data => {
        setRemediationHistory(data.history || []);
      })
      .catch(err => console.error('Error fetching remediation history:', err));
  }, []);

  // WebSocket Live Streaming with Fallback Polling
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/live-stream`;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.telemetry) setTelemetry(data.telemetry);
            if (data.prediction) setPrediction(data.prediction);
            if (data.prediction?.remediation_triggered) {
              setRemediationHistory(prev => [data.prediction.remediation_triggered, ...prev.slice(0, 49)]);
            }
          } catch (e) {
            console.error('Error parsing WS message:', e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          startPollingFallback();
        };

        ws.onerror = () => {
          setIsConnected(false);
          ws.close();
        };
      } catch (e) {
        startPollingFallback();
      }
    };

    const startPollingFallback = () => {
      if (!pollIntervalRef.current) {
        pollIntervalRef.current = setInterval(async () => {
          try {
            const res = await fetch('/api/telemetry/live');
            if (res.ok) {
              const data = await res.json();
              setIsConnected(true);
              if (data.telemetry) setTelemetry(data.telemetry);
              if (data.prediction) setPrediction(data.prediction);
            }
          } catch (e) {
            console.error('Polling error:', e);
          }
        }, 100);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Fault Ingestion Handlers
  const handleInjectFault = async (faultType, durationSec = 30) => {
    try {
      const res = await fetch('/api/fault/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fault_type: faultType, duration_seconds: durationSec })
      });
      const data = await res.json();
      if (data.active_fault) {
        // Immediate update to state
        setTelemetry(prev => ({
          ...prev,
          fault_injected: data.active_fault,
          fault_remaining_sec: data.remaining_seconds,
          scada_race: data.scada_race
        }));
      }
    } catch (e) {
      console.error('Failed to inject fault:', e);
    }
  };

  const handleClearFault = async () => {
    try {
      await fetch('/api/fault/clear', { method: 'POST' });
      setTelemetry(prev => ({
        ...prev,
        fault_injected: null,
        fault_remaining_sec: 0,
        scada_race: null
      }));
    } catch (e) {
      console.error('Failed to clear fault:', e);
    }
  };

  const activeFault = telemetry?.fault_injected || null;
  const remainingSec = telemetry?.fault_remaining_sec || 0;
  const liveInferenceMs = telemetry?.live_inference_ms || 4.28;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans select-none">
      {/* 1. Top Hardware & Telemetry Ribbon */}
      <Header
        systemInfo={systemInfo}
        telemetry={telemetry}
        onOpenBenchmarks={() => setShowBenchmarkModal(true)}
      />

      {/* 2. Command & Fault Injection Bar */}
      <CommandBar
        activeFault={activeFault}
        remainingSec={remainingSec}
        onInjectFault={handleInjectFault}
        onClearFault={handleClearFault}
      />

      {/* 3. Main Workspace Grid (12-Column Hairline Split) */}
      <main className="flex-1 grid grid-cols-12 gap-0 overflow-hidden min-h-0">
        {/* Left 7 Columns */}
        <section className="col-span-7 flex flex-col border-r border-slate-800 h-full overflow-hidden min-h-0">
          {/* Top Panel (56% height): Interactive IEEE 33-Bus Single-Line Diagram */}
          <div className="flex-[56] border-b border-slate-800 overflow-hidden min-h-0">
            <GridTopologyMap
              activeFault={activeFault}
              prediction={prediction}
              telemetry={telemetry}
            />
          </div>

          {/* Bottom Panel (44% height): Real-Time 3-Phase Oscilloscope & Harmonics */}
          <div className="flex-[44] overflow-hidden min-h-0">
            <WaveformChart
              telemetry={telemetry}
              activeFault={activeFault}
            />
          </div>
        </section>

        {/* Right 5 Columns */}
        <section className="col-span-5 flex flex-col h-full overflow-hidden min-h-0">
          {/* Top Panel (33% height): Protection Speed Race: ResiliZ (s390x) vs. Legacy SCADA */}
          <div className="flex-[33] border-b border-slate-800 overflow-hidden min-h-0">
            <ScadaRaceWidget
              telemetry={telemetry}
              prediction={prediction}
            />
          </div>

          {/* Middle Panel (34% height): Autonomous Remediation & Breaker Dispatch Log */}
          <div className="flex-[34] border-b border-slate-800 overflow-hidden min-h-0">
            <DispatchLog
              history={remediationHistory}
              activePrediction={prediction}
              liveLatencyMs={liveInferenceMs}
            />
          </div>

          {/* Bottom Panel (33% height): Confidential Telemetry & CPACF Audit */}
          <div className="flex-[33] overflow-hidden min-h-0">
            <ConfidentialTelemetryPanel
              confidentialData={telemetry?.confidential_telemetry}
            />
          </div>
        </section>
      </main>

      {/* Benchmark Verification Modal */}
      {showBenchmarkModal && (
        <BenchmarkModal
          benchmarks={benchmarks}
          onClose={() => setShowBenchmarkModal(false)}
        />
      )}
    </div>
  );
}
