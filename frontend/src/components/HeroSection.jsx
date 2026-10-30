import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Mic, 
  FlipVertical, 
  Activity, 
  ShieldCheck, 
  Languages, 
  Cpu, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';

export default function HeroSection({
  onStartConversation,
  onSwitchToTabletop,
  onOpenTelemetry,
  isListening,
  operatorLangName,
  visitorLangName
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className="w-full flex items-center justify-between px-4 py-2 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 animate-fade-in">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-slate-300">AI Translator — Real-Time Multilingual Assistant</span>
          <span className="text-slate-500">•</span>
          <span>{operatorLangName} ↔ {visitorLangName}</span>
        </div>
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium transition"
        >
          <span>Show Overview</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <section className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#0E1526]/90 via-[#0B101E]/80 to-[#080C15]/90 border border-white/10 shadow-glass p-6 sm:p-8 lg:p-10 transition-all duration-300">
      
      {/* Background Ambient Radial Glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Collapse Toggle Button in Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setIsCollapsed(true)}
          title="Minimize overview section"
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xs font-medium transition border border-white/5"
        >
          <span>Hide</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-5">
        
        {/* Animated Eyebrow Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-semibold shadow-[0_0_15px_rgba(56,189,248,0.2)] animate-pulse-subtle">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>AI Translator • Bridge Beyond Language</span>
          <span className="w-1 h-1 rounded-full bg-sky-400" />
          <span className="text-[11px] text-slate-400 font-mono">CGC University Mohali</span>
        </div>

        {/* Main Hero Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
          AI-Based Real-Time{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-indigo-300 to-cyan-400">
            Multilingual Assistant
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Department of Artificial Intelligence & Data Science • CGC University Mohali.
          Bidirectional speech-to-speech communication assistant with instant neural translation, speech synthesis, and 180° tabletop counter mode.
        </p>

        {/* Interactive Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          
          {/* Primary Action Button */}
          <button
            onClick={onStartConversation}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-bold text-sm shadow-glow-sky transition transform active:scale-95"
          >
            <Mic className="w-4 h-4 text-slate-950" />
            <span>{isListening ? 'Active Listening...' : `Start in ${operatorLangName}`}</span>
            <ArrowRight className="w-4 h-4 text-slate-950 ml-0.5" />
          </button>

          {/* Secondary Action: Countertop Flip View */}
          <button
            onClick={onSwitchToTabletop}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900/90 hover:bg-white/10 text-white font-semibold text-sm border border-white/10 transition active:scale-95"
          >
            <FlipVertical className="w-4 h-4 text-sky-400" />
            <span>Tabletop (180°) Mode</span>
          </button>

          {/* Tertiary Action: Pipeline Telemetry */}
          <button
            onClick={onOpenTelemetry}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/90 hover:bg-white/10 text-slate-300 font-semibold text-sm border border-white/10 transition active:scale-95"
          >
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Diagnostics</span>
          </button>
        </div>

        {/* Value Proposition Metric Chips Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 text-left">
          
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
              <Cpu className="w-3.5 h-3.5" />
              <span>&lt; 500ms Delay</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">Faster-Whisper int8 + NMT</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Languages className="w-3.5 h-3.5" />
              <span>8+ Indic Native</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">Hindi, Punjabi, Tamil & more</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
              <FlipVertical className="w-3.5 h-3.5" />
              <span>180° Tabletop</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">Face-to-face tablet layout</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Storage</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">Ephemeral in-memory audio</p>
          </div>

        </div>

      </div>
    </section>
  );
}
