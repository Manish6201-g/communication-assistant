# Screen-Based AI Communication Assistant

> **A Real-Time Cross-Language Visual Translation Platform Powered by Multimodal AI & WebSockets on Standard Displays**  
> *Theme: Pure Software Engineering & AI*

---

## 🌟 Overview

The **Screen-Based AI Communication Assistant** eliminates the need for expensive, fragile, and proprietary IoT hardware gadgets at public service desks (airports, railway stations, hospital triage, hotel receptions). By shifting the entire intelligence layer to modern software standards (Web Audio API, client-side VAD, asynchronous WebSockets, streaming neural ASR & NMT), **any standard connected display or tablet becomes an instantaneous bidirectional visual translation portal for ₹0 hardware cost**.

---

## 🚀 Key Features & Upgrades

1. **True Bidirectional Real-Time Translation**
   - **Side A (Visitor / Customer Screen)**:
     - Language Dropdown selector supporting **Hindi, Spanish, French, German, Japanese, Chinese, Tamil, Arabic, Russian**, and more.
     - **Editable Live Textarea**: Type ANY phrase or sentence with sub-second streaming translation feedback as you type.
     - **Continuous Voice Activity Detection (VAD) Mic**: Real-time microphone audio capture with animated audio waveform bars.
     - **Instant Native Speech Synthesis (TTS)**: Listen to native pronunciation aloud.
     - **Live Agent Reply Banner**: Automatically receives and displays translations of replies sent by the agent in the customer's native language.
   - **Side B (Service Agent Screen)**:
     - Real-time live subtitle stream displaying the translated version of whatever the customer says or types.
     - **Audio Playback**: Hear the translation read aloud in fluent English.
     - **Agent Interactive Reply Box**: Agent can type or speak replies in English; the system instantly translates it back to the customer's native language.
     - **Smart Contextual AI Suggested Replies**: Dynamically updates suggested responses based on customer intent (e.g., ticket cancellation, lost luggage, gate direction, medical triage).

2. **Multi-Tier High-Reliability Translation Engine**
   - **Tier 1 (Local API)**: Calls local `/api/translate` powered by `server.py`.
   - **Tier 2 (Open CORS API)**: Fetches real-time translations via MyMemory API.
   - **Tier 3 (Web NMT)**: Connects to Google Translate GTX endpoint.
   - **Tier 4 (Offline Neural Knowledge Base)**: Comprehensive built-in vocabulary and phrase matrix for airport, railway, medical, hotel, and public service queries that works 100% offline without internet.

3. **Countertop Invert Mode (180° Flip)**
   - Allows a flat tablet or monitor resting on a service desk counter to present flipped subtitles right-side-up to the person sitting directly opposite.

4. **13-Slide High-Definition Presentation Deck**
   - Complete architectural slides, hardware vs software efficiency analysis, system layer matrix, and interactive viva defense answers.

---

## 🛠️ How to Run Locally

### Start Local Server
```bash
python3 server.py
```
Or with standard Python HTTP server:
```bash
python3 -m http.server 8000
```

Open your browser at:
```
http://localhost:8000
```

---

## ⌨️ Presentation Keyboard Shortcuts

- `→` / `Space`: Next Slide
- `←`: Previous Slide
- `Esc`: Close Slide Drawer
- `F11`: Toggle Fullscreen Mode
- Top Right Tab: Toggle between **Pitch Deck** and **⚡ Live Assistant Terminal**
