package com.platform.sdk.apikeys;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.List;

/**
 * Full API key model (only returned on creation).
 */
public class APIKey {
    private String id;

    @JsonProperty("tenant_id")
    private String tenantId;

    private String name;
    private String description;
    private String key;

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

    @JsonProperty("last_used_ip")
    private String lastUsedIp;

    @JsonProperty("usage_count")
    private int usageCount;

    @JsonProperty("revoked_at")
    private Instant revokedAt;

    @JsonProperty("revoked_by")
    private String revokedBy;

    @JsonProperty("revoke_reason")
    private String revokeReason;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("created_by")
    private String createdBy;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

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

    public List<String> getAllowedIps() { return allowedIps; }
    public void setAllowedIps(List<String> allowedIps) { this.allowedIps = allowedIps; }

    public List<String> getAllowedOrigins() { return allowedOrigins; }
    public void setAllowedOrigins(List<String> allowedOrigins) { this.allowedOrigins = allowedOrigins; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public Instant getLastUsedAt() { return lastUsedAt; }
    public void setLastUsedAt(Instant lastUsedAt) { this.lastUsedAt = lastUsedAt; }

    public String getLastUsedIp() { return lastUsedIp; }
    public void setLastUsedIp(String lastUsedIp) { this.lastUsedIp = lastUsedIp; }

    public int getUsageCount() { return usageCount; }
    public void setUsageCount(int usageCount) { this.usageCount = usageCount; }

    public Instant getRevokedAt() { return revokedAt; }
    public void setRevokedAt(Instant revokedAt) { this.revokedAt = revokedAt; }

    public String getRevokedBy() { return revokedBy; }
    public void setRevokedBy(String revokedBy) { this.revokedBy = revokedBy; }

    public String getRevokeReason() { return revokeReason; }
    public void setRevokeReason(String revokeReason) { this.revokeReason = revokeReason; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
