import React from 'react';

export default function S390xHardwareCard({ systemInfo }) {
  const arch = systemInfo?.arch || 's390x';
  const machine = systemInfo?.machine_type || 'IBM LinuxONE 3931';
  const cores = systemInfo?.cores || 4;
  const memTotal = systemInfo?.memory?.total_gb || 16.0;
  const memUsedPct = systemInfo?.memory?.percent_used || 24.0;
  const facilities = systemInfo?.cpu_facilities || ['vx', 'vxe', 'msa', 'stfle', 'dfp', 'ldisp'];
  const accel = systemInfo?.hardware_acceleration || {};

  return (
    <div className="glass-card" style={{ height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(15, 98, 254, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <rect x="9" y="9" width="6" height="6" />
              <line x1="9" y1="1" x2="9" y2="4" />
              <line x1="15" y1="1" x2="15" y2="4" />
              <line x1="9" y1="20" x2="9" y2="23" />
              <line x1="15" y1="20" x2="15" y2="23" />
              <line x1="20" y1="9" x2="23" y2="9" />
              <line x1="20" y1="14" x2="23" y2="14" />
              <line x1="1" y1="9" x2="4" y2="9" />
              <line x1="1" y1="14" x2="4" y2="14" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>IBM LinuxONE Mainframe Platform</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Native Hardware & Coprocessor Subsystems</p>
          </div>
        </div>
        <span className="badge badge-s390x">{arch.toUpperCase()} ARCH</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Machine Architecture</div>
          <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 600, color: '#60a5fa', marginTop: '2px' }}>
            {machine}
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>CP / IFL Processing Engines</div>
          <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>
            {cores} Dedicated Cores
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>LPAR Memory Allocation</div>
          <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>
            {memTotal} GB ({memUsedPct}% in-use)
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Hypervisor Layer</div>
          <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 600, color: '#34d399', marginTop: '2px' }}>
            PR/SM & z/VM Type-1
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
          Active Mainframe Coprocessors & Accelerators
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {Object.entries(accel).map(([key, desc]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '6px' }}>
              <span style={{ color: '#00f2fe' }}>✔</span>
              <span style={{ color: '#e2e8f0' }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
          s390x CPU Instruction Facilities
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {facilities.slice(0, 10).map((f) => (
            <span key={f} className="mono" style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', color: '#94a3b8' }}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
