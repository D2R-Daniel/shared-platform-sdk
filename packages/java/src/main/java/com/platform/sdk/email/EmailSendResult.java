package com.platform.sdk.email;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Result of sending an email.
 */
public class EmailSendResult {
    private boolean success;

    @JsonProperty("message_id")
    private String messageId;

    @JsonProperty("recipients_count")
    private int recipientsCount;

    private String error;

    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessageId() { return messageId; }
    public void setMessageId(String messageId) { this.messageId = messageId; }

    public int getRecipientsCount() { return recipientsCount; }
    public void setRecipientsCount(int recipientsCount) { this.recipientsCount = recipientsCount; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}
