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
   * Text-to-Speech playback through laptop speakers
   */
  speak(text, langCode, options = {}) {
    const { onStart, onEnd, onError, rate = 1.0, pitch = 1.0, volume = 1.0 } = options;

    if (!this.isTTSSupported() || !text) {
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

    // Best effort voice match
    if (this.voices.length > 0) {
      const match = this.voices.find(v => v.lang.toLowerCase() === ttsLocale.toLowerCase()) ||
                    this.voices.find(v => v.lang.toLowerCase().startsWith(langCode.toLowerCase()));
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
      console.warn('TTS playback error:', e);
      onError?.(e);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Cancel any active audio playback
   */
  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
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
