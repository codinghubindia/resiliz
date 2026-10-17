import React from 'react';
import { Gauge, AlertTriangle, ShieldCheck, Clock, Zap } from 'lucide-react';

export default function ScadaRaceWidget({ telemetry, prediction, scadaRace, liveInferenceMs }) {
  const race = scadaRace || telemetry?.scada_race || {};
  const isFault = race.fault_active || Boolean(telemetry?.fault_injected);
  const rollingLatency = liveInferenceMs ?? telemetry?.live_inference_ms ?? race.rolling_inference_ms ?? 4.28;
  const lockedLatency = race.resiliz_locked_ms ?? (isFault ? (telemetry?.fault_detection_latency_ms ?? 4.19) : null);
  const opticalTrip = race.optical_trip_ms ?? 0.80;
  const totalClearing = race.total_clearing_ms ?? (lockedLatency ? (lockedLatency + opticalTrip) : null);
  const scadaElapsed = race.scada_poll_elapsed_ms ?? (isFault ? 1420 : 850);
  const scadaProgressPct = Math.min(100, Math.max(0, (scadaElapsed / 3000) * 100));
  const scadaExposedSec = (scadaElapsed / 1000).toFixed(2);
  const aheadOfScada = race.scada_ahead_ms ?? (3000 - (totalClearing || 5.0)).toFixed(1);

  return (
    <div className="flex flex-col h-full bg-[#0f172a] border border-slate-800 rounded-none overflow-hidden select-none">
      {/* Panel Header */}
      <div className="h-8 bg-[#131c2e] border-b border-slate-800 px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300">
            Protection Speed Race: ResiliZ (s390x) vs. Legacy SCADA
          </span>
        </div>
        <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-none font-bold ${
          isFault 
            ? 'text-red-400 bg-red-950/80 border border-red-700 animate-pulse' 
            : 'text-sky-400 bg-sky-950/60 border border-sky-800/80'
        }`}>
          {isFault ? `RESILIZ: ${aheadOfScada} ms AHEAD` : 'IEC 60870-5-104 BENCHMARK'}
        </span>
      </div>

      {/* Main Body */}
      <div className="flex-1 p-2.5 flex flex-col justify-between gap-2 bg-[#090d16]">
        {/* Track A: ResiliZ IBM LinuxONE */}
        <div className="bg-[#0f172a] border border-slate-800 border-l-2 border-l-emerald-500 p-2.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-emerald-400" />
              TRACK A: RESILIZ ON IBM LINUXONE (s390x STREAMING)
            </span>
            <span className="text-[9px] font-mono font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.2">
              SUB-5MS PROTECTION
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-1.5 font-mono tabular-nums">
            {/* Live rolling frame */}
            <div>
              <div className="text-[9px] text-slate-400 uppercase font-medium">Rolling Frame Scoring</div>
              <div className="text-lg font-bold text-slate-100">
                {rollingLatency.toFixed(2)} <span className="text-xs text-slate-400 font-normal">ms</span>
              </div>
            </div>

            {/* Locked fault clearing time */}
            <div>
              <div className={`text-[9px] uppercase font-medium ${isFault ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                {isFault ? 'Fault Lock-In & Clearance' : 'Clearance Est. (SSCB)'}
              </div>
              <div className={`text-lg font-bold ${isFault ? 'text-emerald-400' : 'text-slate-400'}`}>
                {isFault ? (totalClearing ? totalClearing.toFixed(2) : (rollingLatency + opticalTrip).toFixed(2)) : (rollingLatency + opticalTrip).toFixed(2)}{' '}
                <span className="text-xs text-slate-400 font-normal">ms</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-300 mt-1.5 pt-1 border-t border-slate-800/80">
            {isFault ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                TRANSFORMER SAVED ({aheadOfScada} ms AHEAD OF SCADA) &bull; SSCB Optical Trip: {opticalTrip.toFixed(2)}ms
              </span>
            ) : (
              <span className="text-slate-400">
                Continuous 20Hz streaming inference active &bull; Auto optical SSCB relay arm: READY
              </span>
            )}
          </div>
        </div>

        {/* Track B: Legacy SCADA */}
        <div className={`bg-[#0f172a] border border-slate-800 p-2.5 ${isFault ? 'border-l-2 border-l-red-500' : 'border-l-2 border-l-amber-500'}`}>
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wide flex items-center gap-1.5 ${isFault ? 'text-red-400' : 'text-amber-400'}`}>
              <Clock className="w-3 h-3" />
              TRACK B: LEGACY SCADA (3,000ms POLLING WINDOW)
            </span>
            <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 border ${
              isFault 
                ? 'text-red-400 bg-red-950/80 border-red-800' 
                : 'text-amber-400 bg-amber-950/80 border-amber-800'
            }`}>
              {isFault ? 'BLIND TO TRANSIENT' : 'PERIODIC RTU POLL'}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1.5 font-mono tabular-nums">
            <span className={`text-lg font-bold ${isFault ? 'text-red-400' : 'text-amber-400'}`}>
              {scadaElapsed.toFixed(0)} / 3,000
            </span>
            <span className="text-xs text-slate-400">ms elapsed in SCADA polling cycle</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-slate-800 rounded-none overflow-hidden mt-1.5 border border-slate-700/60">
            <div
              className={`h-full transition-all duration-100 ${isFault ? 'bg-red-500' : 'bg-amber-500'}`}
              style={{ width: `${scadaProgressPct}%` }}
            />
          </div>

          <div className="text-[10px] font-mono mt-1.5 pt-1 border-t border-slate-800/80">
            {isFault ? (
              <span className="text-red-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                BLIND WINDOW: AWAITING NEXT RTU POLL (EQUIPMENT EXPOSED FOR {scadaExposedSec}s)
              </span>
            ) : (
              <span className="text-slate-400">
                SCADA cycle scanning RTUs &bull; Blind window leaves grid exposed to cascading faults
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
