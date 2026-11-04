const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Redefine buildTemple with Communication Assistant 3D Stations
const startIdx = html.indexOf("function buildTemple() {");
const endIdx = html.indexOf("function buildOldTempleDisabled() {");

if (startIdx !== -1 && endIdx !== -1) {
  const newTempleCode = `function buildTemple() {
  const g = new THREE.Group();
  
  // Transit Hub Glass & Architecture Materials
  const winTex = tx(texCityWindows(), { wrap: THREE.RepeatWrapping, repeat: [1, 2] });
  const bldgMat = new THREE.MeshStandardMaterial({
    color: 0x111722,
    roughness: 0.25,
    metalness: 0.85,
    map: winTex
  });
  const bldgDarkMat = new THREE.MeshStandardMaterial({
    color: 0x06090e,
    roughness: 0.65,
    metalness: 0.40
  });

  // Modern Architectural Terminal Columns & Trusses
  const leftTowers = [
    { x: -14, z: 12, w: 7, h: 26, d: 9 },
    { x: -16, z: 0, w: 9, h: 38, d: 11 },
    { x: -13, z: -14, w: 8, h: 32, d: 9 },
    { x: -17, z: -28, w: 10, h: 48, d: 12 },
    { x: -15, z: -44, w: 9, h: 36, d: 10 },
    { x: -18, z: -60, w: 11, h: 42, d: 13 }
  ];
  const rightTowers = [
    { x: 14, z: 10, w: 7, h: 28, d: 8 },
    { x: 16, z: -2, w: 10, h: 44, d: 11 },
    { x: 14, z: -16, w: 8, h: 30, d: 9 },
    { x: 17, z: -30, w: 11, h: 52, d: 13 },
    { x: 15, z: -46, w: 9, h: 34, d: 10 },
    { x: 19, z: -62, w: 12, h: 46, d: 14 }
  ];

  [...leftTowers, ...rightTowers].forEach(t => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(t.w, t.h, t.d), bldgMat);
    mesh.position.set(t.x, t.h / 2, t.z);
    mesh.castShadow = true; mesh.receiveShadow = true;
    g.add(mesh);

    // Spire beacon (Cyan & Emerald transit beacons)
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 5, 8), bldgDarkMat);
    spire.position.set(t.x, t.h + 2.5, t.z);
    g.add(spire);
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff }));
    beacon.position.set(t.x, t.h + 5, t.z);
    g.add(beacon);
  });

  // Distant city terminal concourse backdrop
  for (let i = -7; i <= 7; i++) {
    const dw = 12, dh = 24 + Math.abs(i) * 3 + Math.sin(i * 1.5) * 8;
    const db = new THREE.Mesh(new THREE.BoxGeometry(dw, dh, 6), bldgDarkMat);
    db.position.set(i * 11, dh / 2, -78);
    g.add(db);
  }

  // Modern Concourse Light Masts
  const lightMastMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85 });
  const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
  [-20, -10, 0, 10].forEach(z => {
    [-6.2, 6.2].forEach(x => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 5.5, 8), lightMastMat);
      pole.position.set(x, 2.75, z);
      g.add(pole);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.08), lightMastMat);
      arm.position.set(x > 0 ? x - 0.4 : x + 0.4, 5.4, z);
      g.add(arm);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), lampGlowMat);
      head.position.set(x > 0 ? x - 0.8 : x + 0.8, 5.3, z);
      g.add(head);
    });
  });

  /* -------------------------------------------------------------------------
     3D STATION 1: Airport Flight Gate & Baggage Counter (Focus at Step 1 / Cam 1)
     ------------------------------------------------------------------------- */
  const st1Group = new THREE.Group();
  st1Group.position.set(-1.2, 0.04, 6.5);

  // Countertop Desk
  const deskMat1 = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
  const counterDesk1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.85, 1.2), deskMat1);
  counterDesk1.position.set(0, 0.42, 0);
  counterDesk1.castShadow = true;
  st1Group.add(counterDesk1);

  // Dual Screens on Airport Desk
  const monMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
  const screen1A = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.05), monMat);
  screen1A.position.set(-0.55, 1.15, 0.2); screen1A.rotation.y = 0.2;
  st1Group.add(screen1A);

  const screen1B = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.05), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
  screen1B.position.set(0.55, 1.15, 0.2); screen1B.rotation.y = -0.2;
  st1Group.add(screen1B);

  // Concentric Holographic Acoustic Speech Wave Rings (Floor)
  const waveRings = [];
  for (let r = 0; r < 3; r++) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.9 + r * 0.45, 0.96 + r * 0.45, 32),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02 + r * 0.005;
    st1Group.add(ring);
    waveRings.push(ring);
  }
  WORLD.speechWaveRings = waveRings;

  // Sweeping VAD Beam Indicator
  const vadBeam = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 0.06),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
  );
  vadBeam.rotation.x = -Math.PI / 2;
  vadBeam.position.y = 0.05;
  st1Group.add(vadBeam);
  WORLD.vadBeam = vadBeam;

  // Holographic 3D Floating Tag for Desk 01
  const tag1 = makeHudTag([
    'DESK 01: AIRPORT FLIGHT GATE & BAGGAGE',
    'PASSENGER: "Where is boarding gate number 4?"',
    'SUBTITLE: "4番搭乗口はどこですか？" · 340ms WSS'
  ], '#00e5ff', '#00e5ff');
  tag1.position.set(0, 2.3, 0);
  tag1.rotation.y = 0.25;
  st1Group.add(tag1);
  g.add(st1Group);

  /* -------------------------------------------------------------------------
     3D STATION 2: Emergency Clinical Triage Reception (Focus at Step 2 / Cam 2)
     ------------------------------------------------------------------------- */
  const st2Group = new THREE.Group();
  st2Group.position.set(3.5, 0, -5.0);

  // Clinical Triage Counter
  const medDeskMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25, metalness: 0.7 });
  const triageDesk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.85, 1.2), medDeskMat);
  triageDesk.position.set(0, 0.42, 0);
  st2Group.add(triageDesk);

  // 180° Inverted Flat Countertop Tablet on desk
  const tablet = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.8), new THREE.MeshBasicMaterial({ color: 0xe0231c }));
  tablet.position.set(0, 0.88, 0);
  st2Group.add(tablet);

  // Pulsating Emergency Medical Pulse Beacon Ring
  const medBeacon = new THREE.Mesh(
    new THREE.RingGeometry(1.4, 1.55, 32),
    new THREE.MeshBasicMaterial({ color: 0xe0231c, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
  );
  medBeacon.rotation.x = -Math.PI / 2;
  medBeacon.position.y = 0.03;
  st2Group.add(medBeacon);
  WORLD.triagePulse = medBeacon;

  // Floating 3D Tag for Desk 02
  const tag2 = makeHudTag([
    'DESK 02: EMERGENCY CLINICAL TRIAGE',
    'PATIENT: "सीने में बहुत तेज दर्द है, डॉक्टर चाहिए"',
    'SEVERITY: ACUTE TRIAGE PRIORITY 1 • <240ms'
  ], '#ff3b30', '#ff3b30');
  tag2.position.set(0.6, 2.3, 0.2);
  tag2.rotation.y = -0.3;
  st2Group.add(tag2);
  g.add(st2Group);

  /* -------------------------------------------------------------------------
     3D STATION 3: High-Density Railway Transit Concourse (Focus at Step 3 / Cam 3)
     ------------------------------------------------------------------------- */
  const st3Group = new THREE.Group();
  st3Group.position.set(-3.2, 0, -17.0);

  // Railway Service Desk
  const railDeskMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.7 });
  const railDesk = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.85, 1.2), railDeskMat);
  railDesk.position.set(0, 0.42, 0);
  st3Group.add(railDesk);

  // Departure Display Screen on Pole
  const rPole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 5.5, 12), lightMastMat);
  rPole.position.set(0, 2.75, 0);
  st3Group.add(rPole);

  const fidsScreen = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.0, 0.1), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
  fidsScreen.position.set(0, 4.8, 0);
  st3Group.add(fidsScreen);

  // Emerald Noise-Gate Verification Light Pool
  const railLightPool = new THREE.Mesh(
    new THREE.CircleGeometry(2.6, 32),
    new THREE.MeshBasicMaterial({
      map: tx(texGlow('rgba(16,185,129,0.6)', 'rgba(5,150,105,0.08)')),
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
    })
  );
  railLightPool.rotation.x = -Math.PI / 2;
  railLightPool.position.set(0, 0.04, 0);
  st3Group.add(railLightPool);

  // Floating 3D Tag for Desk 03
  const tag3 = makeHudTag([
    'DESK 03: RAILWAY TRANSIT CONCOURSE',
    'PASSENGER: "अगली ट्रेन किस प्लेटफॉर्म से रवाना होगी?"',
    'TRANSLATED: "Next Express Departs 14:35 Platform 4"'
  ], '#10b981', '#10b981');
  tag3.position.set(0, 3.2, 0);
  tag3.rotation.y = 0.2;
  st3Group.add(tag3);
  g.add(st3Group);

  /* -------------------------------------------------------------------------
     FIBER OPTIC DATA HIGHWAY & SPEECH PACKETS (Connecting All Counters)
     ------------------------------------------------------------------------- */
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.75 });
  const netPts = [
    new THREE.Vector3(-1.2, 2.2, 6.5),
    new THREE.Vector3(3.5, 2.2, -5.0),
    new THREE.Vector3(3.5, 2.2, -5.0),
    new THREE.Vector3(-3.2, 3.2, -17.0),
    new THREE.Vector3(-3.2, 3.2, -17.0),
    new THREE.Vector3(0, 8.0, -32.0),
    new THREE.Vector3(-1.2, 2.2, 6.5),
    new THREE.Vector3(0, 8.0, -32.0)
  ];
  const netGeo = new THREE.BufferGeometry().setFromPoints(netPts);
  const netLines = new THREE.LineSegments(netGeo, lineMat);
  g.add(netLines);

  // Floating Speech Audio Data Packets
  const packetGeo = new THREE.SphereGeometry(0.18, 12, 12);
  const packetMatCyan = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
  const packetMatRed = new THREE.MeshBasicMaterial({ color: 0xe0231c });
  const dataPackets = [];
  for (let p = 0; p < 8; p++) {
    const pkt = new THREE.Mesh(packetGeo, p % 2 === 0 ? packetMatCyan : packetMatRed);
    pkt.position.set((Math.random() - 0.5) * 6, 1.5 + Math.random() * 1.5, -p * 6);
    g.add(pkt);
    dataPackets.push(pkt);
  }
  WORLD.dataPackets = dataPackets;

  scene.add(g);
  WORLD.temple = g;
}
`;
  html = html.substring(0, startIdx) + newTempleCode + '\n' + html.substring(endIdx);
  console.log("Successfully replaced buildTemple with 3D Communication Assistant Stations!");
}

