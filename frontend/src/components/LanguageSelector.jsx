import React from 'react';
import { ArrowLeftRight, Sparkles } from 'lucide-react';

export const SUPPORTED_LANGUAGES = [
  { code: 'hi', name: 'Hindi (हिन्दी)', flag: '🇮🇳', region: 'India' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)', flag: '🇮🇳', region: 'India' },
  { code: 'en', name: 'English', flag: '🇬🇧', region: 'Global' },
  { code: 'bn', name: 'Bengali (বাংলা)', flag: '🇮🇳', region: 'India' },
  { code: 'ta', name: 'Tamil (தமிழ்)', flag: '🇮🇳', region: 'India' },
  { code: 'te', name: 'Telugu (తెలుగు)', flag: '🇮🇳', region: 'India' },
  { code: 'mr', name: 'Marathi (मराठी)', flag: '🇮🇳', region: 'India' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)', flag: '🇮🇳', region: 'India' },
  { code: 'ur', name: 'Urdu (اردو)', flag: '🇮🇳', region: 'India' },
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸', region: 'Global' },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷', region: 'Global' },
  { code: 'de', name: 'German (Deutsch)', flag: '🇩🇪', region: 'Global' },
  { code: 'ar', name: 'Arabic (العربية)', flag: '🇸🇦', region: 'Global' },
  { code: 'ja', name: 'Japanese (日本語)', flag: '🇯🇵', region: 'Global' },
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

  return (
    <div className="bg-theme-card/90 backdrop-blur-md rounded-2xl p-4 shadow-counter border border-theme-sand/50">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Person A Language */}
        <div className="flex-1 flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-theme-terracotta flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-theme-terracotta"></span>
            Person A (Counter Operator / Left)
          </label>
          <select
            value={personALang}
            onChange={(e) => setPersonALang(e.target.value)}
            disabled={disabled}
            className="w-full px-3.5 py-2.5 rounded-xl bg-theme-surface border border-theme-sand text-theme-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-theme-terracotta transition cursor-pointer disabled:opacity-60"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={`a-${lang.code}`} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex items-center justify-center self-center pt-2 md:pt-4">
          <button
            onClick={handleSwap}
            disabled={disabled}
            title="Swap Languages"
            className="p-3 rounded-full bg-theme-cream hover:bg-theme-sand text-theme-terracotta transition transform active:scale-95 border border-theme-sand/70 shadow-sm disabled:opacity-50"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* Person B Language */}
        <div className="flex-1 flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-theme-terracotta flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-theme-sand"></span>
            Person B (Citizen / Customer / Right)
          </label>
          <select
            value={personBLang}
            onChange={(e) => setPersonBLang(e.target.value)}
            disabled={disabled}
            className="w-full px-3.5 py-2.5 rounded-xl bg-theme-surface border border-theme-sand text-theme-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-theme-terracotta transition cursor-pointer disabled:opacity-60"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={`b-${lang.code}`} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Domain Vocabulary Enhancer */}
        <div className="w-full md:w-56 flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Service Context
          </label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-theme-surface border border-theme-sand text-theme-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-theme-terracotta transition cursor-pointer"
          >
            <option value="general">Public Counter / General</option>
            <option value="railway">Railway & Transport Desk</option>
            <option value="medical">Healthcare & Medical Clinic</option>
            <option value="public_service">Government / Civic Desk</option>
          </select>
        </div>

      </div>
    </div>
  );
}
