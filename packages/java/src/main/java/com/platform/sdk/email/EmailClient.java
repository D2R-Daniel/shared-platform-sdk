package com.platform.sdk.email;

import com.platform.sdk.common.ApiException;
import com.platform.sdk.common.HttpClient;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Client for email operations.
 */
public class EmailClient {
    private final HttpClient httpClient;

    private EmailClient(Builder builder) {
        this.httpClient = new HttpClient(builder.baseUrl, builder.timeout);
        if (builder.accessToken != null) {
            this.httpClient.setAccessToken(builder.accessToken);
        }
    }

    public void setAccessToken(String accessToken) {
        this.httpClient.setAccessToken(accessToken);
    }

    // Email Sending Operations

    public EmailSendResult send(SendEmailRequest request) throws ApiException {
        try {
            return httpClient.post("/email/send", request, EmailSendResult.class);
        } catch (ApiException e) {
            if (e.getStatusCode() == 503) {
                throw new EmailConfigException("Email service unavailable");
            }
            throw e;
        }
    }

    public EmailSendResult sendTemplate(SendTemplateRequest request) throws ApiException {
        try {
            return httpClient.post("/email/send-template", request, EmailSendResult.class);
        } catch (ApiException e) {
            if (e.getStatusCode() == 404) {
                throw new TemplateNotFoundException(request.getTemplateSlug());
            }
            if (e.getStatusCode() == 503) {
                throw new EmailConfigException("Email service unavailable");
            }
            throw e;
        }
    }

    // Template Operations

    public TemplateListResponse listTemplates(ListTemplatesParams params) throws ApiException {
        Map<String, String> queryParams = params != null ? params.toQueryParams() : Map.of();
        return httpClient.get("/email/templates", TemplateListResponse.class, queryParams);
    }

    public TemplateListResponse listTemplates() throws ApiException {
        return listTemplates(null);
    }

    public EmailTemplate getTemplate(String templateId) throws ApiException {
        try {
            return httpClient.get("/email/templates/" + templateId, EmailTemplate.class);
        } catch (ApiException e) {
            if (e.getStatusCode() == 404) {
                throw new TemplateNotFoundException(templateId);
            }
            throw e;
        }
    }

    public EmailTemplate getTemplateBySlug(String slug) throws ApiException {
        try {
            return httpClient.get("/email/templates/slug/" + slug, EmailTemplate.class);
        } catch (ApiException e) {
            if (e.getStatusCode() == 404) {
                throw new TemplateNotFoundException(slug);
            }
            throw e;
        }
    }

    public EmailTemplate createTemplate(CreateTemplateRequest request) throws ApiException {
        try {
            return httpClient.post("/email/templates", request, EmailTemplate.class);
        } catch (ApiException e) {
            if (e.getStatusCode() == 409) {
                throw new TemplateSlugExistsException(request.getSlug());
            }
            throw e;
        }
    }

    public EmailTemplate updateTemplate(String templateId, UpdateTemplateRequest request) throws ApiException {
        try {
            return httpClient.put("/email/templates/" + templateId, request, EmailTemplate.class);
        } catch (ApiException e) {
            if (e.getStatusCode() == 404) {
                throw new TemplateNotFoundException(templateId);
            }
            throw e;
        }
    }

    public void deleteTemplate(String templateId) throws ApiException {
        try {
            httpClient.delete("/email/templates/" + templateId);
        } catch (ApiException e) {
            if (e.getStatusCode() == 404) {
                throw new TemplateNotFoundException(templateId);
            }
            throw e;
        }
    }

    // Configuration Operations

    public EmailConfig getConfig() throws ApiException {
        try {
            return httpClient.get("/email/config", EmailConfig.class);
        } catch (ApiException e) {
            if (e.getStatusCode() == 404) {
                throw new EmailConfigException("No email configuration found");
            }
            throw e;
        }
    }

    public EmailConfig updateConfig(Map<String, Object> request) throws ApiException {
        return httpClient.put("/email/config", request, EmailConfig.class);
    }

    public EmailTestResult testConfig(String recipient) throws ApiException {
        Map<String, Object> body = new HashMap<>();
        if (recipient != null) {
            body.put("recipient", recipient);
        }
        return httpClient.post("/email/config/test", body, EmailTestResult.class);
    }

    public EmailTestResult testConfig() throws ApiException {
        return testConfig(null);
    }

    /**
     * Builder for EmailClient.
     */
    public static class Builder {
        private String baseUrl;
        private String accessToken;
        private Duration timeout = Duration.ofSeconds(30);

        public Builder baseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
            return this;
        }

        public Builder accessToken(String accessToken) {
            this.accessToken = accessToken;
            return this;
        }

        public Builder timeout(Duration timeout) {
            this.timeout = timeout;
            return this;
        }

        public EmailClient build() {
            if (baseUrl == null || baseUrl.isEmpty()) {
                throw new IllegalArgumentException("baseUrl is required");
            }
            return new EmailClient(this);
        }
    }
}
