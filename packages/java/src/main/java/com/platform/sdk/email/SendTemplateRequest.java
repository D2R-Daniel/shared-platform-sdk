package com.platform.sdk.email;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

/**
 * Request to send a templated email.
 */
public class SendTemplateRequest {
    @JsonProperty("template_slug")
    private String templateSlug;

    private List<String> to;
    private List<String> cc;
    private List<String> bcc;
    private Map<String, String> variables;

    @JsonProperty("from_name")
    private String fromName;

    @JsonProperty("reply_to")
    private String replyTo;

    // Getters and Setters
    public String getTemplateSlug() { return templateSlug; }
    public void setTemplateSlug(String templateSlug) { this.templateSlug = templateSlug; }

    public List<String> getTo() { return to; }
    public void setTo(List<String> to) { this.to = to; }

    public List<String> getCc() { return cc; }
    public void setCc(List<String> cc) { this.cc = cc; }

    public List<String> getBcc() { return bcc; }
    public void setBcc(List<String> bcc) { this.bcc = bcc; }

    public Map<String, String> getVariables() { return variables; }
    public void setVariables(Map<String, String> variables) { this.variables = variables; }

    public String getFromName() { return fromName; }
    public void setFromName(String fromName) { this.fromName = fromName; }

    public String getReplyTo() { return replyTo; }
    public void setReplyTo(String replyTo) { this.replyTo = replyTo; }
}
