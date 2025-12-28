package com.platform.sdk.apikeys;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.List;

/**
 * Response when creating an API key (includes full key).
 */
public class CreateAPIKeyResponse {
    private String id;
    private String name;
    private String key;

    @JsonProperty("key_prefix")
    private String keyPrefix;

    private APIKeyEnvironment environment;
    private List<String> permissions;

    @JsonProperty("rate_limit")
    private int rateLimit;

    @JsonProperty("expires_at")
    private Instant expiresAt;

    @JsonProperty("created_at")
    private Instant createdAt;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getKeyPrefix() { return keyPrefix; }
    public void setKeyPrefix(String keyPrefix) { this.keyPrefix = keyPrefix; }

    public APIKeyEnvironment getEnvironment() { return environment; }
    public void setEnvironment(APIKeyEnvironment environment) { this.environment = environment; }

    public List<String> getPermissions() { return permissions; }
    public void setPermissions(List<String> permissions) { this.permissions = permissions; }

    public int getRateLimit() { return rateLimit; }
    public void setRateLimit(int rateLimit) { this.rateLimit = rateLimit; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
