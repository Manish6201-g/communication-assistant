/**
 * Audio Engine: Speech-to-Text (STT), Text-to-Speech (TTS), and Audio Visualizer
 * Project: AI-Based Real-Time Multilingual Communication Assistant
 * CGC University Mohali - Department of AI & Data Science
 */

import { SUPPORTED_LANGUAGES } from './languages.js';

class AudioEngine {
  constructor() {
    this.recognition = null;
    this.isRecording = false;
    this.audioContext = null;
    this.analyser = null;
    this.microphoneStream = null;
    this.animationFrameId = null;
    this.currentUtterance = null;
    this.currentAudioElement = null;
    this.voices = [];
    this.isPlayingAudio = false;

    this.initTTS();
    this.initSTT();
  }

  initTTS() {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        this.voices = window.speechSynthesis.getVoices();
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  initSTT() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
  }

  /**
   * Check if Speech Recognition is supported in this browser
   */
  isSTTSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Check if Speech Synthesis is supported
   */
  isTTSSupported() {
    return 'speechSynthesis' in window;
  }

  /**
   * Starts microphone recording and STT
   */
  startListening(langCode, callbacks = {}) {
    const { onResult, onInterim, onStart, onEnd, onError } = callbacks;

    if (!this.isSTTSupported()) {
      onError?.({ error: 'Speech Recognition not supported in this browser. Please use Google Chrome or Microsoft Edge.' });
      return;
    }

    if (this.isRecording) {
      this.stopListening();
    }

    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    const speechLocale = langObj ? langObj.speechCode : 'en-US';

    this.recognition.lang = speechLocale;
    let finalTranscript = '';

    this.recognition.onstart = () => {
      this.isRecording = true;
      this.startAudioVisualization();
      onStart?.();
    };

    this.recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) {
        onInterim?.(interim);
      }

      if (finalTranscript) {
        onResult?.(finalTranscript.trim());
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      this.isRecording = false;
      this.stopAudioVisualization();
      onError?.(event);
    };

    this.recognition.onend = () => {
      this.isRecording = false;
      this.stopAudioVisualization();
      onEnd?.(finalTranscript.trim());
    };

