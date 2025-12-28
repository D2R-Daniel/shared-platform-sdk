package com.platform.sdk.apikeys;

/**
 * Exception thrown when an API key is not found.
 */
public class APIKeyNotFoundException extends APIKeyException {
    private final String keyId;

    public APIKeyNotFoundException(String keyId) {
        super("API key not found: " + keyId);
        this.keyId = keyId;
    }

    public String getKeyId() {
        return keyId;
    }
}
