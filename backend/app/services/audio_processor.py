"""
Audio Processor Service
Decodes, validates, normalizes, and resamples incoming audio frames.
Standard format: PCM 16-bit Little-Endian, 16000Hz, Mono.
"""
import numpy as np
from typing import Tuple, Optional
from app.config import settings

class AudioProcessor:
    @staticmethod
    def pcm16_to_float32(pcm_bytes: bytes) -> np.ndarray:
        """Converts raw 16-bit signed integer PCM bytes to normalized float32 array [-1.0, 1.0]."""
        if not pcm_bytes:
            return np.empty(0, dtype=np.float32)
        # Ensure byte length is even for int16
        length = len(pcm_bytes) - (len(pcm_bytes) % 2)
        samples = np.frombuffer(pcm_bytes[:length], dtype=np.int16)
        return (samples.astype(np.float32) / 32768.0)

    @staticmethod
    def float32_to_pcm16(float_array: np.ndarray) -> bytes:
        """Converts float32 audio [-1.0, 1.0] back to 16-bit PCM bytes."""
        clipped = np.clip(float_array, -1.0, 1.0)
        int16_samples = (clipped * 32767.0).astype(np.int16)
        return int16_samples.tobytes()

    @staticmethod
    def calculate_rms(audio_samples: np.ndarray) -> float:
        """Computes Root Mean Square (RMS) energy of audio samples."""
        if audio_samples.size == 0:
            return 0.0
        return float(np.sqrt(np.mean(audio_samples ** 2)))

    @staticmethod
    def resample_linear(audio: np.ndarray, orig_sr: int, target_sr: int) -> np.ndarray:
        """Resample audio signal from orig_sr to target_sr using linear interpolation."""
        if orig_sr == target_sr or audio.size == 0:
            return audio
        duration = len(audio) / orig_sr
        target_num_samples = int(duration * target_sr)
        orig_indices = np.linspace(0, len(audio) - 1, len(audio))
        target_indices = np.linspace(0, len(audio) - 1, target_num_samples)
        return np.interp(target_indices, orig_indices, audio).astype(np.float32)

audio_processor = AudioProcessor()
