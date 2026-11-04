const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Change Wordmark from "CIVIC" to "SCREEN"
html = html.replace("const word = 'CIVIC'", "const word = 'SCREEN'");

// 2. Replace buildTorii with buildCyberPortal
// Let's locate buildTorii
const toriiStart = html.indexOf("function buildTorii() {");
const toriiEnd = html.indexOf("function buildLantern(", toriiStart);

if (toriiStart !== -1 && toriiEnd !== -1) {
  const newPortalCode = `function buildTorii() {
  /* Futuristic Dual-Screen Cyber Portal & Architectural Gateway */
  const g = new THREE.Group();
  const BASE = 0.78, H = 8.5, SPAN = 3.8;

  // Modern metallic titanium materials
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x0a1018,
    roughness: 0.22,
    metalness: 0.88
  });
  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x05070a,
    roughness: 0.45,
    metalness: 0.70
  });

  // Glowing neon materials (Cyan & Vermilion)
  const cyanNeon = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
  const redNeon = new THREE.MeshBasicMaterial({ color: 0xe0231c });
  const emeraldNeon = new THREE.MeshBasicMaterial({ color: 0x10b981 });

  // Generate Digital Ticker Canvas Texture
  const tickerC = cvs(1024, 128), txC = tickerC.getContext('2d');
  txC.fillStyle = '#05070a'; txC.fillRect(0, 0, 1024, 128);
  txC.fillStyle = 'rgba(0, 229, 255, 0.08)'; txC.fillRect(0, 0, 1024, 128);
  txC.strokeStyle = '#00e5ff'; txC.lineWidth = 4; txC.strokeRect(4, 4, 1016, 120);
  txC.fillStyle = '#00e5ff'; txC.font = 'bold 36px "DM Mono", monospace';
  txC.textBaseline = 'middle'; txC.textAlign = 'center';
  txC.fillText('● REAL-TIME TRANSLATION GATE · [HINDI ⇄ ENGLISH] · LATENCY <480ms', 512, 64);
  const tickerTex = tx(tickerC, { aniso: 16 });
  const tickerMat = new THREE.MeshBasicMaterial({ map: tickerTex });

  // Left & Right Monolithic Cyber Columns
  [-1, 1].forEach((s, idx) => {
    // Main column body (Hexagonal / Sleek Box)
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.7, H, 0.9), metalMat);
    col.position.set(s * SPAN, BASE + H / 2, 0);
    col.castShadow = true; col.receiveShadow = true;
    g.add(col);

    // Neon edge accent channel
    const neonMat = idx === 0 ? cyanNeon : redNeon;
    const neonStrip = new THREE.Mesh(new THREE.BoxGeometry(0.08, H - 0.5, 0.94), neonMat);
    neonStrip.position.set(s * SPAN + (idx === 0 ? 0.36 : -0.36), BASE + H / 2, 0);
    g.add(neonStrip);

    // Column Base Plinth
    const foot = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.6, 1.3), darkMetal);
    foot.position.set(s * SPAN, BASE + 0.3, 0);
    g.add(foot);

    // Pillar Telemetry HUD Screen
    const hudC = cvs(256, 512), hx = hudC.getContext('2d');
    hx.fillStyle = '#05070a'; hx.fillRect(0, 0, 256, 512);
    hx.strokeStyle = idx === 0 ? '#00e5ff' : '#e0231c'; hx.lineWidth = 3; hx.strokeRect(4, 4, 248, 504);
    hx.fillStyle = idx === 0 ? '#00e5ff' : '#e0231c';
    hx.font = 'bold 22px monospace'; hx.fillText(idx === 0 ? 'DESK 01 · PASSENGER' : 'DESK 02 · OFFICIAL', 16, 44);
    hx.font = '16px monospace'; hx.fillStyle = '#dfe7e0';
    hx.fillText('STATUS: ONLINE', 16, 90);
    hx.fillText('VAD SENSING: ACTIVE', 16, 125);
    hx.fillText('WSS: STREAMING', 16, 160);
    hx.fillText('BITRATE: 16kHz PCM', 16, 195);
    // Draw simulated audio waveform on the pillar
    hx.strokeStyle = '#00e5ff'; hx.lineWidth = 2; hx.beginPath();
    for (let x = 16; x < 240; x += 4) {
      const y = 300 + Math.sin(x * 0.1) * 35 * Math.random();
      if (x === 16) hx.moveTo(x, y); else hx.lineTo(x, y);
    }
    hx.stroke();
    const hudTex = tx(hudC, { aniso: 16 });
    const hudMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 1.8), new THREE.MeshBasicMaterial({ map: hudTex }));
    hudMesh.position.set(s * SPAN, BASE + 4.2, 0.46);
    g.add(hudMesh);

    // Overhead Light Projector
    const spot = new THREE.PointLight(idx === 0 ? 0x00e5ff : 0xe0231c, 2.5, 14, 2);
    spot.position.set(s * SPAN, BASE + H + 0.5, 1.2);
    g.add(spot);
  });

  // Upper Crossbeam Housing (The Digital Ticker Beam)
  const beamHousing = new THREE.Mesh(new THREE.BoxGeometry(SPAN * 2 + 2.2, 1.1, 1.0), metalMat);
  beamHousing.position.set(0, BASE + H - 0.2, 0);
  beamHousing.castShadow = true;
  g.add(beamHousing);

  // Digital Ticker Screen Face (Front & Back)
  const tickerMeshFront = new THREE.Mesh(new THREE.PlaneGeometry(SPAN * 2 + 1.8, 0.85), tickerMat);
  tickerMeshFront.position.set(0, BASE + H - 0.2, 0.52);
  g.add(tickerMeshFront);

  const tickerMeshBack = tickerMeshFront.clone();
  tickerMeshBack.position.z = -0.52;
  tickerMeshBack.rotation.y = Math.PI;
  g.add(tickerMeshBack);

  // Upper Holographic Rail
  const topRail = new THREE.Mesh(new THREE.BoxGeometry(SPAN * 2 + 3.0, 0.25, 1.4), darkMetal);
  topRail.position.set(0, BASE + H + 0.5, 0);
  g.add(topRail);

  const topNeon = new THREE.Mesh(new THREE.BoxGeometry(SPAN * 2 + 3.1, 0.08, 1.44), cyanNeon);
  topNeon.position.set(0, BASE + H + 0.65, 0);
  g.add(topNeon);

  // =========================================================================
  // CENTRAL DUAL-FACING COUNTERTOP TERMINAL STATION
  // =========================================================================
  const counterStation = buildDualScreenStation();
  counterStation.position.set(0, BASE, 0.5);
  g.add(counterStation);

  scene.add(g);
  WORLD.torii = g;
}

/* Central 3D Countertop Dual-Display Terminal */
function buildDualScreenStation() {
  const station = new THREE.Group();

  // Dark countertop desk
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x070b12, roughness: 0.3, metalness: 0.8 });
  const desk = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.85, 1.6), deskMat);
  desk.position.set(0, 0.42, 0);
  desk.castShadow = true; desk.receiveShadow = true;
  station.add(desk);

  // Glowing base perimeter ring
  const baseNeon = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.05, 1.7), new THREE.MeshBasicMaterial({ color: 0x00e5ff }));
  baseNeon.position.set(0, 0.05, 0);
  station.add(baseNeon);

  // Customer Screen Texture (Left, facing forward-left)
  const custC = cvs(512, 320), cx = custC.getContext('2d');
  cx.fillStyle = '#05070a'; cx.fillRect(0, 0, 512, 320);
  cx.strokeStyle = '#00e5ff'; cx.lineWidth = 4; cx.strokeRect(4, 4, 504, 312);
  cx.fillStyle = 'rgba(0,229,255,0.12)'; cx.fillRect(10, 10, 492, 40);
  cx.fillStyle = '#00e5ff'; cx.font = 'bold 18px "DM Mono", monospace';
  cx.fillText('● PASSENGER DISPLAY · HINDI (हिन्दी)', 24, 36);
  cx.fillStyle = '#ffffff'; cx.font = 'bold 26px "Onest", sans-serif';
  cx.fillText('मुझे अपना टिकट रद्द कराना है', 24, 110);
  cx.fillStyle = '#00e5ff'; cx.font = '20px "Onest", sans-serif';
  cx.fillText('I need to cancel my ticket', 24, 150);
  // Audio waveform bars
  cx.fillStyle = '#00e5ff';
  for (let i = 0; i < 28; i++) {
    const bh = 15 + Math.sin(i * 0.4) * 25 * Math.random();
    cx.fillRect(24 + i * 16, 260 - bh, 10, bh);
  }
  const custTex = tx(custC, { aniso: 16 });
  const custScreenMat = new THREE.MeshBasicMaterial({ map: custTex });

  // Agent Screen Texture (Right, facing forward-right)
  const agentC = cvs(512, 320), ax = agentC.getContext('2d');
  ax.fillStyle = '#05070a'; ax.fillRect(0, 0, 512, 320);
  ax.strokeStyle = '#10b981'; ax.lineWidth = 4; ax.strokeRect(4, 4, 504, 312);
  ax.fillStyle = 'rgba(16,185,129,0.12)'; ax.fillRect(10, 10, 492, 40);
  ax.fillStyle = '#10b981'; ax.font = 'bold 18px "DM Mono", monospace';
  ax.fillText('● OFFICIAL AGENT DESK · ENGLISH', 24, 36);
  ax.fillStyle = '#dfe7e0'; cx.font = '16px monospace';
  ax.fillText('INCOMING: "I need to cancel my ticket"', 24, 100);
  ax.fillStyle = '#10b981'; ax.font = 'bold 22px "Onest", sans-serif';
  ax.fillText('Sure, may I have your 6-digit PNR?', 24, 150);
  // Suggested badges
  ax.fillStyle = '#111722'; ax.fillRect(24, 210, 220, 36);
  ax.strokeStyle = '#10b981'; ax.strokeRect(24, 210, 220, 36);
  ax.fillStyle = '#dfe7e0'; ax.font = '13px monospace';
  ax.fillText('1. PNR Reference?', 36, 234);
  const agentTex = tx(agentC, { aniso: 16 });
  const agentScreenMat = new THREE.MeshBasicMaterial({ map: agentTex });

  // Screen Mounts & Frames
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x111722, roughness: 0.2, metalness: 0.9 });
  
  // Customer Monitor (Screen 1)
  const mon1 = new THREE.Group();
  const stand1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.45, 16), frameMat);
  stand1.position.set(0, 0.22, 0); mon1.add(stand1);
  const body1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.06), frameMat);
  body1.position.set(0, 0.65, 0); mon1.add(body1);
  const disp1 = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 0.82), custScreenMat);
  disp1.position.set(0, 0.65, 0.035); mon1.add(disp1);
  mon1.position.set(-0.95, 0.85, 0);
  mon1.rotation.y = 0.25; mon1.rotation.x = -0.12;
  station.add(mon1);

  // Agent Monitor (Screen 2)
  const mon2 = new THREE.Group();
  const stand2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.45, 16), frameMat);
  stand2.position.set(0, 0.22, 0); mon2.add(stand2);
  const body2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.06), frameMat);
  body2.position.set(0, 0.65, 0); mon2.add(body2);
  const disp2 = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 0.82), agentScreenMat);
  disp2.position.set(0, 0.65, 0.035); mon2.add(disp2);
  mon2.position.set(0.95, 0.85, 0);
  mon2.rotation.y = -0.25; mon2.rotation.x = -0.12;
  station.add(mon2);

  // 3D Animated Audio Spectrum Visualizer Bars (standing between screens)
  const eqGroup = new THREE.Group();
  const eqMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
  const eqBars = [];
  for (let b = 0; b < 12; b++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.4, 0.04), eqMat);
    bar.position.set((b - 5.5) * 0.08, 0.2, 0);
    eqGroup.add(bar);
    eqBars.push(bar);
  }
  eqGroup.position.set(0, 0.85, 0.1);
  station.add(eqGroup);
  WORLD.eqBars = eqBars;

  // Countertop Glow Lamp
  const deskLight = new THREE.PointLight(0x00e5ff, 2.0, 6, 2);
  deskLight.position.set(0, 1.8, 0.5);
  station.add(deskLight);

  return station;
}
`;
  html = html.substring(0, toriiStart) + newPortalCode + '\n' + html.substring(toriiEnd);
  console.log("Replaced buildTorii with Cyber Portal & Dual-Screen Terminal!");
}

