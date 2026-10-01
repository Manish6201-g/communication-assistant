"""
Voice Activity Detection (VAD) & Speech Boundary Segmenter
Fast, zero-latency energy and zero-crossing rate detection with adaptive noise floor.
"""
import numpy as np
import time
from typing import Optional, List, Tuple
from app.config import settings

class VADSegmenter:
    def __init__(self, 
                 sample_rate: int = 16000, 
                 energy_threshold: float = 0.012, 
                 silence_timeout_ms: int = 700,
                 min_speech_duration_ms: int = 350,
                 max_segment_duration_sec: float = 12.0):
        self.sample_rate = sample_rate
        self.energy_threshold = energy_threshold
        self.silence_timeout_ms = silence_timeout_ms
        self.min_speech_duration_ms = min_speech_duration_ms
        self.max_segment_duration_sec = max_segment_duration_sec
        
        # State tracking
        self.is_in_speech: bool = False
        self.current_speech_buffer: List[np.ndarray] = []
        self.last_speech_time: float = 0.0
        self.speech_start_time: float = 0.0
        self.background_energy: float = 0.005

    def reset(self):
        self.is_in_speech = False
        self.current_speech_buffer = []
        self.last_speech_time = 0.0
        self.speech_start_time = 0.0

    def process_frame(self, frame_samples: np.ndarray) -> Tuple[bool, Optional[np.ndarray]]:
        """
        Process a single audio frame (e.g. 20ms - 50ms chunk).
        Returns:
            (is_currently_speaking, completed_segment_if_ready)
        """
        if frame_samples.size == 0:
            return self.is_in_speech, None

        # Energy calculation
        rms = float(np.sqrt(np.mean(frame_samples ** 2)))
        now = time.time()
        
        # Adaptive background noise update
        if not self.is_in_speech and rms < self.energy_threshold:
            self.background_energy = 0.95 * self.background_energy + 0.05 * rms

        effective_threshold = max(self.energy_threshold, self.background_energy * 2.2)
        has_voice = rms > effective_threshold

        completed_segment: Optional[np.ndarray] = None

        if has_voice:
            if not self.is_in_speech:
                self.is_in_speech = True
                self.speech_start_time = now
                self.current_speech_buffer = []
            
            self.last_speech_time = now
            self.current_speech_buffer.append(frame_samples)

            # Check if exceeded maximum allowed utterance duration
            elapsed = now - self.speech_start_time
            if elapsed >= self.max_segment_duration_sec:
                completed_segment = np.concatenate(self.current_speech_buffer)
                self.reset()
                return False, completed_segment

        else:
            if self.is_in_speech:
                # Keep appending trailing silence up to timeout for smoother ASR boundaries
                self.current_speech_buffer.append(frame_samples)
                silence_duration_ms = (now - self.last_speech_time) * 1000.0

                if silence_duration_ms >= self.silence_timeout_ms:
                    speech_duration_ms = (self.last_speech_time - self.speech_start_time) * 1000.0
                    if speech_duration_ms >= self.min_speech_duration_ms and self.current_speech_buffer:
                        completed_segment = np.concatenate(self.current_speech_buffer)
                    self.reset()

        return self.is_in_speech, completed_segment

vad_service = VADSegmenter()
