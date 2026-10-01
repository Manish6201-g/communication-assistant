import React, { useRef, useEffect } from 'react';
import { Volume2, User, Users, Clock, Sparkles } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from './LanguageSelector';

export default function TranscriptPanel({
  role, // 'person_a' or 'person_b'
  title,
  languageCode,
  messages,
  partialTranscript,
  activeSpeaker,
  isMirrored,
  onReplayAudio
}) {
  const scrollRef = useRef(null);

  // Auto scroll to latest speech
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, partialTranscript]);

  const getLanguageLabel = (code) => {
    const found = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    return found ? `${found.flag} ${found.name}` : code.toUpperCase();
  };

  const isCurrentSpeaker = activeSpeaker === role;

  return (
    <div
      className={`flex-1 flex flex-col h-[480px] lg:h-[540px] bg-theme-card rounded-2xl shadow-counter border transition-all duration-300 overflow-hidden ${
        isCurrentSpeaker
          ? 'border-theme-terracotta ring-2 ring-theme-terracotta/20'
          : 'border-theme-sand/60'
      } ${isMirrored && role === 'person_b' ? 'flip-180' : ''}`}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-theme-cream/70 border-b border-theme-sand/40">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${isCurrentSpeaker ? 'bg-theme-terracotta text-white' : 'bg-theme-sand/40 text-theme-dark'}`}>
            {role === 'person_a' ? <User className="w-4 h-4" /> : <Users className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base text-theme-dark leading-tight">{title}</h3>
            <span className="text-xs font-semibold text-stone-600">{getLanguageLabel(languageCode)}</span>
          </div>
        </div>

        {isCurrentSpeaker && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-theme-terracotta text-white animate-pulse">
            Active Mic
          </span>
        )}
      </div>

      {/* Main Captions Stream */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-transparent to-theme-surface/30"
      >
        {messages.length === 0 && !partialTranscript && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
            <Sparkles className="w-8 h-8 mb-2 text-theme-sand/80" />
            <p className="text-sm font-medium">Ready for real-time speech translation</p>
            <p className="text-xs text-stone-400 mt-1">Press "Start Listening" to speak in {getLanguageLabel(languageCode)}</p>
          </div>
        )}

        {messages.map((msg) => {
          // Determine what this panel should display:
          // If this panel is Person A:
          //   - If Person A spoke: show original text
          //   - If Person B spoke: show translated text in Person A's language
          // If this panel is Person B:
          //   - If Person B spoke: show original text
          //   - If Person A spoke: show translated text in Person B's language
          const isOrigin = msg.speaker_role === role;
          const displayText = isOrigin ? msg.source_text : msg.translated_text;
          const subText = isOrigin ? `Translated: "${msg.translated_text}"` : `Original (${msg.source_language}): "${msg.source_text}"`;

          return (
            <div
              key={msg.id}
              className={`p-4 rounded-xl border transition ${
                isOrigin
                  ? 'bg-theme-surface/90 border-theme-sand/70'
                  : 'bg-white border-theme-sand/40 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
                <span className="font-semibold text-theme-terracotta">
                  {isOrigin ? 'Spoken Utterance' : 'Incoming Translation'}
                </span>
                <div className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3" />
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {/* Large, High-Contrast Caption Text */}
              <p className="text-lg md:text-xl font-bold text-theme-dark leading-relaxed">
                {displayText}
              </p>

              {/* Translation Context Subtitle */}
              <p className="text-xs text-stone-500 mt-2 italic font-medium">
                {subText}
              </p>

              {/* Replay TTS Audio Button */}
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-theme-sand/30">
                <button
                  onClick={() => onReplayAudio(msg)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-theme-cream/80 hover:bg-theme-sand/80 text-theme-dark transition active:scale-95 border border-theme-sand/50"
                >
                  <Volume2 className="w-3.5 h-3.5 text-theme-terracotta" />
                  <span>Hear Speech</span>
                </button>

                {msg.latency && msg.latency.total_ms > 0 && (
                  <span className="text-[10px] font-mono text-stone-400">
                    {msg.latency.total_ms}ms
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Partial Live Transcript Streaming */}
        {partialTranscript && partialTranscript.speaker_role === role && (
          <div className="p-4 rounded-xl bg-theme-cream/40 border border-theme-sand/60 border-dashed animate-pulse">
            <span className="text-xs font-bold text-theme-terracotta uppercase tracking-wide">
              Transcribing live...
            </span>
            <p className="text-lg md:text-xl font-medium text-stone-700 mt-1 italic">
              {partialTranscript.source_text}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
