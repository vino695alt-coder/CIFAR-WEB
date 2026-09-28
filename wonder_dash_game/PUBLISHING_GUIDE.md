# 🚀 Wonder Dash: Magic World — Google Play Store & AdMob Publishing Guide

This comprehensive guide takes you step-by-step from building the Android App Bundle (`.aab`) to setting up Google AdMob and Google Play Billing, through to publishing on the Google Play Store.

---

## 🛠️ Step 1: Bundle Game Web Assets into Android Project

Before building the Android App Bundle, bundle the web assets (`index.html`, `css/`, `js/`, `assets/`) into `android/app/src/main/assets/www/`.

You can run this simple PowerShell command from the `wonder_dash_game` root:

```powershell
# Copy web assets to Android assets folder
New-Item -ItemType Directory -Force -Path "android/app/src/main/assets/www"
Copy-Item -Recurse -Force "index.html", "css", "js", "assets" "android/app/src/main/assets/www/"
```

---

## 🔑 Step 2: Generate Release Keystore (for App Signing)

Generate a secure release keystore using Java's `keytool`:

```bash
keytool -genkey -v -keystore wonder_dash_release.keystore -alias wonder_dash -keyalg RSA -keysize 2048 -validity 10000
```

Store this keystore safely.

In `android/app/build.gradle`, configure the signing config:

```groovy
android {
    signingConfigs {
        release {
            storeFile file("path/to/wonder_dash_release.keystore")
            storePassword "YOUR_KEYSTORE_PASSWORD"
            keyAlias "wonder_dash"
            keyPassword "YOUR_KEY_PASSWORD"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 📦 Step 3: Build the Android App Bundle (.aab)

From the `android/` directory, run Gradle:

```bash
# Windows
gradlew.bat bundleRelease

# macOS / Linux
./gradlew bundleRelease
```

The generated release bundle will be created at:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 💰 Step 4: Setup Google AdMob Account & Live Ad Units

1. Log into your [Google AdMob Console](https://apps.admob.com/).
2. Click **Apps > Add App** and select **Android**.
3. Create 3 Ad Units:
   - **Banner Ad:** Name: `WonderDash_Banner` (Adaptive banner)
   - **Interstitial Ad:** Name: `WonderDash_Interstitial` (Natural GameOver breaks)
   - **Rewarded Video Ad:** Name: `WonderDash_Rewarded` (Revive run, double coins, daily 2x)
4. Replace the test IDs with your live IDs in:
   - `android/app/src/main/res/values/strings.xml`
   - `android/app/src/main/AndroidManifest.xml`
   - `js/config.js` (`ADMOB.APP_ID`, `ADMOB.BANNER_ID`, `ADMOB.INTERSTITIAL_ID`, `ADMOB.REWARDED_ID`, and set `TEST_MODE: false`).

---

## 🛒 Step 5: Configure Google Play In-App Products (Billing)

1. In the [Google Play Console](https://play.google.com/console), select **Wonder Dash: Magic World**.
2. Navigate to **Monetize > In-app products**.
3. Create the following product SKUs:

| Product ID | Type | Default Price | Description |
| :--- | :--- | :--- | :--- |
| `wonder_dash_remove_ads` | Non-Consumable | $2.99 | Remove all Banner & Interstitial Ads + 50 Gems |
| `wonder_dash_coins_small` | Consumable | $0.99 | 2,000 Gold Coins |
| `wonder_dash_coins_medium`| Consumable | $2.99 | 7,500 Gold Coins + 25 Gems |
| `wonder_dash_coins_mega`  | Consumable | $7.99 | 25,000 Gold Coins + 120 Gems |
| `wonder_dash_gems_small`  | Consumable | $1.99 | 60 Magic Gems |
| `wonder_dash_gems_vault`  | Consumable | $6.99 | 300 Magic Gems |
| `wonder_dash_starter_bundle` | Non-Consumable | $4.99 | Hero Starter Pack (No Ads + 10k Coins + Skin) |

---

## 🚀 Step 6: Google Play Store Upload & Launch

1. **Create Application:**
   - App Name: `Wonder Dash: Magic World`
   - Default Language: English (US)
   - App or Game: Game
   - Free or Paid: Free

2. **Upload Store Assets:**
   - **App Icon:** `store_assets/icon.png` (512x512 PNG)
   - **Feature Graphic:** `store_assets/feature_graphic.png` (1024x500 PNG)
   - **Screenshots:** Upload phone and 7-inch/10-inch tablet screenshots from `store_assets/promo_screenshots/`.

3. **Store Listing Text:**
   - Copy Short Description and Full Description from `store_assets/google_play_metadata.md`.

4. **App Content Questionnaire:**
   - **Privacy Policy:** Paste link to `privacy_policy.html` hosted on your website or GitHub Pages.
   - **Target Audience & Content:** Select **All Ages (including Families)**.
   - **Ads Declaration:** Select **Yes, my app contains ads**.
   - **Data Safety:** Complete according to the table in `store_assets/google_play_metadata.md`.

5. **Release Track:**
   - Upload `app-release.aab` to **Internal Testing** or **Closed Testing (Alpha/Beta)**.
   - Verify all test purchases and rewarded ads work smoothly.
   - Promote to **Production** track and submit for review!

🎉 **Congratulations on releasing Wonder Dash: Magic World!**
