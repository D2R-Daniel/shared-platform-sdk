package com.platform.sdk.email;

/**
 * Exception thrown when an email template is not found.
 */
public class TemplateNotFoundException extends EmailException {
    private final String identifier;

    public TemplateNotFoundException(String identifier) {
        super("Email template not found: " + identifier);
        this.identifier = identifier;
    }

    public String getIdentifier() {
        return identifier;
    }
}
