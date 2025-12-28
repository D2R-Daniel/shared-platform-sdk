package com.platform.sdk.webhooks;

import java.util.HashMap;
import java.util.Map;

/**
 * Parameters for listing webhooks.
 */
public class ListWebhooksParams {
    private Integer page;
    private Integer pageSize;
    private Boolean isActive;
    private WebhookEvent event;

    public Map<String, String> toQueryParams() {
        Map<String, String> params = new HashMap<>();
        if (page != null) params.put("page", page.toString());
        if (pageSize != null) params.put("page_size", pageSize.toString());
        if (isActive != null) params.put("is_active", isActive.toString());
        if (event != null) params.put("event", event.getValue());
        return params;
    }

    // Getters and Setters
    public Integer getPage() { return page; }
    public void setPage(Integer page) { this.page = page; }

    public Integer getPageSize() { return pageSize; }
    public void setPageSize(Integer pageSize) { this.pageSize = pageSize; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }

    public WebhookEvent getEvent() { return event; }
    public void setEvent(WebhookEvent event) { this.event = event; }
}
