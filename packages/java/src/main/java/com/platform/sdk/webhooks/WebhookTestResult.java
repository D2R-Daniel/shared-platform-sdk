package com.platform.sdk.webhooks;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Result of testing a webhook.
 */
public class WebhookTestResult {
    private boolean success;

    @JsonProperty("status_code")
    private Integer statusCode;

    @JsonProperty("duration_ms")
    private Integer durationMs;

    private String error;

    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public Integer getStatusCode() { return statusCode; }
    public void setStatusCode(Integer statusCode) { this.statusCode = statusCode; }

    public Integer getDurationMs() { return durationMs; }
    public void setDurationMs(Integer durationMs) { this.durationMs = durationMs; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}
