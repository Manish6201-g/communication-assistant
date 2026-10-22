import React from 'react';

export default function AudioWaveform({ audioLevel = 0, isActive = false, barsCount = 20 }) {
  // Generate bar heights based on real audio level + sinusoidal wave offsets
  const bars = Array.from({ length: barsCount }, (_, i) => {
    if (!isActive) {
      return 14; // idle flat state
    }
    const centerFactor = 1 - Math.abs((i - barsCount / 2) / (barsCount / 2));
    const noise = Math.sin((i + Date.now() / 200) * 0.8) * 0.2 + 0.8;
    const dynamicHeight = Math.min(100, Math.max(16, (audioLevel / 100) * 90 * centerFactor * noise));
    return dynamicHeight;
  });

  return (
    <div className="flex items-center justify-center gap-1 h-7 px-3 py-1">
      {bars.map((height, i) => (
        <span
          key={i}
          className={`w-[2.5px] rounded-full transition-all duration-75 ${
            isActive && audioLevel > 5
              ? audioLevel > 65
                ? 'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                : 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.5)]'
              : 'bg-white/15'
          }`}
          style={{
            height: `${height}%`,
            transitionDuration: '80ms'
          }}
        />
      ))}
    </div>
  );
}
