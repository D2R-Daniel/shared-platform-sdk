package com.platform.sdk.settings;

/**
 * Exception thrown when an invalid category is specified.
 */
public class InvalidCategoryException extends SettingsException {
    private final String category;

    public InvalidCategoryException(String category) {
        super("Invalid settings category: " + category);
        this.category = category;
    }

    public String getCategory() {
        return category;
    }
}
