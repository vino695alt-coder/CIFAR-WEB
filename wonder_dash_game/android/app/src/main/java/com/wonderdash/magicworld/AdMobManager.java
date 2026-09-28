package com.wonderdash.magicworld;

import android.app.Activity;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;

import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.RequestConfiguration;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;

public class AdMobManager {
    private static final String TAG = "AdMobManager";

    // Google AdMob Official Test Ad Unit IDs (replace with live IDs in strings.xml for production)
    private static final String BANNER_AD_UNIT_ID = "ca-app-pub-3940256099942544/6300978111";
    private static final String INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-3940256099942544/1033173712";
    private static final String REWARDED_AD_UNIT_ID = "ca-app-pub-3940256099942544/5224354917";

    private final Activity activity;
    private final ViewGroup bannerContainer;

    private AdView adView;
    private InterstitialAd interstitialAd;
    private RewardedAd rewardedAd;

    private boolean isAdFree = false;

    public interface InterstitialCallback {
        void onClosed();
    }

    public interface RewardedCallback {
        void onUserEarnedReward();
        void onAdFailed();
    }

    public AdMobManager(Activity activity, ViewGroup bannerContainer) {
        this.activity = activity;
        this.bannerContainer = bannerContainer;
        initSdk();
    }

    private void initSdk() {
        // Enforce Google Play Families / COPPA Compliance
        RequestConfiguration requestConfiguration = new RequestConfiguration.Builder()
                .setTagForChildDirectedTreatment(RequestConfiguration.TAG_FOR_CHILD_DIRECTED_TREATMENT_TRUE)
                .setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_G)
                .build();
        MobileAds.setRequestConfiguration(requestConfiguration);

        MobileAds.initialize(activity, initializationStatus -> {
            Log.d(TAG, "AdMob SDK Initialized Successfully.");
            preloadInterstitial();
            preloadRewarded();
        });
    }

    public void setAdFree(boolean adFree) {
        this.isAdFree = adFree;
        if (isAdFree) {
            hideBanner();
        }
    }

    // ----------------------------------------------------
    // BANNER ADS
    // ----------------------------------------------------

    public void showBanner() {
        if (isAdFree || bannerContainer == null) return;

        activity.runOnUiThread(() -> {
            if (adView == null) {
                adView = new AdView(activity);
                adView.setAdUnitId(BANNER_AD_UNIT_ID);
                adView.setAdSize(AdSize.BANNER);
                bannerContainer.removeAllViews();
                bannerContainer.addView(adView);
                AdRequest adRequest = new AdRequest.Builder().build();
                adView.loadAd(adRequest);
            }
            bannerContainer.setVisibility(View.VISIBLE);
        });
    }

    public void hideBanner() {
        if (bannerContainer != null) {
            activity.runOnUiThread(() -> bannerContainer.setVisibility(View.GONE));
        }
    }

    // ----------------------------------------------------
    // INTERSTITIAL ADS
    // ----------------------------------------------------

    public void preloadInterstitial() {
        if (isAdFree) return;

        AdRequest adRequest = new AdRequest.Builder().build();
        InterstitialAd.load(activity, INTERSTITIAL_AD_UNIT_ID, adRequest,
                new InterstitialAdLoadCallback() {
                    @Override
                    public void onAdLoaded(@NonNull InterstitialAd ad) {
                        interstitialAd = ad;
                        Log.d(TAG, "Interstitial Ad Loaded.");
                    }

                    @Override
                    public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                        interstitialAd = null;
                        Log.w(TAG, "Interstitial Failed: " + loadAdError.getMessage());
                    }
                });
    }

    public void showInterstitial(InterstitialCallback callback) {
        if (isAdFree || interstitialAd == null) {
            if (callback != null) callback.onClosed();
            return;
        }

        activity.runOnUiThread(() -> {
            interstitialAd.setFullScreenContentCallback(new FullScreenContentCallback() {
                @Override
                public void onAdDismissedFullScreenContent() {
                    interstitialAd = null;
                    preloadInterstitial();
                    if (callback != null) callback.onClosed();
                }

                @Override
                public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                    interstitialAd = null;
                    preloadInterstitial();
                    if (callback != null) callback.onClosed();
                }
            });
            interstitialAd.show(activity);
        });
    }

    // ----------------------------------------------------
    // REWARDED VIDEO ADS
    // ----------------------------------------------------

    public void preloadRewarded() {
        AdRequest adRequest = new AdRequest.Builder().build();
        RewardedAd.load(activity, REWARDED_AD_UNIT_ID, adRequest,
                new RewardedAdLoadCallback() {
                    @Override
                    public void onAdLoaded(@NonNull RewardedAd ad) {
                        rewardedAd = ad;
                        Log.d(TAG, "Rewarded Ad Loaded.");
                    }

                    @Override
                    public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                        rewardedAd = null;
                        Log.w(TAG, "Rewarded Ad Failed: " + loadAdError.getMessage());
                    }
                });
    }

    public void showRewarded(RewardedCallback callback) {
        if (rewardedAd == null) {
            preloadRewarded();
            if (callback != null) callback.onAdFailed();
            return;
        }

        activity.runOnUiThread(() -> {
            rewardedAd.setFullScreenContentCallback(new FullScreenContentCallback() {
                @Override
                public void onAdDismissedFullScreenContent() {
                    rewardedAd = null;
                    preloadRewarded();
                }

                @Override
                public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                    rewardedAd = null;
                    preloadRewarded();
                    if (callback != null) callback.onAdFailed();
                }
            });

            rewardedAd.show(activity, rewardItem -> {
                Log.d(TAG, "User earned reward: " + rewardItem.getAmount() + " " + rewardItem.getType());
                if (callback != null) callback.onUserEarnedReward();
            });
        });
    }
}
