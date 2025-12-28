package com.platform.sdk.webhooks;

/**
 * Exception thrown when webhook signature verification fails.
 */
public class InvalidSignatureException extends WebhookException {
    public InvalidSignatureException(String message) {
        super(message);
    }

    public InvalidSignatureException() {
        super("Invalid webhook signature");
    }
}
