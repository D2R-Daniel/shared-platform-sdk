package com.platform.sdk.webhooks;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Webhook delivery status.
 */
public enum DeliveryStatus {
    PENDING("pending"),
    SUCCESS("success"),
    FAILED("failed"),
    RETRYING("retrying");

    private final String value;

    DeliveryStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
