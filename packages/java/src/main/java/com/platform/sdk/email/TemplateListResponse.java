package com.platform.sdk.email;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Response containing a list of email templates.
 */
public class TemplateListResponse {
    private List<EmailTemplate> data;
    private int total;
    private int page;

    @JsonProperty("page_size")
    private int pageSize;

    // Getters and Setters
    public List<EmailTemplate> getData() { return data; }
    public void setData(List<EmailTemplate> data) { this.data = data; }

    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }
}
