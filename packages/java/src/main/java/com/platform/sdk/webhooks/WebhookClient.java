package com.platform.sdk.webhooks;

import com.platform.sdk.common.ApiException;
import com.platform.sdk.common.HttpClient;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Client for webhook management operations.
 */
public class WebhookClient {
    private final HttpClient httpClient;

    private WebhookClient(Builder builder) {
        this.httpClient = new HttpClient(builder.baseUrl, builder.timeout);
        if (builder.accessToken != null) {
            this.httpClient.setAccessToken(builder.accessToken);
        }
    }

    public void setAccessToken(String accessToken) {
        this.httpClient.setAccessToken(accessToken);
    }

    // Webhook CRUD Operations

    public WebhookListResponse list(ListWebhooksParams params) throws ApiException {
        Map<String, String> queryParams = params != null ? params.toQueryParams() : Map.of();
        return httpClient.get("/webhooks", WebhookListResponse.class, queryParams);
    }

    public WebhookListResponse list() throws ApiException {
        return list(null);
    }

    public Webhook get(String webhookId) throws ApiException {
        try {
            return httpClient.get("/webhooks/" + webhookId, Webhook.class);
        } catch (ApiException e) {
            if (e.getStatusCode() == 404) {
                throw new WebhookNotFoundException(webhookId);
            }
            throw e;
        }
    }

    public Webhook create(CreateWebhookRequest request) throws ApiException {
        return httpClient.post("/webhooks", request, Webhook.class);
    }

    public Webhook update(String webhookId, UpdateWebhookRequest request) throws ApiException {
        try {
            return httpClient.put("/webhooks/" + webhookId, request, Webhook.class);
        } catch (ApiException e) {
            if (e.getStatusCode() == 404) {
                throw new WebhookNotFoundException(webhookId);
            }
            throw e;
        }
    }

    public void delete(String webhookId) throws ApiException {
        try {
            httpClient.delete("/webhooks/" + webhookId);
        } catch (ApiException e) {
            if (e.getStatusCode() == 404) {
                throw new WebhookNotFoundException(webhookId);
            }
            throw e;
        }
    }

    public WebhookTestResult test(String webhookId, WebhookEvent event) throws ApiException {
        try {
            Map<String, Object> body = new HashMap<>();
            if (event != null) {
                body.put("event", event.getValue());
            }
            return httpClient.post("/webhooks/" + webhookId + "/test", body, WebhookTestResult.class);
        } catch (ApiException e) {
            if (e.getStatusCode() == 404) {
                throw new WebhookNotFoundException(webhookId);
            }
            throw e;
        }
    }

    public WebhookTestResult test(String webhookId) throws ApiException {
        return test(webhookId, null);
    }

    public Webhook rotateSecret(String webhookId) throws ApiException {
        try {
            return httpClient.post("/webhooks/" + webhookId + "/rotate-secret", null, Webhook.class);
        } catch (ApiException e) {
            if (e.getStatusCode() == 404) {
                throw new WebhookNotFoundException(webhookId);
            }
            throw e;
        }
    }

    // Delivery Operations

    public DeliveryListResponse listDeliveries(String webhookId, Integer page, Integer pageSize,
                                                DeliveryStatus status, WebhookEvent event) throws ApiException {
        try {
            Map<String, String> params = new HashMap<>();
            if (page != null) params.put("page", page.toString());
            if (pageSize != null) params.put("page_size", pageSize.toString());
            if (status != null) params.put("status", status.getValue());
            if (event != null) params.put("event", event.getValue());

            return httpClient.get("/webhooks/" + webhookId + "/deliveries", DeliveryListResponse.class, params);
        } catch (ApiException e) {
            if (e.getStatusCode() == 404) {
                throw new WebhookNotFoundException(webhookId);
            }
            throw e;
        }
    }

    public DeliveryListResponse listDeliveries(String webhookId) throws ApiException {
        return listDeliveries(webhookId, null, null, null, null);
    }

    public WebhookDelivery getDelivery(String webhookId, String deliveryId) throws ApiException {
        try {
            return httpClient.get("/webhooks/" + webhookId + "/deliveries/" + deliveryId, WebhookDelivery.class);
        } catch (ApiException e) {
            if (e.getStatusCode() == 404) {
                throw new DeliveryNotFoundException(deliveryId);
            }
            throw e;
        }
    }

    public WebhookDelivery retryDelivery(String webhookId, String deliveryId) throws ApiException {
        try {
            return httpClient.post("/webhooks/" + webhookId + "/deliveries/" + deliveryId + "/retry",
                    null, WebhookDelivery.class);
        } catch (ApiException e) {
            if (e.getStatusCode() == 404) {
                throw new DeliveryNotFoundException(deliveryId);
            }
            throw e;
        }
    }

    /**
     * Builder for WebhookClient.
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

        public WebhookClient build() {
            if (baseUrl == null || baseUrl.isEmpty()) {
                throw new IllegalArgumentException("baseUrl is required");
            }
            return new WebhookClient(this);
        }
    }
}
