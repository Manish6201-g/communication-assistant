import React, { useState, useMemo } from 'react';
import { Search, X, Check, Globe, Sparkles } from 'lucide-react';

export const LANGUAGES = [
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', category: 'indic' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳', category: 'indic' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳', category: 'indic' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', category: 'indic' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', category: 'indic' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳', category: 'indic' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳', category: 'indic' },
  { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇮🇳', category: 'indic' },
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧', category: 'global' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸', category: 'global' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', category: 'global' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪', category: 'global' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', category: 'global' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵', category: 'global' },
];

export default function LanguageSelectorModal({
  isOpen,
  onClose,
  selectedCode,
  onSelect,
  title = "Select Language"
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'indic', 'global'

  const filteredLanguages = useMemo(() => {
    return LANGUAGES.filter((lang) => {
      const matchesSearch =
        lang.name.toLowerCase().includes(search.toLowerCase()) ||
        lang.native.toLowerCase().includes(search.toLowerCase()) ||
        lang.code.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || lang.category === filter;
      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#0D1322] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-sky-400" />
            <h3 className="font-semibold text-white text-base">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-white/5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by language or native script..."
              autoFocus
              className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/40 transition"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-lg border border-white/5">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-1 rounded-md text-xs font-medium transition ${
                filter === 'all' ? 'bg-sky-500/20 text-sky-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('indic')}
              className={`flex-1 py-1 rounded-md text-xs font-medium transition flex items-center justify-center gap-1 ${
                filter === 'indic' ? 'bg-sky-500/20 text-sky-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Indian (Indic)</span>
            </button>
            <button
              onClick={() => setFilter('global')}
              className={`flex-1 py-1 rounded-md text-xs font-medium transition ${
                filter === 'global' ? 'bg-sky-500/20 text-sky-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Global
            </button>
          </div>
        </div>

        {/* Language List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredLanguages.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              No languages match "{search}"
            </div>
          ) : (
            filteredLanguages.map((lang) => {
              const isSelected = lang.code === selectedCode;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    onSelect(lang.code);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition group ${
                    isSelected
                      ? 'bg-sky-500/15 border border-sky-500/30 text-white'
                      : 'hover:bg-white/5 text-slate-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl" role="img" aria-label={lang.name}>
                      {lang.flag}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{lang.name}</span>
                        {lang.category === 'indic' && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            Indic
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {lang.native}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
