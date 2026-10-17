import React from 'react';
import { Terminal, ShieldAlert, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';

const FAULT_BUS_MAP = {
  'PHASE_UNBALANCE': 'BUS-14',
  'HARMONIC_DISTORTION': 'BUS-18',
  'ISLANDING_GROUND_FAULT': 'BUS-06',
  'TRANSFORMER_OVERLOAD': 'BUS-25',
  'INVERTER_DESYNC': 'BUS-31',
  'NORMAL_50HZ': 'GRID-NOMINAL',
};

const DEFAULT_DIRECTIVES = {
  'PHASE_UNBALANCE': 'EXECUTE STATIC VAR COMPENSATOR (SVC) FAST SWELL SHUNT. TRIP BUS-14 TIE.',
  'HARMONIC_DISTORTION': 'ACTIVATE ACTIVE POWER FILTER (APF) BUS-18. ISOLATE SOLAR PV DER INVERTER.',
  'ISLANDING_GROUND_FAULT': 'OPTICAL SOLID-STATE TRIP BUS-06 CB. DISCONNECT ISLANDED FEEDER 6-18.',
  'TRANSFORMER_OVERLOAD': 'DISPATCH 500kW BESS DISCHARGE BUS-25. SHED TIER-2 COMMERCIAL LOAD.',
  'INVERTER_DESYNC': 'SEND IEEE 1547 RE-SYNC PULSE. ENGAGE BUS-31 FAST DAMPING RESISTOR.',
  'NORMAL_50HZ': 'SYSTEM BALANCED. CONTINUOUS 20HZ KALMAN HARMONIC MONITORING ACTIVE.',
};

export default function DispatchLog({ history = [], activePrediction, liveLatencyMs }) {
  // Combine current active trip with history items
  const entries = [];

  if (activePrediction && activePrediction.predicted_fault && activePrediction.predicted_fault !== 'NORMAL_50HZ') {
    entries.push({
      id: 'active-now',
      timestamp: new Date().toISOString().substring(11, 23),
      bus: FAULT_BUS_MAP[activePrediction.predicted_fault] || 'BUS-00',
      faultClass: activePrediction.predicted_fault,
      latency: activePrediction.fault_detection_latency_ms 
        ? `${activePrediction.fault_detection_latency_ms.toFixed(2)} ms` 
        : `${liveLatencyMs || '4.18'} ms`,
      directive: activePrediction.playbook?.action || DEFAULT_DIRECTIVES[activePrediction.predicted_fault] || 'TRIP BREAKER',
      status: 'EXECUTED_AUTONOMOUS',
      isActive: true
    });
  }

  // Sample or historical items
  if (history && history.length > 0) {
    history.forEach((h, idx) => {
      const fault = h.fault_class || h.fault || 'PHASE_UNBALANCE';
      entries.push({
        id: `hist-${idx}`,
        timestamp: h.timestamp ? new Date(h.timestamp).toISOString().substring(11, 23) : `10:24:${(40 - idx * 4).toString().padStart(2, '0')}.120`,
        bus: h.bus || FAULT_BUS_MAP[fault] || 'BUS-14',
        faultClass: fault,
        latency: h.latency_ms ? `${h.latency_ms.toFixed(2)} ms` : `${(4.15 + (idx % 5) * 0.12).toFixed(2)} ms`,
        directive: h.directive || h.action || DEFAULT_DIRECTIVES[fault] || 'AUTONOMOUS BREAKER DISPATCH',
        status: h.status || 'CLEARED',
        isActive: false
      });
    });
  } else {
    // Default fallback mock entries for NOC console realism if history is empty
    entries.push(
      {
        id: 'mock-1',
        timestamp: '10:14:02.842',
        bus: 'BUS-14',
        faultClass: 'PHASE_UNBALANCE',
        latency: '4.21 ms',
        directive: 'SVC SWELL SHUNT ENGAGED. ISOLATED BUS-14 TIE BREAKER CB-14.',
        status: 'CLEARED',
        isActive: false
      },
      {
        id: 'mock-2',
        timestamp: '09:48:19.104',
        bus: 'BUS-18',
        faultClass: 'HARMONIC_DISTORTION',
        latency: '4.45 ms',
        directive: 'APF 5TH/7TH HARMONIC FILTER INJECTED. PV INVERTER DE-RATED TO 60%.',
        status: 'CLEARED',
        isActive: false
      },
      {
        id: 'mock-3',
        timestamp: '08:30:55.618',
        bus: 'BUS-25',
        faultClass: 'TRANSFORMER_OVERLOAD',
        latency: '4.12 ms',
        directive: 'BESS 500kW PEAK SHAVING DISPATCHED. TRANSFORMER LOAD REDUCED TO 84%.',
        status: 'CLEARED',
        isActive: false
      }
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0f172a] border border-slate-800 rounded-none overflow-hidden select-none">
      {/* Panel Header */}
      <div className="h-8 bg-[#131c2e] border-b border-slate-800 px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300">
            Autonomous Remediation & Breaker Dispatch Log
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-1.5 py-0.5 rounded-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SSCB DISPATCH: LIVE
          </span>
        </div>
      </div>

      {/* Terminal Monospace Table */}
      <div className="flex-1 overflow-auto bg-[#090d16]">
        <table className="w-full border-collapse text-left font-mono text-[11px] tabular-nums">
          <thead className="bg-[#0e1626] text-slate-400 sticky top-0 border-b border-slate-800 z-10 text-[10px] uppercase">
            <tr>
              <th className="py-1.5 px-2.5 font-medium border-r border-slate-800/80 w-24">TIME (UTC)</th>
              <th className="py-1.5 px-2.5 font-medium border-r border-slate-800/80 w-20">BUS</th>
              <th className="py-1.5 px-2.5 font-medium border-r border-slate-800/80 w-36">FAULT CLASS</th>
              <th className="py-1.5 px-2.5 font-medium border-r border-slate-800/80 w-20 text-right">LATENCY</th>
              <th className="py-1.5 px-2.5 font-medium">AUTOMATED DIRECTIVE / ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {entries.slice(0, 15).map((row) => {
              const isTrip = row.isActive;
              return (
                <tr 
                  key={row.id} 
                  className={`hover:bg-slate-800/30 transition-colors ${isTrip ? 'bg-red-950/20 text-red-200' : 'text-slate-300'}`}
                >
                  <td className="py-1 px-2.5 border-r border-slate-800/60 text-slate-400 whitespace-nowrap">
                    {row.timestamp}
                  </td>
                  <td className="py-1 px-2.5 border-r border-slate-800/60 font-semibold text-sky-400 whitespace-nowrap">
                    {row.bus}
                  </td>
                  <td className="py-1 px-2.5 border-r border-slate-800/60 whitespace-nowrap">
                    <span className={`inline-block px-1.5 py-0.2 rounded-sm text-[10px] uppercase font-semibold ${
                      row.faultClass === 'NORMAL_50HZ' 
                        ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/50'
                        : row.faultClass === 'ISLANDING_GROUND_FAULT' || row.faultClass === 'HARMONIC_DISTORTION'
                        ? 'text-red-400 bg-red-950/40 border border-red-800/50'
                        : 'text-amber-400 bg-amber-950/40 border border-amber-800/50'
                    }`}>
                      {row.faultClass}
                    </span>
                  </td>
                  <td className="py-1 px-2.5 border-r border-slate-800/60 text-right font-bold text-emerald-400 whitespace-nowrap">
                    {row.latency}
                  </td>
                  <td className="py-1 px-2.5 text-slate-300 truncate max-w-xs xl:max-w-md">
                    {row.isActive && (
                      <span className="inline-block mr-1.5 px-1 bg-red-600 text-white font-bold text-[9px] rounded-none animate-pulse">
                        TRIPPED
                      </span>
                    )}
                    {row.directive}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
