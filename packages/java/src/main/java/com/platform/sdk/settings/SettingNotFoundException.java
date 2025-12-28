package com.platform.sdk.settings;

/**
 * Exception thrown when a setting is not found.
 */
public class SettingNotFoundException extends SettingsException {
    private final String key;

    public SettingNotFoundException(String key) {
        super("Setting not found: " + key);
        this.key = key;
    }

    public String getKey() {
        return key;
    }
}
