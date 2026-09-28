package com.wonderdash.magicworld;

import android.annotation.SuppressLint;
import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private static final String TAG = "MainActivity";

    private WebView webView;
    private FrameLayout bannerContainer;
    private AdMobManager adMobManager;
    private BillingManager billingManager;
    private Vibrator vibrator;

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Keep screen on during gameplay & go full screen
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        hideSystemUI();

        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.game_webview);
        bannerContainer = findViewById(R.id.ad_banner_container);
        vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);

        // Initialize AdMob and In-App Billing
        adMobManager = new AdMobManager(this, bannerContainer);
        billingManager = new BillingManager(this);

        billingManager.setPurchaseListener(new BillingManager.PurchaseListener() {
            @Override
            public void onPurchaseSuccess(String productId) {
                if (productId.equals("wonder_dash_remove_ads") || productId.equals("wonder_dash_starter_bundle")) {
                    adMobManager.setAdFree(true);
                }
                runOnUiThread(() -> {
                    if (webView != null) {
                        webView.evaluateJavascript("if(window.onNativePurchaseSuccess) window.onNativePurchaseSuccess('" + productId + "');", null);
                    }
                });
            }

            @Override
            public void onPurchaseFailed(String errorMessage) {
                runOnUiThread(() -> {
                    if (webView != null) {
                        webView.evaluateJavascript("if(window.onNativePurchaseFailed) window.onNativePurchaseFailed('" + errorMessage + "');", null);
                    }
                });
            }
        });

        setupWebView();
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Enable Hardware Acceleration for smooth 60fps WebGL
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient());

        // Register JS Android Bridge
        webView.addJavascriptInterface(new WebAppInterface(), "AndroidBridge");

        // Load bundled game assets
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    private void hideSystemUI() {
        View decorView = getWindow().getDecorView();
        decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
        );
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemUI();
        }
    }

    // ----------------------------------------------------
    // JAVASCRIPT NATIVE BRIDGE INTERFACE
    // ----------------------------------------------------

    public class WebAppInterface {
        @JavascriptInterface
        public void showBannerAd() {
            adMobManager.showBanner();
        }

        @JavascriptInterface
        public void hideBannerAd() {
            adMobManager.hideBanner();
        }

        @JavascriptInterface
        public void showInterstitialAd() {
            adMobManager.showInterstitial(() -> runOnUiThread(() -> {
                if (webView != null) {
                    webView.evaluateJavascript("if(window.onNativeInterstitialClosed) window.onNativeInterstitialClosed();", null);
                }
            }));
        }

        @JavascriptInterface
        public void showRewardedAd(String placement) {
            adMobManager.showRewarded(new AdMobManager.RewardedCallback() {
                @Override
                public void onUserEarnedReward() {
                    runOnUiThread(() -> {
                        if (webView != null) {
                            webView.evaluateJavascript("if(window.onNativeRewardedSuccess) window.onNativeRewardedSuccess();", null);
                        }
                    });
                }

                @Override
                public void onAdFailed() {
                    runOnUiThread(() -> {
                        if (webView != null) {
                            webView.evaluateJavascript("if(window.onNativeRewardedFailed) window.onNativeRewardedFailed();", null);
                        }
                    });
                }
            });
        }

        @JavascriptInterface
        public void launchBillingFlow(String productId) {
            billingManager.launchPurchaseFlow(productId);
        }

        @JavascriptInterface
        public void restorePurchases() {
            billingManager.queryPurchases();
        }

        @JavascriptInterface
        public void vibrate(int durationMs) {
            if (vibrator != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    vibrator.vibrate(durationMs);
                }
            }
        }
    }
}
