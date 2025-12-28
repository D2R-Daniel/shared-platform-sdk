package com.platform.sdk.webhooks;

/**
 * Exception thrown when a webhook delivery is not found.
 */
public class DeliveryNotFoundException extends WebhookException {
    private final String deliveryId;

    public DeliveryNotFoundException(String deliveryId) {
        super("Webhook delivery not found: " + deliveryId);
        this.deliveryId = deliveryId;
    }

    public String getDeliveryId() {
        return deliveryId;
    }
}
