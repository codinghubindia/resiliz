import React from 'react';

const ACTIONS = [
  { id: 'NORMAL_50HZ', label: '[RESET: 50Hz NOMINAL]', isReset: true },
  { id: 'PHASE_UNBALANCE', label: '[BUS-14: PHASE UNBALANCE]' },
  { id: 'HARMONIC_DISTORTION', label: '[BUS-18: HARMONIC THD SPIKE]' },
  { id: 'ISLANDING_GROUND_FAULT', label: '[BUS-06: GROUND FAULT / ISLANDING]' },
  { id: 'TRANSFORMER_OVERLOAD', label: '[BUS-25: TRANSFORMER OVERLOAD]' },
  { id: 'INVERTER_DESYNC', label: '[BUS-31: WIND PLL DESYNC]' },
];

export default function CommandBar({ activeFault, remainingSec, onInjectFault, onClearFault }) {
  return (
    <div style={{
      height: '38px',
      backgroundColor: '#0f172a',
      borderBottom: '1px solid #1e293b',
      padding: '0 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      userSelect: 'none'
    }}>
      {/* Left: Button Array */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          fontWeight: 700,
          color: '#64748b',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginRight: '4px'
        }}>
          FEEDER INJECTOR:
        </span>

        {ACTIONS.map((action) => {
          const isActive = (action.isReset && !activeFault) || (activeFault === action.id);
          
          return (
            <button
              key={action.id}
              className={`btn-industrial ${isActive && !action.isReset ? 'active-danger' : ''}`}
              style={{
                borderColor: isActive ? (action.isReset ? '#10b981' : '#ef4444') : 'var(--border-hairline)',
                backgroundColor: isActive ? (action.isReset ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.2)') : '#131c2e',
                color: isActive ? (action.isReset ? '#34d399' : '#fca5a5') : '#94a3b8',
                padding: '4px 8px',
                fontSize: '10.5px'
              }}
              onClick={() => {
                if (action.isReset) {
                  onClearFault();
                } else {
                  onInjectFault(action.id, 30);
                }
              }}
            >
              {action.label}
            </button>
          );
        })}
      </div>

      {/* Right: State / Countdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
        {activeFault ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#ef4444', fontWeight: 700 }}>
              FAULT TRIP ACTIVE
            </span>
            <span className="tabular-nums" style={{ color: '#f59e0b', background: '#090d16', padding: '2px 6px', border: '1px solid #334155', borderRadius: '2px' }}>
              RESTORATION IN {remainingSec.toFixed(1)}s
            </span>
            <button
              className="btn-industrial"
              onClick={onClearFault}
              style={{ padding: '2px 6px', fontSize: '10px' }}
            >
              [ABORT]
            </button>
          </div>
        ) : (
          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: '#10b981', display: 'inline-block' }} />
            ALL 33 BUSSES NOMINAL &bull; BREAKER SYSTEM ARMED
          </span>
        )}
      </div>
    </div>
  );
}
