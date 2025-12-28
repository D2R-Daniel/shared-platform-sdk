package com.platform.sdk.email;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Email template categories.
 */
public enum TemplateCategory {
    INVITATION("invitation"),
    VERIFICATION("verification"),
    NOTIFICATION("notification"),
    REMINDER("reminder"),
    WELCOME("welcome"),
    PASSWORD_RESET("password_reset"),
    ALERT("alert");

    private final String value;

    TemplateCategory(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
