package com.platform.sdk.apikeys;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * API key validation result.
 */
public class ValidateAPIKeyResponse {
    private boolean valid;

    @JsonProperty("tenant_id")
    private String tenantId;

    private List<String> permissions;

    @JsonProperty("has_permission")
    private Boolean hasPermission;

    private String error;

    @JsonProperty("error_code")
    private APIKeyErrorCode errorCode;

    // Getters and Setters
    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public List<String> getPermissions() { return permissions; }
    public void setPermissions(List<String> permissions) { this.permissions = permissions; }

    public Boolean getHasPermission() { return hasPermission; }
    public void setHasPermission(Boolean hasPermission) { this.hasPermission = hasPermission; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public APIKeyErrorCode getErrorCode() { return errorCode; }
    public void setErrorCode(APIKeyErrorCode errorCode) { this.errorCode = errorCode; }
}
