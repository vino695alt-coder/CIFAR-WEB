/**
 * Wonder Dash: Magic World - Studio Admin Dashboard & Analytics Portal
 * Live game metrics, remote config tuner, events management, and developer tools.
 */

class WonderAdminManager {
  constructor() {
    this.analytics = {
      sessions: 1,
      startTime: Date.now(),
      errors: [],
      adImpressions: 0,
      rewardedWatches: 0
    };
    this.initAnalytics();
  }

  initAnalytics() {
    try {
      const saved = localStorage.getItem("wonder_dash_analytics");
      if (saved) {
        const parsed = JSON.parse(saved);
        this.analytics.sessions = (parsed.sessions || 0) + 1;
        this.analytics.adImpressions = parsed.adImpressions || 0;
        this.analytics.rewardedWatches = parsed.rewardedWatches || 0;
      }
      this.saveAnalytics();
    } catch (e) {}

    window.addEventListener("error", (e) => {
      this.analytics.errors.push({
        time: new Date().toLocaleTimeString(),
        message: e.message || "Script error",
        filename: e.filename || "main.js"
      });
      if (this.analytics.errors.length > 20) this.analytics.errors.shift();
    });
  }

  saveAnalytics() {
    try {
      localStorage.setItem("wonder_dash_analytics", JSON.stringify({
        sessions: this.analytics.sessions,
        adImpressions: this.analytics.adImpressions,
        rewardedWatches: this.analytics.rewardedWatches
      }));
    } catch (e) {}
  }

  logAdImpression() {
    this.analytics.adImpressions++;
    this.saveAnalytics();
  }

  logRewardedWatch() {
    this.analytics.rewardedWatches++;
    this.saveAnalytics();
  }

  // Developer God Mode Actions
  grantCoins(amount = 10000) {
    if (window.WonderProgression) {
      window.WonderProgression.addCoins(amount);
      if (window.showToast) window.showToast(`+${amount} Coins added!`, "gold");
    }
  }

  grantGems(amount = 250) {
    if (window.WonderProgression) {
      window.WonderProgression.addGems(amount);
      if (window.showToast) window.showToast(`+${amount} Gems added!`, "purple");
    }
  }

  unlockAllWorlds() {
    if (window.WonderProgression) {
      WONDER_CONFIG.WORLDS.forEach(w => {
        if (!window.WonderProgression.state.unlockedWorlds.includes(w.id)) {
          window.WonderProgression.state.unlockedWorlds.push(w.id);
        }
      });
      window.WonderProgression.saveState();
      window.WonderProgression.emitStateChange();
      if (window.showToast) window.showToast("All 8 Worlds Unlocked!", "gold");
    }
  }

  unlockAllCharacters() {
    if (window.WonderProgression) {
      WONDER_CONFIG.CHARACTERS.forEach(c => {
        if (!window.WonderProgression.state.unlockedCharacters.includes(c.id)) {
          window.WonderProgression.state.unlockedCharacters.push(c.id);
        }
        if (!window.WonderProgression.state.unlockedSkins[c.id]) {
          window.WonderProgression.state.unlockedSkins[c.id] = [];
        }
        c.skins.forEach(s => {
          if (!window.WonderProgression.state.unlockedSkins[c.id].includes(s.id)) {
            window.WonderProgression.state.unlockedSkins[c.id].push(s.id);
          }
        });
      });
      window.WonderProgression.saveState();
      window.WonderProgression.emitStateChange();
      if (window.showToast) window.showToast("All Characters & Skins Unlocked!", "gold");
    }
  }

  maxPowerups() {
    if (window.WonderProgression) {
      for (const k in window.WonderProgression.state.powerupLevels) {
        window.WonderProgression.state.powerupLevels[k] = 5;
      }
      window.WonderProgression.saveState();
      window.WonderProgression.emitStateChange();
      if (window.showToast) window.showToast("All Power-ups Maxed to Level 5!", "gold");
    }
  }

  resetAllData() {
    if (confirm("Reset all game data to factory defaults? This cannot be undone.")) {
      localStorage.removeItem("wonder_dash_player_save_v1");
      localStorage.removeItem("wonder_dash_monetization");
      localStorage.removeItem("wonder_dash_analytics");
      location.reload();
    }
  }
}

const WonderAdmin = new WonderAdminManager();
window.WonderAdmin = WonderAdmin;
