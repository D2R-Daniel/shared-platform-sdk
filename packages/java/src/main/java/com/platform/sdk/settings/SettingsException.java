package com.platform.sdk.settings;

/**
 * Base exception for settings operations.
 */
public class SettingsException extends RuntimeException {
    public SettingsException(String message) {
        super(message);
    }

    public SettingsException(String message, Throwable cause) {
        super(message, cause);
    }
}
