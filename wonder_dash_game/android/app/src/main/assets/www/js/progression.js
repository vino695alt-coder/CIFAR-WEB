/**
 * Wonder Dash: Magic World - Player Progression & Reward System
 * XP & Levels, Daily Missions, Weekly Challenges, 15 Achievements,
 * 7-Day Login Streaks, Power-Up Upgrades & Local Leaderboards.
 */

class WonderProgressionSystem {
  constructor() {
    this.storageKey = "wonder_dash_player_save_v1";
    this.state = this.getDefaultState();
    this.loadState();
    this.checkDailyLoginStreak();
    this.refreshDailyMissionsIfNeeded();
  }

  getDefaultState() {
    return {
      coins: 1000, // Starter coins
      gems: 25,    // Starter gems
      playerLevel: 1,
      playerXp: 0,
      highScore: 0,
      longestDistance: 0,
      totalRuns: 0,
      totalCoinsCollected: 0,
      totalGemsCollected: 0,
      totalJumps: 0,
      totalSlides: 0,
      totalPowerupsCollected: 0,
      totalWingsUsed: 0,

      selectedWorld: "enchanted_forest",
      selectedCharacter: "milo",
      selectedSkin: "classic",

      unlockedWorlds: ["enchanted_forest"],
      unlockedCharacters: ["leo", "milo"],
      unlockedSkins: {
        leo: ["classic"],
        milo: ["classic"]
      },

      powerupLevels: {
        magnet: 1,
        shield: 1,
        wings: 1,
        multiplier: 1,
        gem_burst: 1
      },

      dailyStreak: 1,
      lastLoginDate: new Date().toISOString().split("T")[0],
      claimedDailyDays: [],

      dailyMissions: [],
      missionsDate: "",

      achievements: {},
      leaderboard: [
        { name: "Milo Explorer", score: 8500, distance: 820, world: "Enchanted Forest", date: "Recent" },
        { name: "Luna Star", score: 5400, distance: 510, world: "Rainbow Valley", date: "Recent" },
        { name: "Pip Drake", score: 3200, distance: 340, world: "Enchanted Forest", date: "Recent" }
      ]
    };
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = Object.assign(this.getDefaultState(), parsed);
      }
    } catch (e) {
      console.warn("Could not load save state", e);
    }
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.error("Save error", e);
    }
  }

  // ----------------------------------------------------
  // CURRENCIES & LEVELING (XP)
  // ----------------------------------------------------

  addCoins(amount) {
    this.state.coins = Math.max(0, this.state.coins + amount);
    this.state.totalCoinsCollected += Math.max(0, amount);
    this.checkAchievements("coin_hoarder_1", this.state.totalCoinsCollected);
    this.checkAchievements("coin_hoarder_2", this.state.totalCoinsCollected);
    this.saveState();
    this.emitStateChange();
  }

  addGems(amount) {
    this.state.gems = Math.max(0, this.state.gems + amount);
    this.state.totalGemsCollected += Math.max(0, amount);
    this.checkAchievements("gem_seeker", this.state.totalGemsCollected);
    this.saveState();
    this.emitStateChange();
  }

  addXp(amount) {
    this.state.playerXp += amount;
    const neededForNext = this.getXpForLevel(this.state.playerLevel);

    if (this.state.playerXp >= neededForNext) {
      this.state.playerXp -= neededForNext;
      this.state.playerLevel++;
      // Level Up Rewards
      this.addCoins(500 * this.state.playerLevel);
      this.addGems(5 * this.state.playerLevel);
      WonderAudio.playChestOpen();

      // Check World Level Unlocks
      WONDER_CONFIG.WORLDS.forEach(world => {
        if (this.state.playerLevel >= world.unlockLevel && !this.state.unlockedWorlds.includes(world.id)) {
          this.state.unlockedWorlds.push(world.id);
        }
      });

      if (window.showToast) {
        window.showToast(`🎉 Level Up! You reached Level ${this.state.playerLevel}!`, "gold");
      }
    }
    this.saveState();
    this.emitStateChange();
  }

  getXpForLevel(level) {
    return Math.floor(1000 * Math.pow(1.25, level - 1));
  }

  // ----------------------------------------------------
  // RUN RECORDING & STATS
  // ----------------------------------------------------

  recordRun(runData) {
    this.state.totalRuns++;
    this.addCoins(runData.coins);
    this.addGems(runData.gems);

    // XP gained based on distance and score
    const xpGained = Math.floor(runData.distance * 1.5 + runData.score * 0.1);
    this.addXp(xpGained);

    // High Score & Distance
    if (runData.score > this.state.highScore) {
      this.state.highScore = runData.score;
      this.checkAchievements("high_score_1", this.state.highScore);
      this.checkAchievements("high_score_2", this.state.highScore);
    }
    if (runData.distance > this.state.longestDistance) {
      this.state.longestDistance = runData.distance;
      this.checkAchievements("distance_1", this.state.longestDistance);
      this.checkAchievements("distance_2", this.state.longestDistance);
    }

    // Achievements check
    this.checkAchievements("first_dash", this.state.totalRuns);

    // Add to Local Leaderboard
    const worldObj = WONDER_CONFIG.WORLDS.find(w => w.id === runData.worldId) || { name: "Magical World" };
    const charObj = WONDER_CONFIG.CHARACTERS.find(c => c.id === this.state.selectedCharacter) || { name: "Hero" };

    this.state.leaderboard.push({
      name: `${charObj.name} (${charObj.title})`,
      score: runData.score,
      distance: runData.distance,
      world: worldObj.name,
      date: new Date().toLocaleDateString()
    });

    // Sort descending by score and keep top 10
    this.state.leaderboard.sort((a, b) => b.score - a.score);
    this.state.leaderboard = this.state.leaderboard.slice(0, 10);

    // Update Missions progress
    this.updateMissionsProgress(runData);

    this.saveState();
    this.emitStateChange();
  }

  // ----------------------------------------------------
  // DAILY LOGIN STREAK SYSTEM
  // ----------------------------------------------------

  checkDailyLoginStreak() {
    const today = new Date().toISOString().split("T")[0];
    if (this.state.lastLoginDate !== today) {
      const lastDate = new Date(this.state.lastLoginDate);
      const currDate = new Date(today);
      const diffTime = Math.abs(currDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive login day!
        this.state.dailyStreak = (this.state.dailyStreak % 7) + 1;
      } else if (diffDays > 1) {
        // Streak broken, restart at day 1
        this.state.dailyStreak = 1;
        this.state.claimedDailyDays = [];
      }

      this.state.lastLoginDate = today;
      this.saveState();
    }
  }

  canClaimDailyReward(day) {
    return day <= this.state.dailyStreak && !this.state.claimedDailyDays.includes(day);
  }

  claimDailyReward(day, doubleMultiplier = false) {
    if (!this.canClaimDailyReward(day)) return false;

    const reward = WONDER_CONFIG.DAILY_REWARDS.find(r => r.day === day);
    if (!reward) return false;

    this.state.claimedDailyDays.push(day);

    const mult = doubleMultiplier ? 2 : 1;

    if (reward.type === "coins") {
      this.addCoins(reward.amount * mult);
    } else if (reward.type === "gems") {
      this.addGems(reward.amount * mult);
    } else if (reward.type === "powerup") {
      this.upgradePowerup(reward.powerup, true);
    } else if (reward.type === "jackpot") {
      this.addCoins(reward.coins * mult);
      this.addGems(reward.gems * mult);
      if (reward.skin) this.unlockSkin("milo", "golden_pilot");
    }

    this.checkAchievements("daily_devotee", this.state.claimedDailyDays.length);
    WonderAudio.playChestOpen();
    this.saveState();
    this.emitStateChange();
    return true;
  }

  // ----------------------------------------------------
  // PROCEDURAL DAILY MISSIONS & WEEKLY CHALLENGES
  // ----------------------------------------------------

  refreshDailyMissionsIfNeeded() {
    const today = new Date().toISOString().split("T")[0];
    if (this.state.missionsDate !== today || !this.state.dailyMissions || this.state.dailyMissions.length === 0) {
      this.state.missionsDate = today;
      this.state.dailyMissions = [
        {
          id: "m_coins",
          title: "Golden Stash",
          desc: "Collect 200 Coins across any runs today",
          target: 200,
          current: 0,
          rewardCoins: 500,
          rewardGems: 5,
          completed: false,
          claimed: false
        },
        {
          id: "m_dist",
          title: "Far Horizons",
          desc: "Run a total distance of 1,200 meters",
          target: 1200,
          current: 0,
          rewardCoins: 750,
          rewardGems: 10,
          completed: false,
          claimed: false
        },
        {
          id: "m_world",
          title: "World Explorer",
          desc: "Score 3,000 points in one magical run",
          target: 3000,
          current: 0,
          rewardCoins: 1000,
          rewardGems: 15,
          completed: false,
          claimed: false
        }
      ];
      this.saveState();
    }
  }

  updateMissionsProgress(runData) {
    if (!this.state.dailyMissions) return;

    this.state.dailyMissions.forEach(m => {
      if (m.completed) return;

      if (m.id === "m_coins") {
        m.current += runData.coins;
      } else if (m.id === "m_dist") {
        m.current += runData.distance;
      } else if (m.id === "m_world") {
        m.current = Math.max(m.current, runData.score);
      }

      if (m.current >= m.target) {
        m.completed = true;
      }
    });
    this.saveState();
  }

  claimMissionReward(missionId) {
    const mission = this.state.dailyMissions.find(m => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed) return false;

    mission.claimed = true;
    this.addCoins(mission.rewardCoins);
    this.addGems(mission.rewardGems);
    WonderAudio.playChestOpen();
    this.saveState();
    this.emitStateChange();
    return true;
  }

  // ----------------------------------------------------
  // ACHIEVEMENTS TRACKER
  // ----------------------------------------------------

  checkAchievements(achievementId, value) {
    const ach = WONDER_CONFIG.ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!ach) return;

    if (!this.state.achievements[achievementId]) {
      this.state.achievements[achievementId] = { progress: 0, completed: false, claimed: false };
    }

    const tracker = this.state.achievements[achievementId];
    tracker.progress = Math.max(tracker.progress, value);

    if (tracker.progress >= ach.goal && !tracker.completed) {
      tracker.completed = true;
      if (window.showToast) {
        window.showToast(`🏆 Achievement Unlocked: ${ach.title}!`, "gold");
      }
      if (window.WonderAudio) {
        if (typeof WonderAudio.playLevelUp === "function") WonderAudio.playLevelUp();
        else if (typeof WonderAudio.playChestOpen === "function") WonderAudio.playChestOpen();
      }
    }
    this.saveState();
  }

  claimAchievement(achievementId) {
    const ach = WONDER_CONFIG.ACHIEVEMENTS.find(a => a.id === achievementId);
    const tracker = this.state.achievements[achievementId];
    if (!ach || !tracker || !tracker.completed || tracker.claimed) return false;

    tracker.claimed = true;
    this.addCoins(ach.reward.coins);
    this.addGems(ach.reward.gems);
    WonderAudio.playChestOpen();
    this.saveState();
    this.emitStateChange();
    return true;
  }

  // ----------------------------------------------------
  // UNLOCKS & UPGRADES
  // ----------------------------------------------------

  upgradePowerup(type, free = false) {
    const config = WONDER_CONFIG.POWER_UPS[type.toUpperCase()];
    if (!config) return false;

    const currentLvl = this.state.powerupLevels[type] || 1;
    if (currentLvl >= config.maxLevel) return false;

    const cost = config.upgradeCosts[currentLvl - 1] || 1000;

    if (!free) {
      if (this.state.coins < cost) return false;
      this.addCoins(-cost);
    }

    this.state.powerupLevels[type] = currentLvl + 1;
    WonderAudio.playPowerup();
    this.saveState();
    this.emitStateChange();
    return true;
  }

  unlockCharacter(charId, useCurrency = "coins") {
    const char = WONDER_CONFIG.CHARACTERS.find(c => c.id === charId);
    if (!char || this.state.unlockedCharacters.includes(charId)) return false;

    if (useCurrency === "coins") {
      if (this.state.coins < char.costCoins) return false;
      this.addCoins(-char.costCoins);
    } else {
      if (this.state.gems < char.costGems) return false;
      this.addGems(-char.costGems);
    }

    this.state.unlockedCharacters.push(charId);
    this.state.selectedCharacter = charId;
    this.checkAchievements("hero_squad", this.state.unlockedCharacters.length);
    WonderAudio.playPurchase();
    this.saveState();
    this.emitStateChange();
    return true;
  }

  unlockSkin(charId, skinId, useCurrency = "coins") {
    const char = WONDER_CONFIG.CHARACTERS.find(c => c.id === charId);
    if (!char) return false;
    const skin = char.skins.find(s => s.id === skinId);
    if (!skin) return false;

    if (!this.state.unlockedSkins[charId]) {
      this.state.unlockedSkins[charId] = ["classic"];
    }

    if (this.state.unlockedSkins[charId].includes(skinId)) return true;

    if (skin.costCoins > 0 || skin.costGems > 0) {
      if (useCurrency === "coins") {
        if (this.state.coins < skin.costCoins) return false;
        this.addCoins(-skin.costCoins);
      } else {
        if (this.state.gems < skin.costGems) return false;
        this.addGems(-skin.costGems);
      }
    }

    this.state.unlockedSkins[charId].push(skinId);
    this.state.selectedSkin = skinId;
    WonderAudio.playPurchase();
    this.saveState();
    this.emitStateChange();
    return true;
  }

  unlockWorld(worldId, useCurrency = "coins") {
    const world = WONDER_CONFIG.WORLDS.find(w => w.id === worldId);
    if (!world || this.state.unlockedWorlds.includes(worldId)) return false;

    if (useCurrency === "coins") {
      if (this.state.coins < world.unlockCoins) return false;
      this.addCoins(-world.unlockCoins);
    } else {
      if (this.state.gems < world.unlockGems) return false;
      this.addGems(-world.unlockGems);
    }

    this.state.unlockedWorlds.push(worldId);
    this.state.selectedWorld = worldId;
    this.checkAchievements("world_explorer", this.state.unlockedWorlds.length);
    WonderAudio.playPurchase();
    this.saveState();
    this.emitStateChange();
    return true;
  }

  emitStateChange() {
    if (window.onWonderStateUpdated) {
      window.onWonderStateUpdated(this.state);
    }
  }
}

const WonderProgression = new WonderProgressionSystem();
window.WonderProgression = WonderProgression;
