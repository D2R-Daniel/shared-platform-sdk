package com.platform.sdk.webhooks;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Webhook configuration.
 */
public class Webhook {
    private String id;

    @JsonProperty("tenant_id")
    private String tenantId;

    private String name;
    private String description;
    private String url;
    private String secret;
    private List<WebhookEvent> events;
    private Map<String, String> headers;

    @JsonProperty("is_active")
    private boolean isActive;

    @JsonProperty("retry_count")
    private int retryCount;

    @JsonProperty("timeout_seconds")
    private int timeoutSeconds;

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

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getSecret() { return secret; }
    public void setSecret(String secret) { this.secret = secret; }

    public List<WebhookEvent> getEvents() { return events; }
    public void setEvents(List<WebhookEvent> events) { this.events = events; }

    public Map<String, String> getHeaders() { return headers; }
    public void setHeaders(Map<String, String> headers) { this.headers = headers; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public int getRetryCount() { return retryCount; }
    public void setRetryCount(int retryCount) { this.retryCount = retryCount; }

    public int getTimeoutSeconds() { return timeoutSeconds; }
    public void setTimeoutSeconds(int timeoutSeconds) { this.timeoutSeconds = timeoutSeconds; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
