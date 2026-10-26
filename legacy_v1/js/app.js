/**
 * AI-Based Real-Time Multilingual Communication Assistant
 * Main Application Logic & Reactive Controller
 * CGC University Mohali - Department of AI & Data Science
 */

import { SUPPORTED_LANGUAGES, SAMPLE_PROMPTS, PRONUNCIATION_GUIDE, SCENARIOS, PERSONAS } from './languages.js';
import { translationEngine } from './translationEngine.js';
import { audioEngine } from './audioEngine.js';

class App {
  constructor() {
    this.currentTab = 'dashboard';
    this.currentPersona = 'natural';
    this.speechRate = 1.0;
    this.speechPitch = 1.0;
    this.autoplayAudio = true;
    this.history = [];
    this.conversation = [];

    this.init();
  }

  init() {
    this.loadState();
    this.setupNavigation();
    this.populateLanguageDropdowns();
    this.setupDashboard();
    this.setupTranslateStudio();
    this.setupLiveConversation();
    this.setupImageOCR();
    this.setupHistory();
    this.setupSettings();
    this.setupTheme();
    this.renderRecentTranslations();

    // Attach real-time canvas visualizer
    const canvas = document.getElementById('waveform-canvas');
    if (canvas) {
      audioEngine.attachCanvasVisualizer(canvas);
    }

    // Attach 3D Neural AI Holographic Orb
    const orbCanvas = document.getElementById('neural-orb-canvas');
    if (orbCanvas) {
      audioEngine.attachNeuralOrb(orbCanvas);
    }
  }

  loadState() {
    try {
      const savedHistory = localStorage.getItem('cgc_ai_history');
      if (savedHistory) {
        this.history = JSON.parse(savedHistory);
      } else {
        // Initial demonstration data matching Fig. 2 Expected Outcomes
        this.history = [
          {
            id: 'demo-1',
            sourceText: 'Where is the bus stop?',
            sourceLang: 'en',
            targetText: '¿Dónde está la parada de autobús?',
            targetLang: 'es',
            time: '2 min ago',
            date: new Date(Date.now() - 120000).toISOString()
          },
          {
            id: 'demo-2',
            sourceText: 'Thank you very much',
            sourceLang: 'en',
            targetText: 'आपका बहुत-बहुत धन्यवाद',
            targetLang: 'hi',
            time: '15 min ago',
            date: new Date(Date.now() - 900000).toISOString()
          },
          {
            id: 'demo-3',
            sourceText: 'Good morning',
            sourceLang: 'en',
            targetText: 'おはようございます',
            targetLang: 'ja',
            time: '1 hour ago',
            date: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'demo-4',
            sourceText: 'What is the weather today?',
            sourceLang: 'en',
            targetText: 'Wie ist das Wetter heute?',
            targetLang: 'de',
            time: '3 hours ago',
            date: new Date(Date.now() - 10800000).toISOString()
          }
        ];
        this.saveHistory();
      }

      const savedTheme = localStorage.getItem('cgc_ai_theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }

  saveHistory() {
    try {
      localStorage.setItem('cgc_ai_history', JSON.stringify(this.history));
    } catch (e) {
      console.warn('Failed to persist history:', e);
    }
  }

  /* =========================================================================
     NAVIGATION & TABS
     ========================================================================= */
  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pageTitle = document.getElementById('page-title');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = link.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Quick action clicks on Dashboard
    document.querySelectorAll('.quick-action-card').forEach(card => {
      card.addEventListener('click', () => {
        const action = card.getAttribute('data-action');
        if (action === 'voice-mode') {
          this.switchTab('translate');
          // Automatically trigger microphone in translate studio
          setTimeout(() => {
            document.getElementById('studio-mic-btn')?.click();
          }, 400);
        } else {
          this.switchTab(action);
        }
      });
    });

    // "View All" link on Dashboard recent translations
    document.getElementById('view-all-history-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchTab('history');
    });
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(l => {
      if (l.getAttribute('data-tab') === tabId) {
        l.classList.add('active');
      } else {
        l.classList.remove('active');
      }
    });

    // Hide all tab views and show target
    document.querySelectorAll('.tab-view').forEach(view => {
      view.style.display = 'none';
      view.classList.remove('active');
    });

    const targetEl = document.getElementById(`tab-${tabId}`);
    if (targetEl) {
      targetEl.style.display = 'block';
      targetEl.classList.add('active');
    }

    // Update Topbar Title
    const titleMap = {
      'dashboard': 'Dashboard',
      'translate': 'Translate Studio (7-Step Pipeline)',
      'conversation': 'Live Two-Way Conversation',
      'image-ocr': 'Image & Document Translation (OCR)',
      'history': 'History & Transcripts',
      'academic': 'Engineering Clinic Project Synopsis (CGC Mohali)',
      'settings': 'Audio & System Diagnostics'
    };
    const titleEl = document.getElementById('page-title');
    if (titleEl) {
      titleEl.textContent = titleMap[tabId] || 'AI Translator';
    }

    if (tabId === 'history') {
      this.renderFullHistory();
    }
  }

  /* =========================================================================
     LANGUAGE SELECTORS POPULATION
     ========================================================================= */
  populateLanguageDropdowns() {
    const dropdownIds = [
      'dash-source-lang', 'dash-target-lang',
      'studio-source-lang', 'studio-target-lang',
      'conv-lang-a', 'conv-lang-b'
    ];

    dropdownIds.forEach(id => {
      const select = document.getElementById(id);
      if (!select) return;
      select.innerHTML = '';

      SUPPORTED_LANGUAGES.forEach(lang => {
        const opt = document.createElement('option');
        opt.value = lang.code;
        opt.textContent = `${lang.flag} ${lang.name} (${lang.native})`;
        select.appendChild(opt);
      });
    });

    // Set defaults
    this.setSelectValue('dash-source-lang', 'en');
    this.setSelectValue('dash-target-lang', 'es');
    this.setSelectValue('studio-source-lang', 'en');
    this.setSelectValue('studio-target-lang', 'hi');
    this.setSelectValue('conv-lang-a', 'en');
    this.setSelectValue('conv-lang-b', 'hi');
  }

  setSelectValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }

