package com.platform.sdk.apikeys;

import com.platform.sdk.common.ApiException;
import com.platform.sdk.common.HttpClient;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Client for API key management operations.
 */
public class APIKeyClient {
    private final HttpClient httpClient;

    private APIKeyClient(Builder builder) {
        this.httpClient = new HttpClient(builder.baseUrl, builder.timeout);
        if (builder.accessToken != null) {
            this.httpClient.setAccessToken(builder.accessToken);
        }
    }

    public void setAccessToken(String accessToken) {
        this.httpClient.setAccessToken(accessToken);
    }

    // API Key CRUD Operations

    public APIKeyListResponse list(ListAPIKeysParams params) throws ApiException {
        Map<String, String> queryParams = params != null ? params.toQueryParams() : Map.of();
        return httpClient.get("/api-keys", APIKeyListResponse.class, queryParams);
    }

    public APIKeyListResponse list() throws ApiException {
        return list(null);
    }

    public APIKeySummary get(String keyId) throws ApiException {
        try {
            return httpClient.get("/api-keys/" + keyId, APIKeySummary.class);
        } catch (ApiException e) {
            if (e.getStatusCode() == 404) {
                throw new APIKeyNotFoundException(keyId);
            }
            throw e;
        }
    }

    public CreateAPIKeyResponse create(CreateAPIKeyRequest request) throws ApiException {
        return httpClient.post("/api-keys", request, CreateAPIKeyResponse.class);
    }

    public APIKeySummary update(String keyId, UpdateAPIKeyRequest request) throws ApiException {
        try {
            return httpClient.put("/api-keys/" + keyId, request, APIKeySummary.class);
        } catch (ApiException e) {
            if (e.getStatusCode() == 404) {
                throw new APIKeyNotFoundException(keyId);
            }
            throw e;
        }
    }

    public void revoke(String keyId, String reason) throws ApiException {
        try {
            Map<String, Object> body = new HashMap<>();
            if (reason != null) {
                body.put("reason", reason);
            }
            httpClient.delete("/api-keys/" + keyId);
        } catch (ApiException e) {
            if (e.getStatusCode() == 404) {
                throw new APIKeyNotFoundException(keyId);
            }
            throw e;
        }
    }

    public void revoke(String keyId) throws ApiException {
        revoke(keyId, null);
    }

    public CreateAPIKeyResponse regenerate(String keyId) throws ApiException {
        try {
            return httpClient.post("/api-keys/" + keyId + "/regenerate", null, CreateAPIKeyResponse.class);
        } catch (ApiException e) {
            if (e.getStatusCode() == 404) {
                throw new APIKeyNotFoundException(keyId);
            }
            throw e;
        }
    }

    // Usage Operations

    public APIKeyUsage getUsage(String keyId, String period) throws ApiException {
        try {
            Map<String, String> params = new HashMap<>();
            params.put("period", period != null ? period : "day");
            return httpClient.get("/api-keys/" + keyId + "/usage", APIKeyUsage.class, params);
        } catch (ApiException e) {
            if (e.getStatusCode() == 404) {
                throw new APIKeyNotFoundException(keyId);
            }
            throw e;
        }
    }

    public APIKeyUsage getUsage(String keyId) throws ApiException {
        return getUsage(keyId, "day");
    }

    // Validation Operations

    public ValidateAPIKeyResponse validate(String key, String requiredPermission) throws ApiException {
        Map<String, String> body = new HashMap<>();
        body.put("key", key);
        if (requiredPermission != null) {
            body.put("required_permission", requiredPermission);
        }
        return httpClient.post("/api-keys/validate", body, ValidateAPIKeyResponse.class);
    }

    public ValidateAPIKeyResponse validate(String key) throws ApiException {
        return validate(key, null);
    }

    public boolean isValid(String key) throws ApiException {
        ValidateAPIKeyResponse result = validate(key);
        return result.isValid();
    }

    public boolean hasPermission(String key, String permission) throws ApiException {
        ValidateAPIKeyResponse result = validate(key, permission);
        return result.isValid() && Boolean.TRUE.equals(result.getHasPermission());
    }

    /**
     * Builder for APIKeyClient.
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

        public APIKeyClient build() {
            if (baseUrl == null || baseUrl.isEmpty()) {
                throw new IllegalArgumentException("baseUrl is required");
            }
            return new APIKeyClient(this);
        }
    }
}
