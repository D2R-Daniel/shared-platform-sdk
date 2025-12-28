package com.platform.sdk.email;

/**
 * Base exception for email operations.
 */
public class EmailException extends RuntimeException {
    public EmailException(String message) {
        super(message);
    }

    public EmailException(String message, Throwable cause) {
        super(message, cause);
    }
}
