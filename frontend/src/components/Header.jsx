import React from 'react';
import { 
  Languages, 
  FlipVertical, 
  Maximize, 
  Minimize, 
  Activity, 
  Trash2, 
  HelpCircle,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function Header({
  connectionStatus,
  latestLatency,
  isMirrored,
  onToggleMirrored,
  fontSize,
  onChangeFontSize,
  isFullscreen,
  onToggleFullscreen,
  onOpenDiagnostics,
  onClearConversation
}) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
      {/* Brand Identity & Live Status */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-glow-sky flex-shrink-0">
          <Languages className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              CivicEye
            </h1>
            <span className="text-[11px] font-medium text-slate-400 border-l border-white/10 pl-2">
              Live Speech Translation
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`} />
              <span className="text-[11px] font-medium text-slate-400">
                {connectionStatus === 'connected' ? 'Connected' : 'Offline'}
              </span>
            </div>
            {latestLatency?.total_ms > 0 && (
              <span className="text-[11px] font-mono text-sky-400 font-medium">
                • {latestLatency.total_ms}ms
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        
        {/* Face-to-Face 180° Mode Toggle */}
        <button
          onClick={onToggleMirrored}
          title="Invert Visitor Panel 180° for flat countertop tablet or kiosk"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
            isMirrored 
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-glow-sky' 
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
          }`}
        >
          <FlipVertical className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Countertop View (180°)</span>
          <span className="md:hidden">180°</span>
        </button>

        {/* Text Scale Buttons */}
        <div className="flex items-center bg-white/5 rounded-xl border border-white/5 p-0.5">
          <button
            onClick={() => onChangeFontSize('normal')}
            title="Standard Font Size"
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
              fontSize === 'normal' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            A
          </button>
          <button
            onClick={() => onChangeFontSize('large')}
            title="Large Font Size"
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
              fontSize === 'large' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            A+
          </button>
          <button
            onClick={() => onChangeFontSize('huge')}
            title="Extra Large Font Size"
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
              fontSize === 'huge' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            A++
          </button>
        </div>

        {/* Diagnostics & Latency Trigger */}
        <button
          onClick={onOpenDiagnostics}
          title="System Diagnostics & Latency Breakdown"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 text-xs font-medium transition"
        >
          <Activity className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Telemetry</span>
        </button>

        {/* Kiosk Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Kiosk Fullscreen"}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition"
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
        </button>

        {/* Clear Conversation */}
        <button
          onClick={onClearConversation}
          title="Clear Conversation History"
          className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

      </div>
    </header>
  );
}
