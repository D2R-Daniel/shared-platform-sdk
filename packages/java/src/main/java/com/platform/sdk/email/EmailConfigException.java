package com.platform.sdk.email;

/**
 * Exception thrown when email configuration is invalid or missing.
 */
public class EmailConfigException extends EmailException {
    public EmailConfigException(String message) {
        super(message);
    }

    public EmailConfigException() {
        super("Email configuration error");
    }
}
