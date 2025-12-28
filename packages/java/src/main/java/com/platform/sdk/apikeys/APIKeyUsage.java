package com.platform.sdk.apikeys;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

/**
 * API key usage statistics.
 */
public class APIKeyUsage {
    @JsonProperty("key_id")
    private String keyId;

    private String period;

    @JsonProperty("requests_count")
    private int requestsCount;

    @JsonProperty("requests_by_endpoint")
    private Map<String, Integer> requestsByEndpoint;

    @JsonProperty("error_count")
    private int errorCount;

    @JsonProperty("rate_limit_hits")
    private int rateLimitHits;

    @JsonProperty("avg_latency_ms")
    private double avgLatencyMs;

    // Getters and Setters
    public String getKeyId() { return keyId; }
    public void setKeyId(String keyId) { this.keyId = keyId; }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public int getRequestsCount() { return requestsCount; }
    public void setRequestsCount(int requestsCount) { this.requestsCount = requestsCount; }

    public Map<String, Integer> getRequestsByEndpoint() { return requestsByEndpoint; }
    public void setRequestsByEndpoint(Map<String, Integer> requestsByEndpoint) { this.requestsByEndpoint = requestsByEndpoint; }

    public int getErrorCount() { return errorCount; }
    public void setErrorCount(int errorCount) { this.errorCount = errorCount; }

    public int getRateLimitHits() { return rateLimitHits; }
    public void setRateLimitHits(int rateLimitHits) { this.rateLimitHits = rateLimitHits; }

    public double getAvgLatencyMs() { return avgLatencyMs; }
    public void setAvgLatencyMs(double avgLatencyMs) { this.avgLatencyMs = avgLatencyMs; }
}
