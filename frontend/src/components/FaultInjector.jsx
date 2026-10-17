import React, { useState } from 'react';

const DER_FAULTS = [
  {
    id: 'PHASE_UNBALANCE',
    name: 'Phase Unbalance (Bus-14)',
    desc: 'Simulate single-phase PV surge causing Phase A voltage sag to 0.86 p.u. & 8.6% unbalance',
    color: '#ef4444'
  },
  {
    id: 'HARMONIC_DISTORTION',
    name: 'Harmonic Distortion (Bus-18)',
    desc: 'Simulate solar inverter PWM saturation pushing 5th/7th harmonic THD > 14.5%',
    color: '#f59e0b'
  },
  {
    id: 'ISLANDING_GROUND_FAULT',
    name: 'Islanding Ground Fault (Bus-6)',
    desc: 'Simulate sudden branch collapse, plunging voltage to 0.46 p.u. & grid frequency to 48.2 Hz',
    color: '#3b82f6'
  },
  {
    id: 'TRANSFORMER_OVERLOAD',
    name: 'Transformer Overload (Bus-25)',
    desc: 'Simulate peak EV/BESS current surge to 1.72 p.u., heating transformer winding past 96°C',
    color: '#8b5cf6'
  },
  {
    id: 'INVERTER_DESYNC',
    name: 'Wind Inverter Desync (Bus-31)',
    desc: 'Simulate wind turbine Phase-Locked Loop (PLL) drift leading to 38° phase angle deviation',
    color: '#ec4899'
  }
];

export default function FaultInjector({ telemetry, onInjectFault, onClearFault }) {
  const [loadingFault, setLoadingFault] = useState(null);
  const activeFault = telemetry?.fault_injected;
  const remainingSec = telemetry?.fault_remaining_sec || 0;

  const handleInject = async (faultId) => {
    setLoadingFault(faultId);
    try {
      await onInjectFault(faultId, 30);
    } finally {
      setLoadingFault(null);
    }
  };

  const handleClear = async () => {
    setLoadingFault('CLEAR');
    try {
      await onClearFault();
    } finally {
      setLoadingFault(null);
    }
  };

  return (
    <div className="glass-card" style={{ height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>IEEE 33-Bus DER Fault Injector</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Renewable Microgrid Perturbation &amp; SSCB Trip Test</p>
          </div>
        </div>

        {activeFault ? (
          <div className="badge badge-anomaly" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>ACTIVE DER FAULT: {remainingSec}s</span>
            <button 
              className="btn btn-outline" 
              onClick={handleClear}
              style={{ padding: '2px 8px', fontSize: '0.7rem', background: 'rgba(0,0,0,0.4)' }}
            >
              Reset 50Hz
            </button>
          </div>
        ) : (
          <span className="badge badge-ok">NOMINAL 50.0 Hz</span>
        )}
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.4' }}>
        Trigger renewable microgrid perturbations to observe ResiliZ on LinuxONE isolate solid-state breakers in <strong>4.31ms</strong> while legacy SCADA remains blind.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {DER_FAULTS.map((fault) => {
          const isActive = activeFault === fault.id;
          const isLoading = loadingFault === fault.id;

          return (
            <div 
              key={fault.id}
              style={{
                background: isActive ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${isActive ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: fault.color, display: 'inline-block' }}></span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{fault.name}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {fault.desc}
                </div>
              </div>

              <button
                className={`btn ${isActive ? 'btn-danger' : 'btn-outline'}`}
                style={{ padding: '6px 12px', fontSize: '0.75rem', minWidth: '85px' }}
                disabled={isLoading}
                onClick={() => isActive ? handleClear() : handleInject(fault.id)}
              >
                {isLoading ? 'Triggering...' : (isActive ? 'Clear' : 'Inject')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
