package com.platform.sdk.settings;

/**
 * Exception thrown when a setting value is invalid.
 */
public class InvalidSettingValueException extends SettingsException {
    private final String key;

    public InvalidSettingValueException(String key, String message) {
        super("Invalid value for setting '" + key + "': " + message);
        this.key = key;
    }

    public String getKey() {
        return key;
    }
}
