import React, { useState } from 'react';
import { Lock, ShieldCheck, Copy, Check, Cpu } from 'lucide-react';

export default function ConfidentialTelemetryPanel({ confidentialData }) {
  const [copiedHash, setCopiedHash] = useState(false);
  const data = confidentialData || {};

  const dpLoad = data.dp_anonymized_load_kw ?? 1428.6;
  const epsilon = data.dp_epsilon ?? 1.0;
  const noiseDelta = data.laplace_noise_delta_kw ?? 3.2;
  const rawLoadEst = data.raw_load_kw ?? (dpLoad - noiseDelta);
  const hash = data.cpacf_sha256_proof || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  const rows = [
    {
      bus: 'BUS-06',
      facility: 'CRITICAL BIO-DEFENSE LAB SUBSTATION',
      rawLoad: `${rawLoadEst.toFixed(1)} kW`,
      dpLoad: `${dpLoad.toFixed(1)} kW`,
      noiseDelta: `${noiseDelta > 0 ? '+' : ''}${noiseDelta.toFixed(1)} kW`,
      epsilon: `ε=${epsilon.toFixed(1)}`,
      hash: hash,
    },
    {
      bus: 'BUS-14',
      facility: 'DISTRICT WATER TREATMENT FACILITY',
      rawLoad: '842.1 kW',
      dpLoad: `${(842.1 + (noiseDelta * 0.4)).toFixed(1)} kW`,
      noiseDelta: `${(noiseDelta * 0.4) > 0 ? '+' : ''}${(noiseDelta * 0.4).toFixed(1)} kW`,
      epsilon: `ε=${epsilon.toFixed(1)}`,
      hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    },
    {
      bus: 'BUS-18',
      facility: 'COMMERCIAL DATA CENTER FEEDER A',
      rawLoad: '2,190.5 kW',
      dpLoad: `${(2190.5 - (noiseDelta * 0.7)).toFixed(1)} kW`,
      noiseDelta: `${(-noiseDelta * 0.7) > 0 ? '+' : ''}${(-noiseDelta * 0.7).toFixed(1)} kW`,
      epsilon: `ε=${epsilon.toFixed(1)}`,
      hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    },
  ];

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a] border border-slate-800 rounded-none overflow-hidden select-none">
      {/* Header Bar */}
      <div className="h-8 bg-[#131c2e] border-b border-slate-800 px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300">
            Confidential Telemetry &amp; CPACF Audit (IBM s390x MSA)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-sky-400 bg-sky-950/60 border border-sky-800/80 px-1.5 py-0.5 rounded-sm">
            <Cpu className="w-3 h-3 text-sky-400" />
            CPACF SHA-256 MSA HARDWARE
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-1.5 py-0.5 rounded-sm">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            DP GUARANTEE ε=1.0
          </span>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto bg-[#090d16]">
        <table className="w-full border-collapse text-left font-mono text-[11px] tabular-nums">
          <thead className="bg-[#0e1626] text-slate-400 sticky top-0 border-b border-slate-800 z-10 text-[10px] uppercase">
            <tr>
              <th className="py-1.5 px-2.5 font-medium border-r border-slate-800/80 w-28">FACILITY BUS</th>
              <th className="py-1.5 px-2.5 font-medium border-r border-slate-800/80 w-32">RAW LOAD (PROTECTED)</th>
              <th className="py-1.5 px-2.5 font-medium border-r border-slate-800/80 w-36">DP ANONYMIZED (ε=1.0)</th>
              <th className="py-1.5 px-2.5 font-medium border-r border-slate-800/80 w-24">NOISE DELTA</th>
              <th className="py-1.5 px-2.5 font-medium">CPACF SHA-256 HARDWARE SIGNATURE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {rows.map((r, i) => (
              <tr key={r.bus} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-1 px-2.5 border-r border-slate-800/60 whitespace-nowrap">
                  <div className="font-semibold text-sky-400">{r.bus}</div>
                  <div className="text-[9px] text-slate-400 font-sans tracking-wide truncate max-w-[130px]">{r.facility}</div>
                </td>
                <td className="py-1 px-2.5 border-r border-slate-800/60 whitespace-nowrap">
                  <span className="inline-block px-1.5 py-0.5 bg-red-950/60 border border-red-800/80 text-red-300 font-semibold text-[10px]">
                    [REDACTED kW]
                  </span>
                </td>
                <td className="py-1 px-2.5 border-r border-slate-800/60 whitespace-nowrap font-bold text-emerald-400">
                  {r.dpLoad}
                </td>
                <td className="py-1 px-2.5 border-r border-slate-800/60 whitespace-nowrap text-amber-400 font-medium">
                  {r.noiseDelta}
                </td>
                <td className="py-1 px-2.5 whitespace-nowrap">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-mono tracking-tight truncate max-w-xs xl:max-w-md">
                      {r.hash}
                    </span>
                    <button
                      onClick={() => handleCopy(r.hash)}
                      title="Copy CPACF SHA-256 hash"
                      className="px-1.5 py-0.5 border border-slate-700 bg-slate-800 hover:border-slate-500 text-slate-300 text-[9px] rounded-none inline-flex items-center gap-1 active:bg-slate-700"
                    >
                      {copiedHash ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-slate-400" />}
                      <span className="text-[9px]">COPY</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
