package com.platform.sdk.email;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Request to create an email template.
 */
public class CreateTemplateRequest {
    private String name;
    private String slug;
    private String subject;

    @JsonProperty("html_content")
    private String htmlContent;

    @JsonProperty("text_content")
    private String textContent;

    private List<String> variables;
    private TemplateCategory category;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getHtmlContent() { return htmlContent; }
    public void setHtmlContent(String htmlContent) { this.htmlContent = htmlContent; }

    public String getTextContent() { return textContent; }
    public void setTextContent(String textContent) { this.textContent = textContent; }

    public List<String> getVariables() { return variables; }
    public void setVariables(List<String> variables) { this.variables = variables; }

    public TemplateCategory getCategory() { return category; }
    public void setCategory(TemplateCategory category) { this.category = category; }
}
