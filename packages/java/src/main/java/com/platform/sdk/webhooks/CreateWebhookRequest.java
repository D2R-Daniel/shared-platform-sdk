package com.platform.sdk.webhooks;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

/**
 * Request to create a webhook.
 */
public class CreateWebhookRequest {
    private String name;
    private String description;
    private String url;
    private List<WebhookEvent> events;
    private Map<String, String> headers;

    @JsonProperty("retry_count")
    private Integer retryCount;

    @JsonProperty("timeout_seconds")
    private Integer timeoutSeconds;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public List<WebhookEvent> getEvents() { return events; }
    public void setEvents(List<WebhookEvent> events) { this.events = events; }

    public Map<String, String> getHeaders() { return headers; }
    public void setHeaders(Map<String, String> headers) { this.headers = headers; }

    public Integer getRetryCount() { return retryCount; }
    public void setRetryCount(Integer retryCount) { this.retryCount = retryCount; }

    public Integer getTimeoutSeconds() { return timeoutSeconds; }
    public void setTimeoutSeconds(Integer timeoutSeconds) { this.timeoutSeconds = timeoutSeconds; }
}
