package com.platform.sdk.apikeys;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Request to update an API key.
 */
public class UpdateAPIKeyRequest {
    private String name;
    private String description;
    private List<String> permissions;

    @JsonProperty("rate_limit")
    private Integer rateLimit;

    @JsonProperty("allowed_ips")
    private List<String> allowedIps;

    @JsonProperty("allowed_origins")
    private List<String> allowedOrigins;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getPermissions() { return permissions; }
    public void setPermissions(List<String> permissions) { this.permissions = permissions; }

    public Integer getRateLimit() { return rateLimit; }
    public void setRateLimit(Integer rateLimit) { this.rateLimit = rateLimit; }

    public List<String> getAllowedIps() { return allowedIps; }
    public void setAllowedIps(List<String> allowedIps) { this.allowedIps = allowedIps; }

    public List<String> getAllowedOrigins() { return allowedOrigins; }
    public void setAllowedOrigins(List<String> allowedOrigins) { this.allowedOrigins = allowedOrigins; }
}
