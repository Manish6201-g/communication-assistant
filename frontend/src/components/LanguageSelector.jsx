import React from 'react';
import { ArrowLeftRight, Sparkles, Building2, Train, Stethoscope, Landmark, Layers } from 'lucide-react';

export const SUPPORTED_LANGUAGES = [
  { code: 'hi', name: 'Hindi (हिन्दी)', flag: '🇮🇳', region: 'India', native: 'हिन्दी' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)', flag: '🇮🇳', region: 'India', native: 'ਪੰਜਾਬੀ' },
  { code: 'en', name: 'English', flag: '🇬🇧', region: 'Global', native: 'English' },
  { code: 'bn', name: 'Bengali (বাংলা)', flag: '🇮🇳', region: 'India', native: 'বাংলা' },
  { code: 'ta', name: 'Tamil (தமிழ்)', flag: '🇮🇳', region: 'India', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu (తెలుగు)', flag: '🇮🇳', region: 'India', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi (मराठी)', flag: '🇮🇳', region: 'India', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)', flag: '🇮🇳', region: 'India', native: 'ગુજરાતી' },
  { code: 'ur', name: 'Urdu (اردو)', flag: '🇮🇳', region: 'India', native: 'اردو' },
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸', region: 'Global', native: 'Español' },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷', region: 'Global', native: 'Français' },
  { code: 'de', name: 'German (Deutsch)', flag: '🇩🇪', region: 'Global', native: 'Deutsch' },
  { code: 'ar', name: 'Arabic (العربية)', flag: '🇸🇦', region: 'Global', native: 'العربية' },
  { code: 'ja', name: 'Japanese (日本語)', flag: '🇯🇵', region: 'Global', native: '日本語' },
];

export const DOMAINS = [
  { id: 'general', name: 'Civic Counter // Public Desk', icon: Landmark },
  { id: 'railway', name: 'Transit Terminal // Railway Desk', icon: Train },
  { id: 'medical', name: 'Healthcare Clinic // Hospital', icon: Stethoscope },
  { id: 'public_service', name: 'Govt Administration // Citizen Service', icon: Building2 },
];

export default function LanguageSelector({
  personALang,
  setPersonALang,
  personBLang,
  setPersonBLang,
  domain,
  setDomain,
  disabled
}) {
  const handleSwap = () => {
    const temp = personALang;
    setPersonALang(personBLang);
    setPersonBLang(temp);
  };

  const getLanguage = (code) => SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];

  const langA = getLanguage(personALang);
  const langB = getLanguage(personBLang);

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-cyber-card border border-slate-800">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Person A Channel Card */}
        <div className="flex-1 bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
              CHANNEL_01 // DESK OPERATOR
            </span>
            {langA.region === 'India' && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                INDIC_NATIVE
              </span>
            )}
          </div>
          <div className="relative">
            <select
              value={personALang}
              onChange={(e) => setPersonALang(e.target.value)}
              disabled={disabled}
              className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white font-bold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition cursor-pointer disabled:opacity-50"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={`a-${lang.code}`} value={lang.code} className="bg-slate-900 text-white">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button with Neon Glow */}
        <div className="flex items-center justify-center self-center my-[-2px] lg:my-0">
          <button
            onClick={handleSwap}
            disabled={disabled}
            title="Swap Inbound/Outbound Languages"
            className="p-3.5 rounded-2xl bg-slate-800/90 hover:bg-cyan-500/20 text-cyan-400 border border-slate-700 hover:border-cyan-400 transition-all transform active:scale-90 hover:rotate-180 duration-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-neon-cyan disabled:opacity-40"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
        </div>

        {/* Person B Channel Card */}
        <div className="flex-1 bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 hover:border-blue-500/30 transition-all flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold tracking-wider text-blue-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]"></span>
              CHANNEL_02 // CITIZEN / VISITOR
            </span>
            {langB.region === 'India' && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-500/40">
                INDIC_NATIVE
              </span>
            )}
          </div>
          <div className="relative">
            <select
              value={personBLang}
              onChange={(e) => setPersonBLang(e.target.value)}
              disabled={disabled}
              className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white font-bold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition cursor-pointer disabled:opacity-50"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={`b-${lang.code}`} value={lang.code} className="bg-slate-900 text-white">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Context / Domain Vocabulary Module */}
        <div className="w-full lg:w-80 bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              DOMAIN_LEXICON_CONTEXT
            </span>
          </div>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-cyan-300 font-mono font-semibold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition cursor-pointer"
          >
            {DOMAINS.map((d) => (
              <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                {d.name}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
}
