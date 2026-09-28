/**
 * Wonder Dash: Magic World - Main Application Bootstrap & UI Manager
 * Handles UI Screen transitions, Hero Carousel, HUD updates, Dialogs, Store, and Game Loop events.
 */

class WonderApp {
  constructor() {
    this.currentScreen = "MENU";
    this.engine = null;
    this.lastGameOverData = null;
    this.currentMenuCharIndex = 0;

    this.init();
  }

  init() {
    // 1. Setup Global Callbacks
    window.onWonderHudUpdate = (hudData) => this.updateHud(hudData);
    window.onWonderGameOver = (endData) => this.handleGameOver(endData);
    window.onWonderStateUpdated = (state) => this.refreshCurrencies(state);
    window.togglePauseGame = () => this.togglePause();
    window.showToast = (msg, type) => this.showToast(msg, type);

    // 2. Find initial hero index safely
    const prog = window.WonderProgression || WonderProgression;
    const progState = (prog && prog.state) ? prog.state : { selectedCharacter: "milo", dailyStreak: 1 };
    const savedChar = progState.selectedCharacter || "milo";
    const foundIdx = WONDER_CONFIG.CHARACTERS.findIndex(c => c.id === savedChar);
    if (foundIdx >= 0) this.currentMenuCharIndex = foundIdx;

    // 3. Bind UI Buttons FIRST so all clicks work under all circumstances
    this.bindButtons();

    // 4. Initialize 3D Game Engine safely
    try {
      if (typeof THREE !== "undefined") {
        this.engine = new WonderEngine("game-canvas-container");
      } else {
        console.error("Three.js library not loaded yet.");
      }
    } catch (err) {
      console.error("Error initializing 3D Game Engine:", err);
    }

    // 5. Initial UI Sync & Show Hero
    if (prog && prog.state) {
      this.refreshCurrencies(prog.state);
    }
    this.updateMenuHeroDisplay();
    this.showScreen("screen-menu");

    // Check if daily reward badge
    if (prog && prog.state) {
      const canClaim = prog.canClaimDailyReward(prog.state.dailyStreak);
      const dailyBadge = document.getElementById("daily-reward-badge");
      if (dailyBadge) {
        dailyBadge.style.display = canClaim ? "inline-block" : "none";
      }
    }

    // Play menu music on first gesture
    const startAudioOnGesture = () => {
      WonderAudio.playMusicForWorld("menu");
      window.removeEventListener("pointerdown", startAudioOnGesture);
      window.removeEventListener("keydown", startAudioOnGesture);
    };
    window.addEventListener("pointerdown", startAudioOnGesture);
    window.addEventListener("keydown", startAudioOnGesture);
  }

  // ----------------------------------------------------
  // HERO CAROUSEL ON MAIN MENU
  // ----------------------------------------------------

  updateMenuHeroDisplay() {
    const chars = WONDER_CONFIG.CHARACTERS;
    const char = chars[this.currentMenuCharIndex] || chars[0];
    const state = WonderProgression.state;
    const isUnlocked = state.unlockedCharacters.includes(char.id);

    // Update Text Elements in Hero Name Pill
    const iconEl = document.getElementById("menu-hero-icon");
    const nameEl = document.getElementById("menu-hero-name");
    const worldNameEl = document.getElementById("menu-selected-world-name");
    const worldImgEl = document.getElementById("menu-selected-world-img");

    if (iconEl) iconEl.innerText = char.skins[0].icon;
    if (nameEl) nameEl.innerText = `${char.name} ${isUnlocked ? '' : '🔒'}`;

    const currentWorldObj = WONDER_CONFIG.WORLDS.find(w => w.id === state.selectedWorld) || WONDER_CONFIG.WORLDS[0];
    if (worldNameEl) worldNameEl.innerText = currentWorldObj.name;
    if (worldImgEl) {
      worldImgEl.src = currentWorldObj.previewImg || "assets/images/world_enchanted_forest.jpg";
      worldImgEl.style.display = "block";
    }
    const worldIconEl = document.querySelector(".world-tag-icon");
    if (worldIconEl) worldIconEl.innerText = currentWorldObj.icon || "🌍";

    // Update 3D Model in Engine
    const skinId = (state.selectedCharacter === char.id) ? state.selectedSkin : "classic";
    if (this.engine) {
      this.engine.showMenuHero(char.id, skinId);
    }
  }

  showHeroInfoModal() {
    const chars = WONDER_CONFIG.CHARACTERS;
    const char = chars[this.currentMenuCharIndex] || chars[0];
    const state = WonderProgression.state;
    const isUnlocked = state.unlockedCharacters.includes(char.id);

    const modal = document.getElementById("dialog-hero-info");
    if (!modal) return;

    document.getElementById("hero-info-icon").innerText = char.skins[0].icon;
    document.getElementById("hero-info-title").innerText = `${char.name} the ${char.title}`;
    document.getElementById("hero-info-role").innerText = isUnlocked ? "✓ Unlocked Hero" : `🔒 Unlock for 🪙 ${char.costCoins.toLocaleString()}`;
    document.getElementById("hero-info-desc").innerText = char.description;
    document.getElementById("hero-info-perk").innerText = `✨ ${char.perk.name}: ${char.perk.desc}`;

    modal.classList.add("active");
    modal.style.display = "flex";
    modal.style.zIndex = "999";
    WonderAudio.playButtonClick();
  }

