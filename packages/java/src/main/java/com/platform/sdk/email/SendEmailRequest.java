package com.platform.sdk.email;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Request to send an email directly.
 */
public class SendEmailRequest {
    private List<String> to;
    private List<String> cc;
    private List<String> bcc;
    private String subject;

    @JsonProperty("html_content")
    private String htmlContent;

    @JsonProperty("text_content")
    private String textContent;

    @JsonProperty("from_name")
    private String fromName;

    @JsonProperty("reply_to")
    private String replyTo;

    // Getters and Setters
    public List<String> getTo() { return to; }
    public void setTo(List<String> to) { this.to = to; }

    public List<String> getCc() { return cc; }
    public void setCc(List<String> cc) { this.cc = cc; }

    public List<String> getBcc() { return bcc; }
    public void setBcc(List<String> bcc) { this.bcc = bcc; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getHtmlContent() { return htmlContent; }
    public void setHtmlContent(String htmlContent) { this.htmlContent = htmlContent; }

    public String getTextContent() { return textContent; }
    public void setTextContent(String textContent) { this.textContent = textContent; }

    public String getFromName() { return fromName; }
    public void setFromName(String fromName) { this.fromName = fromName; }

    public String getReplyTo() { return replyTo; }
    public void setReplyTo(String replyTo) { this.replyTo = replyTo; }
}
