package com.platform.sdk.email;

/**
 * Result of testing email configuration.
 */
public class EmailTestResult {
    private boolean success;
    private String message;
    private String error;

    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}
