package com.platform.sdk.apikeys;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Request to create an API key.
 */
public class CreateAPIKeyRequest {
    private String name;
    private String description;
    private APIKeyEnvironment environment;
    private List<String> permissions;

    @JsonProperty("rate_limit")
    private Integer rateLimit;

    @JsonProperty("allowed_ips")
    private List<String> allowedIps;

    @JsonProperty("allowed_origins")
    private List<String> allowedOrigins;

    @JsonProperty("expires_in_days")
    private Integer expiresInDays;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public APIKeyEnvironment getEnvironment() { return environment; }
    public void setEnvironment(APIKeyEnvironment environment) { this.environment = environment; }

    public List<String> getPermissions() { return permissions; }
    public void setPermissions(List<String> permissions) { this.permissions = permissions; }

    public Integer getRateLimit() { return rateLimit; }
    public void setRateLimit(Integer rateLimit) { this.rateLimit = rateLimit; }

    public List<String> getAllowedIps() { return allowedIps; }
    public void setAllowedIps(List<String> allowedIps) { this.allowedIps = allowedIps; }

    public List<String> getAllowedOrigins() { return allowedOrigins; }
    public void setAllowedOrigins(List<String> allowedOrigins) { this.allowedOrigins = allowedOrigins; }

    public Integer getExpiresInDays() { return expiresInDays; }
    public void setExpiresInDays(Integer expiresInDays) { this.expiresInDays = expiresInDays; }
}
