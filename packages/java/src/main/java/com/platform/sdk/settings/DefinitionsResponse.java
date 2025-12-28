package com.platform.sdk.settings;

import java.util.List;

/**
 * Response containing setting definitions.
 */
public class DefinitionsResponse {
    private List<SettingDefinition> definitions;

    // Getters and Setters
    public List<SettingDefinition> getDefinitions() { return definitions; }
    public void setDefinitions(List<SettingDefinition> definitions) { this.definitions = definitions; }
}
