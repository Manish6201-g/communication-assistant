import React, { useEffect, useRef } from 'react';

export default function VoiceCore({ audioLevel = 0, isListening = false, activeSpeaker = 'person_a' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Base radius + dynamic expansion from real audioLevel
      const normalizedLevel = isListening ? Math.min(100, Math.max(8, audioLevel)) : 6;
      const baseRadius = 38 + (normalizedLevel / 100) * 28;

      phase += isListening ? 0.05 + (normalizedLevel / 100) * 0.08 : 0.02;

      // Outer breathing glow rings
      const ringCount = isListening ? 3 : 2;
      for (let r = ringCount; r >= 1; r--) {
        const ringRadius = baseRadius + r * 14 * (normalizedLevel / 100);
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(10, ringRadius), 0, Math.PI * 2);
        
        const isOperator = activeSpeaker === 'person_a';
        if (isListening) {
          ctx.strokeStyle = isOperator 
            ? `rgba(56, 189, 248, ${0.35 / r})` 
            : `rgba(99, 102, 241, ${0.35 / r})`;
          ctx.lineWidth = 1.5;
        } else {
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.06 / r})`;
          ctx.lineWidth = 1;
        }
        ctx.stroke();
      }

      // Dynamic wave orb with smooth sinusoidal ripples
      ctx.beginPath();
      const points = 36;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const wave = isListening 
          ? Math.sin(angle * 5 + phase) * (normalizedLevel * 0.22) + Math.cos(angle * 3 - phase) * (normalizedLevel * 0.15)
          : Math.sin(angle * 4 + phase) * 2;
        const radius = baseRadius + wave;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      // Core radial gradient fill
      const grad = ctx.createRadialGradient(
        centerX - baseRadius * 0.2, 
        centerY - baseRadius * 0.2, 
        baseRadius * 0.1, 
        centerX, 
        centerY, 
        baseRadius
      );

      if (isListening) {
        if (activeSpeaker === 'person_a') {
          grad.addColorStop(0, '#38BDF8'); // Sky Cyan
          grad.addColorStop(0.6, '#0284C7');
          grad.addColorStop(1, '#0C4A6E');
        } else {
          grad.addColorStop(0, '#818CF8'); // Indigo
          grad.addColorStop(0.6, '#4F46E5');
          grad.addColorStop(1, '#312E81');
        }
      } else {
        grad.addColorStop(0, '#1E293B');
        grad.addColorStop(0.7, '#0F172A');
        grad.addColorStop(1, '#020617');
      }

      ctx.fillStyle = grad;
      ctx.fill();

      // Subtle rim light
      ctx.strokeStyle = isListening 
        ? (activeSpeaker === 'person_a' ? 'rgba(186, 230, 253, 0.8)' : 'rgba(199, 210, 254, 0.8)')
        : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = isListening ? 2 : 1;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [audioLevel, isListening, activeSpeaker]);

  return (
    <div className="relative flex items-center justify-center w-36 h-36 mx-auto select-none pointer-events-none">
      <canvas 
        ref={canvasRef} 
        width={144} 
        height={144} 
        className="w-full h-full"
      />
    </div>
  );
}
