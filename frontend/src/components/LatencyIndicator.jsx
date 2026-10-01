import React from 'react';
import { Activity, Clock, Zap, Waves, Languages, CheckCircle2 } from 'lucide-react';

export default function LatencyIndicator({ latency }) {
  const { capture_ms = 0, vad_ms = 0, asr_ms = 0, translation_ms = 0, total_ms = 0 } = latency || {};

  const getTotalBadge = (ms) => {
    if (ms === 0) return { label: 'Sub-500ms Target', color: 'text-stone-600 bg-stone-100 border-stone-200' };
    if (ms <= 500) return { label: 'Optimal (<500ms)', color: 'text-emerald-800 bg-emerald-100 border-emerald-300' };
    if (ms <= 1000) return { label: 'Acceptable', color: 'text-amber-800 bg-amber-100 border-amber-300' };
    return { label: 'High Latency', color: 'text-rose-800 bg-rose-100 border-rose-300' };
  };

  const status = getTotalBadge(total_ms);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-theme-card/80 backdrop-blur-md rounded-2xl border border-theme-sand/70 text-xs shadow-warm">
      <div className="flex items-center gap-2 font-bold text-theme-dark">
        <Activity className="w-4 h-4 text-theme-terracotta" />
        <span className="hidden sm:inline">Telemetry & Latency:</span>
        <span className="sm:hidden">Latency:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-theme-sand/60 text-stone-700 font-mono shadow-2xs">
          <Waves className="w-3.5 h-3.5 text-stone-500" />
          <span className="text-[11px] font-semibold">PCM: {capture_ms}ms</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-theme-sand/60 text-stone-700 font-mono shadow-2xs">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[11px] font-semibold">VAD: {vad_ms}ms</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-theme-sand/60 text-stone-700 font-mono shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-[11px] font-semibold">ASR: {asr_ms}ms</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-theme-sand/60 text-stone-700 font-mono shadow-2xs">
          <Languages className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[11px] font-semibold">NMT: {translation_ms}ms</span>
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono font-bold border shadow-2xs ${status.color}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Total: {total_ms}ms</span>
          <span className="hidden md:inline text-[10px] font-sans font-semibold">({status.label})</span>
        </div>
      </div>
    </div>
  );
}
