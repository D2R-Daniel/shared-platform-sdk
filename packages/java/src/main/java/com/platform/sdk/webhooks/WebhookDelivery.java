package com.platform.sdk.webhooks;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.Map;

/**
 * Record of a webhook delivery attempt.
 */
public class WebhookDelivery {
    private String id;

    @JsonProperty("webhook_id")
    private String webhookId;

    private WebhookEvent event;
    private Map<String, Object> payload;

    @JsonProperty("request_headers")
    private Map<String, String> requestHeaders;

    @JsonProperty("response_status")
    private Integer responseStatus;

    @JsonProperty("response_headers")
    private Map<String, String> responseHeaders;

    @JsonProperty("response_body")
    private String responseBody;

    @JsonProperty("duration_ms")
    private Integer durationMs;

    private int attempts;
    private DeliveryStatus status;

    @JsonProperty("error_message")
    private String errorMessage;

    @JsonProperty("next_retry_at")
    private Instant nextRetryAt;

    @JsonProperty("delivered_at")
    private Instant deliveredAt;

    @JsonProperty("created_at")
    private Instant createdAt;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getWebhookId() { return webhookId; }
    public void setWebhookId(String webhookId) { this.webhookId = webhookId; }

    public WebhookEvent getEvent() { return event; }
    public void setEvent(WebhookEvent event) { this.event = event; }

    public Map<String, Object> getPayload() { return payload; }
    public void setPayload(Map<String, Object> payload) { this.payload = payload; }

    public Map<String, String> getRequestHeaders() { return requestHeaders; }
    public void setRequestHeaders(Map<String, String> requestHeaders) { this.requestHeaders = requestHeaders; }

    public Integer getResponseStatus() { return responseStatus; }
    public void setResponseStatus(Integer responseStatus) { this.responseStatus = responseStatus; }

    public Map<String, String> getResponseHeaders() { return responseHeaders; }
    public void setResponseHeaders(Map<String, String> responseHeaders) { this.responseHeaders = responseHeaders; }

    public String getResponseBody() { return responseBody; }
    public void setResponseBody(String responseBody) { this.responseBody = responseBody; }

    public Integer getDurationMs() { return durationMs; }
    public void setDurationMs(Integer durationMs) { this.durationMs = durationMs; }

    public int getAttempts() { return attempts; }
    public void setAttempts(int attempts) { this.attempts = attempts; }

    public DeliveryStatus getStatus() { return status; }
    public void setStatus(DeliveryStatus status) { this.status = status; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public Instant getNextRetryAt() { return nextRetryAt; }
    public void setNextRetryAt(Instant nextRetryAt) { this.nextRetryAt = nextRetryAt; }

    public Instant getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(Instant deliveredAt) { this.deliveredAt = deliveredAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
