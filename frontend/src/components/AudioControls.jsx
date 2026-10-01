import React from 'react';
import { 
  Mic, 
  MicOff, 
  Trash2, 
  FlipVertical, 
  User, 
  Users, 
  Volume2, 
  VolumeX,
  Radio,
  Sparkles
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
    <div className="bg-theme-card/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-warm border border-theme-sand/70">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Left: Speaker Selection Tabs */}
        <div className="w-full lg:w-auto flex items-center justify-center p-1.5 bg-theme-surface rounded-2xl border border-theme-sand/70 shadow-inner">
          <button
            onClick={() => onSwitchSpeaker('person_a')}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              activeSpeaker === 'person_a'
                ? 'bg-theme-terracotta text-white shadow-md scale-[1.02]'
                : 'text-stone-600 hover:text-theme-dark hover:bg-theme-cream/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Person A (Desk Agent)</span>
          </button>

          <button
            onClick={() => onSwitchSpeaker('person_b')}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              activeSpeaker === 'person_b'
                ? 'bg-theme-terracotta text-white shadow-md scale-[1.02]'
                : 'text-stone-600 hover:text-theme-dark hover:bg-theme-cream/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Person B (Visitor)</span>
          </button>
        </div>

        {/* Center: Main Mic Controls & Real-Time Audio Level Spectrum */}
        <div className="flex items-center gap-4">
          <button
            onClick={isListening ? onStopListening : onStartListening}
            disabled={disabled}
            className={`group relative flex items-center gap-3 px-7 py-3.5 rounded-2xl font-extrabold text-sm sm:text-base tracking-wide transition-all duration-300 shadow-md active:scale-95 disabled:opacity-50 ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-700 text-white mic-active-glow ring-4 ring-rose-500/20'
                : 'bg-theme-terracotta hover:bg-[#8e4225] text-white hover:shadow-lg'
            }`}
          >
            {isListening ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <MicOff className="w-5 h-5" />
                <span>Stop Listening</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>Start Listening</span>
              </>
            )}
          </button>

          {/* Equalizer Visualizer Spectrum */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-theme-surface rounded-2xl border border-theme-sand/70 h-12">
            <div className="flex items-end gap-1 h-6 w-20 justify-center">
              {[15, 30, 50, 75, 90, 60, 40, 20].map((baseH, idx) => {
                const isActive = isListening && audioLevel > 5;
                const dynamicH = isActive
                  ? Math.min(100, Math.max(15, (audioLevel / 100) * baseH * 1.5))
                  : 12;
                return (
                  <div
                    key={idx}
                    className={`w-1.5 rounded-full transition-all duration-75 ${
                      isActive
                        ? audioLevel > 65
                          ? 'bg-rose-500'
                          : 'bg-theme-terracotta'
                        : 'bg-theme-sand/60'
                    }`}
                    style={{ height: `${dynamicH}%` }}
                  />
                );
              })}
            </div>
            <div className="flex flex-col text-[10px] font-mono font-bold text-stone-500 leading-tight">
              <span>{isListening ? `${audioLevel}%` : 'MUTED'}</span>
              <span className="text-[8px] text-stone-400 font-sans uppercase">
                {isListening ? '16kHz PCM' : 'Idle'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Counter Actions (180° Flip & Clear) */}
        <div className="w-full lg:w-auto flex items-center justify-center lg:justify-end gap-2.5">
          <button
            onClick={onToggleMirrored}
            title="Rotate Person B's panel 180° for flat countertop / face-to-face tablet positioning"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all active:scale-95 shadow-2xs ${
              isMirrored
                ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/30'
                : 'bg-theme-surface hover:bg-theme-cream text-theme-dark border-theme-sand/80'
            }`}
          >
            <FlipVertical className="w-4 h-4 text-theme-terracotta" />
            <span>Face-to-Face 180°</span>
          </button>

          <button
            onClick={onClearConversation}
            title="Clear all conversation messages"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-theme-surface hover:bg-rose-50 text-stone-600 hover:text-rose-700 border border-theme-sand/80 transition-all active:scale-95 shadow-2xs"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>

      </div>
    </div>
  );
}
