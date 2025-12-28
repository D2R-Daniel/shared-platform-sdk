package com.platform.sdk.webhooks;

/**
 * Base exception for webhook operations.
 */
public class WebhookException extends RuntimeException {
    public WebhookException(String message) {
        super(message);
    }

    public WebhookException(String message, Throwable cause) {
        super(message, cause);
    }
}
