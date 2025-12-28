package com.platform.sdk.apikeys;

import java.util.HashMap;
import java.util.Map;

/**
 * Parameters for listing API keys.
 */
public class ListAPIKeysParams {
    private Integer page;
    private Integer pageSize;
    private APIKeyEnvironment environment;
    private Boolean isActive;

    public Map<String, String> toQueryParams() {
        Map<String, String> params = new HashMap<>();
        if (page != null) params.put("page", page.toString());
        if (pageSize != null) params.put("page_size", pageSize.toString());
        if (environment != null) params.put("environment", environment.getValue());
        if (isActive != null) params.put("is_active", isActive.toString());
        return params;
    }

    // Getters and Setters
    public Integer getPage() { return page; }
    public void setPage(Integer page) { this.page = page; }

    public Integer getPageSize() { return pageSize; }
    public void setPageSize(Integer pageSize) { this.pageSize = pageSize; }

    public APIKeyEnvironment getEnvironment() { return environment; }
    public void setEnvironment(APIKeyEnvironment environment) { this.environment = environment; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
}
