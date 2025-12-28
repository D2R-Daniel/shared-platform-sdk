package com.platform.sdk.settings;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Data types for settings.
 */
public enum SettingType {
    BOOLEAN("boolean"),
    STRING("string"),
    NUMBER("number"),
    JSON("json"),
    ARRAY("array");

    private final String value;

    SettingType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
