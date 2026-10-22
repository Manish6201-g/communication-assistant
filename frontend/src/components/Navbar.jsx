import React from 'react';
import { 
  Languages, 
  FlipVertical, 
  Maximize, 
  Minimize, 
  Activity, 
  Trash2, 
  LayoutList, 
  Columns, 
  Sparkles,
  Train,
  Stethoscope,
  Building2,
  Landmark
} from 'lucide-react';

export const DOMAINS = [
  { id: 'general', name: 'General Counter', icon: Landmark },
  { id: 'railway', name: 'Railway & Transit', icon: Train },
  { id: 'medical', name: 'Healthcare & Clinic', icon: Stethoscope },
  { id: 'public_service', name: 'Civic Administration', icon: Building2 },
];

export default function Navbar({
  connectionStatus,
  latestLatency,
  viewMode,
  onChangeViewMode,
  domain,
  onChangeDomain,
  fontSize,
  onChangeFontSize,
  isFullscreen,
  onToggleFullscreen,
  onOpenDiagnostics,
  onClearConversation
}) {
  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-white/10">
      
      {/* Brand & Connection State */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-glow-sky flex-shrink-0">
          <Languages className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              CivicEye <span className="text-sky-400 font-bold">Live</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
              Counter Pro
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`} />
              <span className="text-xs font-medium text-slate-400">
                {connectionStatus === 'connected' ? 'Live Stream (16kHz PCM)' : 'Offline'}
              </span>
            </div>
            {latestLatency?.total_ms > 0 && (
              <span className="text-xs font-mono text-sky-400 font-semibold">
                • {latestLatency.total_ms}ms
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Middle: Interactive Layout Switcher */}
      <div className="flex items-center bg-[#0E1524] rounded-2xl p-1 border border-white/10 self-start lg:self-auto">
        <button
          onClick={() => onChangeViewMode('timeline')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            viewMode === 'timeline'
              ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutList className="w-3.5 h-3.5" />
          <span>Timeline</span>
        </button>

        <button
          onClick={() => onChangeViewMode('facetoface')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            viewMode === 'facetoface'
              ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FlipVertical className="w-3.5 h-3.5" />
          <span>Tabletop (180°)</span>
        </button>

        <button
          onClick={() => onChangeViewMode('dual')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            viewMode === 'dual'
              ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Side-by-Side</span>
        </button>
      </div>

      {/* Right: Service Context, Font Zoom, Telemetry & Fullscreen */}
      <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
        
        {/* Domain Vocabulary Selector */}
        <div className="flex items-center gap-1.5 bg-[#0E1524] border border-white/10 rounded-xl px-2.5 py-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
          <select
            value={domain}
            onChange={(e) => onChangeDomain(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1"
          >
            {DOMAINS.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#0E1524] text-white">
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Text Scale Stepper */}
        <div className="flex items-center bg-[#0E1524] rounded-xl border border-white/10 p-0.5">
          <button
            onClick={() => onChangeFontSize('normal')}
            title="Standard Text Size"
            className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
              fontSize === 'normal' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            A
          </button>
          <button
            onClick={() => onChangeFontSize('large')}
            title="Large Text Size"
            className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
              fontSize === 'large' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            A+
          </button>
          <button
            onClick={() => onChangeFontSize('huge')}
            title="Extra Large Kiosk Size"
            className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
              fontSize === 'huge' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            A++
          </button>
        </div>

        {/* Telemetry Trigger */}
        <button
          onClick={onOpenDiagnostics}
          title="Pipeline Telemetry & Latencies"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E1524] hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold transition"
        >
          <Activity className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Telemetry</span>
        </button>

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Kiosk"}
          className="p-2 rounded-xl bg-[#0E1524] hover:bg-white/10 text-slate-300 border border-white/10 transition"
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
        </button>

        {/* Reset Conversation */}
        <button
          onClick={onClearConversation}
          title="Reset conversation transcript"
          className="p-2 rounded-xl bg-[#0E1524] hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/20 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

      </div>
    </header>
  );
}
