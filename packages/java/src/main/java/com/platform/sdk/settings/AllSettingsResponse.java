package com.platform.sdk.settings;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Response containing all settings grouped by category.
 */
public class AllSettingsResponse {
    @JsonProperty("tenant_id")
    private String tenantId;

    private Map<String, Map<String, Object>> settings;
    private Map<String, List<SettingDefinition>> definitions;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    // Getters and Setters
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public Map<String, Map<String, Object>> getSettings() { return settings; }
    public void setSettings(Map<String, Map<String, Object>> settings) { this.settings = settings; }

    public Map<String, List<SettingDefinition>> getDefinitions() { return definitions; }
    public void setDefinitions(Map<String, List<SettingDefinition>> definitions) { this.definitions = definitions; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
