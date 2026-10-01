import React from 'react';
import { Mic, MicOff, Trash2, FlipVertical, User, Users } from 'lucide-react';

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
    <div className="bg-theme-card rounded-2xl p-4 shadow-counter border border-theme-sand/50 flex flex-wrap items-center justify-between gap-4">
      
      {/* Active Speaker Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-theme-surface rounded-xl border border-theme-sand/60">
        <button
          onClick={() => onSwitchSpeaker('person_a')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs md:text-sm transition ${
            activeSpeaker === 'person_a'
              ? 'bg-theme-terracotta text-white shadow-sm'
              : 'text-stone-600 hover:text-theme-dark hover:bg-theme-cream/50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Person A Speaking</span>
        </button>

        <button
          onClick={() => onSwitchSpeaker('person_b')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs md:text-sm transition ${
            activeSpeaker === 'person_b'
              ? 'bg-theme-terracotta text-white shadow-sm'
              : 'text-stone-600 hover:text-theme-dark hover:bg-theme-cream/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Person B Speaking</span>
        </button>
      </div>

      {/* Main Mic Button & Live Volume Indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={isListening ? onStopListening : onStartListening}
          disabled={disabled}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm md:text-base tracking-wide transition shadow-md active:scale-95 disabled:opacity-50 ${
            isListening
              ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
              : 'bg-theme-terracotta hover:bg-[#8e4225] text-white'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5" />
              <span>Stop Listening</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>Start Listening</span>
            </>
          )}
        </button>

        {/* Live Audio Level Visualizer */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-theme-surface rounded-xl border border-theme-sand/60 h-11 min-w-[90px] justify-center">
          <div className="flex items-end gap-1 h-5">
            {[20, 40, 60, 80, 100].map((threshold, idx) => {
              const isActive = isListening && audioLevel >= threshold;
              return (
                <div
                  key={idx}
                  className={`w-1.5 rounded-full transition-all duration-75 ${
                    isActive
                      ? audioLevel > 70
                        ? 'bg-rose-500'
                        : 'bg-theme-terracotta'
                      : 'bg-theme-sand/50'
                  }`}
                  style={{
                    height: isActive ? `${Math.max(25, (audioLevel / 100) * 100)}%` : '20%'
                  }}
                />
              );
            })}
          </div>
          <span className="text-[10px] font-mono font-semibold text-stone-500 ml-1">
            {isListening ? `${audioLevel}%` : 'OFF'}
          </span>
        </div>
      </div>

      {/* Auxiliary Actions: 180 Flip & Clear */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMirrored}
          title="Flip Person B panel 180° for face-to-face counter display"
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
            isMirrored
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-theme-surface hover:bg-theme-cream text-theme-dark border-theme-sand/70'
          }`}
        >
          <FlipVertical className="w-4 h-4 text-theme-terracotta" />
          <span className="hidden sm:inline">Face-to-Face Mode</span>
        </button>

        <button
          onClick={onClearConversation}
          title="Clear Conversation Transcript"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-theme-surface hover:bg-rose-50 text-stone-600 hover:text-rose-700 border border-theme-sand/70 transition"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

    </div>
  );
}
