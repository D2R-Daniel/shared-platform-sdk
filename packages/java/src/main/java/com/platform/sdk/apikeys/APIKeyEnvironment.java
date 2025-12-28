package com.platform.sdk.apikeys;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * API key environment type.
 */
public enum APIKeyEnvironment {
    LIVE("live"),
    TEST("test");

    private final String value;

    APIKeyEnvironment(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
