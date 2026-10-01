import React from 'react';
import { 
  Mic, 
  MicOff, 
  Trash2, 
  FlipVertical, 
  User, 
  Users, 
  Radio, 
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';

export default function AudioControls({
  isListening,
  onStartListening,
  onStopListening,
  activeSpeaker,
  onSwitchSpeaker,
  audioLevel,
  isMirrored,
  onToggleMirrored,
  onClearConversation,
  disabled
}) {
  return (
    <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-5 shadow-cyber-card border border-slate-800">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
        
        {/* Left: Active Channel / Speaker Toggle */}
        <div className="w-full lg:w-auto flex items-center justify-center p-1.5 bg-slate-950/90 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => onSwitchSpeaker('person_a')}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl font-mono font-bold text-xs sm:text-sm transition-all duration-200 ${
              activeSpeaker === 'person_a'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>OPERATOR [CH_A]</span>
          </button>

          <button
            onClick={() => onSwitchSpeaker('person_b')}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl font-mono font-bold text-xs sm:text-sm transition-all duration-200 ${
              activeSpeaker === 'person_b'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-slate-950 font-black shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>VISITOR [CH_B]</span>
          </button>
        </div>

        {/* Center: Real Microphone Audio Waveform & Big Glowing Cyber Mic Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto justify-center">
          
          {/* Main Action Button */}
          <button
            onClick={isListening ? onStopListening : onStartListening}
            disabled={disabled}
            className={`group relative flex items-center gap-3 px-8 py-3.5 rounded-2xl font-mono font-extrabold text-sm sm:text-base tracking-wider transition-all duration-300 shadow-lg active:scale-95 disabled:opacity-40 ${
              isListening
                ? 'bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-[0_0_30px_rgba(244,63,94,0.5)] ring-4 ring-rose-500/20'
                : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 text-slate-950 hover:shadow-neon-cyan'
            }`}
          >
            {isListening ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <MicOff className="w-5 h-5" />
                <span>TERMINATE MIC</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>ENGAGE STREAM</span>
              </>
            )}
          </button>

          {/* Central Real-Time Dynamic Audio Spectrum Visualizer */}
          <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-950/90 rounded-2xl border border-slate-800 h-14 min-w-[180px] shadow-inner">
            <div className="flex items-end gap-1.5 h-8 justify-center flex-1">
              {[15, 35, 60, 85, 100, 75, 45, 25, 55, 90, 65, 30].map((baseH, idx) => {
                const isActive = isListening && audioLevel > 4;
                const dynamicH = isActive
                  ? Math.min(100, Math.max(12, (audioLevel / 100) * baseH * 1.4))
                  : 12;
                return (
                  <div
                    key={idx}
                    className={`w-1 rounded-full transition-all duration-75 ${
                      isActive
                        ? audioLevel > 70
                          ? 'bg-rose-400 shadow-[0_0_8px_#f43f5e]'
                          : 'bg-gradient-to-t from-blue-500 to-cyan-300 shadow-[0_0_8px_#22d3ee]'
                        : 'bg-slate-800'
                    }`}
                    style={{ height: `${dynamicH}%` }}
                  />
                );
              })}
            </div>
            
            <div className="flex flex-col text-[10px] font-mono font-bold leading-tight pl-2 border-l border-slate-800">
              <span className={isListening ? 'text-cyan-400' : 'text-slate-500'}>
                {isListening ? `${audioLevel}% VU` : 'MUTED'}
              </span>
              <span className="text-[8px] text-slate-500 uppercase tracking-tighter">
                {isListening ? '16kHz S16LE' : 'STANDBY'}
              </span>
            </div>
          </div>

        </div>

        {/* Right: Counter Actions (180° Face-to-Face & Clear) */}
        <div className="w-full lg:w-auto flex items-center justify-center lg:justify-end gap-3">
          <button
            onClick={onToggleMirrored}
            title="Rotate Visitor Panel 180° for Flat Tablet / Across Counter View"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-mono text-xs sm:text-sm font-bold border transition-all active:scale-95 shadow-2xs ${
              isMirrored
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-2 ring-cyan-500/20'
                : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <FlipVertical className="w-4 h-4 text-cyan-400" />
            <span>180° COUNTER_FLIP</span>
          </button>

          <button
            onClick={onClearConversation}
            title="Reset conversation stream"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-mono text-xs sm:text-sm font-bold bg-slate-950/80 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 transition-all active:scale-95 shadow-2xs"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">RESET</span>
          </button>
        </div>

      </div>
    </div>
  );
}
