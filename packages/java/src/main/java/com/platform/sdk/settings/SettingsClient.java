package com.platform.sdk.settings;

import com.platform.sdk.common.ApiException;
import com.platform.sdk.common.HttpClient;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Client for settings management operations.
 */
public class SettingsClient {
    private final HttpClient httpClient;

    private SettingsClient(Builder builder) {
        this.httpClient = new HttpClient(builder.baseUrl, builder.timeout);
        if (builder.accessToken != null) {
            this.httpClient.setAccessToken(builder.accessToken);
        }
    }

    public void setAccessToken(String accessToken) {
        this.httpClient.setAccessToken(accessToken);
    }

    // Settings Operations

    public AllSettingsResponse getAll(boolean includeDefinitions) throws ApiException {
        Map<String, String> params = new HashMap<>();
        params.put("include_definitions", String.valueOf(includeDefinitions));
        return httpClient.get("/settings", AllSettingsResponse.class, params);
    }

    public AllSettingsResponse getAll() throws ApiException {
        return getAll(false);
    }

    public CategorySettingsResponse getCategory(SettingCategory category) throws ApiException {
        try {
            return httpClient.get("/settings/" + category.getValue(), CategorySettingsResponse.class);
        } catch (ApiException e) {
            if (e.getStatusCode() == 400) {
                throw new InvalidCategoryException(category.getValue());
            }
            throw e;
        }
    }

    public CategorySettingsResponse updateCategory(SettingCategory category, Map<String, Object> settings)
            throws ApiException {
        try {
            Map<String, Object> body = Map.of("settings", settings);
            return httpClient.put("/settings/" + category.getValue(), body, CategorySettingsResponse.class);
        } catch (ApiException e) {
            if (e.getStatusCode() == 400) {
                throw new InvalidSettingValueException("unknown", "Invalid settings values");
            }
            if (e.getStatusCode() == 404) {
                throw new InvalidCategoryException(category.getValue());
            }
            throw e;
        }
    }

    public SettingValue get(String key) throws ApiException {
        try {
            return httpClient.get("/settings/" + key, SettingValue.class);
        } catch (ApiException e) {
            if (e.getStatusCode() == 404) {
                throw new SettingNotFoundException(key);
            }
            throw e;
        }
    }

    public SettingValue set(String key, Object value) throws ApiException {
        try {
            Map<String, Object> body = Map.of("value", value);
            return httpClient.put("/settings/" + key, body, SettingValue.class);
        } catch (ApiException e) {
            if (e.getStatusCode() == 400) {
                throw new InvalidSettingValueException(key, "Invalid value");
            }
            if (e.getStatusCode() == 404) {
                throw new SettingNotFoundException(key);
            }
            throw e;
        }
    }

    public CategorySettingsResponse resetCategory(SettingCategory category) throws ApiException {
        try {
            return httpClient.post("/settings/reset/" + category.getValue(), null, CategorySettingsResponse.class);
        } catch (ApiException e) {
            if (e.getStatusCode() == 400) {
                throw new InvalidCategoryException(category.getValue());
            }
            throw e;
        }
    }

    public List<SettingDefinition> getDefinitions(SettingCategory category, Boolean isPublic) throws ApiException {
        Map<String, String> params = new HashMap<>();
        if (category != null) params.put("category", category.getValue());
        if (isPublic != null) params.put("is_public", isPublic.toString());

        DefinitionsResponse response = httpClient.get("/settings/definitions", DefinitionsResponse.class, params);
        return response.getDefinitions();
    }

    public List<SettingDefinition> getDefinitions() throws ApiException {
        return getDefinitions(null, null);
    }

    // Convenience Methods

    public Object getValue(String key, Object defaultValue) {
        try {
            SettingValue setting = get(key);
            return setting.getValue();
        } catch (SettingNotFoundException e) {
            return defaultValue;
        } catch (ApiException e) {
            return defaultValue;
        }
    }

    public boolean isFeatureEnabled(String feature) {
        String key = feature.startsWith("features.") ? feature : "features." + feature;
        Object value = getValue(key, false);
        return Boolean.TRUE.equals(value);
    }

    /**
     * Builder for SettingsClient.
     */
    public static class Builder {
        private String baseUrl;
        private String accessToken;
        private Duration timeout = Duration.ofSeconds(30);

        public Builder baseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
            return this;
        }

        public Builder accessToken(String accessToken) {
            this.accessToken = accessToken;
            return this;
        }

        public Builder timeout(Duration timeout) {
            this.timeout = timeout;
            return this;
        }

        public SettingsClient build() {
            if (baseUrl == null || baseUrl.isEmpty()) {
                throw new IllegalArgumentException("baseUrl is required");
            }
            return new SettingsClient(this);
        }
    }
}
