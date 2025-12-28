package com.platform.sdk.apikeys;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * API key validation error codes.
 */
public enum APIKeyErrorCode {
    KEY_NOT_FOUND("key_not_found"),
    KEY_EXPIRED("key_expired"),
    KEY_REVOKED("key_revoked"),
    IP_NOT_ALLOWED("ip_not_allowed"),
    RATE_LIMITED("rate_limited"),
    PERMISSION_DENIED("permission_denied");

    private final String value;

    APIKeyErrorCode(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
