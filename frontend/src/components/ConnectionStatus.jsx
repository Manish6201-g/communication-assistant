import React from 'react';
import { Wifi, WifiOff, RefreshCw, Maximize, Minimize, Type } from 'lucide-react';

export default function ConnectionStatus({ 
  status, 
  totalLatency, 
  isFullscreen, 
  onToggleFullscreen,
  fontSize,
  onChangeFontSize
}) {
  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Online (16kHz PCM Stream)
          </span>
        );
      case 'connecting':
        return (
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
            Connecting Server...
          </span>
        );
      case 'error':
      case 'disconnected':
      default:
        return (
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs">
            <WifiOff className="w-3.5 h-3.5 text-rose-600" />
            Backend Disconnected
          </span>
        );
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
      {getStatusBadge()}

      {/* Font Size Accessibility Scaler */}
      <div className="flex items-center bg-theme-surface rounded-2xl border border-theme-sand/70 p-1 shadow-2xs">
        <button
          onClick={() => onChangeFontSize('normal')}
          title="Standard Text Size"
          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
            fontSize === 'normal' 
              ? 'bg-theme-terracotta text-white shadow-2xs' 
              : 'text-stone-600 hover:text-theme-dark'
          }`}
        >
          A
        </button>
        <button
          onClick={() => onChangeFontSize('large')}
          title="Large Counter Text"
          className={`px-2.5 py-1 rounded-xl text-sm font-bold transition ${
            fontSize === 'large' 
              ? 'bg-theme-terracotta text-white shadow-2xs' 
              : 'text-stone-600 hover:text-theme-dark'
          }`}
        >
          A+
        </button>
        <button
          onClick={() => onChangeFontSize('huge')}
          title="Extra Large Kiosk Text"
          className={`px-2.5 py-1 rounded-xl text-base font-extrabold transition ${
            fontSize === 'huge' 
              ? 'bg-theme-terracotta text-white shadow-2xs' 
              : 'text-stone-600 hover:text-theme-dark'
          }`}
        >
          A++
        </button>
      </div>

      {/* Kiosk Fullscreen Toggle */}
      <button
        onClick={onToggleFullscreen}
        title={isFullscreen ? "Exit Fullscreen" : "Enter Kiosk Fullscreen Mode"}
        className="p-2 rounded-2xl bg-theme-surface hover:bg-theme-cream text-theme-dark border border-theme-sand/70 transition shadow-2xs active:scale-95"
      >
        {isFullscreen ? (
          <Minimize className="w-4 h-4 text-theme-terracotta" />
        ) : (
          <Maximize className="w-4 h-4 text-theme-terracotta" />
        )}
      </button>
    </div>
  );
}