// 3. Replace buildLantern with buildCounterKiosks
const lanternStart = html.indexOf("function buildLantern(");
const lanternEnd = html.indexOf("function buildMaple(", lanternStart);

if (lanternStart !== -1 && lanternEnd !== -1) {
  const newKioskCode = `function buildLantern(x, z, s, y) {
  /* Sleek 3D Public Counter Information Stela / Interactive Kiosk */
  const g = new THREE.Group();
  const H = 3.6 * (s || 1);

  const matChassis = new THREE.MeshStandardMaterial({
    color: 0x080d14,
    roughness: 0.25,
    metalness: 0.85
  });
  const matNeon = new THREE.MeshBasicMaterial({ color: 0x00e5ff });

  // Main Kiosk Monolith
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.85 * (s || 1), H, 0.3 * (s || 1)), matChassis);
  body.position.set(0, H / 2, 0);
  body.castShadow = true; body.receiveShadow = true;
  g.add(body);

  // Side Neon Trim
  [-1, 1].forEach(side => {
    const trim = new THREE.Mesh(new THREE.BoxGeometry(0.04, H, 0.32 * (s || 1)), matNeon);
    trim.position.set(side * 0.43 * (s || 1), H / 2, 0);
    g.add(trim);
  });

  // Digital Display Face
  const kc = cvs(256, 512), kx = kc.getContext('2d');
  kx.fillStyle = '#05070a'; kx.fillRect(0, 0, 256, 512);
  kx.strokeStyle = '#00e5ff'; kx.lineWidth = 3; kx.strokeRect(4, 4, 248, 504);
  kx.fillStyle = '#00e5ff'; kx.font = 'bold 22px monospace';
  kx.fillText('SERVICE KIOSK', 20, 40);
  kx.fillStyle = '#dfe7e0'; kx.font = '14px monospace';
  kx.fillText('1. SPEECH ASR', 20, 90);
  kx.fillText('2. DUAL TRANSLATE', 20, 130);
  kx.fillText('3. 180° FLIP VIEW', 20, 170);
  kx.fillText('4. AIRGAP SECURE', 20, 210);
  // Frequency waves
  kx.fillStyle = '#00e5ff';
  for (let i = 0; i < 20; i++) {
    const h = 10 + Math.sin(i * 0.5) * 40 * Math.random();
    kx.fillRect(20 + i * 11, 440 - h, 7, h);
  }
  const kTex = tx(kc, { aniso: 16 });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.72 * (s || 1), H * 0.75), new THREE.MeshBasicMaterial({ map: kTex }));
  screen.position.set(0, H * 0.52, 0.16 * (s || 1));
  g.add(screen);

  // Base Light
  const pl = new THREE.PointLight(0x00e5ff, 1.8, 8, 2);
  pl.position.set(0, H * 0.6, 0.4);
  g.add(pl);

  g.position.set(x, y || 0, z);
  scene.add(g);
  return g;
}
`;
  html = html.substring(0, lanternStart) + newKioskCode + '\n' + html.substring(lanternEnd);
  console.log("Replaced buildLantern with Smart Counter Kiosks!");
}

// 4. Animate Equalizer Bars in Render Loop
const renderLoopIdx = html.indexOf("requestAnimationFrame(render);");
if (renderLoopIdx !== -1) {
  const eqAnimCode = `
    // Animate 3D Equalizer Spectrum Bars on Countertop
    if (WORLD.eqBars && WORLD.eqBars.length) {
      const time = performance.now() * 0.006;
      WORLD.eqBars.forEach((bar, idx) => {
        const scaleY = 0.2 + Math.abs(Math.sin(time + idx * 0.5)) * 1.8 + Math.sin(time * 2.2 + idx) * 0.6;
        bar.scale.y = Math.max(0.15, scaleY);
        bar.position.y = 0.2 * bar.scale.y;
      });
    }
  `;
  html = html.substring(0, renderLoopIdx) + eqAnimCode + '\n    ' + html.substring(renderLoopIdx);
  console.log("Added live 3D equalizer bar animation to render loop!");
}

fs.writeFileSync('index.html', html);
console.log("Updated index.html with Screen-Based AI Communication Assistant 3D designs!");