  /* =========================================================================
     DASHBOARD CONTROLLER (Fig. 2 Reproduction)
     ========================================================================= */
  setupDashboard() {
    const sourceText = document.getElementById('dash-source-text');
    const targetText = document.getElementById('dash-target-text');
    const charCount = document.getElementById('dash-char-count');
    const translateBtn = document.getElementById('dash-translate-btn');
    const micBtn = document.getElementById('dash-mic-btn');
    const speakSourceBtn = document.getElementById('dash-speak-source');
    const speakTargetBtn = document.getElementById('dash-speak-target');
    const clearBtn = document.getElementById('dash-clear-source');
    const copyBtn = document.getElementById('dash-copy-target');
    const swapBtn = document.getElementById('dash-swap-btn');
    const latencyEl = document.getElementById('system-latency');
    const engineBadge = document.getElementById('dash-translation-engine-badge');
    const neuralOrbCard = document.getElementById('neural-orb-card');
    const pronunBox = document.getElementById('dash-pronunciation-box');
    const phoneticTextEl = document.getElementById('dash-phonetic-text');
    const phoneticCopyBtn = document.getElementById('dash-phonetic-copy');

    // Helper: Determine phonetic pronunciation
    const updatePronunciation = (translatedText, toLang) => {
      if (!pronunBox || !phoneticTextEl) return;
      const clean = (translatedText || '').trim();
      let phonetic = PRONUNCIATION_GUIDE[clean];

      // Auto-detect common phrases or Punjabi/Hindi key patterns
      if (!phonetic) {
        if (clean.includes('ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ') || clean.includes('Sat Sri')) {
          phonetic = 'Sat Sri Akaal! (True is the Timeless Creator)';
        } else if (clean.includes('ਧੰਨਵਾਦ') || clean.includes('ਧੰਨਵਾਦ!')) {
          phonetic = 'Dhanvaad! (Thank you very much)';
        } else if (clean.includes('ਕਿਵੇਂ ਹੋ')) {
          phonetic = 'Kiven ho? (How are you doing?)';
        } else if (clean.includes('नमस्ते')) {
          phonetic = 'Namaste! (Respectful Greetings)';
        } else if (clean.includes('धन्यवाद')) {
          phonetic = 'Dhanyavaad! (Thank you)';
        }
      }

      if (phonetic) {
        phoneticTextEl.textContent = phonetic;
        pronunBox.style.display = 'flex';
      } else {
        pronunBox.style.display = 'none';
      }
    };

    // Copy Phonetic Pronunciation
    phoneticCopyBtn?.addEventListener('click', async () => {
      if (phoneticTextEl && phoneticTextEl.textContent) {
        await navigator.clipboard.writeText(phoneticTextEl.textContent);
        audioEngine.playFeedbackTone('click');
        phoneticCopyBtn.innerHTML = '✓';
        setTimeout(() => {
          phoneticCopyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>`;
        }, 1200);
      }
    });

    // Character counter
    sourceText?.addEventListener('input', () => {
      const len = sourceText.value.length;
      if (charCount) charCount.textContent = `${len} / 500`;
    });

    // Translate Action
    const doTranslate = async () => {
      const text = sourceText?.value?.trim();
      if (!text) return;

      const fromLang = document.getElementById('dash-source-lang')?.value || 'en';
      const toLang = document.getElementById('dash-target-lang')?.value || 'es';

      audioEngine.setOrbState('translating');
      if (targetText) targetText.textContent = 'Translating via Neural NMT...';
      if (engineBadge) engineBadge.textContent = 'Processing...';

      const result = await translationEngine.translate(text, fromLang, toLang, this.currentPersona);

      if (targetText) targetText.textContent = result.translatedText;
      if (latencyEl) latencyEl.textContent = `${result.latencyMs}ms`;
      if (engineBadge) engineBadge.textContent = `${result.provider}`;

      // Update Phonetic Pronunciation
      updatePronunciation(result.translatedText, toLang);

      // Play celestial completion chime
      audioEngine.playFeedbackTone('translated');

      // Save to history
      this.addHistoryRecord(text, fromLang, result.translatedText, toLang);

      // Audio playback with Orb state reactive tracking
      if (this.autoplayAudio && result.translatedText) {
        audioEngine.setOrbState('speaking');
        audioEngine.speak(result.translatedText, toLang, {
          rate: this.speechRate,
          pitch: this.speechPitch,
          onStart: () => {
            audioEngine.setOrbState('speaking');
          },
          onEnd: () => {
            audioEngine.setOrbState('idle');
          },
          onError: () => {
            audioEngine.setOrbState('idle');
          }
        });
      } else {
        setTimeout(() => audioEngine.setOrbState('idle'), 800);
      }
    };

    translateBtn?.addEventListener('click', () => {
      audioEngine.playFeedbackTone('click');
      doTranslate();
    });

    // Enter key inside textarea
    sourceText?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        doTranslate();
      }
    });

    // Microphone STT Trigger
    const toggleDashboardSTT = () => {
      if (audioEngine.isRecording) {
        audioEngine.playFeedbackTone('mic-stop');
        audioEngine.stopListening();
        micBtn?.classList.remove('recording-pulse');
        audioEngine.setOrbState('idle');
        return;
      }

      audioEngine.playFeedbackTone('mic-start');
      audioEngine.setOrbState('listening');

      const fromLang = document.getElementById('dash-source-lang')?.value || 'en';
      micBtn?.classList.add('recording-pulse');

      audioEngine.startListening(fromLang, {
        onStart: () => {
          audioEngine.setOrbState('listening');
          if (sourceText) sourceText.placeholder = 'Listening to laptop microphone... speak now!';
        },
        onInterim: (interim) => {
          if (sourceText) sourceText.value = interim;
        },
        onResult: (finalText) => {
          if (sourceText) {
            sourceText.value = finalText;
            const len = finalText.length;
            if (charCount) charCount.textContent = `${len} / 500`;
          }
        },
        onEnd: (finalText) => {
          micBtn?.classList.remove('recording-pulse');
          if (sourceText) sourceText.placeholder = 'Type or click microphone to speak...';
          if (finalText) {
            doTranslate();
          } else {
            audioEngine.setOrbState('idle');
          }
        },
        onError: (err) => {
          micBtn?.classList.remove('recording-pulse');
          audioEngine.setOrbState('idle');
          console.warn('STT Error:', err);
        }
      });
    };

    micBtn?.addEventListener('click', toggleDashboardSTT);

    // Interactive Neural AI Orb Card Click to Speak
    neuralOrbCard?.addEventListener('click', () => {
      toggleDashboardSTT();
    });

    // AI Tone / Persona Bar
    document.querySelectorAll('.persona-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.persona-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.currentPersona = pill.getAttribute('data-persona');
        audioEngine.playFeedbackTone('persona');

        // If user already typed something, instantly re-translate with new flavor
        const text = sourceText?.value?.trim();
        if (text) {
          doTranslate();
        }
      });
    });

    // Populate Interactive Real-World Scenarios Grid
    const scenarioContainer = document.getElementById('scenario-cards-container');
    if (scenarioContainer) {
      scenarioContainer.innerHTML = SCENARIOS.map(s => `
        <div class="scenario-card" data-scenario-id="${s.id}" title="Click to test ${s.title}">
          <div class="scenario-header">
            <span class="scenario-icon">${s.icon}</span>
            <div>
              <div class="scenario-title">${s.title}</div>
              <div class="scenario-desc">${s.desc}</div>
            </div>
          </div>
          <span class="scenario-tag">${s.sourceLang.toUpperCase()} → ${s.targetLang.toUpperCase()}</span>
        </div>
      `).join('');

      scenarioContainer.querySelectorAll('.scenario-card').forEach(card => {
        card.addEventListener('click', () => {
          const id = card.getAttribute('data-scenario-id');
          const s = SCENARIOS.find(x => x.id === id);
          if (!s) return;

          audioEngine.playFeedbackTone('persona');
          this.setSelectValue('dash-source-lang', s.sourceLang);
          this.setSelectValue('dash-target-lang', s.targetLang);

          if (sourceText) {
            sourceText.value = s.prompt;
            if (charCount) charCount.textContent = `${s.prompt.length} / 500`;
          }

          doTranslate();
        });
      });
    }

    // Speak Source Audio
    speakSourceBtn?.addEventListener('click', () => {
      const text = sourceText?.value?.trim();
      const fromLang = document.getElementById('dash-source-lang')?.value || 'en';
      if (text) {
        audioEngine.speak(text, fromLang, { rate: this.speechRate, pitch: this.speechPitch });
      }
    });

    // Speak Target Audio
    speakTargetBtn?.addEventListener('click', () => {
      const text = targetText?.textContent?.trim();
      const toLang = document.getElementById('dash-target-lang')?.value || 'es';
      if (text && !text.includes('Translating') && !text.includes('appear here')) {
        audioEngine.setOrbState('speaking');
        audioEngine.speak(text, toLang, {
          rate: this.speechRate,
          pitch: this.speechPitch,
          onEnd: () => audioEngine.setOrbState('idle'),
          onError: () => audioEngine.setOrbState('idle')
        });
      }
    });

    // Clear
    clearBtn?.addEventListener('click', () => {
      audioEngine.playFeedbackTone('click');
      if (sourceText) sourceText.value = '';
      if (targetText) targetText.textContent = 'Translated text will appear here...';
      if (charCount) charCount.textContent = '0 / 500';
      if (pronunBox) pronunBox.style.display = 'none';
      audioEngine.setOrbState('idle');
    });

    // Copy Target
    copyBtn?.addEventListener('click', async () => {
      const text = targetText?.textContent?.trim();
      if (text && !text.includes('Translating') && !text.includes('appear here')) {
        await navigator.clipboard.writeText(text);
        audioEngine.playFeedbackTone('click');
        copyBtn.innerHTML = '✓';
        setTimeout(() => {
          copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>`;
        }, 1200);
      }
    });

    // Swap Languages
    swapBtn?.addEventListener('click', () => {
      audioEngine.playFeedbackTone('click');
      const srcEl = document.getElementById('dash-source-lang');
      const tgtEl = document.getElementById('dash-target-lang');
      if (srcEl && tgtEl) {
        const temp = srcEl.value;
        srcEl.value = tgtEl.value;
        tgtEl.value = temp;

        const currentTarget = targetText?.textContent?.trim();
        if (currentTarget && !currentTarget.includes('Translating') && !currentTarget.includes('appear here')) {
          if (sourceText) sourceText.value = currentTarget;
          doTranslate();
        }
      }
    });

    // "One World Many Voices" Greeting Chips
    document.querySelectorAll('.greeting-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.getAttribute('data-text');
        const lang = chip.getAttribute('data-lang');
        audioEngine.speak(text, lang, { rate: this.speechRate, pitch: this.speechPitch });
        chip.style.transform = 'scale(0.95)';
        setTimeout(() => chip.style.transform = '', 150);
      });
    });
  }

  /* =========================================================================
     TRANSLATE STUDIO (7-Step Pipeline)
     ========================================================================= */
  setupTranslateStudio() {
    const sourceText = document.getElementById('studio-source-text');
    const targetText = document.getElementById('studio-target-text');
    const micBtn = document.getElementById('studio-mic-btn');
    const micText = document.getElementById('studio-mic-text');
    const translateActionBtn = document.getElementById('studio-translate-action-btn');
    const speakSourceBtn = document.getElementById('studio-speak-source-btn');
    const speakTargetBtn = document.getElementById('studio-speak-target-btn');
    const clearBtn = document.getElementById('studio-clear-btn');
    const copyBtn = document.getElementById('studio-copy-btn');
    const visualizerStatus = document.getElementById('visualizer-status');

    // Populate Sample Test Prompts
    const promptsContainer = document.getElementById('sample-prompts-container');
    if (promptsContainer) {
      promptsContainer.innerHTML = '';
      SAMPLE_PROMPTS.forEach(prompt => {
        const btn = document.createElement('button');
        btn.className = 'btn-secondary';
        btn.style.fontSize = '0.78rem';
        btn.style.padding = '0.4rem 0.75rem';
        btn.innerHTML = `<span style="color: var(--accent-cyan);">[${prompt.category}]</span> ${prompt.text}`;
        btn.addEventListener('click', () => {
          if (sourceText) sourceText.value = prompt.text;
          executeStudioTranslation();
        });
        promptsContainer.appendChild(btn);
      });
    }

    // Pipeline Step Highlighting
    const updatePipeline = (stepNumber) => {
      for (let i = 1; i <= 7; i++) {
        const stepEl = document.getElementById(`pipe-step-${i}`);
        if (!stepEl) continue;
        stepEl.classList.remove('active', 'completed');
        if (i < stepNumber) {
          stepEl.classList.add('completed');
        } else if (i === stepNumber) {
          stepEl.classList.add('active');
        }
      }
    };

    const executeStudioTranslation = async () => {
      const text = sourceText?.value?.trim();
      if (!text) return;

      const fromLang = document.getElementById('studio-source-lang')?.value || 'en';
      const toLang = document.getElementById('studio-target-lang')?.value || 'hi';

      // Step 3: Display Recognized Text
      updatePipeline(3);
      if (targetText) targetText.innerHTML = '<div style="color: var(--text-muted); font-style: italic;">Step 4: Neural Translation in progress...</div>';

      // Step 4: Neural Translation
      updatePipeline(4);
      const result = await translationEngine.translate(text, fromLang, toLang, this.currentPersona);

      // Step 5: Display Translation
      updatePipeline(5);
      if (targetText) {
        targetText.innerHTML = `
          <div style="font-size: 1.15rem; font-weight: 600; color: var(--ch-sand); margin-bottom: 0.5rem;">${result.translatedText}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; gap: 0.75rem;">
            <span>Engine: <b style="color: var(--accent-emerald);">${result.provider}</b></span>
            <span>Latency: <b style="color: var(--accent-cyan);">${result.latencyMs}ms</b></span>
          </div>
        `;
      }

      this.addHistoryRecord(text, fromLang, result.translatedText, toLang);

      // Step 6 & 7: TTS and Audio Playback
      if (this.autoplayAudio && result.translatedText) {
        updatePipeline(6);
        if (visualizerStatus) visualizerStatus.textContent = 'Audio Output: Laptop Speakers Playing TTS';

        audioEngine.speak(result.translatedText, toLang, {
          rate: this.speechRate,
          pitch: this.speechPitch,
          onStart: () => {
            updatePipeline(7);
          },
          onEnd: () => {
            updatePipeline(1);
            if (visualizerStatus) visualizerStatus.textContent = 'Live Audio Spectrum: Idle';
          }
        });
      } else {
        setTimeout(() => updatePipeline(1), 1500);
      }
    };

    translateActionBtn?.addEventListener('click', executeStudioTranslation);

    // Studio Microphone STT
    micBtn?.addEventListener('click', () => {
      if (audioEngine.isRecording) {
        audioEngine.stopListening();
        micBtn.classList.remove('recording-pulse');
        if (micText) micText.textContent = 'Start Speaking (STT)';
        if (visualizerStatus) visualizerStatus.textContent = 'Live Audio Spectrum: Idle';
        updatePipeline(1);
        return;
      }

      const fromLang = document.getElementById('studio-source-lang')?.value || 'en';
      micBtn.classList.add('recording-pulse');
      if (micText) micText.textContent = 'Listening... Click to Stop';
      if (visualizerStatus) visualizerStatus.textContent = 'Microphone Capturing Voice (FFT Active)';
      
      // Step 1: Speech Input
      updatePipeline(1);

      audioEngine.startListening(fromLang, {
        onStart: () => {
          updatePipeline(2); // Step 2: Speech-to-Text
        },
        onInterim: (interim) => {
          if (sourceText) sourceText.value = interim;
        },
        onResult: (finalText) => {
          if (sourceText) sourceText.value = finalText;
        },
        onEnd: (finalText) => {
          micBtn.classList.remove('recording-pulse');
          if (micText) micText.textContent = 'Start Speaking (STT)';
          if (visualizerStatus) visualizerStatus.textContent = 'Live Audio Spectrum: Idle';
          if (finalText) {
            executeStudioTranslation();
          } else {
            updatePipeline(1);
          }
        },
        onError: () => {
          micBtn.classList.remove('recording-pulse');
          if (micText) micText.textContent = 'Start Speaking (STT)';
          if (visualizerStatus) visualizerStatus.textContent = 'Live Audio Spectrum: Idle';
          updatePipeline(1);
        }
      });
    });

    speakSourceBtn?.addEventListener('click', () => {
      const text = sourceText?.value?.trim();
      const fromLang = document.getElementById('studio-source-lang')?.value || 'en';
      if (text) {
        audioEngine.speak(text, fromLang, { rate: this.speechRate, pitch: this.speechPitch });
      }
    });

    speakTargetBtn?.addEventListener('click', () => {
      const text = targetText?.querySelector('div')?.textContent?.trim();
      const toLang = document.getElementById('studio-target-lang')?.value || 'hi';
      if (text) {
        audioEngine.speak(text, toLang, { rate: this.speechRate, pitch: this.speechPitch });
      }
    });

    clearBtn?.addEventListener('click', () => {
      if (sourceText) sourceText.value = '';
      if (targetText) targetText.innerHTML = 'Click \'Translate\' or start speaking to see neural translation...';
      updatePipeline(1);
    });

    copyBtn?.addEventListener('click', async () => {
      const text = targetText?.querySelector('div')?.textContent?.trim();
      if (text) {
        await navigator.clipboard.writeText(text);
        copyBtn.innerHTML = '✓';
        setTimeout(() => {
          copyBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>`;
        }, 1200);
      }
    });
  }

  /* =========================================================================
     LIVE TWO-WAY CONVERSATION
     ========================================================================= */
  setupLiveConversation() {
    const micA = document.getElementById('conv-mic-a');
    const micB = document.getElementById('conv-mic-b');
    const container = document.getElementById('conv-messages-container');
    const clearBtn = document.getElementById('conv-clear-btn');
    const faceToFaceBtn = document.getElementById('conv-face-to-face-btn');
    const convTab = document.getElementById('tab-conversation');

    // 180° Face-to-Face Dual Mode Toggle
    faceToFaceBtn?.addEventListener('click', () => {
      audioEngine.playFeedbackTone('flip');
      const isFlipped = convTab.classList.toggle('face-to-face-mode');
      faceToFaceBtn.classList.toggle('active', isFlipped);
      if (isFlipped) {
        faceToFaceBtn.innerHTML = `🔄 <span>Face-to-Face Active (180° Inverted)</span>`;
      } else {
        faceToFaceBtn.innerHTML = `🔄 <span>Face-to-Face Dual View (180° Flip)</span>`;
      }
    });

    // Seed initial dialogue demonstration
    this.conversation = [
      {
        speaker: 'A',
        lang: 'en',
        targetLang: 'hi',
        original: 'Hello! Can you guide me to the AI and Data Science lab?',
        translated: 'नमस्ते! क्या आप मुझे एआई और डेटा साइंस लैब तक ले जा सकते हैं?',
        timestamp: '10:42 AM'
      },
      {
        speaker: 'B',
        lang: 'hi',
        targetLang: 'en',
        original: 'हाँ बिल्कुल, सीधा जाइए और दूसरी मंजिल पर कमरा 204 है।',
        translated: 'Yes absolutely, go straight and room 204 is on the second floor.',
        timestamp: '10:43 AM'
      }
    ];
    this.renderConversation();

    const handleSpeakerTurn = (speakerId) => {
      const isSpeakerA = speakerId === 'A';
      const activeMicBtn = isSpeakerA ? micA : micB;
      const speakerLang = document.getElementById(isSpeakerA ? 'conv-lang-a' : 'conv-lang-b')?.value || (isSpeakerA ? 'en' : 'hi');
      const targetLang = document.getElementById(isSpeakerA ? 'conv-lang-b' : 'conv-lang-a')?.value || (isSpeakerA ? 'hi' : 'en');

      if (audioEngine.isRecording) {
        audioEngine.playFeedbackTone('mic-stop');
        audioEngine.stopListening();
        activeMicBtn.classList.remove('recording-pulse');
        return;
      }

      audioEngine.playFeedbackTone('mic-start');
      activeMicBtn.classList.add('recording-pulse');
      activeMicBtn.querySelector('span').textContent = `Listening to Speaker ${speakerId}...`;

      audioEngine.startListening(speakerLang, {
        onResult: (finalText) => {
          // Process final transcript
        },
        onEnd: async (finalText) => {
          activeMicBtn.classList.remove('recording-pulse');
          activeMicBtn.querySelector('span').textContent = `Speak as Speaker ${speakerId}`;

          if (finalText) {
            const translation = await translationEngine.translate(finalText, speakerLang, targetLang, this.currentPersona);
            audioEngine.playFeedbackTone('translated');
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const newMsg = {
              speaker: speakerId,
              lang: speakerLang,
              targetLang,
              original: finalText,
              translated: translation.translatedText,
              timestamp: now
            };

            this.conversation.push(newMsg);
            this.renderConversation();

            // Speak translated message to other party cleanly after completion chime
            setTimeout(() => {
              audioEngine.speak(translation.translatedText, targetLang, {
                rate: this.speechRate,
                pitch: this.speechPitch
              });
            }, 200);
          }
        },
        onError: () => {
          activeMicBtn.classList.remove('recording-pulse');
          activeMicBtn.querySelector('span').textContent = `Speak as Speaker ${speakerId}`;
        }
      });
    };

    micA?.addEventListener('click', () => handleSpeakerTurn('A'));
    micB?.addEventListener('click', () => handleSpeakerTurn('B'));

    clearBtn?.addEventListener('click', () => {
      audioEngine.playFeedbackTone('click');
      this.conversation = [];
      this.renderConversation();
    });
  }

  renderConversation() {
    const container = document.getElementById('conv-messages-container');
    if (!container) return;

    if (this.conversation.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); margin: auto; padding: 2rem;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎙️💬</div>
          <div style="font-weight: 600;">No conversation turns yet.</div>
          <div style="font-size: 0.8rem;">Click 'Speak as Speaker A' or 'Speak as Speaker B' above to start!</div>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    this.conversation.forEach((msg, idx) => {
      const isA = msg.speaker === 'A';
      const bubble = document.createElement('div');
      bubble.className = isA ? 'chat-bubble-a' : 'chat-bubble-b conv-bubble-partner';

      bubble.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; font-size: 0.75rem;">
          <span style="font-weight: 700; color: ${isA ? 'var(--ch-cream)' : 'var(--ch-sand)'};">
            ${isA ? '👤 Speaker A' : '👥 Speaker B'} (${msg.lang.toUpperCase()} → ${msg.targetLang.toUpperCase()})
          </span>
          <span style="color: var(--text-muted); font-size: 0.7rem;">${msg.timestamp}</span>
        </div>
        <div style="font-size: 0.95rem; color: var(--text-primary); margin-bottom: 0.35rem;">
          ${msg.original}
        </div>
        <div style="font-size: 0.95rem; font-weight: 600; color: ${isA ? 'var(--ch-sand)' : 'var(--ch-cream)'}; padding-top: 0.35rem; border-top: 1px solid rgba(220,195,170,0.15); display: flex; justify-content: space-between; align-items: center;">
          <span>${msg.translated}</span>
          <button class="btn-icon conv-play-msg" data-idx="${idx}" style="width: 28px; height: 28px; min-width: 28px; font-size: 0.75rem;" title="Play Audio">
            ▶
          </button>
        </div>
      `;

      container.appendChild(bubble);
    });

    // Attach play audio listeners
    container.querySelectorAll('.conv-play-msg').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const item = this.conversation[idx];
        if (item) {
          audioEngine.speak(item.translated, item.targetLang, { rate: this.speechRate, pitch: this.speechPitch });
        }
      });
    });

    container.scrollTop = container.scrollHeight;
  }

  /* =========================================================================
     IMAGE & DOCUMENT OCR TRANSLATOR
     ========================================================================= */
  setupImageOCR() {
    const ocrButtons = document.querySelectorAll('.ocr-sample-btn');
    const previewBox = document.getElementById('ocr-preview-box');
    const previewIcon = document.getElementById('ocr-preview-icon');
    const previewTitle = document.getElementById('ocr-preview-title');
    const previewSub = document.getElementById('ocr-preview-sub');
    const extractedEl = document.getElementById('ocr-extracted-text');
    const translatedEl = document.getElementById('ocr-translated-text');
    const speakBtn = document.getElementById('ocr-speak-btn');
    const copyBtn = document.getElementById('ocr-copy-btn');

    const sampleData = {
      airport: {
        icon: '✈️',
        title: 'Salida de Emergencia y Puerta de Embarque B12',
        sub: 'Detected Language: Spanish (es)',
        lang: 'es',
        targetLang: 'en',
        extracted: 'Salida de Emergencia y Puerta de Embarque B12',
        translated: 'Emergency Exit and Boarding Gate B12'
      },
      hospital: {
        icon: '🏥',
        title: 'आपातकालीन कक्ष और गहन चिकित्सा विभाग',
        sub: 'Detected Language: Hindi (hi)',
        lang: 'hi',
        targetLang: 'en',
        extracted: 'आपातकालीन कक्ष और गहन चिकित्सा विभाग',
        translated: 'Emergency Room and Intensive Care Department'
      },
      menu: {
        icon: '🍽️',
        title: 'Soupe à l’oignon gratinée et Salade fraîche du jardin',
        sub: 'Detected Language: French (fr)',
        lang: 'fr',
        targetLang: 'en',
        extracted: 'Soupe à l’oignon gratinée et Salade fraîche du jardin',
        translated: 'French Onion Soup with Melted Cheese and Fresh Garden Salad'
      },
      bus: {
        icon: '🚌',
        title: 'ਬੱਸ ਸਟੈਂਡ ਮੋਹਾਲੀ - ਟਿਕਟ ਕਾਊਂਟਰ',
        sub: 'Detected Language: Punjabi (pa)',
        lang: 'pa',
        targetLang: 'en',
        extracted: 'ਬੱਸ ਸਟੈਂਡ ਮੋਹਾਲੀ - ਟਿਕਟ ਕਾਊਂਟਰ',
        translated: 'Mohali Bus Stand - Ticket Counter'
      }
    };

    let activeSample = sampleData.airport;

    ocrButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        const data = sampleData[type];
        if (!data) return;

        activeSample = data;
        if (previewIcon) previewIcon.textContent = data.icon;
        if (previewTitle) previewTitle.textContent = data.title;
        if (previewSub) previewSub.textContent = data.sub;
        if (extractedEl) extractedEl.textContent = data.extracted;
        if (translatedEl) translatedEl.textContent = data.translated;
      });
    });

    speakBtn?.addEventListener('click', () => {
      if (activeSample) {
        audioEngine.speak(activeSample.translated, activeSample.targetLang, {
          rate: this.speechRate,
          pitch: this.speechPitch
        });
      }
    });

    copyBtn?.addEventListener('click', async () => {
      if (activeSample) {
        await navigator.clipboard.writeText(activeSample.translated);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy', 1200);
      }
    });
  }

  /* =========================================================================
     RECENT & FULL TRANSLATION HISTORY
     ========================================================================= */
  addHistoryRecord(sourceText, sourceLang, targetText, targetLang) {
    const record = {
      id: 'rec-' + Date.now(),
      sourceText,
      sourceLang,
      targetText,
      targetLang,
      time: 'Just now',
      date: new Date().toISOString()
    };

    this.history.unshift(record);
    if (this.history.length > 50) {
      this.history.pop();
    }
    this.saveHistory();
    this.renderRecentTranslations();
  }

  renderRecentTranslations() {
    const tbody = document.getElementById('recent-translations-body');
    if (!tbody) return;

    const displayList = this.history.slice(0, 4);
    if (displayList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No recent translations yet</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    displayList.forEach(item => {
      const srcLangObj = SUPPORTED_LANGUAGES.find(l => l.code === item.sourceLang) || { flag: '🌐' };
      const tgtLangObj = SUPPORTED_LANGUAGES.find(l => l.code === item.targetLang) || { flag: '🌐' };

      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';
      tr.innerHTML = `
        <td style="padding: 0.65rem 0.75rem; color: var(--text-primary); font-weight: 500;">
          <span style="margin-right: 0.35rem;">${srcLangObj.flag}</span> ${item.sourceText}
        </td>
        <td style="padding: 0.65rem 0.75rem; color: var(--ch-sand); font-weight: 500;">
          <span style="margin-right: 0.35rem;">${tgtLangObj.flag}</span> ${item.targetText}
        </td>
        <td style="padding: 0.65rem 0.75rem; color: var(--text-muted); font-size: 0.75rem;">
          ${item.time}
        </td>
        <td style="padding: 0.65rem 0.75rem; text-align: right;">
          <button class="btn-icon play-recent-item" style="width: 30px; height: 30px; font-size: 0.75rem;" title="Play Audio">
            ▶
          </button>
        </td>
      `;

      tr.querySelector('.play-recent-item')?.addEventListener('click', () => {
        audioEngine.speak(item.targetText, item.targetLang, { rate: this.speechRate, pitch: this.speechPitch });
      });

      tbody.appendChild(tr);
    });
  }

  setupHistory() {
    const searchInput = document.getElementById('history-search-input');
    const clearBtn = document.getElementById('clear-full-history');
    const exportJsonBtn = document.getElementById('export-history-json');
    const exportTxtBtn = document.getElementById('export-history-txt');

    searchInput?.addEventListener('input', () => {
      this.renderFullHistory(searchInput.value);
    });

    clearBtn?.addEventListener('click', () => {
      if (confirm('Clear all translation history records?')) {
        this.history = [];
        this.saveHistory();
        this.renderRecentTranslations();
        this.renderFullHistory();
      }
    });

    exportJsonBtn?.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.history, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ai_translator_history_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });

    exportTxtBtn?.addEventListener('click', () => {
      let txtContent = "AI-Based Real-Time Multilingual Communication Assistant\n";
      txtContent += "CGC University Mohali - Department of AI & Data Science\n";
      txtContent += "Session Transcript Export\n";
      txtContent += "========================================================\n\n";

      this.history.forEach((h, i) => {
        txtContent += `[${i + 1}] Date: ${new Date(h.date).toLocaleString()}\n`;
        txtContent += `    Source (${h.sourceLang}): ${h.sourceText}\n`;
        txtContent += `    Target (${h.targetLang}): ${h.targetText}\n\n`;
      });

      const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(txtContent);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ai_translator_transcript_${Date.now()}.txt`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });
  }

  renderFullHistory(filter = '') {
    const tbody = document.getElementById('full-history-table-body');
    if (!tbody) return;

    const term = filter.toLowerCase().trim();
    const filtered = this.history.filter(item =>
      item.sourceText.toLowerCase().includes(term) ||
      item.targetText.toLowerCase().includes(term) ||
      item.sourceLang.toLowerCase().includes(term) ||
      item.targetLang.toLowerCase().includes(term)
    );

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No matching translation records found</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    filtered.forEach(item => {
      const srcLangObj = SUPPORTED_LANGUAGES.find(l => l.code === item.sourceLang) || { name: item.sourceLang, flag: '🌐' };
      const tgtLangObj = SUPPORTED_LANGUAGES.find(l => l.code === item.targetLang) || { name: item.targetLang, flag: '🌐' };

      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';
      tr.innerHTML = `
        <td style="padding: 0.75rem; font-weight: 600;">${srcLangObj.flag} ${srcLangObj.name}</td>
        <td style="padding: 0.75rem; color: var(--text-primary);">${item.sourceText}</td>
        <td style="padding: 0.75rem; font-weight: 600;">${tgtLangObj.flag} ${tgtLangObj.name}</td>
        <td style="padding: 0.75rem; color: var(--ch-sand); font-weight: 500;">${item.targetText}</td>
        <td style="padding: 0.75rem; color: var(--text-muted); font-size: 0.75rem;">${new Date(item.date).toLocaleString()}</td>
        <td style="padding: 0.75rem; text-align: right;">
          <button class="btn-icon play-full-history-item" style="width: 30px; height: 30px; font-size: 0.75rem;" title="Play Audio">
            ▶
          </button>
        </td>
      `;

      tr.querySelector('.play-full-history-item')?.addEventListener('click', () => {
        audioEngine.speak(item.targetText, item.targetLang, { rate: this.speechRate, pitch: this.speechPitch });
      });

      tbody.appendChild(tr);
    });
  }

  /* =========================================================================
     SETTINGS & AUDIO DIAGNOSTICS
     ========================================================================= */
  setupSettings() {
    const sttStatus = document.getElementById('settings-stt-status');
    const ttsStatus = document.getElementById('settings-tts-status');
    const testMicBtn = document.getElementById('settings-test-mic-btn');
    const micResult = document.getElementById('settings-mic-result');
    const testToneBtn = document.getElementById('settings-test-tone-btn');
    const testVoiceBtn = document.getElementById('settings-test-voice-btn');
    const speedSlider = document.getElementById('settings-voice-speed');
    const pitchSlider = document.getElementById('settings-voice-pitch');
    const speedVal = document.getElementById('speed-val');
    const pitchVal = document.getElementById('pitch-val');
    const autoplayCheckbox = document.getElementById('settings-autoplay-audio');

    // Check system capabilities
    if (sttStatus) {
      if (audioEngine.isSTTSupported()) {
        sttStatus.textContent = '✓ Supported (Web Speech Recognition API Active)';
        sttStatus.style.color = 'var(--accent-emerald)';
      } else {
        sttStatus.textContent = '⚠️ Limited (Use Google Chrome or Microsoft Edge for native mic STT)';
        sttStatus.style.color = 'var(--accent-amber)';
      }
    }

    if (ttsStatus) {
      if (audioEngine.isTTSSupported()) {
        ttsStatus.textContent = '✓ Supported (SpeechSynthesis API Active)';
        ttsStatus.style.color = 'var(--accent-emerald)';
      } else {
        ttsStatus.textContent = '❌ SpeechSynthesis Not Supported';
        ttsStatus.style.color = 'var(--accent-rose)';
      }
    }

    testMicBtn?.addEventListener('click', () => {
      testMicBtn.textContent = '🎙️ Listening... Speak something now';
      testMicBtn.classList.add('recording-pulse');

      audioEngine.startListening('en', {
        onResult: (text) => {
          if (micResult) micResult.textContent = `Microphone Detected: "${text}"`;
        },
        onEnd: (text) => {
          testMicBtn.textContent = 'Test Microphone Live (Speak for 3 seconds)';
          testMicBtn.classList.remove('recording-pulse');
          if (micResult && text) {
            micResult.innerHTML = `✅ <b style="color: var(--accent-emerald);">Microphone Input Success:</b> "${text}"`;
          } else if (micResult) {
            micResult.textContent = 'No voice detected or microphone permission prompt pending.';
          }
        },
        onError: (e) => {
          testMicBtn.textContent = 'Test Microphone Live (Speak for 3 seconds)';
          testMicBtn.classList.remove('recording-pulse');
          if (micResult) micResult.textContent = `Microphone test notice: ${e.error || e.message}`;
        }
      });
    });

    testToneBtn?.addEventListener('click', () => {
      audioEngine.playTestTone();
    });

    testVoiceBtn?.addEventListener('click', () => {
      audioEngine.speak(
        'Laptop audio test successful. Multilingual Communication Assistant is fully operational.',
        'en',
        { rate: this.speechRate, pitch: this.speechPitch }
      );
    });

    const testPunjabiBtn = document.getElementById('settings-test-punjabi-btn');
    testPunjabiBtn?.addEventListener('click', () => {
      audioEngine.speak(
        'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਪੰਜਾਬੀ ਆਵਾਜ਼ ਪ੍ਰਣਾਲੀ ਪੂਰੀ ਤਰ੍ਹਾਂ ਕੰਮ ਕਰ ਰਹੀ ਹੈ।',
        'pa',
        { rate: this.speechRate, pitch: this.speechPitch }
      );
    });

    const testHindiBtn = document.getElementById('settings-test-hindi-btn');
    testHindiBtn?.addEventListener('click', () => {
      audioEngine.speak(
        'नमस्ते, हिंदी आवाज़ प्रणाली सफलतापूर्वक काम कर रही है।',
        'hi',
        { rate: this.speechRate, pitch: this.speechPitch }
      );
    });

    speedSlider?.addEventListener('input', () => {
      this.speechRate = parseFloat(speedSlider.value);
      if (speedVal) speedVal.textContent = `${this.speechRate.toFixed(1)}x`;
    });

    pitchSlider?.addEventListener('input', () => {
      this.speechPitch = parseFloat(pitchSlider.value);
      if (pitchVal) pitchVal.textContent = `${this.speechPitch.toFixed(1)}`;
    });

    autoplayCheckbox?.addEventListener('change', () => {
      this.autoplayAudio = autoplayCheckbox.checked;
    });
  }

  /* =========================================================================
     THEME TOGGLE
     ========================================================================= */
  setupTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    toggleBtn?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('cgc_ai_theme', next);
    });
  }
}

// Initialize Application once DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
