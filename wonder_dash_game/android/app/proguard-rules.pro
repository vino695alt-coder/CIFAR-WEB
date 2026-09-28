# Wonder Dash ProGuard Rules for Production Release Build
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Google Play Billing Client
-keep class com.android.billingclient.api.** { *; }

# Keep Google AdMob SDK
-keep public class com.google.android.gms.ads.** {
   public *;
}
-keep public class com.google.ads.** {
   public *;
}