  cycleMenuHero(delta) {
    const chars = WONDER_CONFIG.CHARACTERS;
    this.currentMenuCharIndex = (this.currentMenuCharIndex + delta + chars.length) % chars.length;
    const char = chars[this.currentMenuCharIndex];

    // If unlocked, make active hero
    if (WonderProgression.state.unlockedCharacters.includes(char.id)) {
      WonderProgression.state.selectedCharacter = char.id;
      WonderProgression.saveState();
    }

    WonderAudio.playButtonClick();
    this.updateMenuHeroDisplay();
  }

  // ----------------------------------------------------
  // NAVIGATION & SCREEN SWITCHING
  // ----------------------------------------------------

  showScreen(screenId) {
    const screens = document.querySelectorAll(".game-screen");
    screens.forEach(s => s.classList.remove("active"));

    // Ensure all dialog overlays are closed when changing screens
    document.querySelectorAll(".dialog-overlay").forEach(d => d.classList.remove("active"));

    const target = document.getElementById(screenId);
    if (target) target.classList.add("active");

    const frame = document.getElementById("mobile-device-frame");
    const container = document.getElementById("app-container");
    const topBar = document.querySelector(".game-top-bar");

    if (screenId === "screen-hud") {
      if (topBar) {
        topBar.classList.add("hidden");
        topBar.style.display = "none";
      }
      if (frame) frame.classList.add("in-game");
      if (container) container.classList.add("in-game");
      WonderMonetization.hideBanner();
    } else {
      if (topBar) {
        topBar.classList.remove("hidden");
        topBar.style.display = "flex";
      }
      if (frame) frame.classList.remove("in-game");
      if (container) container.classList.remove("in-game");
      WonderMonetization.showBanner();
    }

    if (screenId === "screen-menu") this.updateMenuHeroDisplay();
    if (screenId === "screen-worlds") this.renderWorldsScreen();
    if (screenId === "screen-characters") this.renderCharactersScreen();
    if (screenId === "screen-shop") this.renderShopScreen();
    if (screenId === "screen-missions") this.renderMissionsScreen();
    if (screenId === "screen-achievements") this.renderAchievementsScreen();
    if (screenId === "screen-daily") this.renderDailyRewardScreen();
    if (screenId === "screen-leaderboard") this.renderLeaderboardScreen();
    if (screenId === "screen-settings") this.renderSettingsScreen();
    if (screenId === "screen-admin") this.renderAdminScreen();
  }

  // ----------------------------------------------------
  // BUTTON ACTIONS & EVENT BINDINGS
  // ----------------------------------------------------

  bindButtons() {
    const bindClick = (id, fn) => {
      const el = document.getElementById(id);
      if (!el) {
        console.warn("Element not found for binding:", id);
        return;
      }
      const trigger = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        fn();
      };
      el.addEventListener("click", trigger);
      el.addEventListener("touchend", trigger, { passive: false });
    };

    // Menu Hero Carousel & World Selectors
    bindClick("btn-menu-hero-prev", () => this.cycleMenuHero(-1));
    bindClick("btn-menu-hero-next", () => this.cycleMenuHero(1));
    bindClick("btn-hero-touch-target", () => this.showHeroInfoModal());
    bindClick("btn-hero-info-close", () => {
      const modal = document.getElementById("dialog-hero-info");
      if (modal) modal.classList.remove("active");
      WonderAudio.playButtonClick();
    });
    bindClick("btn-hero-info-roster", () => {
      const modal = document.getElementById("dialog-hero-info");
      if (modal) modal.classList.remove("active");
      WonderAudio.playButtonClick();
      this.showScreen("screen-characters");
    });
    bindClick("btn-menu-world-select", () => {
      WonderAudio.playButtonClick();
      this.showScreen("screen-worlds");
    });

    // Menu Navigation Buttons
    bindClick("btn-play-main", () => this.startGame());
    bindClick("btn-nav-worlds", () => { WonderAudio.playButtonClick(); this.showScreen("screen-worlds"); });
    bindClick("btn-nav-characters", () => { WonderAudio.playButtonClick(); this.showScreen("screen-characters"); });
    bindClick("btn-nav-shop", () => { WonderAudio.playButtonClick(); this.showScreen("screen-shop"); });
    bindClick("btn-nav-missions", () => { WonderAudio.playButtonClick(); this.showScreen("screen-missions"); });
    bindClick("btn-nav-achievements", () => { WonderAudio.playButtonClick(); this.showScreen("screen-achievements"); });
    bindClick("btn-nav-daily", () => { WonderAudio.playButtonClick(); this.showScreen("screen-daily"); });
    bindClick("btn-nav-leaderboard", () => { WonderAudio.playButtonClick(); this.showScreen("screen-leaderboard"); });
    bindClick("btn-nav-settings", () => { WonderAudio.playButtonClick(); this.showScreen("screen-settings"); });
    bindClick("btn-nav-admin", () => { WonderAudio.playButtonClick(); this.showScreen("screen-admin"); });

