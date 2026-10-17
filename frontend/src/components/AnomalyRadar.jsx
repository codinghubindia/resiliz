import React from 'react';

export default function AnomalyRadar({ prediction }) {
  const isAnomaly = prediction?.is_anomaly || false;
  const anomalyScore = prediction?.anomaly_score ? Math.round(prediction.anomaly_score * 100) : 4;
  const faultClass = prediction?.predicted_fault || 'NORMAL_50HZ';
  const confidence = prediction?.confidence ? Math.round(prediction.confidence * 100) : 97;
  const latency = prediction?.inference_latency_ms || 4.31;
  const classProbs = prediction?.class_probabilities || {};
  const topDeviations = prediction?.top_deviating_features || [];

  const getFaultBadgeClass = (fault) => {
    if (fault === 'NORMAL_50HZ') return 'badge-ok';
    return 'badge-anomaly';
  };

  const formatFaultLabel = (fault) => {
    if (fault === 'NORMAL_50HZ') return 'NORMAL (50.0Hz SYNCHRONIZED)';
    return fault.replace(/_/g, ' ');
  };

  return (
    <div className="glass-card" style={{ height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: isAnomaly ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isAnomaly ? '#ef4444' : '#10b981'} strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>IEEE 33-Bus Anomaly Radar &amp; Root Cause</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Native LinuxONE s390x Isolation Forest &amp; Fault Classifier</p>
          </div>
        </div>
        <div className="badge" style={{ background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe' }}>
          <span className="mono">{latency.toFixed(2)} ms</span> LATENCY
        </div>
      </div>

      {/* Main Status Hero */}
      <div style={{ 
        background: isAnomaly ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
        border: `1px solid ${isAnomaly ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
            Classified Microgrid Operating State
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: isAnomaly ? '#ef4444' : '#10b981', marginTop: '2px' }}>
            {formatFaultLabel(faultClass)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Confidence: <strong style={{ color: '#ffffff' }}>{confidence}%</strong> | Isolation Forest Anomaly: <strong style={{ color: isAnomaly ? '#ef4444' : '#34d399' }}>{anomalyScore}%</strong>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span className={`badge ${getFaultBadgeClass(faultClass)}`} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            {isAnomaly ? 'DER FAULT ISOLATED' : 'NOMINAL GRID'}
          </span>
        </div>
      </div>

      {/* Root Cause Feature Deviations */}
      {topDeviations.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Microgrid Feature Z-Score Anomalies
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {topDeviations.map((dev, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="mono" style={{ color: '#00f2fe' }}>{dev.feature}</span>
                <span style={{ color: dev.direction === 'HIGH' ? '#ef4444' : '#3b82f6', fontWeight: 600 }}>
                  ({dev.direction} +{dev.z_score}σ)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Class Probabilities Distribution */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px' }}>
          Real-Time Fault Probability Distribution (s390x CPU)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Object.entries(classProbs).map(([cls, prob]) => {
            const probPct = Math.round(prob * 100);
            const isHighest = cls === faultClass;
            return (
              <div key={cls}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                  <span style={{ color: isHighest ? '#ffffff' : 'var(--text-secondary)', fontWeight: isHighest ? 600 : 400 }}>
                    {cls.replace(/_/g, ' ')}
                  </span>
                  <span className="mono" style={{ color: isHighest ? (cls === 'NORMAL_50HZ' ? '#10b981' : '#ef4444') : 'var(--text-muted)' }}>
                    {probPct}%
                  </span>
                </div>
                <div className="bar-track" style={{ height: '4px', marginTop: '0' }}>
                  <div 
                    className="bar-fill" 
                    style={{ 
                      width: `${probPct}%`, 
                      backgroundColor: isHighest ? (cls === 'NORMAL_50HZ' ? '#10b981' : '#ef4444') : 'rgba(255,255,255,0.2)' 
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
