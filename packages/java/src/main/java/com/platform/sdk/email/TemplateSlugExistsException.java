package com.platform.sdk.email;

/**
 * Exception thrown when attempting to create a template with an existing slug.
 */
public class TemplateSlugExistsException extends EmailException {
    private final String slug;

    public TemplateSlugExistsException(String slug) {
        super("Email template with slug already exists: " + slug);
        this.slug = slug;
    }

    public String getSlug() {
        return slug;
    }
}
