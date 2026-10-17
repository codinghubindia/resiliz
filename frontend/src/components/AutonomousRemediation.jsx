import React, { useState } from 'react';

export default function AutonomousRemediation({ 
  prediction, 
  autoRemediationEnabled, 
  onToggleAuto, 
  onExecuteManual, 
  history = [] 
}) {
  const [executing, setExecuting] = useState(false);
  const playbook = prediction?.playbook;
  const faultClass = prediction?.predicted_fault;
  const isAnomaly = prediction?.is_anomaly && faultClass !== 'NORMAL_50HZ';

  const handleManualExecute = async () => {
    if (!playbook || !faultClass) return;
    setExecuting(true);
    try {
      await onExecuteManual(faultClass);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="glass-card" style={{ height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Autonomous Microgrid Protection</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ultra-Fast DER Remediation &amp; SSCB Trip Control</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Auto-Trip:</span>
          <button
            className={`btn ${autoRemediationEnabled ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            onClick={() => onToggleAuto(!autoRemediationEnabled)}
          >
            {autoRemediationEnabled ? 'AUTONOMOUS (<5ms)' : 'OPERATOR CONFIRM'}
          </button>
        </div>
      </div>

      {/* Active Remediation Playbook Card */}
      {isAnomaly && playbook ? (
        <div style={{ 
          background: 'rgba(15, 98, 254, 0.1)', 
          border: '1px solid rgba(15, 98, 254, 0.4)', 
          borderRadius: '10px', 
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="badge badge-s390x" style={{ marginBottom: '6px' }}>
                {playbook.id}
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                {playbook.title}
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {playbook.description}
              </p>
            </div>

            <button
              className="btn btn-primary"
              style={{ minWidth: '130px', fontSize: '0.8rem' }}
              disabled={executing}
              onClick={handleManualExecute}
            >
              {executing ? 'Firing Trigger...' : 'Execute Trip'}
            </button>
          </div>

          <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Microgrid Dispatch Commands:
            </div>
            {playbook.commands.map((cmd, idx) => (
              <div key={idx} className="mono" style={{ fontSize: '0.74rem', color: '#00f2fe' }}>
                &gt; {cmd}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.78rem' }}>
            <span style={{ color: '#34d399' }}>✓ Impact: {playbook.impact}</span>
            <span style={{ color: 'var(--text-secondary)' }}>Clearance: {playbook.estimated_recovery_sec * 1000}ms</span>
          </div>
        </div>
      ) : (
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.02)', 
          border: '1px dashed rgba(255, 255, 255, 0.1)', 
          borderRadius: '8px', 
          padding: '18px', 
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ color: '#10b981', fontSize: '1.2rem', marginBottom: '4px' }}>✓</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>All 33 Microgrid Busses Synchronized</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Solid-state circuit breaker optical triggers ready. Sub-5ms autonomous isolation active.
          </div>
        </div>
      )}

      {/* Remediation History Audit Trail */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
          Protection Event Log ({history.length} Actions Recorded)
        </div>
        
        {history.length === 0 ? (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>
            No protection events logged yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
            {history.map((record) => (
              <div 
                key={record.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                    {record.playbook_title}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                    Triggered by <span style={{ color: '#60a5fa' }}>{record.triggered_by}</span> in {record.execution_duration_sec}s
                  </div>
                </div>
                <span className="badge badge-ok" style={{ padding: '2px 8px' }}>
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
