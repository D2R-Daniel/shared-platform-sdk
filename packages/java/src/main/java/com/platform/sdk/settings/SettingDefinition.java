package com.platform.sdk.settings;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

/**
 * Definition of a configurable setting.
 */
public class SettingDefinition {
    private String key;
    private SettingType type;

    @JsonProperty("default_value")
    private Object defaultValue;

    private String label;
    private String description;
    private SettingCategory category;

    @JsonProperty("is_public")
    private boolean isPublic;

    @JsonProperty("is_readonly")
    private boolean isReadonly;

    @JsonProperty("validation_rules")
    private Map<String, Object> validationRules;

    @JsonProperty("display_order")
    private int displayOrder;

    // Getters and Setters
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public SettingType getType() { return type; }
    public void setType(SettingType type) { this.type = type; }

    public Object getDefaultValue() { return defaultValue; }
    public void setDefaultValue(Object defaultValue) { this.defaultValue = defaultValue; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public SettingCategory getCategory() { return category; }
    public void setCategory(SettingCategory category) { this.category = category; }

    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

    public boolean isReadonly() { return isReadonly; }
    public void setReadonly(boolean isReadonly) { this.isReadonly = isReadonly; }

    public Map<String, Object> getValidationRules() { return validationRules; }
    public void setValidationRules(Map<String, Object> validationRules) { this.validationRules = validationRules; }

    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }
}
