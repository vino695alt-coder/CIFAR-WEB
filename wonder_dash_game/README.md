# 🌟 Wonder Dash: Magic World

> **A Complete, Polished, Original Android Mobile 3D Casual Endless Runner Game**
> Designed for publication on the Google Play Store and ethical monetization through Google AdMob & Google Play Billing.

---

## 🎮 Game Concept & Features

* **Original Intellectual Property (100% Copyright-Safe):** All characters, models, worlds, audio synthesizer tracks, UI, and mechanics are original creations.
* **Core Gameplay Loop:** Auto-running 3D hero with 3-lane physics. Swipe left/right to change lanes, swipe up to jump, swipe down to slide.
* **5 Cute Playable Heroes:**
  1. 🦊 **Milo** (Adventurous Fox) — Golden aviator goggles, magnet master perk.
  2. 🐱 **Luna** (Magical Star Cat) — Witch star hat & cape, 2X multiplier perk.
  3. 🐲 **Pip** (Baby Dragon) — Flutter wings & horn, protective shield perk.
  4. 🐼 **Coco** (Cheerful Panda) — Adventure vest & bamboo pack, Cloud Wings flight perk.
  5. 🐰 **Nova** (Cosmic Space Bunny) — Astronaut visor & rocket ears, rare gem luck perk.
* **8 Exciting Procedural Worlds:**
  1. 🌲 **Enchanted Forest** (Glowing flora, mossy logs, firefly particles)
  2. 🌈 **Rainbow Valley** (Floating pastel clouds, prism arches, rainbow coins)
  3. 🍭 **Candy Kingdom** (Peppermint rolls, lollipop hurdles, wafer bridges)
  4. 🦕 **Dinosaur Island** (Prehistoric ferns, amber gems, volcanic boulders)
  5. 🌊 **Ocean Adventure** (Sunken coral reefs, glowing jellies, bubble streams)
  6. 🚀 **Space Adventure** (Cosmic asteroid speedways, neon plasma hurdles)
  7. 💎 **Crystal Mountains** (Amethyst spires, icicle gates, snow glimmers)
  8. 👑 **Magical Sky Kingdom** (Golden palace minarets, marble cloud speedways)
* **5 Supercharged Power-Ups:** Star Magnet, Magic Shield, Cloud Wings, 2X Star Multiplier, Gem Burst (upgradable up to Level 5).
* **Progression Systems:** XP & Player Leveling, 7-Day Login Streak Rewards, Procedural Daily Missions, 15 Achievements, Local Hall of Fame Leaderboard.
* **Audio Synthesizer Engine:** Zero-dependency procedural Web Audio synth generating custom musical themes for all 8 worlds + menu, plus crisp SFX for jumps, slides, coins, gems, powerups, shields, and fanfare.
* **Ethical Monetization:**
  - Opt-in Rewarded Ads (Revive run once, double coins 2X, double daily reward)
  - Natural break Interstitial Ads (cooldown limiter, never during run)
  - Sticky Banner Ads in menus
  - Google Play In-App Purchases (Remove Ads, Coin Bags, Gem Bundles, Hero Starter Pack)
  - Built-in Sandbox Test Simulator for testing ad/billing flows without real money.
* **Studio Admin Portal:** Live DAU/Session metrics, developer cheats, remote config tuner, and error tracker.
* **Family & Children Friendly:** Google Play Families policy & COPPA compliant, child-directed treatment tag, general audience G-rated ads, offline-first playable.

---

## 📁 Project Directory Structure

```text
wonder_dash_game/
├── index.html                           # Single Page Web App with Glassmorphism UI
├── css/
│   └── style.css                        # Mobile game CSS design system & animations
├── js/
│   ├── config.js                        # Game physics, AdMob IDs, Billing SKUs, Worlds & Heroes
│   ├── audio.js                         # Procedural Web Audio synth & SFX engine
│   ├── models.js                        # Three.js 3D cartoon mesh procedural builders
│   ├── engine.js                        # 3D Endless Runner engine & particle systems
│   ├── monetization.js                  # AdMob & Google Play Billing controller
│   ├── progression.js                   # XP, Levels, Missions, Achievements, Daily Streak
│   ├── admin.js                         # Studio Admin Portal & Analytics
│   └── main.js                          # UI router, HUD updates & gameplay lifecycle
├── assets/
│   └── images/                          # High-res icons, feature graphic, previews
├── android/                             # Complete Native Android Project (Gradle, targetSdk 34)
│   ├── build.gradle
│   ├── settings.gradle
│   └── app/
│       ├── build.gradle                 # AdMob SDK & Play Billing dependencies
│       ├── proguard-rules.pro
│       └── src/main/
│           ├── AndroidManifest.xml      # AdMob App ID, Billing permission, portrait mode
│           ├── java/com/wonderdash/magicworld/
│           │   ├── MainActivity.java    # Hardware accelerated WebView host + JS Bridge
│           │   ├── AdMobManager.java    # Native AdMob Banner, Interstitial & Rewarded SDK
│           │   └── BillingManager.java  # Native Google Play Billing Client 6.x
│           ├── res/                     # Layouts, colors, styles, strings
│           └── assets/www/              # Pre-bundled game assets for Android APK/AAB
├── store_assets/                        # Google Play Publishing Package
│   ├── icon.png                         # 512x512 High-Res App Icon
│   ├── feature_graphic.png              # 1024x500 Feature Graphic
│   ├── promo_screenshots/               # Showcase promotional screenshots
│   ├── privacy_policy.html              # COPPA / Families compliant Privacy Policy
│   ├── terms_of_service.html            # Family-friendly Terms of Service
│   └── google_play_metadata.md          # Store descriptions, Data Safety, Content Rating
└── PUBLISHING_GUIDE.md                  # Step-by-step Android App Bundle (.aab) build guide
```

---

## 🕹️ How to Play Locally

1. Start a local HTTP server:
   ```bash
   python -m http.server 8080 --directory wonder_dash_game
   ```
2. Open `http://localhost:8080` in your web browser or mobile browser.
3. **Controls:**
   - **Keyboard:** `Left/Right` or `A/D` to switch lanes, `Up` or `W` or `Space` to jump, `Down` or `S` to slide, `P` or `Esc` to pause.
   - **Touch / Swipe:** Swipe left/right, swipe up to jump, swipe down to slide, or tap the on-screen touch buttons.
   - **Device Frame Toggle:** Tap "📱 Toggle Device Frame" in top right to switch between mobile preview frame and fullscreen mode.

---

## 📦 Building the Android App Bundle (.aab) for Google Play

Follow the detailed instructions in [`PUBLISHING_GUIDE.md`](file:///h:/Data%20science%20doc/Python/Demo%201/.ipynb_checkpoints/DL/Ch-7%20Image%20Classification%20Scripting/APP%20web/wonder_dash_game/PUBLISHING_GUIDE.md):

```bash
cd android
./gradlew bundleRelease
```
The signed `.aab` output will be located at:
`android/app/build/outputs/bundle/release/app-release.aab`
