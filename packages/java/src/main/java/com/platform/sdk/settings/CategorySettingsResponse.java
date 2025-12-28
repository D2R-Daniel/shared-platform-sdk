package com.platform.sdk.settings;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.Map;

/**
 * Response containing settings for a single category.
 */
public class CategorySettingsResponse {
    @JsonProperty("tenant_id")
    private String tenantId;

    private SettingCategory category;
    private Map<String, Object> settings;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    // Getters and Setters
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public SettingCategory getCategory() { return category; }
    public void setCategory(SettingCategory category) { this.category = category; }

    public Map<String, Object> getSettings() { return settings; }
    public void setSettings(Map<String, Object> settings) { this.settings = settings; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
