import React, { useState, useEffect, useRef } from 'react';

export default function WaveformChart({ telemetry }) {
  const canvasRef = useRef(null);
  const phaseData = telemetry?.phase_voltages || {};
  const va = phaseData.va_pu ?? 0.998;
  const vb = phaseData.vb_pu ?? 1.001;
  const vc = phaseData.vc_pu ?? 0.999;
  const freq = phaseData.freq_hz ?? 50.0;
  const thd = phaseData.thd_pct ?? 1.82;
  const isHarmonic = thd > 8.0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      // Draw subtle #1e293b gridlines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;

      // Horizontal lines
      for (let y = 15; y < height; y += 22) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center zero line
      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.stroke();

      // Vertical lines
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      const drawPhase = (amplitude, phaseShift, color) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();

        for (let x = 0; x < width; x++) {
          const t = (x + offset) * 0.05;
          let yVal = Math.sin(t + phaseShift);

          // Add harmonic distortion ripples if THD is high
          if (isHarmonic) {
            yVal += 0.28 * Math.sin(5 * (t + phaseShift)) + 0.18 * Math.sin(7 * (t + phaseShift));
          }

          const y = midY - (yVal * (amplitude * 32));
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      };

      // 3-Phase Sinusoids (Phase A: 0°, Phase B: 120°, Phase C: 240°)
      drawPhase(va, 0, '#ef4444');              // Phase A (Red)
      drawPhase(vb, (2 * Math.PI) / 3, '#f59e0b'); // Phase B (Amber)
      drawPhase(vc, (4 * Math.PI) / 3, '#38bdf8'); // Phase C (Sky)

      offset += 1.8;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [va, vb, vc, freq, thd, isHarmonic]);

  return (
    <div className="industrial-panel" style={{ height: '100%' }}>
      {/* Tabular Metrics Bar on Top */}
      <div style={{
        backgroundColor: '#0c1424',
        borderBottom: '1px solid #1e293b',
        padding: '5px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>
            <strong style={{ color: '#ef4444' }}>Va:</strong>{' '}
            <span className="tabular-nums" style={{ color: '#f8fafc' }}>{va.toFixed(3)} pu</span>
          </span>
          <span style={{ color: '#334155' }}>|</span>
          <span>
            <strong style={{ color: '#f59e0b' }}>Vb:</strong>{' '}
            <span className="tabular-nums" style={{ color: '#f8fafc' }}>{vb.toFixed(3)} pu</span>
          </span>
          <span style={{ color: '#334155' }}>|</span>
          <span>
            <strong style={{ color: '#38bdf8' }}>Vc:</strong>{' '}
            <span className="tabular-nums" style={{ color: '#f8fafc' }}>{vc.toFixed(3)} pu</span>
          </span>
          <span style={{ color: '#334155' }}>|</span>
          <span>
            <strong style={{ color: '#94a3b8' }}>Freq:</strong>{' '}
            <span className="tabular-nums" style={{ color: freq < 49.0 ? '#ef4444' : '#10b981' }}>{freq.toFixed(2)} Hz</span>
          </span>
        </div>

        <div>
          <span>
            <strong style={{ color: '#94a3b8' }}>Inverter THD:</strong>{' '}
            <span className="tabular-nums" style={{ color: isHarmonic ? '#ef4444' : '#10b981', fontWeight: 600 }}>
              {thd.toFixed(2)}%
            </span>
          </span>
        </div>
      </div>

      {/* Oscilloscope Canvas */}
      <div style={{ flex: 1, backgroundColor: '#090d16', position: 'relative', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          width={650}
          height={115}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
        <div style={{
          position: 'absolute',
          top: '4px',
          right: '8px',
          fontSize: '9.5px',
          fontFamily: 'var(--font-mono)',
          color: '#64748b'
        }}>
          50Hz OSCILLOSCOPE &bull; TIMEBASE: 2.0ms/DIV
        </div>
      </div>
    </div>
  );
}