// 2. Update updateWorld to animate the new speech objects
const updateWorldStart = html.indexOf("function updateWorld(dt) {");
const updateWorldEnd = html.indexOf("/* the focused chapter warms the lanterns", updateWorldStart);

if (updateWorldStart !== -1 && updateWorldEnd !== -1) {
  const newUpdateCode = `function updateWorld(dt) {
  WORLD.uT.value = clock;

  /* Screen-Based AI Communication Assistant 3D Animations */
  // 1. Audio VAD scanning beam
  if (WORLD.vadBeam) {
    WORLD.vadBeam.position.z = Math.sin(clock * 3.5) * 0.7;
  }
  // 2. Acoustic speech wave rings expanding from counter
  if (WORLD.speechWaveRings) {
    WORLD.speechWaveRings.forEach((ring, i) => {
      const s = 1.0 + ((clock * 2.2 + i * 0.45) % 2.4);
      ring.scale.set(s, s, s);
      ring.material.opacity = Math.max(0, 0.8 - (s - 1.0) / 1.5);
    });
  }
  // 3. Clinical triage pulse beacon
  if (WORLD.triagePulse) {
    const s2 = 1.0 + ((clock * 2.4) % 2.5);
    WORLD.triagePulse.scale.set(s2, s2, s2);
    WORLD.triagePulse.material.opacity = Math.max(0, 0.75 - (s2 - 1.0) / 1.6);
  }
  // 4. Countertop live 3D Equalizer Spectrum Analyzer Bars
  if (WORLD.eqBars && WORLD.eqBars.length) {
    WORLD.eqBars.forEach((bar, idx) => {
      const s = 0.2 + Math.abs(Math.sin(clock * 6.5 + idx * 0.6)) * 1.8 + Math.sin(clock * 11.0 + idx) * 0.5;
      bar.scale.y = Math.max(0.15, s);
      bar.position.y = 0.2 * bar.scale.y;
    });
  }
  // 5. Traveling speech data packets along fiber optic lines
  if (WORLD.dataPackets) {
    WORLD.dataPackets.forEach((pkt, i) => {
      pkt.position.z = 10 - ((clock * 8.0 + i * 5.0) % 55);
      pkt.position.y = 1.6 + Math.sin(clock * 3.0 + i) * 0.35;
    });
  }
  `;
  html = html.substring(0, updateWorldStart) + newUpdateCode + '\n  ' + html.substring(updateWorldEnd);
  console.log("Successfully updated updateWorld() for real-time acoustic speech animations!");
}

fs.writeFileSync('index.html', html);
console.log("Done updating index.html!");
