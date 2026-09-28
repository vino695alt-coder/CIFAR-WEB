/**
 * Wonder Dash: Magic World - High Performance 3D Endless Runner Engine
 * Powered by Three.js with Object Pooling, Unified 60FPS Game Loop, and Universal Mouse/Touch/Keyboard Controls.
 */

class WonderEngine {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    
    // Core Three.js Objects
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    
    // Game State
    this.isRunning = false;
    this.isPaused = false;
    this.isGameOver = false;
    this.inMenuMode = true;
    
    // Run Stats
    this.worldId = "enchanted_forest";
    this.characterId = "milo";
    this.skinId = "classic";
    this.score = 0;
    this.coins = 0;
    this.gems = 0;
    this.distance = 0;
    this.currentSpeed = WONDER_CONFIG.GAMEPLAY.INITIAL_SPEED;
    this.multiplier = 1;
    
    // Player Controller
    this.currentLane = 1; // 0: Left (-2.5), 1: Center (0), 2: Right (2.5)
    this.targetLaneX = 0;
    this.playerY = 0;
    this.playerVy = 0;
    this.isGrounded = true;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.isInvulnerable = false;
    this.invulnerableTimer = 0;
    this.hasRevivedThisRun = false;
    
    // Power-up States
    this.activePowerups = {
      magnet: 0,
      shield: 0,
      wings: 0,
      multiplier: 0
    };
    this.shieldHitCount = 0;

    // Track Pooling
    this.segments = [];
    this.nextSegmentZ = 0;
    this.activeCoins = [];
    this.activeGems = [];
    this.activeObstacles = [];
    this.activePowerupPickups = [];
    this.activeProps = [];
    
    // Particle Engine
    this.particleSystems = [];
    this.weatherEmitter = null;
    
    // Visual References
    this.playerMesh = null;
    this.pedestalMesh = null;
    this.trackGroup = null;
    this.collectiblesGroup = null;
    this.obstaclesGroup = null;
    this.propsGroup = null;
    this.particlesGroup = null;
    this.dirLight = null;
    this.hemiLight = null;

