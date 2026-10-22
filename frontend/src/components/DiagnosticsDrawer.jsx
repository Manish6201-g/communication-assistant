import React from 'react';
import { X, Activity, Cpu, ShieldCheck, Waves, Clock, Zap, Languages, CheckCircle2 } from 'lucide-react';

export default function DiagnosticsDrawer({
  isOpen,
  onClose,
  latency,
  connectionStatus
}) {
  if (!isOpen) return null;

  const { capture_ms = 0, vad_ms = 0, asr_ms = 0, translation_ms = 0, total_ms = 0 } = latency || {};

  const getLatencyBadge = (ms) => {
    if (ms === 0) return { label: 'Idle / Ready', color: 'text-slate-400 bg-slate-800/80 border-slate-700' };
    if (ms <= 500) return { label: 'Optimal (<500ms)', color: 'text-emerald-300 bg-emerald-950/70 border-emerald-500/40' };
    if (ms <= 1000) return { label: 'Normal (<1s)', color: 'text-amber-300 bg-amber-950/70 border-amber-500/40' };
    return { label: 'Elevated Latency', color: 'text-rose-300 bg-rose-950/70 border-rose-500/40' };
  };

  const status = getLatencyBadge(total_ms);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#0D1322] border-l border-white/10 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-sky-400" />
              <div>
                <h3 className="font-bold text-white text-base">System Telemetry & Health</h3>
                <p className="text-xs text-slate-400 font-mono">Real-time pipeline diagnostics</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Connection Overview Card */}
          <div className="bg-slate-900/90 rounded-xl p-4 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">WebSocket Transport</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
                connectionStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {connectionStatus === 'connected' ? 'ONLINE (ws://8000)' : 'DISCONNECTED'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                <span className="text-slate-500 text-[10px] block">AUDIO SPEC</span>
                <span className="text-slate-200 font-bold">16kHz Mono PCM</span>
              </div>
              <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                <span className="text-slate-500 text-[10px] block">QUEUE LIMIT</span>
                <span className="text-slate-200 font-bold">500 Bounded Frames</span>
              </div>
            </div>
          </div>

          {/* Latency Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-400" />
                Pipeline Latency Breakdown
              </h4>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${status.color}`}>
                {status.label}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-white/5">
                <span className="text-slate-400 flex items-center gap-2">
                  <Waves className="w-3.5 h-3.5 text-slate-400" />
                  PCM Resample & Ingest
                </span>
                <span className="text-white font-bold">{capture_ms} ms</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-white/5">
                <span className="text-slate-400 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  VAD Speech Segmentation
                </span>
                <span className="text-white font-bold">{vad_ms} ms</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-white/5">
                <span className="text-slate-400 flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  Faster-Whisper ASR Inference
                </span>
                <span className="text-white font-bold">{asr_ms} ms</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-white/5">
                <span className="text-slate-400 flex items-center gap-2">
                  <Languages className="w-3.5 h-3.5 text-sky-400" />
                  Neural Machine Translation
                </span>
                <span className="text-white font-bold">{translation_ms} ms</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-sky-500/10 border border-sky-500/30 font-bold text-sky-300">
                <span>Total End-to-End Latency</span>
                <span className="text-base text-white">{total_ms} ms</span>
              </div>
            </div>
          </div>

          {/* Privacy Guarantee */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Privacy & Ephemeral Storage Architecture</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              All raw audio frames and live streaming buffers are processed in volatile memory. No audio recordings or user transcripts are persistently stored on the host filesystem.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-white/10 text-center text-xs text-slate-500 font-mono">
          CivicEye Communication Assistant • v2.0
        </div>
      </div>
    </div>
  );
}
