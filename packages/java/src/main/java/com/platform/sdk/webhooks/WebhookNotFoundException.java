package com.platform.sdk.webhooks;

/**
 * Exception thrown when a webhook is not found.
 */
public class WebhookNotFoundException extends WebhookException {
    private final String webhookId;

    public WebhookNotFoundException(String webhookId) {
        super("Webhook not found: " + webhookId);
        this.webhookId = webhookId;
    }

    public String getWebhookId() {
        return webhookId;
    }
}
