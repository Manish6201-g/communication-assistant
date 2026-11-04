const fs = require('fs');

function cleanFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let count = 0;
  for (const [pattern, repl] of replacements) {
    if (pattern instanceof RegExp) {
      const matches = content.match(pattern);
      if (matches) {
        count += matches.length;
        content = content.replace(pattern, repl);
      }
    } else {
      while (content.includes(pattern)) {
        content = content.replace(pattern, repl);
        count++;
      }
    }
  }
  fs.writeFileSync(filePath, content);
  console.log(`Cleaned ${filePath}: ${count} replacements made.`);
}

// 1. Clean index.html and frontend/public/landing.html
const htmlReplacements = [
  // SGF SVG Mark (was drawing CIVICEYE)
  [
    /<div class="sgf-mark">[\s\S]*?<\/footer>/,
    `<div class="sgf-mark" style="text-align:center;padding:3rem 1rem 1rem 1rem">
    <p class="sr-only">AI TRANSLATOR</p>
    <div style="font-family:var(--font-display);font-size:clamp(36px, 8vw, 84px);font-weight:900;letter-spacing:0.18em;color:#dfe7e0;text-transform:uppercase;line-height:1;margin:0 auto;text-shadow:0 0 30px rgba(0,229,255,0.25)">
      AI TRANSLATOR
    </div>
    <div style="font-family:var(--font-mono);font-size:12px;letter-spacing:0.35em;color:#00e5ff;margin-top:0.75rem;text-transform:uppercase">
      REAL-TIME MULTIMODAL COMMUNICATION PLATFORM
    </div>
  </div>
</footer>`
  ],
  [/CivicEye/g, 'AI Translator'],
  [/Civic Eye/g, 'AI Translator'],
  [/civiceye/g, 'ai-translator'],
  [/CIVICEYE/g, 'AI TRANSLATOR'],
  [/Civic Command/g, 'AI Translator OS'],
  [/CIVIC COMMAND/g, 'AI TRANSLATOR OS'],
  [/CIVIC-OS/g, 'AI-TRANSLATOR-OS'],
  [/civic municipal desks/g, 'public service desks'],
  [/civic\/counter phrases/g, 'counter and emergency phrases'],
  [/Municipal Civic Service Desks/g, 'Public Administration & Service Desks'],
  [/Hanging the civic beacon/g, 'Initializing neural translation audio pipeline'],
  [/Connected to CivicEye Telemetry/g, 'Connected to AI Translator Telemetry'],
  [/FLOATING COMMAND DOCK \(CIVICEYE STYLE\)/g, 'FLOATING COMMAND DOCK (AI TRANSLATOR)'],
  [/class="civic-dock"/g, 'class="civic-dock ai-dock" aria-label="AI Translator Command Dock"'],
  [/aria-label="Civic Command Dock"/g, 'aria-label="AI Translator Command Dock"'],
  [/civic-gov-[a-z]+/g, 'trans-gov-hub'],
  [/civic-card-[a-z]+/g, 'trans-card-desk']
];

cleanFile('index.html', htmlReplacements);
cleanFile('frontend/public/landing.html', htmlReplacements);

// 2. Clean src/style.css
const cssReplacements = [
  [/CivicEye Design System/g, 'AI Translator Design System'],
  [/--civic-red/g, '--ai-red'],
  [/--civic-ember/g, '--ai-ember'],
  [/--civic-cyan/g, '--ai-cyan'],
  [/--civic-teal/g, '--ai-teal'],
  [/--civic-emerald/g, '--ai-emerald'],
  [/--civic-amber/g, '--ai-amber'],
  [/--civic-indigo/g, '--ai-indigo'],
  [/\.civic-card/g, '.ai-card, .civic-card'],
  [/\.civic-pill/g, '.ai-pill, .civic-pill'],
  [/\.civic-dock/g, '.ai-dock, .civic-dock'],
  [/CivicEye style/g, 'AI Translator style']
];
cleanFile('src/style.css', cssReplacements);

// 3. Clean src/app.js
const appJsReplacements = [
  [/CivicEye Architecture/g, 'AI Translator Architecture'],
  [/CIVICEYE-STYLE FULL LANDING PAGE RENDERER/g, 'AI TRANSLATOR FULL LANDING PAGE RENDERER'],
  [/CIVICEYE BRAND FOOTER/g, 'AI TRANSLATOR BRAND FOOTER'],
  [/CIVICEYE SYSTEM INTEGRATION/g, 'AI TRANSLATOR SYSTEM INTEGRATION'],
  [/CivicEye-powered/g, 'AI-powered'],
  [/CivicEye/g, 'AI Translator'],
  [/Civic Eye/g, 'AI Translator'],
  [/CIVICEYE/g, 'AI TRANSLATOR'],
  [/civic municipal/g, 'public service'],
  [/civic desks/g, 'service counters'],
  [/Civic Counters/g, 'Public Service Counters'],
  [/civic-card/g, 'ai-card'],
  [/civic-pill/g, 'ai-pill'],
  [/civic-dock/g, 'ai-dock']
];
cleanFile('src/app.js', appJsReplacements);

// 4. Clean frontend components
const frontendComponentReplacements = [
  [/CivicEye/g, 'AI Translator'],
  [/Civic Eye/g, 'AI Translator'],
  [/CIVICEYE/g, 'AI TRANSLATOR'],
  [/Civic Command Dock/g, 'AI Translator Command Dock'],
  [/civic-dock/g, 'ai-dock']
];
cleanFile('frontend/src/components/Landing3D.jsx', frontendComponentReplacements);
cleanFile('frontend/src/components/Navbar.jsx', frontendComponentReplacements);
cleanFile('frontend/src/components/HeroSection.jsx', frontendComponentReplacements);
cleanFile('frontend/src/pages/Translator.jsx', frontendComponentReplacements);

// 5. Clean backend
cleanFile('backend/app/main.py', [
  [/"Government \/ Civic Desk"/g, '"Government & Public Service Counter"']
]);

console.log('All files completely cleaned of "civic eye" references!');
