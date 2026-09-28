/**
 * Wonder Dash: Magic World - Monetization Architecture
 * Google AdMob (Banner, Interstitial, Rewarded) + Google Play Billing (IAP)
 * Supports Native Android WebBridge AND Sandbox Test Simulator.
 */

class WonderMonetizationManager {
  constructor() {
    this.hasRemoveAds = false;
    this.totalRunsCount = 0;
    this.interstitialCooldown = WONDER_CONFIG.ADMOB.INTERSTITIAL_RUN_INTERVAL;
    this.isNativeAndroid = typeof window.AndroidBridge !== "undefined";
    
    this.initFromStorage();
  }

  initFromStorage() {
    try {
      const saved = localStorage.getItem("wonder_dash_monetization");
      if (saved) {
        const parsed = JSON.parse(saved);
        this.hasRemoveAds = !!parsed.hasRemoveAds;
        this.totalRunsCount = parsed.totalRunsCount || 0;
      }
    } catch (e) {
      console.warn("Monetization storage load error", e);
    }
  }

  saveData() {
    try {
      localStorage.setItem("wonder_dash_monetization", JSON.stringify({
        hasRemoveAds: this.hasRemoveAds,
        totalRunsCount: this.totalRunsCount
      }));
    } catch (e) {}
  }

  isAdFree() {
    return this.hasRemoveAds;
  }

  // ----------------------------------------------------
  // GOOGLE ADMOB BANNER ADS
  // ----------------------------------------------------

  showBanner() {
    if (this.hasRemoveAds) {
      this.hideBanner();
      return;
    }

    if (this.isNativeAndroid && window.AndroidBridge.showBannerAd) {
      window.AndroidBridge.showBannerAd();
    } else {
      const bannerEl = document.getElementById("admob-banner-container");
      if (bannerEl) bannerEl.style.display = "flex";
    }
  }

  hideBanner() {
    if (this.isNativeAndroid && window.AndroidBridge.hideBannerAd) {
      window.AndroidBridge.hideBannerAd();
    } else {
      const bannerEl = document.getElementById("admob-banner-container");
      if (bannerEl) bannerEl.style.display = "none";
    }
  }

  // ----------------------------------------------------
  // GOOGLE ADMOB INTERSTITIAL ADS
  // ----------------------------------------------------

  checkAndShowInterstitial(onCompleted) {
    if (this.hasRemoveAds) {
      if (onCompleted) onCompleted();
      return;
    }

    this.totalRunsCount++;
    this.saveData();

    // Only show interstitial every N runs at natural breaks (Game Over)
    if (this.totalRunsCount % this.interstitialCooldown === 0) {
      this.showInterstitialAd(onCompleted);
    } else {
      if (onCompleted) onCompleted();
    }
  }

  showInterstitialAd(onCompleted) {
    if (this.hasRemoveAds) {
      if (onCompleted) onCompleted();
      return;
    }

    if (this.isNativeAndroid && window.AndroidBridge.showInterstitialAd) {
      // Native Android AdMob call
      window.onNativeInterstitialClosed = () => {
        if (onCompleted) onCompleted();
      };
      window.AndroidBridge.showInterstitialAd();
    } else {
      // Simulated Sandbox Interstitial Modal
      this.renderSimulatorModal({
        type: "interstitial",
        title: "Sponsored Magic Break",
        duration: 4,
        onSuccess: () => {
          if (onCompleted) onCompleted();
        }
      });
    }
  }

  // ----------------------------------------------------
  // GOOGLE ADMOB REWARDED ADS (Opt-in Family Friendly)
  // ----------------------------------------------------

  showRewardedAd(placement, onSuccess, onFailed) {
    if (this.isNativeAndroid && window.AndroidBridge.showRewardedAd) {
      // Native Android AdMob Rewarded Callback
      window.onNativeRewardedSuccess = () => {
        if (onSuccess) onSuccess();
      };
      window.onNativeRewardedFailed = () => {
        if (onFailed) onFailed();
      };
      window.AndroidBridge.showRewardedAd(placement);
    } else {
      // Sandbox Interactive Video Ad Simulator
      this.renderSimulatorModal({
        type: "rewarded",
        placement: placement,
        title: `Rewarded Video — ${placement.replace('_', ' ').toUpperCase()}`,
        duration: 5,
        onSuccess: () => {
          if (onSuccess) onSuccess();
        },
        onFailed: () => {
          if (onFailed) onFailed();
        }
      });
    }
  }

  // ----------------------------------------------------
  // GOOGLE PLAY BILLING (IN-APP PURCHASES)
  // ----------------------------------------------------

