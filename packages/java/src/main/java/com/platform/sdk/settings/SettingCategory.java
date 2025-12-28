package com.platform.sdk.settings;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Categories for organizing settings.
 */
public enum SettingCategory {
    GENERAL("general"),
    BRANDING("branding"),
    FEATURES("features"),
    INTEGRATIONS("integrations"),
    SECURITY("security"),
    NOTIFICATIONS("notifications");

    private final String value;

    SettingCategory(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
