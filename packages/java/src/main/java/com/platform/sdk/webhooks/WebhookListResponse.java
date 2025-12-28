package com.platform.sdk.webhooks;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Response containing a list of webhooks.
 */
public class WebhookListResponse {
    private List<Webhook> data;
    private int total;
    private int page;

    @JsonProperty("page_size")
    private int pageSize;

    // Getters and Setters
    public List<Webhook> getData() { return data; }
    public void setData(List<Webhook> data) { this.data = data; }

    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }
}
