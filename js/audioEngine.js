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
   */
  playAudioChunks(chunks, langCode, options = {}) {
    const { onStart, onEnd, onError, rate = 1.0, volume = 1.0 } = options;
    let index = 0;

    const playNext = () => {
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

      let triedDirect = false;

      audio.onplay = () => {
        if (index === 1) {
          this.isPlayingAudio = true;
          onStart?.();
        }
      };

      audio.onended = () => {
        playNext();
      };

      audio.onerror = (err) => {
        if (!triedDirect) {
          triedDirect = true;
          console.info(`Switching to direct TTS for ${langCode}...`);
          audio.src = directGoogleUrl;
          audio.play().catch(() => {
            this.fallbackBrowserSpeak(chunks.slice(index - 1).join(' '), langCode, options);
          });
          return;
        }
        console.warn(`Online audio error for ${langCode}, falling back to browser synthesis:`, err);
        this.fallbackBrowserSpeak(chunks.slice(index - 1).join(' '), langCode, options);
      };

      // Try local proxy if running on web server
      if (window.location.protocol.startsWith('http')) {
        audio.src = localProxyUrl;
      } else {
        triedDirect = true;
        audio.src = directGoogleUrl;
      }

      audio.play().catch((err) => {
        if (!triedDirect) {
          triedDirect = true;
          audio.src = directGoogleUrl;
          audio.play().catch(() => {
            this.fallbackBrowserSpeak(chunks.slice(index - 1).join(' '), langCode, options);
          });
          return;
        }
        this.fallbackBrowserSpeak(chunks.slice(index - 1).join(' '), langCode, options);
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
      // If mic permission blocked or error, visualization uses simulated gentle wave
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
            // Simulated mic wave
            barHeight = 6 + Math.abs(Math.sin(phase + i * 0.4)) * (height - 12);
          }
        } else if (this.isPlayingAudio) {
          barHeight = 5 + Math.abs(Math.sin(phase * 1.5 + i * 0.3)) * (height * 0.7);
        } else {
          // Idle gentle wave
          barHeight = 4 + Math.sin(phase * 0.5 + i * 0.2) * 2;
        }

        const x = i * (barWidth + 3) + 2;
        const y = (height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (this.isRecording) {
          gradient.addColorStop(0, '#8ea66b');
          gradient.addColorStop(1, '#fff9d6');
        } else if (this.isPlayingAudio) {
          gradient.addColorStop(0, '#d8a2a2');
          gradient.addColorStop(1, '#ffdcdc');
        } else {
          gradient.addColorStop(0, '#8ea66b');
          gradient.addColorStop(1, '#d8a2a2');
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
}

export const audioEngine = new AudioEngine();