    this.initScene();
    this.setupEventListeners();
  }

  initScene() {
    if (!this.container) {
      this.container = document.getElementById("game-canvas-container") || document.body;
    }

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x022c22, 0.011);

    const rect = this.container.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : (this.container.clientWidth || 400);
    const height = rect.height > 0 ? rect.height : (this.container.clientHeight || 700);
    const aspect = width / height;

    this.camera = new THREE.PerspectiveCamera(aspect < 1.0 ? 65 : 60, aspect, 0.5, 350);
    this.camera.position.set(0, 1.45, 4.0);
    this.camera.lookAt(0, 0.85, 0);

    // 2. Renderer with High-Vibrancy Tone Mapping
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (THREE.SRGBColorSpace) {
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.container.innerHTML = "";
    this.container.appendChild(this.renderer.domElement);

    // 3. Lighting (Hemisphere ambient + Top Sun + Front Face fill light + Dramatic Rim Light)
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.25);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.dirLight.position.set(10, 25, 15);
    this.dirLight.castShadow = true;
    this.scene.add(this.dirLight);

    const frontFillLight = new THREE.DirectionalLight(0xffffff, 0.95);
    frontFillLight.position.set(0, 4, 10);
    this.scene.add(frontFillLight);

    // Rim / Back light for crisp cartoon model outlines
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    rimLight.position.set(-10, 12, -15);
    this.scene.add(rimLight);

    // 4. Group Containers
    this.trackGroup = new THREE.Group();
    this.obstaclesGroup = new THREE.Group();
    this.collectiblesGroup = new THREE.Group();
    this.propsGroup = new THREE.Group();
    this.particlesGroup = new THREE.Group();

    this.scene.add(this.trackGroup);
    this.scene.add(this.obstaclesGroup);
    this.scene.add(this.collectiblesGroup);
    this.scene.add(this.propsGroup);
    this.scene.add(this.particlesGroup);

    // 5. Initial World Visuals & Particles
    this.applyWorldTheme(this.worldId);
    this.initWeatherParticles();

    // 6. Show initial Hero in Menu
    const initialChar = (window.WonderProgression && window.WonderProgression.state) ? 
                        window.WonderProgression.state.selectedCharacter : "milo";
    const initialSkin = (window.WonderProgression && window.WonderProgression.state) ? 
                        window.WonderProgression.state.selectedSkin : "classic";
    this.showMenuHero(initialChar, initialSkin);

    // 7. Start unified RAF loop
    this.clock.start();
    this.tick();
  }

  handleResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const rect = this.container.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : (this.container.clientWidth || 400);
    const height = rect.height > 0 ? rect.height : (this.container.clientHeight || 700);
    const aspect = width / height;

    this.camera.aspect = aspect;
    this.camera.fov = aspect < 1.0 ? 65 : 60;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  showMenuHero(characterId = "milo", skinId = "classic") {
    this.inMenuMode = true;
    this.isRunning = false;
    this.isPaused = false;
    this.isGameOver = false;
    this.characterId = characterId;
    this.skinId = skinId;

    // Clean up any leftover track entities so menu is spotless
    this.clearAllTrackEntities();

    if (this.playerMesh) {
      this.scene.remove(this.playerMesh);
    }
    if (this.pedestalMesh) {
      this.scene.remove(this.pedestalMesh);
    }

    const pedGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.35, 24);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.15,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.4
    });
    this.pedestalMesh = new THREE.Mesh(pedGeo, pedMat);
    this.pedestalMesh.position.set(0, -0.15, 0);
    this.scene.add(this.pedestalMesh);

    this.playerMesh = WonderModels.createCharacter(characterId, skinId);
    this.playerMesh.position.set(0, 0.05, 0);
    this.playerMesh.rotation.set(0, 0, 0);
    this.scene.add(this.playerMesh);

    this.camera.position.set(0, 1.45, 4.0);
    this.camera.lookAt(0, 0.85, 0);
  }

  applyWorldTheme(worldId) {
    this.worldId = worldId;
    const world = WONDER_CONFIG.WORLDS.find(w => w.id === worldId) || WONDER_CONFIG.WORLDS[0];

    const skyCol = new THREE.Color(world.skyColor);
    const fogCol = new THREE.Color(world.fogColor);
    
    this.scene.background = skyCol;
    this.scene.fog.color = fogCol;

    if (this.hemiLight) {
      this.hemiLight.color.set(world.skyColor);
      this.hemiLight.groundColor.set(world.groundColor);
    }
  }

  buildInitialTrack() {
    this.clearAllTrackEntities();
    if (this.pedestalMesh) {
      this.scene.remove(this.pedestalMesh);
      this.pedestalMesh = null;
    }

    this.nextSegmentZ = 10;
    for (let i = 0; i < WONDER_CONFIG.GAMEPLAY.ACTIVE_SEGMENTS; i++) {
      this.spawnTrackSegment(i === 0);
    }
  }

  spawnTrackSegment(isStarting = false) {
    const world = WONDER_CONFIG.WORLDS.find(w => w.id === this.worldId) || WONDER_CONFIG.WORLDS[0];
    const segLength = WONDER_CONFIG.GAMEPLAY.SEGMENT_LENGTH;
    const segZ = this.nextSegmentZ;
    this.nextSegmentZ -= segLength;

    const segmentGroup = new THREE.Group();
    segmentGroup.position.z = segZ;

    // Road surface with rich thematic ground material
    const groundGeo = new THREE.PlaneGeometry(8.2, segLength, 8, 8);
    const groundMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(world.groundColor),
      roughness: 0.4,
      metalness: 0.15
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, -segLength / 2);
    ground.receiveShadow = true;
    segmentGroup.add(ground);

    // Glowing lane dividers (Left & Right lane markings)
    [-1.3, 1.3].forEach(x => {
      for (let dz = -2; dz >= -segLength + 2; dz -= 6) {
        const dashGeo = new THREE.PlaneGeometry(0.16, 3.4);
        const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
        const dash = new THREE.Mesh(dashGeo, dashMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(x, 0.02, dz);
        segmentGroup.add(dash);
      }
    });

    // Glowing neon curb rails with accent color
    [-4.1, 4.1].forEach(x => {
      const curbGeo = new THREE.BoxGeometry(0.38, 0.48, segLength);
      const curbMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(world.accentColor),
        emissive: new THREE.Color(world.accentColor),
        emissiveIntensity: 0.6,
        roughness: 0.15,
        metalness: 0.3
      });
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.position.set(x, 0.24, -segLength / 2);
      segmentGroup.add(curb);
    });

    this.trackGroup.add(segmentGroup);
    this.segments.push(segmentGroup);

    // Overhead Arches every 2 segments for grand depth & visual landmarks
    if (Math.abs(segZ) % (segLength * 2) === 0 && !isStarting) {
      const arch = WonderModels.createOverheadArch(this.worldId);
      arch.position.set(0, 0, segZ - segLength / 2);
      this.propsGroup.add(arch);
      this.activeProps.push(arch);
    }

    // Side scenery props (trees, mushrooms, candy canes, crystal clusters, satellites)
    for (let pz = -4; pz >= -segLength + 4; pz -= 12) {
      [-6.5, 6.5].forEach(sideX => {
        const prop = WonderModels.createSideProp(this.worldId, sideX > 0 ? 1 : -1);
        prop.position.set(sideX + (Math.random() * 1.6 - 0.8), 0, segZ + pz);
        this.propsGroup.add(prop);
        this.activeProps.push(prop);
      });
    }

    if (isStarting) {
      for (let cz = -10; cz >= -segLength; cz -= 3) {
        this.spawnCoin(0, 0.6, segZ + cz);
      }
      return;
    }

    const stepCount = Math.floor(segLength / WONDER_CONFIG.GAMEPLAY.OBSTACLE_MIN_DIST);
    for (let s = 0; s < stepCount; s++) {
      const targetZ = segZ - (s * WONDER_CONFIG.GAMEPLAY.OBSTACLE_MIN_DIST + 8);
      this.populateTrackStep(targetZ);
    }
  }

  populateTrackStep(zPos) {
    const rand = Math.random();
    const lanes = WONDER_CONFIG.GAMEPLAY.LANES;

    if (rand < 0.35) {
      const laneIdx = Math.floor(Math.random() * 3);
      const obs = WonderModels.createObstacle("low_jump", this.worldId);
      obs.position.set(lanes[laneIdx], 0, zPos);
      obs.lane = laneIdx;
      this.obstaclesGroup.add(obs);
      this.activeObstacles.push(obs);

      [-4, -2, 0, 2, 4].forEach(dz => {
        const yHeight = 0.6 + Math.max(0, 1.8 - Math.abs(dz) * 0.4);
        this.spawnCoin(lanes[laneIdx], yHeight, zPos + dz);
      });

    } else if (rand < 0.60) {
      const laneIdx = Math.floor(Math.random() * 3);
      const obs = WonderModels.createObstacle("high_slide", this.worldId);
      obs.position.set(lanes[laneIdx], 0, zPos);
      obs.lane = laneIdx;
      this.obstaclesGroup.add(obs);
      this.activeObstacles.push(obs);

      [-3, 0, 3].forEach(dz => {
        this.spawnCoin(lanes[laneIdx], 0.35, zPos + dz);
      });

    } else if (rand < 0.85) {
      const blockedLane1 = Math.floor(Math.random() * 3);
      const blockedLane2 = Math.random() < 0.4 ? (blockedLane1 + 1) % 3 : -1;

      [blockedLane1, blockedLane2].forEach(laneIdx => {
        if (laneIdx >= 0) {
          const obs = WonderModels.createObstacle("lane_blocker", this.worldId);
          obs.position.set(lanes[laneIdx], 0, zPos);
          obs.lane = laneIdx;
          this.obstaclesGroup.add(obs);
          this.activeObstacles.push(obs);
        }
      });

      const openLanes = [0, 1, 2].filter(l => l !== blockedLane1 && l !== blockedLane2);
      if (openLanes.length > 0) {
        const openLane = openLanes[Math.floor(Math.random() * openLanes.length)];
        const itemRoll = Math.random();
        if (itemRoll < 0.12) {
          const pTypes = ["magnet", "shield", "wings", "multiplier", "gem_burst"];
          const pType = pTypes[Math.floor(Math.random() * pTypes.length)];
          this.spawnPowerupPickup(pType, lanes[openLane], 0.8, zPos);
        } else if (itemRoll < 0.22) {
          this.spawnGem(lanes[openLane], 0.8, zPos);
        } else {
          [-3, 0, 3].forEach(dz => {
            this.spawnCoin(lanes[openLane], 0.6, zPos + dz);
          });
        }
      }
    } else {
      const laneIdx = Math.floor(Math.random() * 3);
      for (let cz = -4; cz <= 4; cz += 2) {
        this.spawnCoin(lanes[laneIdx], 0.6, zPos + cz);
      }
    }
  }

  spawnCoin(x, y, z) {
    const coin = WonderModels.createCoinMesh();
    coin.position.set(x, y, z);
    coin.collected = false;
    this.collectiblesGroup.add(coin);
    this.activeCoins.push(coin);
  }

  spawnGem(x, y, z) {
    const gem = WonderModels.createGemMesh();
    gem.position.set(x, y, z);
    gem.collected = false;
    this.collectiblesGroup.add(gem);
    this.activeGems.push(gem);
  }

  spawnPowerupPickup(type, x, y, z) {
    const pMesh = WonderModels.createPowerupMesh(type);
    pMesh.position.set(x, y, z);
    pMesh.powerupType = type;
    pMesh.collected = false;
    this.collectiblesGroup.add(pMesh);
    this.activePowerupPickups.push(pMesh);
  }

  // ----------------------------------------------------
  // PARTICLE SYSTEMS
  // ----------------------------------------------------

  initWeatherParticles() {
    const count = 150;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 35;
      positions[i + 1] = Math.random() * 20;
      positions[i + 2] = -Math.random() * 120;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.35,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.weatherEmitter = new THREE.Points(geometry, material);
    this.particlesGroup.add(this.weatherEmitter);
  }

  updateWeatherParticles(dt) {
    if (!this.weatherEmitter) return;
    const positions = this.weatherEmitter.geometry.attributes.position.array;
    const playerZ = this.playerMesh ? this.playerMesh.position.z : 0;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] -= dt * 2.0;
      if (positions[i + 2] > playerZ + 15) {
        positions[i + 2] = playerZ - 100 - Math.random() * 20;
      }
      if (positions[i + 1] < 0) {
        positions[i + 1] = 18 + Math.random() * 5;
      }
    }
    this.weatherEmitter.geometry.attributes.position.needsUpdate = true;
  }

  triggerSparkBurst(x, y, z, colorHex = 0xf1c40f) {
    const count = 16;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vel = [];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      vel.push({
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 8 + 2,
        vz: (Math.random() - 0.5) * 8
      });
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: colorHex,
      size: 0.45,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    const pSystem = new THREE.Points(geo, mat);
    pSystem.vel = vel;
    pSystem.life = 0.5;
    this.particlesGroup.add(pSystem);
    this.particleSystems.push(pSystem);
  }

  // ----------------------------------------------------
  // RUN LIFECYCLE
  // ----------------------------------------------------

  startRun(worldId = "enchanted_forest", characterId = "milo", skinId = "classic") {
    this.inMenuMode = false;
    this.worldId = worldId;
    this.characterId = characterId;
    this.skinId = skinId;

    this.score = 0;
    this.coins = 0;
    this.gems = 0;
    this.distance = 0;
    this.currentSpeed = WONDER_CONFIG.GAMEPLAY.INITIAL_SPEED;
    this.multiplier = 1;
    this.currentLane = 1;
    this.targetLaneX = 0;
    this.playerY = 0;
    this.playerVy = 0;
    this.isGrounded = true;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.isInvulnerable = false;
    this.invulnerableTimer = 0;
    this.hasRevivedThisRun = false;
    this.activePowerups = { magnet: 0, shield: 0, wings: 0, multiplier: 0 };
    this.shieldHitCount = 0;

    this.applyWorldTheme(worldId);

    if (this.playerMesh) {
      this.scene.remove(this.playerMesh);
    }
    this.playerMesh = WonderModels.createCharacter(characterId, skinId);
    this.playerMesh.position.set(0, 0, 0);
    this.playerMesh.rotation.set(0, Math.PI, 0);
    this.scene.add(this.playerMesh);

    const charData = WONDER_CONFIG.CHARACTERS.find(c => c.id === characterId);
    if (charData && charData.id === "pip") {
      this.activePowerups.shield = 999;
      this.shieldHitCount = 1;
    }

    this.buildInitialTrack();

    this.isRunning = true;
    this.isPaused = false;
    this.isGameOver = false;

    this.camera.position.set(0, 3.8, 6.5);
    this.camera.lookAt(0, 1.2, -10.0);

    WonderAudio.playMusicForWorld(worldId);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    this.clock.getDelta();
  }

  revivePlayer() {
    this.isGameOver = false;
    this.isRunning = true;
    this.isPaused = false;
    this.hasRevivedThisRun = true;
    
    if (this.playerMesh) {
      const pz = this.playerMesh.position.z;
      this.activeObstacles = this.activeObstacles.filter(obs => {
        if (obs.position.z <= pz && obs.position.z >= pz - 45) {
          this.obstaclesGroup.remove(obs);
          return false;
        }
        return true;
      });
    }

    this.isInvulnerable = true;
    this.invulnerableTimer = 3.5;
    this.playerY = 0;
    this.playerVy = 0;
    this.isGrounded = true;

    WonderAudio.playPowerup();
  }

  triggerGameOver() {
    if (this.isGameOver) return;
    this.isRunning = false;
    this.isGameOver = true;

    WonderAudio.playHit();
    WonderAudio.playGameOver();

    if (window.onWonderGameOver) {
      window.onWonderGameOver({
        score: Math.floor(this.score),
        coins: this.coins,
        gems: this.gems,
        distance: Math.floor(this.distance),
        worldId: this.worldId,
        canRevive: !this.hasRevivedThisRun
      });
    }
  }

  // ----------------------------------------------------
  // PLAYER CONTROLS
  // ----------------------------------------------------

  changeLane(direction) {
    if (!this.isRunning || this.isPaused || this.isGameOver) return;
    const newLane = Math.max(0, Math.min(2, this.currentLane + direction));
    if (newLane !== this.currentLane) {
      this.currentLane = newLane;
      this.targetLaneX = WONDER_CONFIG.GAMEPLAY.LANES[this.currentLane];
      WonderAudio.playJump();
    }
  }

  jump() {
    if (!this.isRunning || this.isPaused || this.isGameOver) return;
    if (this.isGrounded || this.activePowerups.wings > 0) {
      this.isJumping = true;
      this.isGrounded = false;
      this.isSliding = false;
      this.playerVy = WONDER_CONFIG.GAMEPLAY.JUMP_FORCE;
      WonderAudio.playJump();
    }
  }

  slide() {
    if (!this.isRunning || this.isPaused || this.isGameOver) return;
    if (this.activePowerups.wings > 0) return;
    
    this.isSliding = true;
    this.slideTimer = WONDER_CONFIG.GAMEPLAY.SLIDE_DURATION;
    if (!this.isGrounded) {
      this.playerVy = -WONDER_CONFIG.GAMEPLAY.JUMP_FORCE * 1.5;
    }
    WonderAudio.playSlide();
  }

  // ----------------------------------------------------
  // UNIFIED 60FPS TICK LOOP
  // ----------------------------------------------------

  tick() {
    requestAnimationFrame(() => this.tick());

    const dt = Math.min(this.clock.getDelta(), 0.05);

    if (this.isRunning && !this.isPaused && !this.isGameOver) {
      this.updatePlayer(dt);
      this.updatePowerups(dt);
      this.updateTrackAndEntities(dt);
      this.updateCollisions(dt);
      this.updateParticles(dt);
      this.updateCamera(dt);
    } else {
      this.updateMenuHero(dt);
      this.updateWeatherParticles(dt);
    }

    this.renderer.render(this.scene, this.camera);
  }

  updateMenuHero(dt) {
    if (!this.playerMesh) return;
    const time = Date.now() * 0.0025;

    // Smooth gentle turntable rotation with camera face
    this.playerMesh.rotation.y = Math.sin(time * 0.8) * 0.45;
    this.playerMesh.position.y = 0.05 + Math.sin(time * 2.5) * 0.05;

    if (this.pedestalMesh) {
      this.pedestalMesh.rotation.y += dt * 0.6;
    }

    if (this.playerMesh.animNodes) {
      const nodes = this.playerMesh.animNodes;

      // Breathing squash & stretch
      const breath = Math.sin(time * 3.0);
      nodes.bodyPivot.scale.set(1 + breath * 0.02, 1 - breath * 0.025, 1 + breath * 0.02);
      nodes.bodyPivot.rotation.z = Math.sin(time * 1.5) * 0.04;
      nodes.bodyPivot.rotation.x = Math.sin(time * 1.0) * 0.03;

      // Inquisitive head tilt
      nodes.headPivot.rotation.y = Math.sin(time * 1.2) * 0.22;
      nodes.headPivot.rotation.z = Math.cos(time * 0.9) * 0.08;
      nodes.headPivot.rotation.x = Math.sin(time * 2.0) * 0.05;

      // Weight-shifting stepping feet
      nodes.leftLeg.rotation.x = Math.sin(time * 2.0) * 0.16;
      nodes.rightLeg.rotation.x = -Math.sin(time * 2.0) * 0.16;
      nodes.leftLeg.position.y = Math.max(0, -Math.sin(time * 2.0)) * 0.06 + 0.35;
      nodes.rightLeg.position.y = Math.max(0, Math.sin(time * 2.0)) * 0.06 + 0.35;

      // Expressive arm sway / idle gestures
      nodes.leftArm.rotation.x = Math.sin(time * 2.0) * 0.25 + 0.1;
      nodes.rightArm.rotation.x = -Math.sin(time * 2.0) * 0.25 + 0.1;
      nodes.leftArm.rotation.z = -0.15 - Math.sin(time * 1.5) * 0.08;
      nodes.rightArm.rotation.z = 0.15 + Math.sin(time * 1.5) * 0.08;

      // Tail swish
      if (nodes.tailPivot) {
        nodes.tailPivot.rotation.y = Math.sin(time * 3.2) * 0.6;
        nodes.tailPivot.rotation.z = Math.cos(time * 2.0) * 0.18;
      }

      // Wings flutter
      if (nodes.wingsPivot) {
        nodes.wingsPivot.rotation.y = Math.sin(time * 8.0) * 0.45;
      }

      // Scarf / Cape flutter
      if (nodes.scarfPivot) nodes.scarfPivot.rotation.x = Math.PI / 2 + Math.sin(time * 4) * 0.15;
      if (nodes.capePivot) nodes.capePivot.rotation.x = 0.2 + Math.sin(time * 3) * 0.12;
    }
  }

  updatePlayer(dt) {
    if (!this.playerMesh) return;

    const speed = this.currentSpeed * (this.activePowerups.wings > 0 ? 1.35 : 1.0);
    this.playerMesh.position.z -= speed * dt;
    this.distance += speed * dt;

    this.currentSpeed = Math.min(
      WONDER_CONFIG.GAMEPLAY.MAX_SPEED,
      WONDER_CONFIG.GAMEPLAY.INITIAL_SPEED + (this.distance / 100.0) * WONDER_CONFIG.GAMEPLAY.SPEED_ACCELERATION
    );

    const scoreMultiplier = (this.activePowerups.multiplier > 0 ? 2 : 1) * this.multiplier;
    this.score += speed * dt * scoreMultiplier;

    // Smooth responsive lane switching
    this.playerMesh.position.x += (this.targetLaneX - this.playerMesh.position.x) * WONDER_CONFIG.GAMEPLAY.LANE_SWITCH_SPEED * dt;

    // Dynamic Motorcycle Banking & Lean into Lane Changes
    const laneDelta = this.targetLaneX - this.playerMesh.position.x;
    this.playerMesh.rotation.z = -laneDelta * 0.32;
    this.playerMesh.rotation.y = Math.PI - laneDelta * 0.22;

    if (this.activePowerups.wings > 0) {
      const targetFlyY = 4.2 + Math.sin(Date.now() * 0.006) * 0.35;
      this.playerY += (targetFlyY - this.playerY) * 8.0 * dt;
      this.playerMesh.position.y = this.playerY;
    } else {
      if (!this.isGrounded) {
        this.playerVy += WONDER_CONFIG.GAMEPLAY.GRAVITY * dt;
        this.playerY += this.playerVy * dt;
        if (this.playerY <= 0) {
          this.playerY = 0;
          this.playerVy = 0;
          this.isGrounded = true;
          this.isJumping = false;
          this.landingSquash = 0.22;
          this.triggerSparkBurst(this.playerMesh.position.x, 0.1, this.playerMesh.position.z, 0xffffff);
        }
      }
      this.playerMesh.position.y = this.playerY;

      if (this.isSliding) {
        this.slideTimer -= dt;
        if (this.slideTimer <= 0) {
          this.isSliding = false;
        }
        if (Math.random() < 0.4) {
          this.triggerSparkBurst(this.playerMesh.position.x + (Math.random() * 0.4 - 0.2), 0.15, this.playerMesh.position.z + 0.3, 0xf39c12, 4);
        }
      } else if (this.isGrounded) {
        // Magical Stardust Footstep Trail behind sneakers
        if (Math.random() < 0.65) {
          const isLeo = this.characterId === "leo";
          const trailColor = isLeo ? (Math.random() < 0.5 ? 0xf43f5e : 0xf1c40f) : 0x00f0ff;
          this.triggerSparkBurst(
            this.playerMesh.position.x + (Math.random() * 0.32 - 0.16),
            0.12,
            this.playerMesh.position.z + 0.35,
            trailColor,
            isLeo ? 3 : 2
          );
        }
      }
    }

    if (this.isInvulnerable) {
      this.invulnerableTimer -= dt;
      this.playerMesh.visible = Math.floor(Date.now() / 80) % 2 === 0;
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
        this.playerMesh.visible = true;
      }
    } else {
      this.playerMesh.visible = true;
    }

    this.animateCharacter(dt);

    if (window.onWonderHudUpdate) {
      window.onWonderHudUpdate({
        score: Math.floor(this.score),
        coins: this.coins,
        gems: this.gems,
        distance: Math.floor(this.distance),
        speed: Math.floor(this.currentSpeed),
        powerups: this.activePowerups
      });
    }
  }

  animateCharacter(dt) {
    if (!this.playerMesh || !this.playerMesh.animNodes) return;
    const nodes = this.playerMesh.animNodes;

    if (this.landingSquash > 0) {
      this.landingSquash -= dt * 3.0;
      if (this.landingSquash < 0) this.landingSquash = 0;
    }

    if (this.activePowerups.wings > 0) {
      // Superhero Flying Animation
      nodes.bodyPivot.rotation.x = -1.15;
      nodes.bodyPivot.position.y = -0.15;
      nodes.headPivot.rotation.x = 0.85;
      nodes.leftLeg.rotation.x = 0.2;
      nodes.rightLeg.rotation.x = 0.3;
      nodes.leftArm.rotation.x = 2.6;
      nodes.rightArm.rotation.x = 2.6;
      if (nodes.wingsPivot) nodes.wingsPivot.rotation.y = Math.sin(Date.now() * 0.035) * 1.25;
      if (nodes.tailPivot) nodes.tailPivot.rotation.y = Math.sin(Date.now() * 0.01) * 0.3;

    } else if (this.isSliding) {
      // Aerodynamic Slide Tuck
      nodes.bodyPivot.rotation.x = -1.35;
      nodes.bodyPivot.position.y = -0.42;
      nodes.bodyPivot.scale.set(1.15, 0.7, 1.2);
      nodes.headPivot.rotation.x = 0.75;
      nodes.leftLeg.rotation.x = 1.5;
      nodes.rightLeg.rotation.x = 1.5;
      nodes.leftLeg.position.y = 0.2;
      nodes.rightLeg.position.y = 0.2;
      nodes.leftArm.rotation.x = -1.2;
      nodes.rightArm.rotation.x = -1.2;
      if (nodes.capePivot) nodes.capePivot.rotation.x = 0.8;

    } else if (!this.isGrounded) {
      // Jumping / In-Air Acrobatics
      nodes.bodyPivot.rotation.x = 0.15;
      nodes.bodyPivot.position.y = 0;
      nodes.bodyPivot.scale.set(0.88, 1.28, 0.88);
      nodes.headPivot.rotation.x = -0.1;
      nodes.leftLeg.rotation.x = -0.85;
      nodes.rightLeg.rotation.x = -0.85;
      nodes.leftLeg.position.y = 0.45;
      nodes.rightLeg.position.y = 0.45;
      nodes.leftArm.rotation.x = 2.5;
      nodes.rightArm.rotation.x = 2.5;
      if (nodes.tailPivot) nodes.tailPivot.rotation.x = -0.4;
      if (nodes.capePivot) nodes.capePivot.rotation.x = 0.6;

    } else {
      // Full Athletic Running Sprint
      this.runCycle = (this.runCycle || 0) + dt * Math.max(14.0, this.currentSpeed * 0.92);
      const cycle = this.runCycle;
      const legAngle = Math.sin(cycle) * 1.15;

      // Dynamic squash & stretch with landing bounce
      const squash = this.landingSquash || 0;
      nodes.bodyPivot.scale.set(1.0 + squash * 0.3, 1.0 - squash * 0.4, 1.0 + squash * 0.3);

      // Stride bounce & athletic forward lean
      nodes.bodyPivot.rotation.x = -0.22 - (this.currentSpeed / 130.0);
      nodes.bodyPivot.position.y = Math.abs(Math.sin(cycle * 2)) * 0.14 - squash * 0.2;
      nodes.bodyPivot.rotation.y = Math.sin(cycle) * 0.12;
      nodes.bodyPivot.rotation.z = Math.sin(cycle) * 0.08;

      // Alternating legs with high knee lift & foot swing
      nodes.leftLeg.rotation.x = legAngle;
      nodes.rightLeg.rotation.x = -legAngle;
      nodes.leftLeg.position.y = Math.max(0, -legAngle) * 0.18 + 0.35;
      nodes.rightLeg.position.y = Math.max(0, legAngle) * 0.18 + 0.35;

      // Pumping arms synced with opposite legs
      nodes.leftArm.rotation.x = -legAngle * 1.15;
      nodes.rightArm.rotation.x = legAngle * 1.15;
      nodes.leftArm.rotation.z = -0.18;
      nodes.rightArm.rotation.z = 0.18;

      // Head bob & focus
      nodes.headPivot.position.y = 1.15 + Math.abs(Math.sin(cycle * 2)) * 0.06;
      nodes.headPivot.rotation.x = 0.12;
      nodes.headPivot.rotation.y = -Math.sin(cycle) * 0.06;

      // Secondary motion on tails, wings, scarf & cape
      if (nodes.tailPivot) {
        nodes.tailPivot.rotation.y = Math.sin(cycle * 1.5) * 0.55;
        nodes.tailPivot.rotation.z = Math.cos(cycle) * 0.2;
      }
      if (nodes.wingsPivot) {
        nodes.wingsPivot.rotation.y = Math.sin(Date.now() * 0.02) * 0.65;
      }
      if (nodes.scarfPivot) {
        nodes.scarfPivot.rotation.x = Math.PI / 2 + 0.3 + Math.sin(cycle * 2) * 0.25;
      }
      if (nodes.capePivot) {
        nodes.capePivot.rotation.x = 0.35 + Math.sin(cycle * 2) * 0.22;
      }
    }
  }

  updatePowerups(dt) {
    for (const key in this.activePowerups) {
      if (this.activePowerups[key] > 0 && this.activePowerups[key] !== 999) {
        this.activePowerups[key] -= dt;
        if (this.activePowerups[key] <= 0) {
          this.activePowerups[key] = 0;
        }
      }
    }
  }

  updateTrackAndEntities(dt) {
    if (!this.playerMesh) return;
    const playerZ = this.playerMesh.position.z;

    if (playerZ < this.nextSegmentZ + (WONDER_CONFIG.GAMEPLAY.ACTIVE_SEGMENTS - 2) * WONDER_CONFIG.GAMEPLAY.SEGMENT_LENGTH) {
      this.spawnTrackSegment(false);
    }

    while (this.segments.length > WONDER_CONFIG.GAMEPLAY.ACTIVE_SEGMENTS + 2) {
      const oldSeg = this.segments.shift();
      this.trackGroup.remove(oldSeg);
    }

    this.activeCoins.forEach(coin => { coin.rotation.y += dt * 3.5; });
    this.activeGems.forEach(gem => { gem.rotation.y += dt * 4.0; gem.rotation.x += dt * 2.0; });
    this.activePowerupPickups.forEach(p => {
      p.rotation.y += dt * 3.0;
      p.position.y += Math.sin(Date.now() * 0.005) * 0.005;
    });

    if (this.activePowerups.magnet > 0) {
      const magnetRadius = 16.0;
      this.activeCoins.forEach(coin => {
        if (!coin.collected) {
          const dist = coin.position.distanceTo(this.playerMesh.position);
          if (dist < magnetRadius) coin.position.lerp(this.playerMesh.position, 14.0 * dt);
        }
      });
      this.activeGems.forEach(gem => {
        if (!gem.collected) {
          const dist = gem.position.distanceTo(this.playerMesh.position);
          if (dist < magnetRadius) gem.position.lerp(this.playerMesh.position, 14.0 * dt);
        }
      });
    }

    this.activeCoins = this.activeCoins.filter(c => {
      if (c.position.z > playerZ + 20 || c.collected) {
        this.collectiblesGroup.remove(c);
        return false;
      }
      return true;
    });

    this.activeGems = this.activeGems.filter(g => {
      if (g.position.z > playerZ + 20 || g.collected) {
        this.collectiblesGroup.remove(g);
        return false;
      }
      return true;
    });

    this.activePowerupPickups = this.activePowerupPickups.filter(p => {
      if (p.position.z > playerZ + 20 || p.collected) {
        this.collectiblesGroup.remove(p);
        return false;
      }
      return true;
    });

    this.activeObstacles = this.activeObstacles.filter(o => {
      if (o.position.z > playerZ + 20) {
        this.obstaclesGroup.remove(o);
        return false;
      }
      return true;
    });

    this.activeProps = this.activeProps.filter(p => {
      if (p.position.z > playerZ + 30) {
        this.propsGroup.remove(p);
        return false;
      }
      return true;
    });
  }

  updateCollisions(dt) {
    if (!this.playerMesh || this.isGameOver) return;
    const px = this.playerMesh.position.x;
    const py = this.playerMesh.position.y;
    const pz = this.playerMesh.position.z;

    this.activeCoins.forEach(coin => {
      if (!coin.collected) {
        const dx = Math.abs(coin.position.x - px);
        const dy = Math.abs(coin.position.y - py);
        const dz = Math.abs(coin.position.z - pz);

        if (dx < 1.1 && dy < 1.4 && dz < 1.2) {
          coin.collected = true;
          this.coins += 1;
          this.score += 50 * (this.activePowerups.multiplier > 0 ? 2 : 1);
          WonderAudio.playCoin();
          this.triggerSparkBurst(coin.position.x, coin.position.y, coin.position.z, 0xf1c40f);
        }
      }
    });

    this.activeGems.forEach(gem => {
      if (!gem.collected) {
        const dx = Math.abs(gem.position.x - px);
        const dy = Math.abs(gem.position.y - py);
        const dz = Math.abs(gem.position.z - pz);

        if (dx < 1.2 && dy < 1.4 && dz < 1.2) {
          gem.collected = true;
          this.gems += 1;
          this.score += 250 * (this.activePowerups.multiplier > 0 ? 2 : 1);
          WonderAudio.playGem();
          this.triggerSparkBurst(gem.position.x, gem.position.y, gem.position.z, 0x9b59b6);
        }
      }
    });

    this.activePowerupPickups.forEach(p => {
      if (!p.collected) {
        const dx = Math.abs(p.position.x - px);
        const dy = Math.abs(p.position.y - py);
        const dz = Math.abs(p.position.z - pz);

        if (dx < 1.3 && dy < 1.5 && dz < 1.3) {
          p.collected = true;
          this.applyPowerup(p.powerupType);
          WonderAudio.playPowerup();
          this.triggerSparkBurst(p.position.x, p.position.y, p.position.z, 0x00d2d3);
        }
      }
    });

    if (this.isInvulnerable || this.activePowerups.wings > 0) return;

    this.activeObstacles.forEach(obs => {
      const dx = Math.abs(obs.position.x - px);
      const dz = Math.abs(obs.position.z - pz);

      if (dx < 1.45 && dz < 1.45) {
        const hitBox = obs.hitBox || { type: "blocker" };

        if (hitBox.type === "low") {
          if (py >= 0.95) return; // Successfully jumped over
        } else if (hitBox.type === "high") {
          if (this.isSliding) return; // Successfully slid under
        }

        if (this.activePowerups.shield > 0 || this.shieldHitCount > 0) {
          if (this.shieldHitCount > 0) {
            this.shieldHitCount--;
            if (this.shieldHitCount <= 0) this.activePowerups.shield = 0;
          } else {
            this.activePowerups.shield = 0;
          }
          WonderAudio.playShieldBreak();
          this.isInvulnerable = true;
          this.invulnerableTimer = 2.0;
          this.triggerSparkBurst(px, py + 1.0, pz, 0x3498db);
        } else {
          this.triggerGameOver();
        }
      }
    });
  }

  applyPowerup(type) {
    const config = WONDER_CONFIG.POWER_UPS[type.toUpperCase()] || { baseDuration: 8.0 };
    const charData = WONDER_CONFIG.CHARACTERS.find(c => c.id === this.characterId);
    let duration = config.baseDuration;

    if (type === "magnet") {
      if (charData && charData.perk.magnetBonus) duration *= (1 + charData.perk.magnetBonus);
      this.activePowerups.magnet = duration;
    } else if (type === "shield") {
      if (charData && charData.perk.shieldBonus) duration *= (1 + charData.perk.shieldBonus);
      this.activePowerups.shield = duration;
      this.shieldHitCount = 1;
    } else if (type === "wings") {
      if (charData && charData.perk.wingsBonus) duration *= (1 + charData.perk.wingsBonus);
      this.activePowerups.wings = duration;
    } else if (type === "multiplier") {
      if (charData && charData.perk.multiplierBonus) duration *= (1 + charData.perk.multiplierBonus);
      this.activePowerups.multiplier = duration;
    } else if (type === "gem_burst") {
      for (let i = 1; i <= 6; i++) {
        this.spawnGem(this.targetLaneX, 0.8, this.playerMesh.position.z - i * 4);
      }
    }
  }

  initWeatherParticles() {
    if (this.weatherEmitter) {
      this.particlesGroup.remove(this.weatherEmitter);
      this.weatherEmitter = null;
    }

    const particleCount = 140;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const world = WONDER_CONFIG.WORLDS.find(w => w.id === this.worldId) || WONDER_CONFIG.WORLDS[0];
    const baseCol = new THREE.Color(world.accentColor || 0xfbbf24);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = Math.random() * 12 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      const c = (Math.random() > 0.5) ? baseCol : new THREE.Color(0xffffff);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.weatherEmitter = new THREE.Points(geometry, material);
    this.particlesGroup.add(this.weatherEmitter);
  }

  updateWeatherParticles(dt) {
    if (!this.weatherEmitter) return;
    const positions = this.weatherEmitter.geometry.attributes.position.array;
    const count = positions.length / 3;
    const refZ = this.playerMesh ? this.playerMesh.position.z : 0;

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] += Math.sin(Date.now() * 0.002 + i) * dt * 0.4;
      positions[i * 3] += Math.cos(Date.now() * 0.0015 + i) * dt * 0.2;

      if (this.isRunning && !this.isPaused) {
        if (positions[i * 3 + 2] > refZ + 15) {
          positions[i * 3 + 2] = refZ - 45 - Math.random() * 15;
          positions[i * 3] = (Math.random() - 0.5) * 20;
          positions[i * 3 + 1] = Math.random() * 10 + 0.5;
        }
      }
    }
    this.weatherEmitter.geometry.attributes.position.needsUpdate = true;
  }

  triggerSparkBurst(x, y, z, colorHex = 0xf1c40f, count = 12) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vel = [];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5.0 + 2.0;
      vel.push({
        vx: Math.cos(angle) * speed,
        vy: Math.random() * 5.0 + 2.0,
        vz: Math.sin(angle) * speed * 0.6
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: new THREE.Color(colorHex),
      size: 0.38,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    const ps = new THREE.Points(geo, mat);
    ps.vel = vel;
    ps.life = 0.45;
    ps.maxLife = 0.45;

    this.particlesGroup.add(ps);
    this.particleSystems.push(ps);
  }

  updateParticles(dt) {
    this.updateWeatherParticles(dt);

    for (let i = this.particleSystems.length - 1; i >= 0; i--) {
      const ps = this.particleSystems[i];
      ps.life -= dt;
      const positions = ps.geometry.attributes.position.array;

      for (let j = 0; j < ps.vel.length; j++) {
        positions[j * 3] += ps.vel[j].vx * dt;
        positions[j * 3 + 1] += ps.vel[j].vy * dt;
        positions[j * 3 + 2] += ps.vel[j].vz * dt;
        ps.vel[j].vy -= 9.8 * dt;
      }
      ps.geometry.attributes.position.needsUpdate = true;
      ps.material.opacity = ps.life / 0.5;

      if (ps.life <= 0) {
        this.particlesGroup.remove(ps);
        this.particleSystems.splice(i, 1);
      }
    }
  }

  updateCamera(dt) {
    if (!this.playerMesh) return;
    const px = this.playerMesh.position.x;
    const py = this.playerMesh.position.y;
    const pz = this.playerMesh.position.z;

    const targetCamX = px * 0.45;
    const targetCamY = py * 0.35 + 3.8;
    const targetCamZ = pz + 6.5;

    this.camera.position.x += (targetCamX - this.camera.position.x) * 10 * dt;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 10 * dt;
    this.camera.position.z = targetCamZ;

    this.camera.lookAt(px * 0.5, py * 0.4 + 1.2, pz - 10.0);

    const targetFov = 60 + (this.currentSpeed - 18) * 0.4 + (this.activePowerups.wings > 0 ? 8 : 0);
    this.camera.fov += (targetFov - this.camera.fov) * 5 * dt;
    this.camera.updateProjectionMatrix();

    this.dirLight.position.set(px + 15, 30, pz + 15);
    this.dirLight.target.position.set(px, 0, pz);
  }

  clearAllTrackEntities() {
    this.segments.forEach(seg => this.trackGroup.remove(seg));
    this.segments = [];

    this.activeCoins.forEach(c => this.collectiblesGroup.remove(c));
    this.activeCoins = [];

    this.activeGems.forEach(g => this.collectiblesGroup.remove(g));
    this.activeGems = [];

    this.activePowerupPickups.forEach(p => this.collectiblesGroup.remove(p));
    this.activePowerupPickups = [];

    this.activeObstacles.forEach(o => this.obstaclesGroup.remove(o));
    this.activeObstacles = [];

    this.activeProps.forEach(p => this.propsGroup.remove(p));
    this.activeProps = [];
  }

  // ----------------------------------------------------
  // UNIVERSAL EVENT LISTENERS (Mouse, Touch, Keyboard)
  // ----------------------------------------------------

  setupEventListeners() {
    window.addEventListener('resize', () => this.handleResize());

    if (this.container) {
      this.container.addEventListener('pointerdown', () => {
        try { window.focus(); } catch (_) {}
      });
    }

    // Keyboard Controls with scroll prevention and auto-focus
    window.addEventListener('keydown', (e) => {
      const gameKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Space', 'a', 'A', 'd', 'D', 'w', 'W', 's', 'S', 'p', 'P', 'Escape'];
      if (gameKeys.includes(e.key) && this.isRunning && !this.isGameOver) {
        e.preventDefault();
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.changeLane(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.changeLane(1);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ' || e.key === 'Space') {
        this.jump();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        this.slide();
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (window.togglePauseGame) window.togglePauseGame();
      }
    });

    // Universal Pointer Drag / Swipe / Click Tracking
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let isPointerActive = false;

    const isInteractiveElement = (el) => {
      if (!el) return false;
      return !!el.closest('button, input, select, textarea, a, .nav-icon-btn, .currency-pill, .char-card, .world-card, .switch-toggle, .menu-hero-info-badge, .menu-world-selector-bar, .dialog-card, .dev-floating-controls, .btn-touch-action');
    };

    const handlePointerStart = (clientX, clientY, target) => {
      try { window.focus(); } catch (_) {}
      if (isInteractiveElement(target)) {
        return;
      }
      startX = clientX;
      startY = clientY;
      startTime = Date.now();
      isPointerActive = true;
    };

    const handlePointerEnd = (clientX, clientY, target) => {
      if (!isPointerActive) return;
      isPointerActive = false;

      const dx = clientX - startX;
      const dy = clientY - startY;
      const elapsed = Date.now() - startTime;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (this.isRunning && !this.isPaused && !this.isGameOver) {
        // In gameplay: Swipe gesture
        if (absDx > 20 || absDy > 20) {
          if (absDx > absDy) {
            if (dx < 0) this.changeLane(-1);
            else this.changeLane(1);
          } else {
            if (dy < 0) this.jump();
            else this.slide();
          }
        } else if (elapsed < 350) {
          // Tap on screen zone relative to the game canvas container
          const rect = this.container.getBoundingClientRect();
          const relX = clientX - rect.left;
          const relY = clientY - rect.top;
          const width = rect.width;
          const height = rect.height;

          if (relX >= 0 && relX <= width && relY >= 0 && relY <= height) {
            if (relY > height * 0.70) {
              this.slide();
            } else if (relY < height * 0.30) {
              this.jump();
            } else if (relX < width * 0.38) {
              this.changeLane(-1);
            } else if (relX > width * 0.62) {
              this.changeLane(1);
            } else {
              this.jump();
            }
          }
        }
      }
    };

    // Touch events
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        handlePointerStart(e.touches[0].clientX, e.touches[0].clientY, e.target);
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 0) {
        handlePointerEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY, e.target);
      }
    }, { passive: true });

    // Mouse events for desktop
    window.addEventListener('mousedown', (e) => {
      handlePointerStart(e.clientX, e.clientY, e.target);
    });

    window.addEventListener('mouseup', (e) => {
      handlePointerEnd(e.clientX, e.clientY, e.target);
    });
  }
}

window.WonderEngine = WonderEngine;