    // Back to Menu Buttons
    document.querySelectorAll(".btn-back-to-menu").forEach(btn => {
      const triggerBack = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        WonderAudio.playButtonClick();
        this.showScreen("screen-menu");
      };
      btn.addEventListener("click", triggerBack);
      btn.addEventListener("touchend", triggerBack, { passive: false });
    });

    // Fast-response In-Game HUD Controls (Instant pointerdown & touchstart & click)
    const fastBind = (id, fn) => {
      const el = document.getElementById(id);
      if (!el) return;
      const trigger = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        try { window.focus(); } catch (_) {}
        fn();
      };
      el.addEventListener("pointerdown", trigger);
      el.addEventListener("touchstart", trigger, { passive: false });
      el.onclick = trigger;
    };

    fastBind("btn-hud-pause", () => this.togglePause());
    fastBind("btn-touch-left", () => this.engine.changeLane(-1));
    fastBind("btn-touch-right", () => this.engine.changeLane(1));
    fastBind("btn-touch-jump", () => this.engine.jump());
    fastBind("btn-touch-slide", () => this.engine.slide());

    // Pause Dialog Buttons
    bindClick("btn-pause-resume", () => this.togglePause());
    bindClick("btn-pause-restart", () => {
      WonderAudio.playButtonClick();
      const pEl = document.getElementById("dialog-pause");
      if (pEl) pEl.classList.remove("active");
      this.startGame();
    });
    bindClick("btn-pause-quit", () => {
      WonderAudio.playButtonClick();
      const pEl = document.getElementById("dialog-pause");
      if (pEl) pEl.classList.remove("active");
      if (this.engine) {
        this.engine.isRunning = false;
        this.engine.isGameOver = false;
      }
      WonderAudio.playMusicForWorld("menu");
      this.showScreen("screen-menu");
    });

    // Game Over Buttons (Immediate Restart / Immediate Return to Home)
    bindClick("btn-gameover-replay", () => {
      WonderAudio.playButtonClick();
      const goEl = document.getElementById("dialog-gameover");
      if (goEl) goEl.classList.remove("active");
      this.startGame();
    });
    bindClick("btn-gameover-home", () => {
      WonderAudio.playButtonClick();
      const goEl = document.getElementById("dialog-gameover");
      if (goEl) goEl.classList.remove("active");
      if (this.engine) {
        this.engine.isRunning = false;
        this.engine.isGameOver = false;
      }
      WonderAudio.playMusicForWorld("menu");
      this.showScreen("screen-menu");
    });
    bindClick("btn-gameover-double", () => this.handleDoubleCoinsAd());
    bindClick("btn-gameover-revive", () => this.handleReviveAd());

    // Global Key Listener for Dialogs & Quick Replay
    window.addEventListener("keydown", (e) => {
      const goEl = document.getElementById("dialog-gameover");
      const pEl = document.getElementById("dialog-pause");
      
      if (goEl && goEl.classList.contains("active")) {
        if (e.code === "Space" || e.code === "Enter") {
          e.preventDefault();
          goEl.classList.remove("active");
          this.startGame();
        } else if (e.code === "Escape") {
          e.preventDefault();
          goEl.classList.remove("active");
          if (this.engine) {
            this.engine.isRunning = false;
            this.engine.isGameOver = false;
          }
          WonderAudio.playMusicForWorld("menu");
          this.showScreen("screen-menu");
        }
      } else if (pEl && pEl.classList.contains("active")) {
        if (e.code === "Space" || e.code === "Enter") {
          e.preventDefault();
          this.togglePause();
        } else if (e.code === "Escape") {
          e.preventDefault();
          pEl.classList.remove("active");
          if (this.engine) {
            this.engine.isRunning = false;
            this.engine.isGameOver = false;
          }
          WonderAudio.playMusicForWorld("menu");
          this.showScreen("screen-menu");
        }
      }
    });

    // Frame Toggle with dynamic state indicator and robust resize
    const toggleBtn = document.getElementById("btn-toggle-frame");
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        WonderAudio.playButtonClick();
        const wrapper = document.getElementById("mobile-device-frame");
        const appContainer = document.getElementById("app-container");
        wrapper.classList.toggle("fullscreen-mode");
        const isFullscreen = wrapper.classList.contains("fullscreen-mode");
        if (appContainer) {
          appContainer.classList.toggle("fullscreen-active", isFullscreen);
        }
        toggleBtn.innerText = isFullscreen ? "📱 Switch to Phone Frame" : "🖥️ Toggle Fullscreen View";
        
        if (this.engine) this.engine.handleResize();
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
          if (this.engine) this.engine.handleResize();
        }, 100);
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
          if (this.engine) this.engine.handleResize();
        }, 350);
      };
    }
  }

  // ----------------------------------------------------
  // GAMEPLAY LIFECYCLE
  // ----------------------------------------------------

  startGame() {
    WonderAudio.playButtonClick();
    const state = WonderProgression.state;

    // Check if selected character is unlocked (if locked, fallback to Milo)
    let charToPlay = state.selectedCharacter;
    if (!state.unlockedCharacters.includes(charToPlay)) {
      charToPlay = "milo";
      state.selectedCharacter = "milo";
    }

    this.showScreen("screen-hud");

    // Hide any overlays
    const pauseEl = document.getElementById("dialog-pause");
    const goEl = document.getElementById("dialog-gameover");
    if (pauseEl) pauseEl.classList.remove("active");
    if (goEl) goEl.classList.remove("active");

    try { window.focus(); } catch (_) {}

    // Start 3D Engine Run
    if (this.engine) {
      this.engine.startRun(state.selectedWorld, charToPlay, state.selectedSkin);
    }
  }

  togglePause() {
    if (!this.engine.isRunning || this.engine.isGameOver) return;
    const pauseDialog = document.getElementById("dialog-pause");

    if (this.engine.isPaused) {
      this.engine.resume();
      pauseDialog.classList.remove("active");
    } else {
      this.engine.pause();
      pauseDialog.classList.add("active");
      WonderAudio.playButtonClick();
    }
  }

  handleGameOver(endData) {
    this.lastGameOverData = endData;
    WonderProgression.recordRun(endData);

    // Show Game Over Dialog IMMEDIATELY upon crash with zero delay
    this.renderGameOverDialog(endData);
  }

  renderGameOverDialog(endData) {
    const dialog = document.getElementById("dialog-gameover");
    if (!dialog) return;

    // Close any pause dialogs
    const pauseDialog = document.getElementById("dialog-pause");
    if (pauseDialog) pauseDialog.classList.remove("active");

    dialog.classList.add("active");
    dialog.style.display = "flex";
    dialog.style.zIndex = "999";

    document.getElementById("gameover-score").innerText = (endData.score || 0).toLocaleString();
    document.getElementById("gameover-best").innerText = (WonderProgression.state.highScore || 0).toLocaleString();
    document.getElementById("gameover-coins").innerText = `+${endData.coins || 0}`;
    document.getElementById("gameover-gems").innerText = `+${endData.gems || 0}`;
    document.getElementById("gameover-distance").innerText = `${endData.distance || 0}m`;

    const xpEarned = Math.floor(endData.distance * 1.5 + endData.score * 0.1);
    document.getElementById("gameover-xp").innerText = `+${xpEarned} XP`;

    const reviveBtn = document.getElementById("btn-gameover-revive");
    if (endData.canRevive) {
      reviveBtn.style.display = "flex";
    } else {
      reviveBtn.style.display = "none";
    }

    const doubleBtn = document.getElementById("btn-gameover-double");
    doubleBtn.disabled = false;
    doubleBtn.classList.remove("btn-claimed");
    doubleBtn.innerHTML = `<span>📺 2X COINS (+${endData.coins})</span>`;
  }

  handleReviveAd() {
    WonderAudio.playButtonClick();
    WonderMonetization.showRewardedAd("revive_run", () => {
      document.getElementById("dialog-gameover").classList.remove("active");
      this.engine.revivePlayer();
      this.showToast("🌟 Revived! Run Continues!", "gold");
    }, () => {
      this.showToast("Ad could not be loaded. Try again later.", "purple");
    });
  }

  handleDoubleCoinsAd() {
    WonderAudio.playButtonClick();
    if (!this.lastGameOverData) return;

    WonderMonetization.showRewardedAd("double_coins", () => {
      const bonusCoins = this.lastGameOverData.coins;
      WonderProgression.addCoins(bonusCoins);

      const doubleBtn = document.getElementById("btn-gameover-double");
      doubleBtn.disabled = true;
      doubleBtn.classList.add("btn-claimed");
      doubleBtn.innerHTML = `<span>✓ DOUBLED! (+${bonusCoins * 2})</span>`;
      this.showToast(`🎉 Claimed +${bonusCoins} Bonus Coins!`, "gold");
    });
  }

  // ----------------------------------------------------
  // HUD UPDATES
  // ----------------------------------------------------

  updateHud(hudData) {
    document.getElementById("hud-score").innerText = hudData.score.toLocaleString();
    document.getElementById("hud-coins").innerText = hudData.coins;
    document.getElementById("hud-gems").innerText = hudData.gems;
    document.getElementById("hud-distance").innerText = `${hudData.distance}m`;

    const powerups = hudData.powerups;
    this.updatePowerupHudItem("hud-pu-magnet", powerups.magnet, WONDER_CONFIG.POWER_UPS.MAGNET.baseDuration);
    this.updatePowerupHudItem("hud-pu-shield", powerups.shield, WONDER_CONFIG.POWER_UPS.SHIELD.baseDuration);
    this.updatePowerupHudItem("hud-pu-wings", powerups.wings, WONDER_CONFIG.POWER_UPS.WINGS.baseDuration);
    this.updatePowerupHudItem("hud-pu-multiplier", powerups.multiplier, WONDER_CONFIG.POWER_UPS.MULTIPLIER.baseDuration);
  }

  updatePowerupHudItem(elementId, remainingTime, maxDuration) {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (remainingTime > 0) {
      el.style.display = "flex";
      const fill = el.querySelector(".hud-pu-fill");
      if (fill) {
        const percent = Math.min(100, (remainingTime / maxDuration) * 100);
        fill.style.width = `${percent}%`;
      }
    } else {
      el.style.display = "none";
    }
  }

  refreshCurrencies(state) {
    document.querySelectorAll(".val-coins").forEach(el => el.innerText = state.coins.toLocaleString());
    document.querySelectorAll(".val-gems").forEach(el => el.innerText = state.gems.toLocaleString());
    document.querySelectorAll(".val-player-level").forEach(el => el.innerText = `Lv.${state.playerLevel}`);
  }

  // ----------------------------------------------------
  // SCREEN RENDERS
  // ----------------------------------------------------

  renderWorldsScreen() {
    const container = document.getElementById("worlds-grid-container");
    container.innerHTML = "";
    const state = WonderProgression.state;

    WONDER_CONFIG.WORLDS.forEach(world => {
      const isUnlocked = state.unlockedWorlds.includes(world.id);
      const isSelected = state.selectedWorld === world.id;
      const worldIcon = world.icon || "🌍";
      const previewImg = world.previewImg || "assets/images/world_enchanted_forest.jpg";

      const card = document.createElement("div");
      card.className = `world-card ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}`;
      card.style.borderColor = isSelected ? "var(--color-gold)" : (world.themeColor || "var(--color-glass-border)");
      card.dataset.id = world.id;

      card.innerHTML = `
        <div class="world-card-square-art">
          <img src="${previewImg}" alt="${world.name}" class="world-card-square-img" onerror="this.style.display='none'">
          <div class="world-card-art-gradient"></div>
          <div class="world-card-icon-badge">${worldIcon}</div>
          <div class="world-card-status-badge ${isSelected ? 'active-badge' : (isUnlocked ? 'unlocked-badge' : 'locked-badge')}">
            ${isSelected ? '✨ Active' : (isUnlocked ? '✓ Ready' : `🔒 Lv.${world.unlockLevel}`)}
          </div>
          ${!isUnlocked ? `
            <div class="world-card-lock-overlay">
              <span class="world-lock-icon">🔒</span>
              <span class="world-lock-cost">🪙 ${world.unlockCoins.toLocaleString()}</span>
            </div>
          ` : ''}
        </div>
        <div class="world-card-info">
          <h3 class="world-card-title">${world.name}</h3>
          <div class="world-card-stats-chips">
            <span>⚡ x${world.speedModifier}</span>
            <span style="color: var(--color-gold);">🪙 +${Math.round((world.coinDensity - 1) * 100)}%</span>
          </div>
          <div class="world-card-action">
            ${isSelected ? '<button class="btn-world-action btn-selected" disabled>✓ ACTIVE</button>' : 
              (isUnlocked ? `<button class="btn-world-action btn-select-world" data-id="${world.id}">SELECT</button>` :
               `<button class="btn-world-action btn-unlock-world" data-id="${world.id}">UNLOCK</button>`)}
          </div>
        </div>
      `;

      // Full card click interaction
      card.onclick = () => {
        if (isSelected) return;
        if (isUnlocked) {
          state.selectedWorld = world.id;
          WonderProgression.saveState();
          WonderAudio.playButtonClick();
          this.updateMenuHeroDisplay();
          this.renderWorldsScreen();
          this.showToast(`${worldIcon} World Selected: ${world.name}`, "gold");
        } else {
          const success = WonderProgression.unlockWorld(world.id, "coins");
          if (success) {
            this.showToast(`${worldIcon} ${world.name} Unlocked!`, "gold");
            this.updateMenuHeroDisplay();
            this.renderWorldsScreen();
          } else {
            this.showToast(`Need 🪙 ${world.unlockCoins.toLocaleString()} or Reach Lv.${world.unlockLevel} to unlock!`, "purple");
          }
        }
      };

      container.appendChild(card);
    });
  }

  renderCharactersScreen() {
    const roster = document.getElementById("characters-roster-container");
    roster.innerHTML = "";
    const state = WonderProgression.state;

    WONDER_CONFIG.CHARACTERS.forEach(char => {
      const isUnlocked = state.unlockedCharacters.includes(char.id);
      const isSelected = state.selectedCharacter === char.id;

      const card = document.createElement("div");
      card.className = `char-card ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}`;
      card.dataset.id = char.id;

      card.innerHTML = `
        <div class="char-header" style="background: linear-gradient(135deg, ${char.baseColor}, ${char.secondaryColor})">
          <div class="char-avatar-ring">
            <span class="char-avatar-emoji">${char.skins[0].icon}</span>
          </div>
          <div class="char-title-block">
            <h3>${char.name}</h3>
            <span class="char-role">${char.title}</span>
          </div>
        </div>
        <div class="char-body">
          <p class="char-desc">${char.description}</p>
          <div class="char-perk-box">
            <strong>✨ ${char.perk.name}:</strong>
            <span>${char.perk.desc}</span>
          </div>
          <div class="char-actions">
            ${isSelected ? '<button class="btn-selected" disabled>✓ ACTIVE HERO</button>' : 
              (isUnlocked ? `<button class="btn-select-char" data-id="${char.id}">CHOOSE HERO</button>` :
               `<button class="btn-unlock-char" data-id="${char.id}">🪙 ${char.costCoins.toLocaleString()} or 💎 ${char.costGems}</button>`)}
          </div>
        </div>
      `;

      // Full card click interaction
      card.onclick = () => {
        if (isSelected) return;
        if (isUnlocked) {
          state.selectedCharacter = char.id;
          WonderProgression.saveState();
          WonderAudio.playButtonClick();
          const foundIdx = WONDER_CONFIG.CHARACTERS.findIndex(c => c.id === char.id);
          if (foundIdx >= 0) this.currentMenuCharIndex = foundIdx;
          this.updateMenuHeroDisplay();
          this.renderCharactersScreen();
          this.showToast(`🐾 Hero Selected: ${char.name}!`, "gold");
        } else {
          const success = WonderProgression.unlockCharacter(char.id, "coins");
          if (success) {
            this.showToast(`🐾 ${char.name} Unlocked & Ready!`, "gold");
            const foundIdx = WONDER_CONFIG.CHARACTERS.findIndex(c => c.id === char.id);
            if (foundIdx >= 0) this.currentMenuCharIndex = foundIdx;
            this.updateMenuHeroDisplay();
            this.renderCharactersScreen();
          } else {
            this.showToast("Not enough Coins to recruit this hero!", "purple");
          }
        }
      };

      roster.appendChild(card);
    });
  }

  renderShopScreen() {
    const upgradesContainer = document.getElementById("shop-upgrades-list");
    const iapContainer = document.getElementById("shop-iap-list");
    upgradesContainer.innerHTML = "";
    iapContainer.innerHTML = "";
    const state = WonderProgression.state;

    // 1. Upgrades
    Object.values(WONDER_CONFIG.POWER_UPS).forEach(pu => {
      const currentLevel = state.powerupLevels[pu.id] || 1;
      const isMax = currentLevel >= pu.maxLevel;
      const cost = isMax ? 0 : pu.upgradeCosts[currentLevel - 1];

      const item = document.createElement("div");
      item.className = "upgrade-item-card";
      item.dataset.id = pu.id;

      item.innerHTML = `
        <div class="upgrade-icon">${pu.icon}</div>
        <div class="upgrade-details">
          <h4>${pu.name}</h4>
          <p>${pu.description}</p>
          <div class="upgrade-level-bars">
            ${Array.from({ length: pu.maxLevel }).map((_, i) => `<div class="lvl-dot ${i < currentLevel ? 'filled' : ''}"></div>`).join('')}
            <span class="lvl-text">Lv.${currentLevel}/${pu.maxLevel}</span>
          </div>
        </div>
        <div class="upgrade-btn-box">
          ${isMax ? '<button class="btn-max" disabled>MAX</button>' : `<button class="btn-upgrade-pu" data-id="${pu.id}">🪙 ${cost.toLocaleString()}</button>`}
        </div>
      `;

      item.onclick = () => {
        if (isMax) {
          this.showToast("⚡ Power-Up is already at MAX Level!", "gold");
          return;
        }
        WonderAudio.playButtonClick();
        const success = WonderProgression.upgradePowerup(pu.id);
        if (success) {
          this.showToast(`⚡ ${pu.name} upgraded to Lv.${currentLevel + 1}!`, "gold");
          this.renderShopScreen();
        } else {
          this.showToast(`Need 🪙 ${cost.toLocaleString()} to upgrade!`, "purple");
        }
      };

      upgradesContainer.appendChild(item);
    });

    // 2. Billing Products
    Object.values(WONDER_CONFIG.BILLING.PRODUCTS).forEach(prod => {
      const isOwned = prod.id === "wonder_dash_remove_ads" && WonderMonetization.isAdFree();

      const card = document.createElement("div");
      card.className = `iap-product-card ${prod.id === 'wonder_dash_starter_bundle' ? 'featured' : ''}`;
      card.dataset.id = prod.id;

      card.innerHTML = `
        <div class="iap-badge">${prod.id === 'wonder_dash_starter_bundle' ? '⭐ BEST VALUE' : 'OFFICIAL IAP'}</div>
        <h4>${prod.title}</h4>
        <p>${prod.description}</p>
        <div class="iap-action-row">
          <span class="iap-price">${prod.price}</span>
          ${isOwned ? '<button class="btn-selected" disabled>✓ OWNED</button>' : `<button class="btn-buy-iap" data-id="${prod.id}">BUY</button>`}
        </div>
      `;

      card.onclick = () => {
        if (isOwned) return;
        WonderAudio.playButtonClick();
        WonderMonetization.purchaseProduct(prod.id, (p) => {
          this.showToast(`🎉 Purchased ${p.title}!`, "gold");
          this.renderShopScreen();
        });
      };

      iapContainer.appendChild(card);
    });
  }

  renderMissionsScreen() {
    const list = document.getElementById("missions-list-container");
    list.innerHTML = "";
    const state = WonderProgression.state;

    state.dailyMissions.forEach(m => {
      const percent = Math.min(100, Math.round((m.current / m.target) * 100));

      const card = document.createElement("div");
      card.className = `mission-card ${m.completed ? 'completed' : ''}`;

      card.innerHTML = `
        <div class="mission-info">
          <h4>${m.title}</h4>
          <p>${m.desc}</p>
          <div class="mission-bar-bg">
            <div class="mission-bar-fill" style="width: ${percent}%;"></div>
          </div>
          <span class="mission-counter">${m.current.toLocaleString()} / ${m.target.toLocaleString()}</span>
        </div>
        <div class="mission-reward-box">
          <div class="reward-tag">🪙 ${m.rewardCoins} | 💎 ${m.rewardGems}</div>
          ${m.claimed ? '<button class="btn-selected" disabled>CLAIMED</button>' : 
            (m.completed ? `<button class="btn-claim-mission" data-id="${m.id}">CLAIM</button>` :
             `<button class="btn-in-progress" disabled>${percent}%</button>`)}
        </div>
      `;

      list.appendChild(card);
    });

    list.querySelectorAll(".btn-claim-mission").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        WonderProgression.claimMissionReward(id);
        this.showToast("🎁 Daily Mission Reward Claimed!", "gold");
        this.renderMissionsScreen();
      };
    });
  }

  renderAchievementsScreen() {
    const list = document.getElementById("achievements-list-container");
    list.innerHTML = "";
    const state = WonderProgression.state;

    WONDER_CONFIG.ACHIEVEMENTS.forEach(ach => {
      const tracker = state.achievements[ach.id] || { progress: 0, completed: false, claimed: false };
      const percent = Math.min(100, Math.round((tracker.progress / ach.goal) * 100));

      const card = document.createElement("div");
      card.className = `ach-card ${tracker.completed ? 'completed' : ''}`;

      card.innerHTML = `
        <div class="ach-icon">${ach.icon}</div>
        <div class="ach-info">
          <h4>${ach.title}</h4>
          <p>${ach.desc}</p>
          <div class="mission-bar-bg">
            <div class="mission-bar-fill" style="width: ${percent}%;"></div>
          </div>
          <span class="mission-counter">${tracker.progress.toLocaleString()} / ${ach.goal.toLocaleString()}</span>
        </div>
        <div class="ach-reward-box">
          <div class="reward-tag">🪙 ${ach.reward.coins} | 💎 ${ach.reward.gems}</div>
          ${tracker.claimed ? '<button class="btn-selected" disabled>CLAIMED</button>' : 
            (tracker.completed ? `<button class="btn-claim-ach" data-id="${ach.id}">CLAIM</button>` :
             `<button class="btn-in-progress" disabled>${percent}%</button>`)}
        </div>
      `;

      list.appendChild(card);
    });

    list.querySelectorAll(".btn-claim-ach").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        WonderProgression.claimAchievement(id);
        this.showToast("🏆 Achievement Reward Claimed!", "gold");
        this.renderAchievementsScreen();
      };
    });
  }

  renderDailyRewardScreen() {
    const grid = document.getElementById("daily-grid-container");
    grid.innerHTML = "";
    const state = WonderProgression.state;

    WONDER_CONFIG.DAILY_REWARDS.forEach(item => {
      const isClaimed = state.claimedDailyDays.includes(item.day);
      const isCurrent = state.dailyStreak === item.day;
      const canClaim = WonderProgression.canClaimDailyReward(item.day);

      const card = document.createElement("div");
      card.className = `daily-day-card ${isClaimed ? 'claimed' : ''} ${isCurrent ? 'current' : ''} ${canClaim ? 'can-claim' : ''}`;

      card.innerHTML = `
        <div class="daily-day-num">DAY ${item.day}</div>
        <div class="daily-icon">${item.icon}</div>
        <div class="daily-label">${item.label}</div>
        ${isClaimed ? '<span class="status-tag">✓ Claimed</span>' : 
          (canClaim ? `<button class="btn-claim-daily" data-day="${item.day}">CLAIM</button>` :
           `<span class="status-tag">Locked</span>`)}
      `;

      grid.appendChild(card);
    });

    grid.querySelectorAll(".btn-claim-daily").forEach(btn => {
      btn.onclick = () => {
        const day = parseInt(btn.dataset.day, 10);
        WonderProgression.claimDailyReward(day, false);
        this.showToast("🎁 Daily Login Bonus Claimed!", "gold");
        this.renderDailyRewardScreen();
      };
    });

    const doubleDailyBtn = document.getElementById("btn-daily-2x-ad");
    const canClaimCurrent = WonderProgression.canClaimDailyReward(state.dailyStreak);
    doubleDailyBtn.disabled = !canClaimCurrent;
    doubleDailyBtn.onclick = () => {
      WonderMonetization.showRewardedAd("daily_bonus", () => {
        WonderProgression.claimDailyReward(state.dailyStreak, true);
        this.showToast("🎉 2X Daily Bonus Claimed with Video Ad!", "gold");
        this.renderDailyRewardScreen();
      });
    };
  }

  renderLeaderboardScreen() {
    const list = document.getElementById("leaderboard-list-container");
    list.innerHTML = "";
    const leaderboard = WonderProgression.state.leaderboard;

    leaderboard.forEach((run, idx) => {
      const row = document.createElement("div");
      row.className = `leader-row rank-${idx + 1}`;

      const medal = idx === 0 ? "🥇" : (idx === 1 ? "🥈" : (idx === 2 ? "🥉" : `#${idx + 1}`));

      row.innerHTML = `
        <div class="leader-rank">${medal}</div>
        <div class="leader-info">
          <h4>${run.name}</h4>
          <span>${run.world} • ${run.date}</span>
        </div>
        <div class="leader-score">
          <strong>${run.score.toLocaleString()} pts</strong>
          <span>${run.distance}m</span>
        </div>
      `;

      list.appendChild(row);
    });
  }

  renderSettingsScreen() {
    const bgmSlider = document.getElementById("slider-bgm-volume");
    const sfxSlider = document.getElementById("slider-sfx-volume");
    const muteToggle = document.getElementById("toggle-sound-mute");
    const muteStatusLabel = document.getElementById("label-mute-status");
    const muteRow = document.getElementById("row-toggle-mute");

    const updateMuteUI = (isMuted) => {
      if (muteToggle) muteToggle.checked = isMuted;
      if (muteStatusLabel) {
        muteStatusLabel.innerText = isMuted ? "Sound: MUTED 🔇" : "Sound: ACTIVE 🔊";
        muteStatusLabel.style.color = isMuted ? "#e74c3c" : "#2ecc71";
      }
    };

    if (bgmSlider) bgmSlider.value = Math.round(WonderAudio.bgmVolume * 100);
    if (sfxSlider) sfxSlider.value = Math.round(WonderAudio.sfxVolume * 100);
    updateMuteUI(WonderAudio.isMuted);

    if (bgmSlider) bgmSlider.oninput = (e) => WonderAudio.setBgmVolume(e.target.value / 100);
    if (sfxSlider) sfxSlider.oninput = (e) => WonderAudio.setSfxVolume(e.target.value / 100);
    
    if (muteToggle) {
      muteToggle.onchange = (e) => {
        WonderAudio.setMuted(e.target.checked);
        updateMuteUI(WonderAudio.isMuted);
      };
    }

    if (muteRow) {
      muteRow.onclick = (e) => {
        if (e.target === muteToggle) return;
        WonderAudio.playButtonClick();
        WonderAudio.setMuted(!WonderAudio.isMuted);
        updateMuteUI(WonderAudio.isMuted);
      };
    }

    document.getElementById("btn-restore-purchases").onclick = () => {
      WonderAudio.playButtonClick();
      WonderMonetization.restorePurchases((success, msg) => {
        this.showToast(msg, success ? "gold" : "purple");
      });
    };

    document.getElementById("btn-view-privacy").onclick = () => {
      WonderAudio.playButtonClick();
      window.open("store_assets/privacy_policy.html", "_blank");
    };

    document.getElementById("btn-reset-data").onclick = () => {
      WonderAudio.playButtonClick();
      WonderAdmin.resetAllData();
    };
  }

  renderAdminScreen() {
    document.getElementById("admin-stat-dau").innerText = (1240 + Math.floor(Math.random() * 50)).toLocaleString();
    document.getElementById("admin-stat-sessions").innerText = WonderAdmin.analytics.sessions.toLocaleString();
    document.getElementById("admin-stat-ad-views").innerText = WonderAdmin.analytics.adImpressions.toLocaleString();
    document.getElementById("admin-stat-rewarded-views").innerText = WonderAdmin.analytics.rewardedWatches.toLocaleString();

    document.getElementById("btn-admin-add-coins").onclick = () => {
      WonderAdmin.grantCoins(10000);
      this.updateMenuHeroDisplay();
    };
    document.getElementById("btn-admin-add-gems").onclick = () => {
      WonderAdmin.grantGems(250);
      this.updateMenuHeroDisplay();
    };
    document.getElementById("btn-admin-unlock-worlds").onclick = () => WonderAdmin.unlockAllWorlds();
    document.getElementById("btn-admin-unlock-chars").onclick = () => {
      WonderAdmin.unlockAllCharacters();
      this.updateMenuHeroDisplay();
    };
    document.getElementById("btn-admin-max-powerups").onclick = () => WonderAdmin.maxPowerups();
  }

  showToast(message, theme = "gold") {
    const existing = document.getElementById("game-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "game-toast";
    toast.className = `game-toast ${theme}`;
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 20);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  }
}

// Instant Reliable Bootloader
function bootWonderApp() {
  if (!window.WonderApp) {
    try {
      window.WonderApp = new WonderApp();
      console.log("🌟 WonderDash App initialized successfully!");
      // Delayed resize triggers to ensure full viewport synchronization
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        if (window.WonderApp && window.WonderApp.engine) {
          window.WonderApp.engine.handleResize();
        }
      }, 50);
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        if (window.WonderApp && window.WonderApp.engine) {
          window.WonderApp.engine.handleResize();
        }
      }, 200);
    } catch (e) {
      console.error("Fatal error initializing WonderApp:", e);
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootWonderApp);
} else {
  bootWonderApp();
}
