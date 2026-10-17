import React from 'react';

const FAULT_BUS_ID_MAP = {
  'PHASE_UNBALANCE': 14,
  'HARMONIC_DISTORTION': 18,
  'ISLANDING_GROUND_FAULT': 6,
  'TRANSFORMER_OVERLOAD': 25,
  'INVERTER_DESYNC': 31,
};

export default function GridTopologyMap({ telemetry, activeFault: propActiveFault, prediction }) {
  const activeFault = propActiveFault || telemetry?.fault_injected || (prediction?.predicted_fault !== 'NORMAL_50HZ' ? prediction?.predicted_fault : null);
  const faultedBusId = telemetry?.faulted_bus_id || (activeFault ? FAULT_BUS_ID_MAP[activeFault] : null);
  const sldBuses = telemetry?.sld_buses || {};
  const isTrip = Boolean(activeFault);

  // IEEE 33-Bus Node Coordinates (Horizontally scaled across canvas)
  // Main Trunk: Bus 1 -> Bus 18 along Y=110
  const mainBuses = [
    { id: 1, x: 40, y: 110, label: 'B1 (Slack)' },
    { id: 2, x: 80, y: 110, label: 'B2' },
    { id: 3, x: 125, y: 110, label: 'B3' },
    { id: 4, x: 170, y: 110, label: 'B4' },
    { id: 5, x: 215, y: 110, label: 'B5' },
    { id: 6, x: 260, y: 110, label: 'B6 (DER F1)' },
    { id: 7, x: 305, y: 110, label: 'B7' },
    { id: 8, x: 350, y: 110, label: 'B8' },
    { id: 9, x: 395, y: 110, label: 'B9' },
    { id: 10, x: 440, y: 110, label: 'B10' },
    { id: 11, x: 485, y: 110, label: 'B11' },
    { id: 12, x: 530, y: 110, label: 'B12' },
    { id: 13, x: 575, y: 110, label: 'B13' },
    { id: 14, x: 620, y: 110, label: 'B14 (PV Solar)' },
    { id: 15, x: 665, y: 110, label: 'B15' },
    { id: 16, x: 710, y: 110, label: 'B16' },
    { id: 17, x: 755, y: 110, label: 'B17' },
    { id: 18, x: 800, y: 110, label: 'B18 (Inverter)' },
  ];

  // Lateral Feeder 1: Branch from Bus 3 going down (19 -> 22)
  const lateral1 = [
    { id: 19, x: 125, y: 155, label: 'B19' },
    { id: 20, x: 125, y: 185, label: 'B20' },
    { id: 21, x: 125, y: 215, label: 'B21' },
    { id: 22, x: 125, y: 245, label: 'B22' },
  ];

  // Lateral Feeder 2: Branch from Bus 6 going up (23 -> 25)
  const lateral2 = [
    { id: 23, x: 260, y: 75, label: 'B23' },
    { id: 24, x: 260, y: 45, label: 'B24' },
    { id: 25, x: 260, y: 20, label: 'B25 (XFMR)' },
  ];

  // Lateral Feeder 3: Branch from Bus 12 going down (26 -> 33)
  const lateral3 = [
    { id: 26, x: 530, y: 155, label: 'B26' },
    { id: 27, x: 530, y: 185, label: 'B27' },
    { id: 28, x: 530, y: 215, label: 'B28' },
    { id: 29, x: 575, y: 215, label: 'B29' },
    { id: 30, x: 620, y: 215, label: 'B30' },
    { id: 31, x: 665, y: 215, label: 'B31 (Wind)' },
    { id: 32, x: 710, y: 215, label: 'B32' },
    { id: 33, x: 755, y: 215, label: 'B33' },
  ];

  const getBusVoltage = (id) => {
    if (sldBuses[id]) return sldBuses[id].v_pu.toFixed(3);
    if (id === 6 && faultedBusId === 6) return '0.468';
    if (id === 14 && faultedBusId === 14) return '0.865';
    if (id === 25 && faultedBusId === 25) return '0.884';
    return (1.000 - (id * 0.0012)).toFixed(3);
  };

  return (
    <div className="industrial-panel" style={{ height: '100%' }}>
      {/* Panel Header */}
      <div className="panel-header">
        <span>IEEE 33-BUS RADIAL DISTRIBUTION SINGLE-LINE DIAGRAM (SLD)</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: '#64748b' }}>BASE VOLTAGE: 12.66 kV</span>
          <span className={`status-pill ${isTrip ? 'pill-critical' : 'pill-nominal'}`}>
            {isTrip ? `ISOLATED BRANCH: BUS-${faultedBusId}` : 'ALL 33 BUSSES ENERGIZED'}
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div style={{
        flex: 1,
        backgroundColor: '#090d16',
        backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
        backgroundSize: '16px 16px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <svg viewBox="0 0 850 270" style={{ width: '100%', height: '100%', padding: '10px' }}>
          {/* Main Trunk Bus Line 1 -> 18 */}
          <line x1="40" y1="110" x2="800" y2="110" stroke="#334155" strokeWidth="2.5" />
          
          {/* Lateral 1 Line (Bus 3 -> 22) */}
          <line x1="125" y1="110" x2="125" y2="245" stroke="#334155" strokeWidth="2" />

          {/* Lateral 2 Line (Bus 6 -> 25) */}
          <line 
            x1="260" y1="110" x2="260" y2="20" 
            stroke={faultedBusId === 25 ? '#ef4444' : '#334155'} 
            strokeWidth={faultedBusId === 25 ? "2.5" : "2"} 
            strokeDasharray={faultedBusId === 25 ? "4 3" : "none"}
          />

          {/* Lateral 3 Line (Bus 12 -> 28 -> 33) */}
          <line x1="530" y1="110" x2="530" y2="215" stroke="#334155" strokeWidth="2" />
          <line 
            x1="530" y1="215" x2="755" y2="215" 
            stroke={faultedBusId === 31 ? '#ef4444' : '#334155'} 
            strokeWidth={faultedBusId === 31 ? "2.5" : "2"} 
            strokeDasharray={faultedBusId === 31 ? "4 3" : "none"}
          />

          {/* Render All Main Buses */}
          {mainBuses.map((b) => {
            const isFaulted = b.id === faultedBusId;
            const isKeyDer = [1, 6, 14, 18].includes(b.id);
            const v = getBusVoltage(b.id);

            return (
              <g key={b.id}>
                {/* Breaker symbol on key buses */}
                {isKeyDer && b.id !== 1 && (
                  <g transform={`translate(${b.x - 6}, 98)`}>
                    <rect 
                      width="12" 
                      height="12" 
                      fill={isFaulted ? 'rgba(239, 68, 68, 0.25)' : '#0f172a'} 
                      stroke={isFaulted ? '#ef4444' : '#10b981'} 
                      strokeWidth="1.2" 
                    />
                    <text 
                      x="6" 
                      y="9" 
                      fontSize="8" 
                      fontFamily="var(--font-mono)" 
                      fill={isFaulted ? '#ef4444' : '#10b981'} 
                      textAnchor="middle" 
                      fontWeight="bold"
                    >
                      {isFaulted ? '/' : 'X'}
                    </text>
                  </g>
                )}

                {/* Bus Bar Node */}
                <circle 
                  cx={b.x} 
                  cy={b.y} 
                  r={isKeyDer ? 4.5 : 2.5} 
                  fill={isFaulted ? '#ef4444' : (isKeyDer ? '#38bdf8' : '#94a3b8')} 
                />

                {/* Bus Number Label */}
                <text 
                  x={b.x} 
                  y={b.y - (isKeyDer ? 16 : 8)} 
                  fill={isFaulted ? '#ef4444' : (isKeyDer ? '#f8fafc' : '#64748b')} 
                  fontSize={isKeyDer ? '9.5' : '8'} 
                  fontFamily="var(--font-mono)" 
                  textAnchor="middle"
                  fontWeight={isKeyDer ? '600' : 'normal'}
                >
                  {isKeyDer ? b.label : `B${b.id}`}
                </text>

                {/* Per-unit voltage readout under key buses */}
                {isKeyDer && (
                  <text 
                    x={b.x} 
                    y={b.y + 16} 
                    fill={isFaulted ? '#ef4444' : '#10b981'} 
                    fontSize="8.5" 
                    fontFamily="var(--font-mono)" 
                    textAnchor="middle"
                    className="tabular-nums"
                  >
                    {v} pu
                  </text>
                )}
              </g>
            );
          })}

          {/* Render Lateral 1 Buses (19-22) */}
          {lateral1.map((b) => (
            <g key={b.id}>
              <circle cx={b.x} cy={b.y} r="2.5" fill="#94a3b8" />
              <text x={b.x + 8} y={b.y + 3} fill="#64748b" fontSize="8" fontFamily="var(--font-mono)">
                B{b.id} ({getBusVoltage(b.id)} pu)
              </text>
            </g>
          ))}

          {/* Render Lateral 2 Buses (23-25 XFMR) */}
          {lateral2.map((b) => {
            const isFaulted = b.id === faultedBusId;
            return (
              <g key={b.id}>
                <circle cx={b.x} cy={b.y} r={b.id === 25 ? 4.5 : 2.5} fill={isFaulted ? '#ef4444' : '#94a3b8'} />
                <text 
                  x={b.x + 8} 
                  y={b.y + 3} 
                  fill={isFaulted ? '#ef4444' : (b.id === 25 ? '#38bdf8' : '#64748b')} 
                  fontSize={b.id === 25 ? '9' : '8'} 
                  fontFamily="var(--font-mono)"
                  fontWeight={b.id === 25 ? '600' : 'normal'}
                >
                  {b.label} ({getBusVoltage(b.id)} pu)
                </text>
              </g>
            );
          })}

          {/* Render Lateral 3 Buses (26-33 Wind) */}
          {lateral3.map((b) => {
            const isFaulted = b.id === faultedBusId;
            const isWind = b.id === 31;
            return (
              <g key={b.id}>
                <circle cx={b.x} cy={b.y} r={isWind ? 4.5 : 2.5} fill={isFaulted ? '#ef4444' : '#94a3b8'} />
                <text 
                  x={b.x} 
                  y={b.y + 14} 
                  fill={isFaulted ? '#ef4444' : (isWind ? '#38bdf8' : '#64748b')} 
                  fontSize={isWind ? '9' : '7.5'} 
                  fontFamily="var(--font-mono)"
                  textAnchor="middle"
                  fontWeight={isWind ? '600' : 'normal'}
                >
                  {isWind ? b.label : `B${b.id}`}
                </text>
                {isWind && (
                  <text 
                    x={b.x} 
                    y={b.y + 24} 
                    fill={isFaulted ? '#ef4444' : '#10b981'} 
                    fontSize="8.5" 
                    fontFamily="var(--font-mono)" 
                    textAnchor="middle"
                  >
                    {getBusVoltage(b.id)} pu
                  </text>
                )}
              </g>
            );
          })}

          {/* Substation Icon at Bus 1 */}
          <g transform="translate(18, 98)">
            <rect width="18" height="24" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
            <path d="M 4 8 L 9 2 L 14 8 Z" fill="#38bdf8" />
            <text x="9" y="20" fontSize="7" fill="#38bdf8" textAnchor="middle" fontFamily="var(--font-mono)">G</text>
          </g>
        </svg>

        {/* Legend Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '10px',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid #1e293b',
          padding: '4px 8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '9.5px',
          display: 'flex',
          gap: '12px',
          color: '#94a3b8'
        }}>
          <span>[X] SSCB CLOSED (NORMAL)</span>
          <span style={{ color: '#ef4444' }}>[/] SSCB OPEN (ISOLATED)</span>
          <span style={{ color: '#38bdf8' }}>&bull; DER GENERATION BUS</span>
        </div>
      </div>
    </div>
  );
}
