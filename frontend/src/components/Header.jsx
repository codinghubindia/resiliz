import React from 'react';

export default function Header({ systemInfo, telemetry, onOpenBenchmarks }) {
  const isFault = Boolean(telemetry?.fault_injected);
  const faultName = telemetry?.fault_injected || 'NORMAL_50HZ';
  const liveInference = telemetry?.live_inference_ms ?? 4.28;
  const streamRate = telemetry?.stream_rate_fps ?? 2840;
  const arch = (systemInfo?.arch || 's390x').toUpperCase();

  return (
    <header style={{
      height: '42px',
      backgroundColor: '#0b111e',
      borderBottom: '1px solid #1e293b',
      padding: '0 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      userSelect: 'none'
    }}>
      {/* Left: System Title & State */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            backgroundColor: isFault ? '#ef4444' : '#10b981',
            borderRadius: '1px'
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#f8fafc'
          }}>
            RESILIZ // IEEE-33 MICROGRID PROTECTION SYSTEM
          </span>
        </div>

        <span className={`status-pill ${isFault ? 'pill-critical' : 'pill-nominal'}`}>
          {isFault ? `TRIP: ${faultName}` : 'NOMINAL 50.00 Hz'}
        </span>
      </div>

      {/* Center / Right: Industrial Monospace Telemetry Strip */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
        {/* Host */}
        <div style={{
          borderLeft: '1px solid #1e293b',
          borderRight: '1px solid #1e293b',
          padding: '0 12px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#94a3b8'
        }}>
          <span>HOST:</span>
          <span style={{ color: '#38bdf8', fontWeight: 600 }}>IBM LinuxONE ({arch} / RHEL 9.8)</span>
        </div>

        {/* Stream Rate */}
        <div style={{
          borderRight: '1px solid #1e293b',
          padding: '0 12px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#94a3b8'
        }}>
          <span>STREAM RATE:</span>
          <span className="tabular-nums" style={{ color: '#f8fafc', fontWeight: 600 }}>
            {streamRate.toLocaleString()} frames/s
          </span>
        </div>

        {/* Live Inference Latency */}
        <div style={{
          borderRight: '1px solid #1e293b',
          padding: '0 12px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#94a3b8'
        }}>
          <span>LIVE INFERENCE:</span>
          <span className="tabular-nums" style={{ color: '#10b981', fontWeight: 700 }}>
            {liveInference.toFixed(2)} ms
          </span>
        </div>

        {/* Cryptography */}
        <div style={{
          borderRight: '1px solid #1e293b',
          padding: '0 12px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#94a3b8'
        }}>
          <span>CRYPTO:</span>
          <span style={{ color: '#c084fc', fontWeight: 600 }}>CPACF SHA-256 + DP (ε=1.0)</span>
        </div>

        {/* Benchmark Button */}
        <div style={{ paddingLeft: '12px' }}>
          <button
            className="btn-industrial"
            onClick={onOpenBenchmarks}
            style={{ padding: '3px 8px', fontSize: '10px' }}
          >
            [ML BENCHMARK: F1 0.9672]
          </button>
        </div>
      </div>
    </header>
  );
}
