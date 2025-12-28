package com.platform.sdk.email;

import java.util.HashMap;
import java.util.Map;

/**
 * Parameters for listing email templates.
 */
public class ListTemplatesParams {
    private Integer page;
    private Integer pageSize;
    private TemplateCategory category;
    private Boolean isActive;
    private String search;

    public Map<String, String> toQueryParams() {
        Map<String, String> params = new HashMap<>();
        if (page != null) params.put("page", page.toString());
        if (pageSize != null) params.put("page_size", pageSize.toString());
        if (category != null) params.put("category", category.getValue());
        if (isActive != null) params.put("is_active", isActive.toString());
        if (search != null) params.put("search", search);
        return params;
    }

    // Getters and Setters
    public Integer getPage() { return page; }
    public void setPage(Integer page) { this.page = page; }

    public Integer getPageSize() { return pageSize; }
    public void setPageSize(Integer pageSize) { this.pageSize = pageSize; }

    public TemplateCategory getCategory() { return category; }
    public void setCategory(TemplateCategory category) { this.category = category; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }

    public String getSearch() { return search; }
    public void setSearch(String search) { this.search = search; }
}
