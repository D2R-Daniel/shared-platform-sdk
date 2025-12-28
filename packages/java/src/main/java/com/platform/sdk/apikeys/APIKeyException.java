package com.platform.sdk.apikeys;

/**
 * Base exception for API key operations.
 */
public class APIKeyException extends RuntimeException {
    public APIKeyException(String message) {
        super(message);
    }

    public APIKeyException(String message, Throwable cause) {
        super(message, cause);
    }
}
