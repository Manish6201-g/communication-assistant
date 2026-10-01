# AI-Based Real-Time Multilingual Communication Assistant
**Engineering Clinic Project (2026–27)**  
*School of Engineering & Technology, CGC University Mohali*  
*Department of Artificial Intelligence & Data Science*

---

## 👥 Project Team & Mentors

### Team Members (CSE – Apex BT AIDS)
- **Sanskar Srivastava** – Roll No: `2547172`
- **Piyush Jaiswal** – Roll No: `2547135`
- **Manish** – Roll No: `2547102`
- **Parkeerat Singh** – Roll No: `2547131`

### Project Mentors
- **Ms. Mittali** – Assistant Professor
- **Dr. Inam Haq** – Assistant Professor

---

## 💡 Project Synopsis & Overview
The **AI-Based Real-Time Multilingual Communication Assistant** is a software-only speech-to-speech communication application developed to run entirely on a laptop. By utilizing the laptop's built-in microphone, speakers, and screen interface, it eliminates the need for external IoT modules (ESP32), wearable electronics, or custom hardware prototyping.

### 7-Step Operational Pipeline (Synopsis Section 6.2)
1. **Speech Input**: Built-in laptop microphone captures user speech in real time.
2. **Speech-to-Text (STT)**: Real-time conversion of audio input into text via Web Speech API.
3. **Display Recognized Text**: Instant rendering of recognized words on laptop display.
4. **Neural Machine Translation (NMT)**: Neural translation across 19+ languages (English, Hindi, Punjabi, Spanish, French, German, Japanese, etc.).
5. **Display Translation**: Target-language sentence rendered side-by-side with latency metrics.
6. **Text-to-Speech (TTS)**: Neural acoustic synthesis producing spoken audio in the target language accent.
7. **Audio Output**: Translated audio played through the laptop's built-in speakers.

---

## 🚀 How to Run the Website

### Option 1: Using the Python Server (Recommended)
Run the included zero-dependency server:
```bash
python3 serve.py
```
Open your browser at `http://localhost:3000`.

### Option 2: Using Any Static Web Server
```bash
# Using Python standard module
python3 -m http.server 3000

# Or using Node.js npx
npx serve .
```

> **Note**: For native Speech-to-Text (STT) microphone access, modern browsers require either `http://localhost` or `https://`. Recommended browsers: **Google Chrome** or **Microsoft Edge**.

---

## 🌟 Key Application Features

1. **Interactive Dashboard (Fig. 2 Reproduction)**:
   - "Welcome Back, Piyush" hero banner with feature highlights.
   - Dual-card translation studio with live microphone input and audio playback.
   - Quick action shortcuts (Live Conversation, Translate Studio, Translate Image, Voice Mode).
   - Recent translations table with audio playback and timestamps.
   - "One World Many Voices" interactive language greeting cloud.

2. **Translate Studio (Full 7-Step Pipeline)**:
   - Live visual step indicator highlighting each stage from mic capture to speaker output.
   - Real-time animated canvas waveform visualizer using Web Audio API FFT analysis.
   - Preset demo prompts covering travel, emergencies, academic introductions, and shopping.

3. **Live Two-Way Conversation Mode**:
   - Turn-taking dialogue interface between Speaker A and Speaker B.
   - Hands-free speech-to-speech loop with conversational chat bubbles and transcript logs.

4. **Image / Document OCR Translation (Fig. 2 Quick Action)**:
   - Extract text from signs, hospital boards, transit schedules, and restaurant menus.
   - Instant neural translation and audio synthesis.

5. **History & Transcripts**:
   - Searchable and filterable archive of all translation sessions.
   - Export session logs as **JSON** or formatted **TXT** transcript.

6. **Academic Project Dossier (CGC University Mohali)**:
   - Complete digital copy of the Engineering Clinic Project Synopsis.
   - System Requirements Table 1 and 8-Phase Implementation Plan Table 2.

7. **Audio & System Diagnostics**:
   - Live microphone test with visual input feedback.
   - Dual-frequency harmonic test chime and voice test for laptop speakers.
   - Speech rate and pitch calibration sliders.
