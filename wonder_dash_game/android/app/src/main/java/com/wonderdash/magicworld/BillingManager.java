package com.wonderdash.magicworld;

import android.app.Activity;
import android.util.Log;

import androidx.annotation.NonNull;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ConsumeParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class BillingManager implements PurchasesUpdatedListener {
    private static final String TAG = "BillingManager";

    private final Activity activity;
    private BillingClient billingClient;
    private final Map<String, ProductDetails> productDetailsMap = new HashMap<>();

    public interface PurchaseListener {
        void onPurchaseSuccess(String productId);
        void onPurchaseFailed(String errorMessage);
    }

    private PurchaseListener purchaseListener;

    public BillingManager(Activity activity) {
        this.activity = activity;
        initBilling();
    }

    public void setPurchaseListener(PurchaseListener listener) {
        this.purchaseListener = listener;
    }

    private void initBilling() {
        billingClient = BillingClient.newBuilder(activity)
                .setListener(this)
                .enablePendingPurchases()
                .build();

        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(@NonNull BillingResult billingResult) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    Log.d(TAG, "Google Play Billing Connected.");
                    queryProducts();
                    queryPurchases();
                } else {
                    Log.w(TAG, "Billing Connection Failed: " + billingResult.getDebugMessage());
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                Log.w(TAG, "Billing Service Disconnected. Will retry on next purchase attempt.");
            }
        });
    }

    private void queryProducts() {
        List<QueryProductDetailsParams.Product> productList = new ArrayList<>();
        
        String[] productIds = new String[]{
                "wonder_dash_remove_ads",
                "wonder_dash_coins_small",
                "wonder_dash_coins_medium",
                "wonder_dash_coins_mega",
                "wonder_dash_gems_small",
                "wonder_dash_gems_vault",
                "wonder_dash_starter_bundle"
        };

        for (String id : productIds) {
            productList.add(QueryProductDetailsParams.Product.newBuilder()
                    .setProductId(id)
                    .setProductType(BillingClient.ProductType.INAPP)
                    .build());
        }

        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(productList)
                .build();

        billingClient.queryProductDetailsAsync(params, (billingResult, list) -> {
            if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && list != null) {
                for (ProductDetails pd : list) {
                    productDetailsMap.put(pd.getProductId(), pd);
                }
                Log.d(TAG, "Queried " + list.size() + " products successfully.");
            }
        });
    }

    public void launchPurchaseFlow(String productId) {
        ProductDetails productDetails = productDetailsMap.get(productId);
        if (productDetails == null) {
            if (purchaseListener != null) {
                purchaseListener.onPurchaseFailed("Product details not loaded from Google Play.");
            }
            return;
        }

        List<BillingFlowParams.ProductDetailsParams> productDetailsParamsList = new ArrayList<>();
        productDetailsParamsList.add(
                BillingFlowParams.ProductDetailsParams.newBuilder()
                        .setProductDetails(productDetails)
                        .build()
        );

        BillingFlowParams billingFlowParams = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(productDetailsParamsList)
                .build();

        billingClient.launchBillingFlow(activity, billingFlowParams);
    }

    @Override
    public void onPurchasesUpdated(@NonNull BillingResult billingResult, List<Purchase> purchases) {
        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (Purchase purchase : purchases) {
                handlePurchase(purchase);
            }
        } else if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
            if (purchaseListener != null) purchaseListener.onPurchaseFailed("Purchase cancelled by user.");
        } else {
            if (purchaseListener != null) purchaseListener.onPurchaseFailed(billingResult.getDebugMessage());
        }
    }

    private void handlePurchase(Purchase purchase) {
        if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
            for (String pid : purchase.getProducts()) {
                if (pid.equals("wonder_dash_remove_ads") || pid.equals("wonder_dash_starter_bundle")) {
                    // Non-consumable: Acknowledge purchase
                    if (!purchase.isAcknowledged()) {
                        AcknowledgePurchaseParams ackParams = AcknowledgePurchaseParams.newBuilder()
                                .setPurchaseToken(purchase.getPurchaseToken())
                                .build();
                        billingClient.acknowledgePurchase(ackParams, billingResult -> {
                            Log.d(TAG, "Non-consumable acknowledged: " + pid);
                        });
                    }
                } else {
                    // Consumable coins/gems: Consume purchase
                    ConsumeParams consumeParams = ConsumeParams.newBuilder()
                            .setPurchaseToken(purchase.getPurchaseToken())
                            .build();
                    billingClient.consumeAsync(consumeParams, (billingResult, s) -> {
                        Log.d(TAG, "Consumable consumed: " + pid);
                    });
                }

                if (purchaseListener != null) {
                    purchaseListener.onPurchaseSuccess(pid);
                }
            }
        }
    }

    public void queryPurchases() {
        if (billingClient == null || !billingClient.isReady()) return;

        billingClient.queryPurchasesAsync(
                QueryPurchasesParams.newBuilder()
                        .setProductType(BillingClient.ProductType.INAPP)
                        .build(),
                (billingResult, list) -> {
                    if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                        for (Purchase p : list) {
                            if (p.getProducts().contains("wonder_dash_remove_ads") || p.getProducts().contains("wonder_dash_starter_bundle")) {
                                if (purchaseListener != null) {
                                    purchaseListener.onPurchaseSuccess("wonder_dash_remove_ads");
                                }
                            }
                        }
                    }
                }
        );
    }
}
