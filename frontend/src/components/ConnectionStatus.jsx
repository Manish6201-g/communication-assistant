import React from 'react';
import { Wifi, WifiOff, RefreshCw, Cpu, Server } from 'lucide-react';

export default function ConnectionStatus({ status, totalLatency }) {
  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Backend Active (WebSocket 16kHz)
          </span>
        );
      case 'connecting':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
            Connecting to Server...
          </span>
        );
      case 'error':
      case 'disconnected':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <WifiOff className="w-3 h-3 text-rose-600" />
            Disconnected (FastAPI ws://localhost:8000)
          </span>
        );
    }
  };

  return (
    <div className="flex items-center gap-3">
      {getStatusBadge()}
      {totalLatency > 0 && (
        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-theme-cream/80 text-theme-dark border border-theme-sand/50">
          <Cpu className="w-3 h-3 text-theme-terracotta" />
          {totalLatency}ms Latency
        </span>
      )}
    </div>
  );
}
