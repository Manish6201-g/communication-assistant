import React from 'react';
import { Wifi, WifiOff, RefreshCw, Maximize, Minimize, ShieldCheck, Cpu } from 'lucide-react';

export default function ConnectionStatus({ 
  status, 
  totalLatency, 
  isFullscreen, 
  onToggleFullscreen,
  fontSize,
  onChangeFontSize
}) {
  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span>WS://ONLINE (16kHz PCM)</span>
          </span>
        );
      case 'connecting':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>CONNECTING PROTOCOL...</span>
          </span>
        );
      case 'error':
      case 'disconnected':
      default:
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-rose-950/80 text-rose-400 border border-rose-500/40 shadow-[0_0_15px_-3px_rgba(244,63,94,0.3)]">
            <WifiOff className="w-3.5 h-3.5 text-rose-400" />
            <span>DISCONNECTED (FASTAPI :8000)</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
      {/* Privacy Guarantee Pill */}
      <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 text-cyan-300 border border-cyan-500/20 text-[11px] font-mono shadow-2xs">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        <span>ZERO_STORAGE // EPHEMERAL_STREAM</span>
      </div>

      {/* Real-time Connection State */}
      {getStatusBadge()}

      {/* Text Size Accessibility Controls */}
      <div className="flex items-center bg-slate-900/90 rounded-xl border border-slate-700/60 p-1 shadow-2xs">
        <button
          onClick={() => onChangeFontSize('normal')}
          title="Default Font Size"
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition font-mono ${
            fontSize === 'normal' 
              ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.5)]' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          A
        </button>
        <button
          onClick={() => onChangeFontSize('large')}
          title="Large Font Size for Counter Viewing"
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition font-mono ${
            fontSize === 'large' 
              ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.5)]' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          A+
        </button>
        <button
          onClick={() => onChangeFontSize('huge')}
          title="Extra Large Size for Kiosk Displays"
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition font-mono ${
            fontSize === 'huge' 
              ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.5)]' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          A++
        </button>
      </div>

      {/* Kiosk Fullscreen Mode Toggle */}
      <button
        onClick={onToggleFullscreen}
        title={isFullscreen ? "Exit Kiosk Fullscreen" : "Enter Kiosk Fullscreen Mode"}
        className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-400 border border-slate-700/60 hover:border-cyan-500/50 transition-all shadow-2xs active:scale-95"
      >
        {isFullscreen ? (
          <Minimize className="w-4 h-4 text-cyan-400" />
        ) : (
          <Maximize className="w-4 h-4 text-cyan-400" />
        )}
      </button>
    </div>
  );
}
