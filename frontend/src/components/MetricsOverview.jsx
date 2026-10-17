import React from 'react';

export default function MetricsOverview({ telemetry }) {
  const freq = telemetry?.grid_freq_hz ?? 50.0;
  const vBus14 = telemetry?.voltage_pu_bus14 ?? 1.0;
  const unbalance = telemetry?.phase_unbalance_pct ?? 0.45;
  const thdBus18 = telemetry?.thd_inverter_bus18_pct ?? 1.8;
  const actPower = telemetry?.active_power_mw ?? 12.4;
  const transTemp = telemetry?.bus25_transformer_temp_c ?? 61.8;
  const transCurr = telemetry?.bus25_current_pu ?? 0.72;

  const isFreqFault = freq < 49.0 || freq > 50.8;
  const isVoltageFault = vBus14 < 0.90 || unbalance > 5.0;
  const isThdFault = thdBus18 > 8.0;
  const isThermalFault = transTemp > 85.0 || transCurr > 1.4;

  return (
    <div className="grid-cols-4" style={{ marginBottom: '24px' }}>
      {/* 1. Grid Frequency */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="metric-label">Microgrid Frequency</span>
          <span className={`badge ${isFreqFault ? 'badge-anomaly' : 'badge-ok'}`}>
            {isFreqFault ? 'FREQUENCY PLUNGE' : '50.0 Hz SYNCHRONIZED'}
          </span>
        </div>
        <div className="metric-val" style={{ color: isFreqFault ? '#ef4444' : '#f8fafc' }}>
          {freq.toFixed(2)} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 400 }}>Hz</span>
        </div>
        <div className="bar-track">
          <div 
            className="bar-fill" 
            style={{ 
              width: `${Math.min(100, Math.max(10, ((freq - 47) / 6) * 100))}%`, 
              backgroundColor: isFreqFault ? '#ef4444' : '#0f62fe' 
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <span>Nominal: 50.00 Hz</span>
          <span className="mono" style={{ color: isFreqFault ? '#ef4444' : '#34d399' }}>
            Δf: {(freq - 50.0).toFixed(2)} Hz
          </span>
        </div>
      </div>

      {/* 2. Bus-14 Voltage & Phase Imbalance */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="metric-label">Bus-14 Voltage &amp; Phase</span>
          <span className={`badge ${isVoltageFault ? 'badge-anomaly' : 'badge-ok'}`}>
            {isVoltageFault ? 'PHASE UNBALANCE' : '1.0 p.u. BALANCED'}
          </span>
        </div>
        <div className="metric-val" style={{ color: isVoltageFault ? '#ef4444' : '#00f2fe' }}>
          {vBus14.toFixed(3)} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 400 }}>p.u.</span>
        </div>
        <div className="bar-track">
          <div 
            className="bar-fill" 
            style={{ 
              width: `${Math.min(100, (vBus14 / 1.2) * 100)}%`, 
              backgroundColor: isVoltageFault ? '#ef4444' : '#00f2fe' 
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <span>Phase Imbalance:</span>
          <span className="mono" style={{ color: unbalance > 3.0 ? '#ef4444' : '#00f2fe', fontWeight: 600 }}>
            {unbalance.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* 3. Bus-18 Solar PV Inverter THD */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="metric-label">Bus-18 Solar Inverter THD</span>
          <span className={`badge ${isThdFault ? 'badge-anomaly' : 'badge-ok'}`}>
            {isThdFault ? 'HARMONIC SURGE' : 'IEEE 519 COMPLIANT'}
          </span>
        </div>
        <div className="metric-val" style={{ color: isThdFault ? '#ef4444' : '#10b981' }}>
          {thdBus18.toFixed(1)}% <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 400 }}>THD</span>
        </div>
        <div className="bar-track">
          <div 
            className="bar-fill" 
            style={{ 
              width: `${Math.min(100, (thdBus18 / 20) * 100)}%`, 
              backgroundColor: isThdFault ? '#ef4444' : '#10b981' 
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <span>Active Generation</span>
          <span className="mono">{actPower.toFixed(1)} MW</span>
        </div>
      </div>

      {/* 4. Bus-25 Transformer Load */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="metric-label">Bus-25 Transformer Thermal</span>
          <span className={`badge ${isThermalFault ? 'badge-anomaly' : 'badge-ok'}`}>
            {isThermalFault ? 'OVERLOAD RISK' : 'OPTIMAL LOAD'}
          </span>
        </div>
        <div className="metric-val" style={{ color: isThermalFault ? '#ef4444' : '#8b5cf6' }}>
          {transTemp.toFixed(1)}° <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 400 }}>C</span>
        </div>
        <div className="bar-track">
          <div 
            className="bar-fill" 
            style={{ 
              width: `${Math.min(100, (transTemp / 120) * 100)}%`, 
              backgroundColor: isThermalFault ? '#ef4444' : '#8b5cf6' 
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <span>Winding Current</span>
          <span className="mono" style={{ color: transCurr > 1.2 ? '#ef4444' : 'inherit' }}>
            {transCurr.toFixed(2)} p.u.
          </span>
        </div>
      </div>
    </div>
  );
}
