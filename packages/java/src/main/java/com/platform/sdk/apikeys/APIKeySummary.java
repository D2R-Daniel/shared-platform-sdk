package com.platform.sdk.apikeys;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.List;

/**
 * API key summary (does not include full key).
 */
public class APIKeySummary {
    private String id;
    private String name;
    private String description;

    @JsonProperty("key_prefix")
    private String keyPrefix;

    private APIKeyEnvironment environment;
    private List<String> permissions;

    @JsonProperty("rate_limit")
    private int rateLimit;

    @JsonProperty("allowed_ips")
    private List<String> allowedIps;

    @JsonProperty("allowed_origins")
    private List<String> allowedOrigins;

    @JsonProperty("expires_at")
    private Instant expiresAt;

    @JsonProperty("last_used_at")
    private Instant lastUsedAt;

    @JsonProperty("is_active")
    private boolean isActive;

    @JsonProperty("created_at")
    private Instant createdAt;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getKeyPrefix() { return keyPrefix; }
    public void setKeyPrefix(String keyPrefix) { this.keyPrefix = keyPrefix; }

    public APIKeyEnvironment getEnvironment() { return environment; }
    public void setEnvironment(APIKeyEnvironment environment) { this.environment = environment; }

    public List<String> getPermissions() { return permissions; }
    public void setPermissions(List<String> permissions) { this.permissions = permissions; }

    public int getRateLimit() { return rateLimit; }
    public void setRateLimit(int rateLimit) { this.rateLimit = rateLimit; }

    public List<String> getAllowedIps() { return allowedIps; }
    public void setAllowedIps(List<String> allowedIps) { this.allowedIps = allowedIps; }

    public List<String> getAllowedOrigins() { return allowedOrigins; }
    public void setAllowedOrigins(List<String> allowedOrigins) { this.allowedOrigins = allowedOrigins; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public Instant getLastUsedAt() { return lastUsedAt; }
    public void setLastUsedAt(Instant lastUsedAt) { this.lastUsedAt = lastUsedAt; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
