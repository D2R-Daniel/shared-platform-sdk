package com.platform.sdk.settings;

/**
 * A single setting value with its definition.
 */
public class SettingValue {
    private String key;
    private Object value;
    private SettingDefinition definition;

    // Getters and Setters
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public Object getValue() { return value; }
    public void setValue(Object value) { this.value = value; }

    public SettingDefinition getDefinition() { return definition; }
    public void setDefinition(SettingDefinition definition) { this.definition = definition; }
}
