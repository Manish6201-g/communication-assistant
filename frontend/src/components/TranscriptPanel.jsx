import React, { useRef, useEffect, useState } from 'react';
import { 
  Volume2, 
  User, 
  Users, 
  Clock, 
  Sparkles, 
  Copy, 
  Check, 
  Send,
  Zap,
  Radio,
  CornerDownLeft,
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

  // Determine current active state for panel header
  const getPanelStateBadge = () => {
    if (isMicLive) {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>STREAMING AUDIO</span>
        </span>
      );
    }
    if (partialTranscript && partialTranscript.speaker_role === role) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/50 animate-pulse">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>ASR_PROCESSING</span>
        </span>
      );
    }
    if (isCurrentSpeaker) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
          MIC_STANDBY
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-slate-900 text-slate-500 border border-slate-800">
        IDLE
      </span>
    );
  };

  return (
    <div
      className={`flex-1 flex flex-col h-[540px] lg:h-[600px] bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-cyber-card border transition-all duration-300 overflow-hidden relative ${
        isMicLive
          ? 'border-cyan-500/60 ring-4 ring-cyan-500/20 shadow-cyber-card-active'
          : 'border-slate-800 hover:border-slate-700'
      } ${isMirrored && role === 'person_b' ? 'flip-180' : ''}`}
    >
      {/* Panel Futuristic Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div 
            className={`p-2.5 rounded-2xl transition-all shadow-inner ${
              isMicLive 
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105' 
                : 'bg-slate-900 text-cyan-400 border border-slate-800'
            }`}
          >
            {role === 'person_a' ? <User className="w-5 h-5" /> : <Users className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono font-extrabold text-sm sm:text-base text-white tracking-wide">
                {title}
              </h3>
              <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-md bg-slate-800 text-cyan-400 border border-cyan-500/20">
                {subTitle}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-semibold text-slate-300">
                {getLanguageLabel(languageCode)}
              </span>
            </div>
          </div>
        </div>

        {/* Live Audio State Badge */}
        {getPanelStateBadge()}
      </div>

      {/* Main Conversation Captions Stream */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-gradient-to-b from-transparent via-slate-950/30 to-slate-950/60"
      >
        {messages.length === 0 && !partialTranscript && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <div className="w-16 h-16 rounded-3xl bg-slate-950/80 border border-slate-800 flex items-center justify-center mb-3 shadow-inner">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <h4 className="text-sm font-mono font-bold text-slate-300">CHANNEL READY // STREAM ENGAGED</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs font-sans leading-relaxed">
              Utterances spoken in {getLanguageLabel(languageCode)} will be transcribed & translated with sub-second neural latency.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isOrigin = msg.speaker_role === role;
          const displayText = isOrigin ? msg.source_text : msg.translated_text;
          const subText = isOrigin 
            ? `TRANSLATED (${msg.target_language.toUpperCase()}): "${msg.translated_text}"` 
            : `ORIGINAL (${msg.source_language.toUpperCase()}): "${msg.source_text}"`;
          const isPlayingThis = playingId === msg.id;

          return (
            <div
              key={msg.id}
              className={`p-5 rounded-2xl border transition-all duration-200 relative group animate-fade-in ${
                isOrigin
                  ? 'bg-slate-950/90 border-slate-800/90 shadow-sm hover:border-slate-700'
                  : 'bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-cyan-500/30 shadow-[0_0_20px_-5px_rgba(6,182,212,0.15)] hover:border-cyan-500/60'
              }`}
            >
              {/* Header Meta */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono font-bold flex items-center gap-1.5 tracking-wider uppercase text-[11px] text-cyan-400">
                  {isOrigin ? (
                    <>
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-400">INPUT_SPEECH</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-cyan-300 font-extrabold">NEURAL_TRANSLATION</span>
                    </>
                  )}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {/* Large High-Contrast Caption Typography */}
              <p className={`${currentFontSize} font-bold text-white leading-relaxed tracking-normal font-sans`}>
                {displayText}
              </p>

              {/* Translation Context Subtitle */}
              <p className="text-xs text-slate-400 mt-2 font-mono italic border-l-2 border-cyan-500/40 pl-2.5">
                {subText}
              </p>

              {/* Bottom Card Actions: Replay & Copy & Latency */}
              <div className="mt-3.5 pt-2.5 flex items-center justify-between border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReplay(msg)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition shadow-sm active:scale-95 border ${
                      isPlayingThis
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-pulse'
                        : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-slate-700/80 hover:border-cyan-500/50'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isPlayingThis ? 'SYNTHESIZING...' : 'LISTEN'}</span>
                  </button>

                  <button
                    onClick={() => handleCopy(msg.id, displayText)}
                    title="Copy to clipboard"
                    className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {msg.latency && msg.latency.total_ms > 0 && (
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-950 text-cyan-400 border border-cyan-500/20">
                    ⚡ {msg.latency.total_ms}ms
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Real-time Streaming Partial Transcript Card */}
        {partialTranscript && partialTranscript.speaker_role === role && (
          <div className="p-5 rounded-2xl bg-cyan-950/30 border-2 border-cyan-500/40 border-dashed animate-pulse">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              STREAMING LIVE ASR...
            </span>
            <p className={`${currentFontSize} font-semibold text-cyan-100 mt-2 italic font-sans leading-relaxed`}>
              "{partialTranscript.source_text}"
            </p>
          </div>
        )}
      </div>

      {/* Futuristic Context Quick Prompts */}
      {quickPhrases && quickPhrases.length > 0 && (
        <div className="px-5 py-2.5 bg-slate-950/90 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-mono font-bold text-cyan-400 whitespace-nowrap uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            PROMPTS:
          </span>
          <div className="flex items-center gap-1.5">
            {quickPhrases.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => onSendText(phrase, role)}
                className="text-xs font-medium px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white whitespace-nowrap transition active:scale-95 shadow-2xs"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fallback Direct Type-to-Translate Bar */}
      <form
        onSubmit={handleSendCustomText}
        className="p-3 bg-slate-950 border-t border-slate-800/90 flex items-center gap-2"
      >
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder={`Type message in ${getLanguageLabel(languageCode)}...`}
          className="flex-1 px-4 py-2 text-xs md:text-sm bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white font-medium transition placeholder:text-slate-600"
        />
        <button
          type="submit"
          disabled={!customText.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-30 transition shadow-sm active:scale-95"
          title="Send and translate text"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
