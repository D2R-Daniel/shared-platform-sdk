package com.platform.sdk.email;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

/**
 * SMTP configuration for tenant email sending.
 */
public class EmailConfig {
    private String id;

    @JsonProperty("tenant_id")
    private String tenantId;

    @JsonProperty("smtp_host")
    private String smtpHost;

    @JsonProperty("smtp_port")
    private int smtpPort;

    @JsonProperty("smtp_user")
    private String smtpUser;

    @JsonProperty("use_tls")
    private boolean useTls;

    @JsonProperty("from_name")
    private String fromName;

    @JsonProperty("from_email")
    private String fromEmail;

    @JsonProperty("reply_to")
    private String replyTo;

    @JsonProperty("is_active")
    private boolean isActive;

    @JsonProperty("verified_at")
    private Instant verifiedAt;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getSmtpHost() { return smtpHost; }
    public void setSmtpHost(String smtpHost) { this.smtpHost = smtpHost; }

    public int getSmtpPort() { return smtpPort; }
    public void setSmtpPort(int smtpPort) { this.smtpPort = smtpPort; }

    public String getSmtpUser() { return smtpUser; }
    public void setSmtpUser(String smtpUser) { this.smtpUser = smtpUser; }

    public boolean isUseTls() { return useTls; }
    public void setUseTls(boolean useTls) { this.useTls = useTls; }

    public String getFromName() { return fromName; }
    public void setFromName(String fromName) { this.fromName = fromName; }

    public String getFromEmail() { return fromEmail; }
    public void setFromEmail(String fromEmail) { this.fromEmail = fromEmail; }

    public String getReplyTo() { return replyTo; }
    public void setReplyTo(String replyTo) { this.replyTo = replyTo; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public Instant getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(Instant verifiedAt) { this.verifiedAt = verifiedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
