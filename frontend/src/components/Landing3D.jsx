import React, { useState, useEffect, useRef } from 'react';

export default function Landing3D({ onOpenTranslator }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'SWITCH_TO_TRANSLATOR') {
        if (onOpenTranslator) onOpenTranslator();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onOpenTranslator]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05070a] select-none">
      {/* 3D WebGL Three.js Kyoto/Cyber Architecture Iframe */}
      <iframe
        ref={iframeRef}
        title="Screen-Based AI Communication Assistant — 3D OS"
        src="./landing.html"
        loading="eager"
        className="w-full h-full border-0 block"
        style={{
          width: '100vw',
          height: '100vh',
          background: '#05070a',
          border: 'none',
          display: 'block'
        }}
        onLoad={() => setIsLoaded(true)}
      />

      {/* Floating Top Shortcut to Full React Translator */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={onOpenTranslator}
          className="px-4 py-2 rounded-full bg-[#00e5ff]/15 hover:bg-[#00e5ff]/25 text-[#00e5ff] border border-[#00e5ff]/40 text-xs font-mono font-bold tracking-wider uppercase transition shadow-lg shadow-cyan-500/20 backdrop-blur-md flex items-center gap-2 hover:scale-[1.03] active:scale-95"
          title="Open Full Enterprise React Translator Studio"
        >
          <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse" />
          <span>⚡ Full React Terminal</span>
        </button>
      </div>
    </div>
  );
}
