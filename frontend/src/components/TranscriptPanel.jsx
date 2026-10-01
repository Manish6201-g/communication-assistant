import React, { useRef, useEffect, useState } from 'react';
import { 
  Volume2, 
  VolumeX,
  User, 
  Users, 
  Clock, 
  Sparkles, 
  Copy, 
  Check, 
  Send,
  Zap,
  ArrowRight
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from './LanguageSelector';

export default function TranscriptPanel({
  role, // 'person_a' or 'person_b'
  title,
  subTitle,
  languageCode,
  messages,
  partialTranscript,
  activeSpeaker,
  isListening,
  audioLevel,
  isMirrored,
  fontSize,
  onReplayAudio,
  onSendText,
  quickPhrases = []
}) {
  const scrollRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);
  const [customText, setCustomText] = useState('');
  const [playingId, setPlayingId] = useState(null);

  // Auto-scroll on new message or partial transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, partialTranscript]);

  const getLanguageLabel = (code) => {
    const found = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    return found ? `${found.flag} ${found.name}` : code.toUpperCase();
  };

  const isCurrentSpeaker = activeSpeaker === role;
  const isMicLive = isCurrentSpeaker && isListening;

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReplay = (msg) => {
    setPlayingId(msg.id);
    onReplayAudio(msg);
    setTimeout(() => setPlayingId(null), 3500);
  };

  const handleSendCustomText = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;
    onSendText(customText.trim(), role);
    setCustomText('');
  };

  // Font size classes
  const fontSizes = {
    normal: 'text-base sm:text-lg',
    large: 'text-xl sm:text-2xl',
    huge: 'text-2xl sm:text-3xl'
  };
  const currentFontSize = fontSizes[fontSize] || fontSizes.large;

  return (
    <div
      className={`flex-1 flex flex-col h-[520px] lg:h-[580px] bg-theme-card/95 rounded-3xl shadow-warm border transition-all duration-300 overflow-hidden relative ${
        isMicLive
          ? 'border-theme-terracotta ring-4 ring-theme-terracotta/20 mic-active-glow'
          : 'border-theme-sand/70'
      } ${isMirrored && role === 'person_b' ? 'flip-180' : ''}`}
    >
      {/* Panel Top Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-theme-cream/80 to-theme-ivory/60 border-b border-theme-sand/50">
        <div className="flex items-center gap-3">
          <div 
            className={`p-2.5 rounded-2xl transition-all shadow-sm ${
              isMicLive 
                ? 'bg-theme-terracotta text-white scale-105' 
                : 'bg-theme-surface text-theme-terracotta border border-theme-sand/60'
            }`}
          >
            {role === 'person_a' ? <User className="w-5 h-5" /> : <Users className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base md:text-lg text-theme-dark tracking-tight leading-tight">
                {title}
              </h3>
              {role === 'person_a' ? (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-theme-terracotta/10 text-theme-terracotta border border-theme-terracotta/20">
                  Desk
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                  Client
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-semibold text-stone-700">
                {getLanguageLabel(languageCode)}
              </span>
              <span className="text-[11px] text-stone-400">• {subTitle}</span>
            </div>
          </div>
        </div>

        {/* Live Speaking Indicator */}
        <div className="flex items-center gap-2">
          {isMicLive ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
              <span>Speaking Now</span>
              {/* Dynamic waveform visualizer */}
              <div className="flex items-end gap-0.5 h-3.5 ml-1">
                {[40, 90, 60, 100, 50].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-rose-600 rounded-full animate-voice-wave"
                    style={{ animationDelay: `${i * 0.15}s`, height: `${Math.max(30, (audioLevel / 100) * h)}%` }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <span className="text-xs font-semibold text-stone-400 bg-theme-surface/70 px-2.5 py-1 rounded-full border border-theme-sand/40">
              {isCurrentSpeaker ? 'Mic Ready' : 'Standby'}
            </span>
          )}
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-gradient-to-b from-theme-surface/30 via-white/50 to-theme-cream/20"
      >
        {messages.length === 0 && !partialTranscript && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-400">
            <div className="w-14 h-14 rounded-2xl bg-theme-cream/50 flex items-center justify-center mb-3 border border-theme-sand/50 shadow-sm">
              <Sparkles className="w-7 h-7 text-theme-terracotta" />
            </div>
            <h4 className="text-sm font-bold text-stone-600">Conversation Screen Active</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-xs leading-relaxed">
              When someone speaks in {getLanguageLabel(languageCode)}, accurate translation appears here in real time.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isOrigin = msg.speaker_role === role;
          const displayText = isOrigin ? msg.source_text : msg.translated_text;
          const subText = isOrigin 
            ? `Translated (${msg.target_language.toUpperCase()}): "${msg.translated_text}"` 
            : `Spoken (${msg.source_language.toUpperCase()}): "${msg.source_text}"`;
          const isPlayingThis = playingId === msg.id;

          return (
            <div
              key={msg.id}
              className={`p-5 rounded-2xl border transition-all duration-200 relative group ${
                isOrigin
                  ? 'bg-theme-surface/90 border-theme-sand/80 shadow-sm hover:border-theme-terracotta/40'
                  : 'bg-white border-theme-sand/50 shadow-warm hover:border-theme-sand'
              }`}
            >
              {/* Header Meta */}
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="font-bold flex items-center gap-1.5 text-theme-terracotta tracking-wide uppercase text-[11px]">
                  {isOrigin ? (
                    <>
                      <User className="w-3 h-3" />
                      Original Speech
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3 text-amber-600" />
                      Live Translation
                    </>
                  )}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-400">
                  <Clock className="w-3 h-3" />
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {/* Large Captions Text */}
              <p className={`${currentFontSize} font-bold text-theme-dark leading-relaxed tracking-tight`}>
                {displayText}
              </p>

              {/* Subtitle with Context */}
              <p className="text-xs text-stone-500 mt-2.5 font-medium italic border-l-2 border-theme-sand pl-2.5">
                {subText}
              </p>

              {/* Bottom Card Actions: Replay & Copy & Latency */}
              <div className="mt-3.5 pt-2.5 flex items-center justify-between border-t border-theme-sand/40">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReplay(msg)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 border ${
                      isPlayingThis
                        ? 'bg-theme-terracotta text-white border-theme-terracotta animate-pulse'
                        : 'bg-theme-cream/80 hover:bg-theme-sand text-theme-dark border-theme-sand/70'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-theme-terracotta group-hover:scale-110" />
                    <span>{isPlayingThis ? 'Playing Speech...' : 'Listen'}</span>
                  </button>

                  <button
                    onClick={() => handleCopy(msg.id, displayText)}
                    title="Copy text"
                    className="p-1.5 rounded-xl bg-theme-surface hover:bg-theme-cream text-stone-600 border border-theme-sand/60 transition"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {msg.latency && msg.latency.total_ms > 0 && (
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-theme-surface text-stone-500 border border-theme-sand/40">
                    ⚡ {msg.latency.total_ms}ms
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Partial Live Transcribing Animation */}
        {partialTranscript && partialTranscript.speaker_role === role && (
          <div className="p-4 rounded-2xl bg-theme-cream/40 border-2 border-theme-sand/60 border-dashed animate-pulse">
            <span className="text-xs font-bold text-theme-terracotta uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-theme-terracotta animate-ping"></span>
              Transcribing live audio...
            </span>
            <p className={`${currentFontSize} font-semibold text-stone-700 mt-1 italic leading-relaxed`}>
              "{partialTranscript.source_text}..."
            </p>
          </div>
        )}
      </div>

      {/* Quick Prompts / Counter Starter Phrases */}
      {quickPhrases && quickPhrases.length > 0 && (
        <div className="px-5 py-2.5 bg-theme-surface/70 border-t border-theme-sand/40 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-stone-500 whitespace-nowrap uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            Quick:
          </span>
          <div className="flex items-center gap-1.5">
            {quickPhrases.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => onSendText(phrase, role)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/90 hover:bg-theme-cream border border-theme-sand/60 text-theme-dark font-medium whitespace-nowrap transition active:scale-95 shadow-2xs hover:border-theme-terracotta/40"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fallback Direct Type-to-Translate Input Bar */}
      <form
        onSubmit={handleSendCustomText}
        className="p-3 bg-theme-card border-t border-theme-sand/50 flex items-center gap-2"
      >
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder={`Type message in ${getLanguageLabel(languageCode)}...`}
          className="flex-1 px-3.5 py-2 text-xs md:text-sm bg-theme-surface rounded-xl border border-theme-sand focus:outline-none focus:ring-2 focus:ring-theme-terracotta text-theme-dark font-medium transition"
        />
        <button
          type="submit"
          disabled={!customText.trim()}
          className="p-2.5 rounded-xl bg-theme-terracotta text-white hover:bg-[#8e4225] disabled:opacity-40 transition shadow-sm active:scale-95"
          title="Send and Translate"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