  purchaseProduct(productId, onSuccess, onFailed) {
    const product = WONDER_CONFIG.BILLING.PRODUCTS[productId.toUpperCase()] || 
                    Object.values(WONDER_CONFIG.BILLING.PRODUCTS).find(p => p.id === productId);

    if (!product) {
      console.error("Unknown product ID:", productId);
      if (onFailed) onFailed("Product not found");
      return;
    }

    if (this.isNativeAndroid && window.AndroidBridge.launchBillingFlow) {
      window.onNativePurchaseSuccess = (purchasedId) => {
        this.fulfillPurchase(product);
        if (onSuccess) onSuccess(product);
      };
      window.onNativePurchaseFailed = (err) => {
        if (onFailed) onFailed(err);
      };
      window.AndroidBridge.launchBillingFlow(product.id);
    } else {
      // Render Google Play In-App Purchase Simulation Dialog
      this.renderPurchaseDialog(product, (confirmed) => {
        if (confirmed) {
          this.fulfillPurchase(product);
          if (onSuccess) onSuccess(product);
        } else {
          if (onFailed) onFailed("User cancelled");
        }
      });
    }
  }

  fulfillPurchase(product) {
    if (product.type === "non_consumable" || product.removeAds || product.id === "wonder_dash_remove_ads") {
      this.hasRemoveAds = true;
      this.hideBanner();
      this.saveData();
    }

    // Grant currency & skins
    if (window.WonderProgression) {
      if (product.coins > 0) window.WonderProgression.addCoins(product.coins);
      if (product.gems > 0) window.WonderProgression.addGems(product.gems);
      if (product.skin) window.WonderProgression.unlockSkin("milo", "golden_pilot");
    }

    WonderAudio.playPurchase();
  }

  restorePurchases(onRestored) {
    if (this.isNativeAndroid && window.AndroidBridge.restorePurchases) {
      window.AndroidBridge.restorePurchases();
    }
    // Check non-consumable status
    if (this.hasRemoveAds) {
      if (onRestored) onRestored(true, "Remove Ads restored successfully!");
    } else {
      if (onRestored) onRestored(false, "No previous purchases found.");
    }
  }

  // ----------------------------------------------------
  // SANDBOX SIMULATOR MODALS (For Dev, Review & Web)
  // ----------------------------------------------------

  renderSimulatorModal({ type, title, duration = 4, onSuccess, onFailed }) {
    const existing = document.getElementById("admob-sim-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "admob-sim-overlay";
    overlay.className = "ad-modal-overlay";

    let remaining = duration;

    overlay.innerHTML = `
      <div class="ad-modal-card">
        <div class="ad-modal-header">
          <span class="ad-badge">${type === "rewarded" ? "REWARDED AD (TEST)" : "INTERSTITIAL (TEST)"}</span>
          <span class="ad-timer" id="ad-countdown">Reward in: ${remaining}s</span>
        </div>
        <div class="ad-video-mock">
          <div class="ad-pulse-circle">⭐</div>
          <h3>${title}</h3>
          <p>Official Google AdMob Test Environment</p>
          <div class="ad-progress-bar-bg">
            <div class="ad-progress-bar-fill" id="ad-progress-fill" style="width: 0%;"></div>
          </div>
        </div>
        <div class="ad-modal-footer">
          <span class="ad-coppa-note">🛡️ Family-Friendly Safe Content</span>
          <button id="ad-close-btn" class="btn-ad-close" disabled>Wait ${remaining}s...</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const countdownEl = document.getElementById("ad-countdown");
    const progressFill = document.getElementById("ad-progress-fill");
    const closeBtn = document.getElementById("ad-close-btn");

    const timer = setInterval(() => {
      remaining--;
      const percent = Math.min(100, ((duration - remaining) / duration) * 100);
      if (progressFill) progressFill.style.width = `${percent}%`;

      if (remaining > 0) {
        if (countdownEl) countdownEl.innerText = `Reward in: ${remaining}s`;
        if (closeBtn) closeBtn.innerText = `Wait ${remaining}s...`;
      } else {
        clearInterval(timer);
        if (countdownEl) countdownEl.innerText = "✓ Reward Earned!";
        if (closeBtn) {
          closeBtn.disabled = false;
          closeBtn.innerText = "Claim & Close";
          closeBtn.classList.add("btn-claim-active");
          closeBtn.onclick = () => {
            overlay.remove();
            if (onSuccess) onSuccess();
          };
        }
      }
    }, 1000);
  }

  renderPurchaseDialog(product, callback) {
    const existing = document.getElementById("billing-sim-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "billing-sim-overlay";
    overlay.className = "ad-modal-overlay";

    overlay.innerHTML = `
      <div class="billing-modal-card">
        <div class="google-play-header">
          <span class="gp-icon">▶</span>
          <span class="gp-title">Google Play Billing (Sandbox Test)</span>
        </div>
        <div class="billing-product-info">
          <h3>${product.title}</h3>
          <p class="billing-desc">${product.description}</p>
          <div class="billing-price-tag">${product.price}</div>
        </div>
        <div class="billing-security-note">
          🔒 Secure test purchase sandbox. No real charges are processed.
        </div>
        <div class="billing-actions">
          <button id="billing-cancel-btn" class="btn-billing-cancel">Cancel</button>
          <button id="billing-confirm-btn" class="btn-billing-confirm">1-Tap Buy</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("billing-cancel-btn").onclick = () => {
      overlay.remove();
      callback(false);
    };

    document.getElementById("billing-confirm-btn").onclick = () => {
      overlay.remove();
      callback(true);
    };
  }
}

const WonderMonetization = new WonderMonetizationManager();
window.WonderMonetization = WonderMonetization;