    try {
      this.recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      this.isRecording = false;
      this.stopAudioVisualization();
      onError?.(err);
    }
  }

  /**
   * Stops microphone recording
   */
  stopListening() {
    if (this.recognition && this.isRecording) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn(err);
      }
    }
    this.isRecording = false;
    this.stopAudioVisualization();
  }

  /**
   * Split long text into natural sentence or word chunks for TTS endpoints
   */
  splitTextIntoChunks(text, maxLen = 160) {
    if (!text || text.length <= maxLen) return [text];
    const sentences = text.match(/[^.!?।\n]+[.!?।\n]+|[^.!?।\n]+$/g) || [text];
    const chunks = [];
    let current = '';

    for (const s of sentences) {
      if ((current + ' ' + s).trim().length <= maxLen) {
        current = (current + ' ' + s).trim();
      } else {
        if (current) chunks.push(current);
        if (s.length > maxLen) {
          const words = s.split(/\s+/);
          let wordChunk = '';
          for (const w of words) {
            if ((wordChunk + ' ' + w).trim().length <= maxLen) {
              wordChunk = (wordChunk + ' ' + w).trim();
            } else {
              if (wordChunk) chunks.push(wordChunk);
              wordChunk = w;
            }
          }
          if (wordChunk) chunks.push(wordChunk);
          current = '';
        } else {
          current = s.trim();
        }
      }
    }
    if (current) chunks.push(current);
    return chunks.filter(c => c.length > 0);
  }

  /**
   * Plays sequential audio chunks via native online neural TTS (e.g. for pure Punjabi, Hindi, etc.)
   * Strictly guarantees single audio output so two voices NEVER speak simultaneously.
   */
  playAudioChunks(chunks, langCode, options = {}) {
    const { onStart, onEnd, onError, rate = 1.0, volume = 1.0 } = options;
    let index = 0;
    let isTerminated = false;

    const playNext = () => {
      if (isTerminated) return;
      if (index >= chunks.length) {
        this.isPlayingAudio = false;
        this.currentAudioElement = null;
        onEnd?.();
        return;
      }

      const chunk = chunks[index++];
      const localProxyUrl = `/api/tts?tl=${encodeURIComponent(langCode)}&q=${encodeURIComponent(chunk)}`;
      const directGoogleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(langCode)}&q=${encodeURIComponent(chunk)}`;

      const audio = new Audio();
      audio.referrerPolicy = 'no-referrer';
      audio.playbackRate = Math.min(Math.max(rate, 0.75), 1.3);
      audio.volume = Math.min(Math.max(volume, 0), 1);
      this.currentAudioElement = audio;

      let hasStarted = false;
      let hasFailed = false;

      const triggerFallback = () => {
        if (hasFailed || isTerminated) return;
        hasFailed = true;
        isTerminated = true;

        if (this.currentAudioElement) {
          try {
            this.currentAudioElement.pause();
            this.currentAudioElement.removeAttribute('src');
            this.currentAudioElement.load();
          } catch (e) {}
          this.currentAudioElement = null;
        }

        // Only call browser speak once
        this.fallbackBrowserSpeak(chunks.slice(index - 1).join(' '), langCode, options);
      };

      audio.onplay = () => {
        if (isTerminated) {
          audio.pause();
          return;
        }
        hasStarted = true;
        if (index === 1) {
          this.isPlayingAudio = true;
          onStart?.();
        }
      };

      audio.onended = () => {
        if (isTerminated) return;
        playNext();
      };

      let hasTriedFallback = false;

      audio.onerror = () => {
        if (!hasTriedFallback && !isTerminated) {
          hasTriedFallback = true;
          audio.src = localProxyUrl;
          audio.play().catch(() => triggerFallback());
          return;
        }
        triggerFallback();
      };

      // Direct high-fidelity Google TTS stream with no-referrer
      audio.src = directGoogleUrl;

      audio.play().catch(() => {
        if (!hasStarted && !hasTriedFallback && !isTerminated) {
          hasTriedFallback = true;
          audio.src = localProxyUrl;
          audio.play().catch(() => triggerFallback());
        }
      });
    };

    playNext();
  }

  /**
   * Browser SpeechSynthesis fallback
   */
  fallbackBrowserSpeak(text, langCode, options = {}) {
    const { onStart, onEnd, onError, rate = 1.0, pitch = 1.0, volume = 1.0 } = options;

    if (!this.isTTSSupported() || !text) {
      this.isPlayingAudio = false;
      onError?.(new Error('TTS not supported or empty text'));
      return;
    }

    window.speechSynthesis.cancel();

    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    const ttsLocale = langObj ? langObj.ttsLang : 'en-US';

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = ttsLocale;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    if (this.voices.length > 0) {
      let match = this.voices.find(v => v.lang.toLowerCase() === ttsLocale.toLowerCase()) ||
                  this.voices.find(v => v.lang.toLowerCase().startsWith(langCode.toLowerCase()));

      // For Indian languages without direct voice, try Hindi voice for phonetics
      if (!match && ['pa', 'mr', 'gu', 'te', 'ta', 'bn', 'ur', 'kn', 'ml'].includes(langCode)) {
        match = this.voices.find(v => v.lang.toLowerCase() === 'hi-in' || v.lang.toLowerCase().startsWith('hi')) ||
                this.voices.find(v => v.lang.toLowerCase() === 'en-in');
      }

      if (match) {
        utterance.voice = match;
      }
    }

    utterance.onstart = () => {
      this.isPlayingAudio = true;
      onStart?.();
    };

    utterance.onend = () => {
      this.isPlayingAudio = false;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isPlayingAudio = false;
      console.warn('Browser TTS error:', e);
      onError?.(e);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Text-to-Speech playback through laptop speakers
   * Supports authentic native pronunciation for Punjabi, Hindi, and all Indian regional languages
   */
  speak(text, langCode, options = {}) {
    const { onStart, onEnd, onError, rate = 1.0, pitch = 1.0, volume = 1.0 } = options;

    if (!text || !text.trim()) {
      onError?.(new Error('TTS empty text'));
      return;
    }

    // Stop any currently playing audio/speech
    this.stopSpeaking();

    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    const ttsLocale = langObj ? langObj.ttsLang : 'en-US';

    // Check if the browser actually has a native voice installed for this language
    const hasBrowserVoice = this.voices.some(v =>
      v.lang.toLowerCase() === ttsLocale.toLowerCase() ||
      v.lang.toLowerCase().replace('_', '-').startsWith(langCode.toLowerCase() + '-')
    );

    // Languages that commonly lack OS offline voices (specifically Indian languages like Punjabi)
    // For these, high-fidelity neural audio stream provides authentic native pronunciation!
    const nativeOnlinePreferred = ['pa', 'mr', 'gu', 'te', 'ta', 'bn', 'ur', 'kn', 'ml'];

    if (!hasBrowserVoice || nativeOnlinePreferred.includes(langCode)) {
      const chunks = this.splitTextIntoChunks(text.trim());
      this.playAudioChunks(chunks, langCode, {
        onStart,
        onEnd,
        onError: () => {
          this.fallbackBrowserSpeak(text, langCode, options);
        },
        rate,
        volume
      });
      return;
    }

    this.fallbackBrowserSpeak(text, langCode, options);
  }

  /**
   * Cancel any active audio playback
   */
  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (err) {
        console.warn('Error pausing audio:', err);
      }
      this.currentAudioElement = null;
    }
    this.isPlayingAudio = false;
  }

  /**
   * Play an acoustic audio chime for speaker diagnostic testing
   */
  playTestTone() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Create a warm two-note chord (C5 -> G5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.3); // G5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, now); // E5

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } catch (e) {
      console.warn('Audio diagnostic tone error:', e);
    }
  }

  /**
   * Play high-tech sci-fi audio cues for interactive UI events
   */
  playFeedbackTone(type = 'click') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      const ctx = this.audioContext;
      const now = ctx.currentTime;

      if (type === 'mic-start') {
        // High-tech ascending dual chime (wake up cue)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(440, now);
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        osc2.frequency.setValueAtTime(554.37, now + 0.06);
        osc2.frequency.exponentialRampToValueAtTime(1108.73, now + 0.18);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now + 0.06);
        osc1.stop(now + 0.22);
        osc2.stop(now + 0.22);

      } else if (type === 'mic-stop') {
        // Soft descending release tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.15);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);

      } else if (type === 'translated') {
        // Celestial translation completion chime (F5 -> A5 -> C6)
        const freqs = [698.46, 880, 1046.5];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + idx * 0.06;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.12, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.35);
        });

      } else if (type === 'persona') {
        // Bubbly persona morph tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);

      } else if (type === 'flip') {
        // Smooth swoop tone for 180 flip
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.2);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);

      } else {
        // Subtle click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {
      console.warn('Feedback tone error:', e);
    }
  }

  /**
   * Start Live Audio Visualizer connected to canvas
   */
  async startAudioVisualization() {
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      if (!this.microphoneStream) {
        this.microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const source = this.audioContext.createMediaStreamSource(this.microphoneStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        source.connect(this.analyser);
      }
    } catch (err) {
      console.info('Using simulated visualizer wave:', err.message);
    }
  }

  stopAudioVisualization() {
    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach(track => track.stop());
      this.microphoneStream = null;
    }
  }

  /**
   * Renders real-time audio wave onto any canvas element
   */
  attachCanvasVisualizer(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    let phase = 0;

    const render = () => {
      this.animationFrameId = requestAnimationFrame(render);

      ctx.clearRect(0, 0, width, height);

      let dataArray = null;
      let isLive = false;

      if (this.isRecording && this.analyser) {
        const bufferLength = this.analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);
        isLive = true;
      }

      const bars = 24;
      const barWidth = (width / bars) - 3;

      for (let i = 0; i < bars; i++) {
        let barHeight = 4;

        if (this.isRecording) {
          if (isLive && dataArray) {
            const val = dataArray[i % dataArray.length] / 255;
            barHeight = Math.max(6, val * (height - 8));
          } else {
            barHeight = 6 + Math.abs(Math.sin(phase + i * 0.4)) * (height - 12);
          }
        } else if (this.isPlayingAudio) {
          barHeight = 5 + Math.abs(Math.sin(phase * 1.5 + i * 0.3)) * (height * 0.7);
        } else {
          barHeight = 4 + Math.sin(phase * 0.5 + i * 0.2) * 2;
        }

        const x = i * (barWidth + 3) + 2;
        const y = (height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (this.isRecording) {
          gradient.addColorStop(0, '#aa512f');
          gradient.addColorStop(1, '#f9f3cf');
        } else if (this.isPlayingAudio) {
          gradient.addColorStop(0, '#ddbc89');
          gradient.addColorStop(1, '#ede7cf');
        } else {
          gradient.addColorStop(0, '#aa512f');
          gradient.addColorStop(1, '#ddbc89');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      phase += 0.08;
    };

    render();
  }

  /**
   * Set dynamic state for the 3D Neural AI Orb
   * @param {'idle' | 'listening' | 'translating' | 'speaking'} state
   */
  setOrbState(state) {
    this.orbState = state;
    const statusText = document.getElementById('orb-status-text');
    const orbCard = document.getElementById('neural-orb-card');
    if (statusText) {
      const stateLabels = {
        'idle': '✨ AI Neural Core: Idle (Click to Speak)',
        'listening': '🎙️ Listening to Voice...',
        'translating': '⚡ Neural Computing NMT...',
        'speaking': '🔊 AI Speaking (Native Audio)...'
      };
      statusText.textContent = stateLabels[state] || 'AI Core Ready';
    }
    if (orbCard) {
      orbCard.setAttribute('data-orb-state', state);
    }
  }

  /**
   * Attaches a living, futuristic 3D Neural AI Orb to the given canvas
   */
  attachNeuralOrb(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    this.orbState = 'idle';
    let tick = 0;

    // Particle constellation
    const particles = [];
    const particleCount = 28;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        angle: (i / particleCount) * Math.PI * 2,
        distance: 38 + Math.random() * 22,
        speed: 0.015 + Math.random() * 0.02,
        size: 1.5 + Math.random() * 2.5,
        color: i % 2 === 0 ? '#aa512f' : '#ddbc89'
      });
    }

    const renderOrb = () => {
      requestAnimationFrame(renderOrb);
      ctx.clearRect(0, 0, width, height);

      tick += 0.03;
      const state = this.orbState || (this.isRecording ? 'listening' : (this.isPlayingAudio ? 'speaking' : 'idle'));

      // 1. Outer dynamic glow/pulse
      let baseRadius = 32;
      let pulseSpeed = 1;
      let coreColorStart = '#aa512f';
      let coreColorEnd = '#26160e';
      let auraColor = 'rgba(170, 81, 47, 0.25)';

      if (state === 'listening') {
        pulseSpeed = 2.4;
        baseRadius = 36 + Math.sin(tick * pulseSpeed) * 6;
        coreColorStart = '#aa512f';
        coreColorEnd = '#f9f3cf';
        auraColor = 'rgba(170, 81, 47, 0.45)';
      } else if (state === 'translating') {
        pulseSpeed = 3.5;
        baseRadius = 34 + Math.sin(tick * pulseSpeed) * 4;
        coreColorStart = '#ede7cf';
        coreColorEnd = '#ddbc89';
        auraColor = 'rgba(221, 188, 137, 0.55)';
      } else if (state === 'speaking') {
        pulseSpeed = 2.0;
        baseRadius = 35 + Math.abs(Math.sin(tick * pulseSpeed)) * 7;
        coreColorStart = '#ddbc89';
        coreColorEnd = '#f9f3cf';
        auraColor = 'rgba(249, 243, 207, 0.45)';
      } else {
        baseRadius = 30 + Math.sin(tick * 1.2) * 2.5;
      }

      // Draw Aura
      const auraGradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, baseRadius * 1.6);
      auraGradient.addColorStop(0, auraColor);
      auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // 2. Soundwave / Synapse rings in active states
      if (state === 'listening' || state === 'speaking') {
        const ringCount = 3;
        for (let r = 0; r < ringCount; r++) {
          const ringProgress = (tick * 0.8 + r / ringCount) % 1;
          const ringRadius = baseRadius + ringProgress * 28;
          const ringAlpha = (1 - ringProgress) * 0.6;

          ctx.strokeStyle = state === 'listening' ? `rgba(170, 81, 47, ${ringAlpha})` : `rgba(221, 188, 137, ${ringAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // 3. Rotating Gyroscopic Rings
      const ringAngles = [tick * 1.2, -tick * 0.9, tick * 1.5];
      ringAngles.forEach((angle, idx) => {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.strokeStyle = idx === 0 ? 'rgba(170, 81, 47, 0.45)' : (idx === 1 ? 'rgba(221, 188, 137, 0.4)' : 'rgba(249, 243, 207, 0.35)');
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, baseRadius * 1.25, baseRadius * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // 4. Orbiting Constellation Particles
      particles.forEach(p => {
        const speedMult = state === 'translating' ? 3.5 : (state === 'listening' ? 2.0 : 1.0);
        p.angle += p.speed * speedMult;
        const px = centerX + Math.cos(p.angle) * p.distance;
        const py = centerY + Math.sin(p.angle) * (p.distance * 0.7);

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Subtle synaptic lines connecting to center in translating mode
        if (state === 'translating' && Math.random() > 0.6) {
          ctx.strokeStyle = 'rgba(249, 243, 207, 0.25)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
      });

      // 5. High-Tech Core Sphere with Specular Highlight
      const coreGradient = ctx.createRadialGradient(
        centerX - baseRadius * 0.3,
        centerY - baseRadius * 0.3,
        baseRadius * 0.1,
        centerX,
        centerY,
        baseRadius
      );
      coreGradient.addColorStop(0, '#ffffff');
      coreGradient.addColorStop(0.3, coreColorStart);
      coreGradient.addColorStop(0.85, coreColorEnd);
      coreGradient.addColorStop(1, 'rgba(22, 14, 10, 0.95)');

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Core Outer Rim
      ctx.strokeStyle = state === 'translating' ? '#ede7cf' : '#aa512f';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    renderOrb();
  }
}

export const audioEngine = new AudioEngine();

