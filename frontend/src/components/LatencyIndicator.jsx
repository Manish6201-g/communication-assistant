import React from 'react';
import { Activity, Clock, Zap, Waves, Languages, ShieldCheck } from 'lucide-react';

export default function LatencyIndicator({ latency }) {
  const { capture_ms = 0, vad_ms = 0, asr_ms = 0, translation_ms = 0, total_ms = 0 } = latency || {};

  const getStatus = (ms) => {
    if (ms === 0) return { label: '<500ms TARGET', color: 'text-slate-400 bg-slate-900 border-slate-700' };
    if (ms <= 500) return { label: 'OPTIMAL (<500ms)', color: 'text-cyan-300 bg-cyan-950/80 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]' };
    if (ms <= 1000) return { label: 'ACCEPTABLE', color: 'text-amber-300 bg-amber-950/80 border-amber-500/50' };
    return { label: 'DEGRADED', color: 'text-rose-300 bg-rose-950/80 border-rose-500/50' };
  };

  const status = getStatus(total_ms);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-cyber-card text-xs">
      <div className="flex items-center gap-2 font-mono font-bold text-cyan-400">
        <Activity className="w-4 h-4 animate-pulse text-cyan-400" />
        <span className="tracking-wider">STAGE_TELEMETRY:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 font-mono text-[11px]">
        {/* PCM Capture */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-300">
          <Waves className="w-3.5 h-3.5 text-cyan-400" />
          <span>CAPTURE: <strong className="text-white">{capture_ms}ms</strong></span>
        </div>

        {/* VAD Boundary */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-300">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>VAD: <strong className="text-white">{vad_ms}ms</strong></span>
        </div>

        {/* ASR Whisper */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>ASR: <strong className="text-white">{asr_ms}ms</strong></span>
        </div>

        {/* Neural NMT */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-300">
          <Languages className="w-3.5 h-3.5 text-indigo-400" />
          <span>NMT: <strong className="text-white">{translation_ms}ms</strong></span>
        </div>

        {/* Total Pipeline */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold border transition-all ${status.color}`}>
          <span>TOTAL: <strong>{total_ms}ms</strong></span>
          <span className="hidden md:inline font-sans text-[10px] uppercase font-bold opacity-80">[{status.label}]</span>
        </div>
      </div>
    </div>
  );
}
