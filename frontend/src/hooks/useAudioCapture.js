/**
 * useAudioCapture Hook
 * Captures microphone audio, resamples from device sample rate (e.g., 44.1k/48k)
 * to standard 16,000 Hz 16-bit Mono Little-Endian PCM, and calculates volume level.
 */
import { useState, useRef, useCallback } from 'react';

export function useAudioCapture({ onAudioChunk }) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState(null);

  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const processorRef = useRef(null);
  const animFrameRef = useRef(null);
  const analyserRef = useRef(null);

  const startCapture = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      // Downsample buffer size: 4096 samples
      const bufferSize = 4096;
      const processor = audioCtx.createScriptProcessor(bufferSize, 1, 1);
      processorRef.current = processor;

      const targetSampleRate = 16000;
      const sourceSampleRate = audioCtx.sampleRate;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);

        // Linear interpolation resampling to 16kHz
        const ratio = sourceSampleRate / targetSampleRate;
        const targetLength = Math.round(inputData.length / ratio);
        const resampledData = new Float32Array(targetLength);

        for (let i = 0; i < targetLength; i++) {
          const origIndex = i * ratio;
          const indexFloor = Math.floor(origIndex);
          const indexCeil = Math.min(indexFloor + 1, inputData.length - 1);
          const fraction = origIndex - indexFloor;
          resampledData[i] = inputData[indexFloor] * (1 - fraction) + inputData[indexCeil] * fraction;
        }

        // Convert Float32 [-1.0, 1.0] to 16-bit PCM (signed 16-bit little-endian)
        const pcmBuffer = new ArrayBuffer(resampledData.length * 2);
        const view = new DataView(pcmBuffer);

        for (let i = 0; i < resampledData.length; i++) {
          let s = Math.max(-1, Math.min(1, resampledData[i]));
          view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true); // true = little-endian
        }

        if (onAudioChunk) {
          onAudioChunk(pcmBuffer);
        }
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);

      // Volume meter animation loop
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();

      setIsCapturing(true);
    } catch (err) {
      console.error('Audio capture error:', err);
      setError(err.message || 'Microphone access denied or unavailable');
      setIsCapturing(false);
    }
  }, [onAudioChunk]);

  const stopCapture = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsCapturing(false);
    setAudioLevel(0);
  }, []);

  return {
    isCapturing,
    audioLevel,
    error,
    startCapture,
    stopCapture
  };
}
