package com.platform.sdk.email;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.List;

/**
 * Email template with variable substitution support.
 */
public class EmailTemplate {
    private String id;

    @JsonProperty("tenant_id")
    private String tenantId;

    private String name;
    private String slug;
    private String subject;

    @JsonProperty("html_content")
    private String htmlContent;

    @JsonProperty("text_content")
    private String textContent;

    private List<String> variables;
    private TemplateCategory category;

    @JsonProperty("is_system")
    private boolean isSystem;

    @JsonProperty("is_active")
    private boolean isActive;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

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

    public boolean isSystem() { return isSystem; }
    public void setSystem(boolean system) { isSystem = system; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
