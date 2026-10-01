import React from 'react';
import { Activity, Clock, Zap, Waves, Languages } from 'lucide-react';

export default function LatencyIndicator({ latency }) {
  const { capture_ms = 0, vad_ms = 0, asr_ms = 0, translation_ms = 0, total_ms = 0 } = latency || {};

  const getTotalColor = (ms) => {
    if (ms <= 500) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (ms <= 1000) return 'text-amber-700 bg-amber-50 border-amber-300';
    return 'text-rose-700 bg-rose-50 border-rose-300';
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-theme-cream/60 rounded-xl border border-theme-sand/40 text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-theme-dark">
        <Activity className="w-3.5 h-3.5 text-theme-terracotta" />
        <span>Stage Latency Metrics:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/80 border border-theme-sand/40 text-stone-700 font-mono">
          <Waves className="w-3 h-3 text-stone-500" />
          Capture: {capture_ms}ms
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/80 border border-theme-sand/40 text-stone-700 font-mono">
          <Zap className="w-3 h-3 text-amber-500" />
          VAD: {vad_ms}ms
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/80 border border-theme-sand/40 text-stone-700 font-mono">
          <Clock className="w-3 h-3 text-blue-500" />
          ASR: {asr_ms}ms
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/80 border border-theme-sand/40 text-stone-700 font-mono">
          <Languages className="w-3 h-3 text-indigo-500" />
          Translate: {translation_ms}ms
        </span>
        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold border font-mono ${getTotalColor(total_ms)}`}>
          Total: {total_ms}ms
        </span>
      </div>
    </div>
  );
}
