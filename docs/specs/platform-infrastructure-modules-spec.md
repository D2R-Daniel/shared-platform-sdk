# Platform Infrastructure Modules -- Detailed Requirements Specification

**Document**: Platform Infrastructure Modules Enhancement & Expansion
**Version**: 1.0
**Date**: 2026-02-06
**Status**: Draft
**Branch**: `006-platform-component-expansion`
**Scope**: 5 existing module enhancements + 2 new modules

---

## Table of Contents

1. [Webhooks Module (Enhancement)](#1-webhooks-module-enhancement)
2. [API Keys Module (Enhancement)](#2-api-keys-module-enhancement)
3. [Email Module (Enhancement)](#3-email-module-enhancement)
4. [Settings Module (Enhancement)](#4-settings-module-enhancement)
5. [Invitations Module (Enhancement)](#5-invitations-module-enhancement)
6. [Audit Logs Module (New -- P1)](#6-audit-logs-module-new----p1)
7. [Admin Portal Components Module (New -- P3)](#7-admin-portal-components-module-new----p3)

---

## 1. Webhooks Module (Enhancement)

### Overview

The Webhooks module enables tenants to subscribe to platform events and receive HTTP POST notifications at their configured endpoints. This is the backbone of integration infrastructure -- every significant action on the platform (user creation, role change, subscription update) should be deliverable to external systems in near-real-time.

**Value Proposition**: Reliable, Svix-grade webhook infrastructure built into the platform, eliminating the need for customers to integrate a separate webhook service. This is a key differentiator for developer experience and integration ecosystem growth.

### Current Capabilities (Implemented)

| Capability | Status | Details |
|------------|--------|---------|
| Webhook CRUD | Done | create, list, get, update, delete |
| Event Subscription | Done | Via `events` array on webhook config |
| Signature Verification | Done | HMAC-SHA256 with timestamp; `sha256={hex_digest}` format |
| Delivery Tracking | Done | WebhookDelivery model with status, attempts, duration |
| Retry Logic | Done | Configurable `retry_count` (0-10), `next_retry_at` |
| Test Webhook | Done | `test()` sends synthetic payload |
| Secret Rotation | Done | `rotate_secret()` method |
| Custom Headers | Done | Arbitrary headers per webhook |
| Event Listing | Done | `list_events()` returns available event types |
| Delivery Retry | Done | Manual `retry_delivery()` for individual deliveries |

### Competitive Analysis

| Feature | Auth0 | Clerk/Svix | WorkOS | Firebase | Supabase | Our SDK |
|---------|-------|-----------|--------|----------|----------|---------|
| Webhook CRUD | Yes | Yes | Yes | N/A (Functions) | Auth Hooks | Yes |
| Signature Verification | Token-based | Svix signing (symmetric + asymmetric) | HMAC | N/A | Standard Webhooks | HMAC-SHA256 |
| Event Type Filtering | Per stream | Per endpoint, hierarchical grouping | Per endpoint | Per function | Per hook | Per webhook |
| Retry with Exponential Backoff | 3 retries | 8 attempts, exponential schedule | Yes | N/A | Yes (5s timeout) | Configurable count, no backoff schedule |
| Delivery Logs & Debugging | Health tab, 7-day window | Full delivery history with response | Yes | Cloud Logging | Postgres logs | Delivery model |
| Bulk Retry / Recovery | No | Yes (recover all from date) | No | No | No | Single retry only |
| Self-Service Portal | Dashboard only | Svix App Portal (embeddable) | Dashboard | Console | Dashboard | No portal |
| Auto-Disable on Failure | Yes (7 days) | Yes (configurable) | Yes | N/A | No | No |
| Multiple Signature Schemes | No | Symmetric + Asymmetric | No | No | No | Symmetric only |
| Event Type Registry | Implicit | Explicit with schemas | Explicit | Trigger-based | Hook-based | Enum only |
| Payload Transformation | No | Yes (inflight modification) | No | Yes (via code) | Yes (via SQL) | No |
| Rate Limiting / Throttling | N/A | Yes (per endpoint) | N/A | N/A | N/A | No |

**Key Gaps Identified**:
1. No exponential backoff schedule (just retry count)
2. No automatic disabling on sustained failures
3. No bulk recovery ("recover all failed since date X")
4. No self-service management portal for end users
5. No event type schema/documentation registry
6. No asymmetric signature support
7. No endpoint rate limiting/throttling
8. No webhook health monitoring metrics

### Requirements

#### Core Features (Must Have)

- **Exponential Backoff Retry Schedule**: Replace simple `retry_count` with a configurable exponential backoff schedule. Default schedule: immediately, 5s, 5m, 30m, 2h, 5h, 10h, 10h (matching Svix). Allow tenants to customize the schedule.
  - API methods: `getRetrySchedule()`, `updateRetrySchedule(schedule)`
  - Models: `RetrySchedule` with `intervals: Duration[]` and `max_retries: int`

- **Automatic Disable on Sustained Failure**: When a webhook endpoint fails for N consecutive days (configurable, default 7), automatically pause the webhook and notify the tenant. Webhook enters `disabled_by_system` status.
  - API methods: `getHealth(webhookId)`, `enable(webhookId)`, `disable(webhookId)`
  - Models: `WebhookHealth` with `consecutive_failures`, `last_success_at`, `status_reason`
  - New webhook statuses: `active`, `paused`, `disabled_by_system`, `disabled_by_user`

- **Bulk Recovery**: Allow recovering (retrying) all failed deliveries since a given timestamp for a specific webhook.
  - API methods: `recoverDeliveries(webhookId, since: DateTime)`
  - Models: `RecoveryResult` with `recovered_count`, `failed_count`, `skipped_count`

- **Event Type Registry**: Formalize event types with schemas and documentation. Support hierarchical grouping (e.g., subscribing to `user.*` covers all user events). Provide JSON Schema for each event type's payload.
  - API methods: `listEventTypes()`, `getEventType(name)`, `getEventSchema(name)`
  - Models: `EventType` with `name`, `description`, `category`, `schema`, `example_payload`, `version`

- **Webhook Endpoint Health Monitoring**: Track success rate, average latency, and failure streaks per webhook endpoint.
  - API methods: `getMetrics(webhookId, period)`
  - Models: `WebhookMetrics` with `success_rate`, `avg_latency_ms`, `total_deliveries`, `failed_deliveries`, `period`

- **Idempotency Keys**: Include a unique idempotency key in each webhook delivery to allow receivers to deduplicate.
  - Header: `X-Webhook-Id` (unique message ID per delivery attempt)
  - All retries of the same event share the same `X-Webhook-Id`

#### Enhanced Features (Should Have)

- **Asymmetric Signature Support**: Add Ed25519 or RSA asymmetric signing as an alternative to HMAC-SHA256. Useful when the webhook consumer does not want to store a shared secret.
  - API methods: `getSigningKey(webhookId)`, `rotateSigningKey(webhookId)`
  - Models: `SigningConfig` with `scheme: "hmac-sha256" | "ed25519"`, `public_key`

- **Endpoint Rate Limiting / Throttling**: Allow configuring maximum delivery rate per endpoint to prevent overwhelming consumer systems.
  - Field on Webhook: `max_deliveries_per_second: int` (default unlimited)

- **Payload Transformation**: Allow tenants to define simple payload transformations (field mapping, filtering) before delivery. Supports integration with systems expecting specific payload formats.
  - API methods: `setTransformation(webhookId, template)`, `getTransformation(webhookId)`, `testTransformation(webhookId, samplePayload)`
  - Models: `PayloadTransformation` with `template` (Liquid/JSONPath)

- **Delivery Filtering**: Beyond event type filtering, allow filtering deliveries by payload content (e.g., only deliver `user.updated` when `data.role` changed).
  - Field on Webhook: `filter_rules: FilterRule[]`
  - Model: `FilterRule` with `field`, `operator`, `value`

#### Future Features (Nice to Have)

- **Self-Service Webhook Portal**: Embeddable portal component (similar to Svix App Portal) that allows end-users to manage their own webhook endpoints, view delivery history, and test endpoints.
- **Webhook Analytics Dashboard**: Visual dashboard showing delivery volume, success rates, latency distribution, and failure trends.
- **Multi-Destination Fan-Out**: Single event delivered to multiple endpoints simultaneously with independent retry tracking.
- **Dead Letter Queue**: Failed deliveries after all retries are moved to a DLQ that tenants can inspect and manually replay.

### API Surface

| Method | Description | Parameters | Returns |
|--------|------------|------------|---------|
| `list(page, pageSize, isActive, event)` | List webhooks | Pagination + filters | `WebhookListResponse` |
| `get(webhookId)` | Get webhook by ID | `webhookId: string` | `Webhook` |
| `create(request)` | Create webhook | `CreateWebhookRequest` | `Webhook` |
| `update(webhookId, request)` | Update webhook | `webhookId`, `UpdateWebhookRequest` | `Webhook` |
| `delete(webhookId)` | Delete webhook | `webhookId: string` | `void` |
| `enable(webhookId)` | Enable a paused/disabled webhook | `webhookId: string` | `Webhook` |
| `disable(webhookId)` | Disable a webhook | `webhookId: string` | `Webhook` |
| `test(webhookId, event?)` | Send test payload | `webhookId`, optional `event` | `WebhookTestResult` |
| `rotateSecret(webhookId)` | Rotate signing secret | `webhookId: string` | `Webhook` |
| `getHealth(webhookId)` | Get endpoint health | `webhookId: string` | `WebhookHealth` |
| `getMetrics(webhookId, period)` | Get delivery metrics | `webhookId`, `period` | `WebhookMetrics` |
| `listDeliveries(webhookId, ...)` | List deliveries | Pagination + filters | `DeliveryListResponse` |
| `getDelivery(webhookId, deliveryId)` | Get delivery detail | IDs | `WebhookDelivery` |
| `retryDelivery(webhookId, deliveryId)` | Retry single delivery | IDs | `WebhookDelivery` |
| `recoverDeliveries(webhookId, since)` | Bulk recover failed | `webhookId`, `since: DateTime` | `RecoveryResult` |
| `listEventTypes()` | List all event types | None | `EventType[]` |
| `getEventType(name)` | Get event type detail | `name: string` | `EventType` |
| `getRetrySchedule(webhookId)` | Get retry config | `webhookId: string` | `RetrySchedule` |
| `updateRetrySchedule(webhookId, schedule)` | Update retry config | `webhookId`, `RetrySchedule` | `RetrySchedule` |

### Models

- **Webhook** (enhanced): Add `status: WebhookStatus`, `retry_schedule: RetrySchedule`, `max_deliveries_per_second: int?`, `filter_rules: FilterRule[]?`, `disabled_reason: string?`, `consecutive_failures: int`
- **WebhookStatus**: `active | paused | disabled_by_system | disabled_by_user`
- **RetrySchedule**: `intervals: Duration[]`, `max_retries: int`
- **WebhookHealth**: `webhook_id`, `status`, `consecutive_failures`, `last_success_at`, `last_failure_at`, `success_rate_7d`, `avg_latency_ms_7d`, `status_reason`
- **WebhookMetrics**: `webhook_id`, `period`, `total_deliveries`, `successful_deliveries`, `failed_deliveries`, `success_rate`, `avg_latency_ms`, `p95_latency_ms`, `p99_latency_ms`
- **RecoveryResult**: `webhook_id`, `since`, `recovered_count`, `failed_count`, `skipped_count`, `recovery_id`
- **EventType**: `name`, `description`, `category`, `schema: JSONSchema`, `example_payload`, `version`, `deprecated: bool`
- **FilterRule**: `field: string`, `operator: "equals" | "not_equals" | "contains" | "exists"`, `value: any`
- **PayloadTransformation**: `template: string`, `format: "liquid" | "jsonpath"`, `enabled: bool`
- **WebhookDelivery** (enhanced): Add `idempotency_key: string`, `recovery_id: string?`

### Events (for webhooks -- meta events)

- `webhook.created`: When a new webhook endpoint is registered
- `webhook.updated`: When webhook configuration changes
- `webhook.deleted`: When a webhook is removed
- `webhook.disabled`: When a webhook is auto-disabled due to failures
- `webhook.enabled`: When a webhook is re-enabled

### Error Scenarios

| Scenario | HTTP Status | Python | TypeScript | Java |
|----------|-------------|--------|------------|------|
| Webhook not found | 404 | `WebhookNotFoundError` | `WebhookNotFoundError` | `WebhookNotFoundException` |
| Delivery not found | 404 | `DeliveryNotFoundError` | `DeliveryNotFoundError` | `DeliveryNotFoundException` |
| Invalid URL format | 400 | `ValidationError` | `ValidationError` | `ValidationException` |
| URL unreachable on test | 422 | `WebhookTestError` | `WebhookTestError` | `WebhookTestException` |
| Recovery already in progress | 409 | `RecoveryInProgressError` | `RecoveryInProgressError` | `RecoveryInProgressException` |
| Webhook disabled | 409 | `WebhookDisabledError` | `WebhookDisabledError` | `WebhookDisabledException` |
| Invalid signature scheme | 400 | `ValidationError` | `ValidationError` | `ValidationException` |
| Rate limit on webhook API | 429 | `RateLimitError` | `RateLimitError` | `RateLimitException` |

### Cross-Language Notes

- **Python**: `verify_signature()` and `generate_signature()` already exist in `webhooks/signature.py`. Extend to support asymmetric schemes. Use `cryptography` library for Ed25519.
- **TypeScript**: Mirror signature utilities in `webhooks/signature.ts`. Use Node.js `crypto` module. Ensure browser-compatible verification (for consumer-side validation in browser environments).
- **Java**: Use `javax.crypto.Mac` for HMAC-SHA256 and `java.security.Signature` for Ed25519. Ensure constant-time comparison for signature validation. Builder pattern for `RetrySchedule` construction.

---

## 2. API Keys Module (Enhancement)

### Overview

The API Keys module provides programmatic access management for the platform. API keys are long-lived credentials that tenants use to integrate their systems with the platform API. They support environment separation (live/test), fine-grained permissions, rate limiting, and IP restrictions.

**Value Proposition**: Production-ready API key infrastructure that enables tenants to securely expose their platform integration to third-party services, with self-service management and comprehensive usage analytics.

### Current Capabilities (Implemented)

| Capability | Status | Details |
|------------|--------|---------|
| Key Generation | Done | Format: `sk_{environment}_{32-char-hex}` |
| Key Management | Done | list, get, create, update, revoke, regenerate |
| Validation | Done | `validate()` with permission check |
| Convenience Methods | Done | `is_valid()`, `has_permission()` |
| Rate Limiting | Done | Per-key, configurable requests/hour |
| IP Restrictions | Done | `allowed_ips` whitelist |
| Origin Restrictions | Done | `allowed_origins` CORS whitelist |
| Usage Tracking | Done | `get_usage()` with period aggregation |
| Environment Separation | Done | `live` and `test` environments |
| Key Prefix Display | Done | First 12 chars for safe display |
| Expiration | Done | `expires_at` / `expires_in_days` |
| Revocation with Reason | Done | `revoke(reason)` with audit trail |

### Competitive Analysis

| Feature | Auth0 | Clerk | WorkOS | Firebase | Supabase | Our SDK |
|---------|-------|-------|--------|----------|----------|---------|
| API Key CRUD | M2M app tokens | Yes (beta) | Yes | Console-only | Dashboard-only | Yes |
| Scoped Permissions | OAuth scopes | Scopes array | Fine-grained permissions | IAM roles | RLS policies | Permission strings |
| Environment Separation | Tenants (dev/prod) | Dev/Prod instances | Staging/Production | Projects | Projects | live/test |
| Rate Limiting | Per-app limits | Not yet | Not documented | Quota-based | Rate limiting | Per-key configurable |
| IP Restrictions | N/A | N/A | N/A | API key restrictions | N/A | Yes |
| Key Rotation / Regeneration | Client secret rotation | Revoke + recreate | Regenerate in dashboard | Regenerate | Rotate secrets | `regenerate()` |
| Usage Analytics | Dashboard analytics | Not yet | Not documented | Usage dashboard | Not exposed | `get_usage()` |
| Self-Service UI Widget | Dashboard | `<UserProfile />` API Keys tab | API Keys Widget | Console | Dashboard | No widget |
| User/Org Scoping | Per-app | Per-user or per-org | Per-org | Per-project | Per-project | Per-tenant |
| Multiple Key Types | Client ID/Secret pairs | Single type | Single type | Multiple (Browser, Server, Admin) | anon/service_role/secret | Single type |
| Expiration | Token expiry (24h) | Configurable (default: never) | Not documented | No expiry | No expiry | Configurable |
| Key Prefix Convention | N/A | N/A | `sk_` prefix | `AIza...` | `sb_publishable_`, `sb_secret_` | `sk_live_`, `sk_test_` |
| Audit Trail | Logs | Not yet | Not documented | Cloud Audit Logs | Not exposed | `revoked_by`, `revoke_reason` |

**Key Gaps Identified**:
1. No user-scoped or organization-scoped keys (only tenant-scoped)
2. No multiple key types (publishable vs secret)
3. No key labels/tags for organization
4. No usage alerts/notifications when approaching rate limits
5. No key activity log (beyond aggregate usage)
6. No self-service management widget
7. No batch operations (bulk revoke, bulk create)
8. No key metadata/custom properties

### Requirements

#### Core Features (Must Have)

- **Publishable Keys**: Introduce a second key type -- publishable keys (format: `pk_{environment}_{32-char-hex}`) for client-side use with restricted permissions. These keys are safe to embed in front-end code.
  - API methods: `createPublishable(request)`, `listPublishable()`
  - Models: `APIKeyType` enum: `secret | publishable`
  - Field on `APIKey`: `key_type: APIKeyType`

- **User and Organization Scoping**: Allow keys to be scoped to a specific user or sub-organization within a tenant, not just to the entire tenant.
  - Fields on `CreateAPIKeyRequest`: `scope_type: "tenant" | "user" | "organization"`, `scope_id: string?`
  - Fields on `APIKeySummary`: `scope_type`, `scope_id`, `scope_name`

- **Key Labels and Tags**: Add tagging support for key organization and filtering.
  - Field on `APIKey`: `tags: string[]`, `labels: Record<string, string>`
  - Filter parameter: `list(tags=["production", "integration"])`

- **Key Activity Log**: Detailed per-key activity log showing individual requests (not just aggregates), including endpoint, status, IP, timestamp.
  - API methods: `listActivity(keyId, page, pageSize, startDate?, endDate?)`
  - Models: `APIKeyActivity` with `timestamp`, `endpoint`, `method`, `status_code`, `ip_address`, `user_agent`, `latency_ms`

- **Usage Alerts**: Configurable alerts when a key approaches its rate limit threshold.
  - API methods: `setUsageAlert(keyId, threshold)`, `listUsageAlerts(keyId)`
  - Models: `UsageAlert` with `key_id`, `threshold_percent: int`, `notification_channel: "email" | "webhook"`, `is_active: bool`
  - Events: `apikey.rate_limit_approaching`, `apikey.rate_limit_exceeded`

- **Key Metadata**: Allow storing arbitrary metadata on API keys for integration context.
  - Field on `APIKey`: `metadata: Record<string, any>`

#### Enhanced Features (Should Have)

- **Batch Operations**: Bulk revoke and bulk create for administrative workflows.
  - API methods: `bulkRevoke(keyIds, reason)`, `bulkCreate(requests)`
  - Models: `BulkRevokeResult`, `BulkCreateResult`

- **Key Rotation with Grace Period**: When regenerating a key, keep the old key valid for a configurable grace period (default 24h) to allow consumers to update.
  - API methods: `regenerate(keyId, gracePeriodHours?)`
  - Field on `CreateAPIKeyResponse`: `previous_key_expires_at: DateTime?`

- **IP Range Support**: Extend `allowed_ips` to support CIDR notation (e.g., `10.0.0.0/24`) in addition to individual IPs.
  - Field on `APIKey`: `allowed_ip_ranges: string[]` (supports both individual IPs and CIDR)

- **Request Signing**: Optional request signing for API keys (similar to AWS Signature V4) where the key is used to sign requests rather than being sent directly.
  - API methods: `getSigningCredentials(keyId)`
  - Models: `SigningCredentials` with `access_key_id`, `secret_access_key`, `region`

#### Future Features (Nice to Have)

- **Self-Service API Keys Widget**: Embeddable React/Web Component for end-users to create, manage, and revoke their own API keys (similar to Clerk's `<UserProfile />` API Keys tab or WorkOS API Keys Widget).
- **Key Analytics Dashboard**: Visual dashboard showing usage patterns, top endpoints, error rates, and latency distribution per key.
- **Programmatic Key Policies**: Define reusable key policies (permission sets + rate limits + restrictions) that can be applied to new keys.
- **Short-Lived Keys**: Support for automatically expiring keys with configurable TTL (minutes to hours) for CI/CD and automation use cases.

### API Surface

| Method | Description | Parameters | Returns |
|--------|------------|------------|---------|
| `list(page, pageSize, environment?, isActive?, scopeType?, tags?)` | List API keys | Pagination + filters | `APIKeyListResponse` |
| `get(keyId)` | Get key summary (no secret) | `keyId: string` | `APIKeySummary` |
| `create(request)` | Create new key | `CreateAPIKeyRequest` | `CreateAPIKeyResponse` |
| `update(keyId, request)` | Update key metadata | `keyId`, `UpdateAPIKeyRequest` | `APIKeySummary` |
| `revoke(keyId, reason?)` | Revoke a key | `keyId`, optional `reason` | `void` |
| `regenerate(keyId, gracePeriodHours?)` | Regenerate key value | `keyId`, optional grace period | `CreateAPIKeyResponse` |
| `validate(key, requiredPermission?)` | Validate a key | `key: string`, optional permission | `ValidateAPIKeyResponse` |
| `isValid(key)` | Quick validity check | `key: string` | `bool` |
| `hasPermission(key, permission)` | Check permission | `key`, `permission` | `bool` |
| `getUsage(keyId, period)` | Get usage stats | `keyId`, `period` | `APIKeyUsage` |
| `listActivity(keyId, page, pageSize, ...)` | Get activity log | `keyId`, pagination + date range | `APIKeyActivityListResponse` |
| `setUsageAlert(keyId, threshold)` | Set rate limit alert | `keyId`, `threshold` | `UsageAlert` |
| `listUsageAlerts(keyId)` | List alerts for key | `keyId` | `UsageAlert[]` |
| `deleteUsageAlert(keyId, alertId)` | Remove alert | `keyId`, `alertId` | `void` |
| `bulkRevoke(keyIds, reason?)` | Revoke multiple keys | `keyIds: string[]`, optional reason | `BulkRevokeResult` |
| `bulkCreate(requests)` | Create multiple keys | `CreateAPIKeyRequest[]` | `BulkCreateResult` |

### Models

- **APIKey** (enhanced): Add `key_type: APIKeyType`, `scope_type`, `scope_id`, `scope_name`, `tags: string[]`, `labels: Record<string, string>`, `metadata: Record<string, any>`
- **APIKeyType**: `secret | publishable`
- **APIKeyScopeType**: `tenant | user | organization`
- **APIKeyActivity**: `id`, `key_id`, `timestamp`, `endpoint`, `method`, `status_code`, `ip_address`, `user_agent`, `latency_ms`, `request_size_bytes`, `response_size_bytes`
- **APIKeyActivityListResponse**: `data: APIKeyActivity[]`, `pagination: Pagination`
- **UsageAlert**: `id`, `key_id`, `threshold_percent`, `notification_channel`, `is_active`, `last_triggered_at`, `created_at`
- **BulkRevokeResult**: `revoked_count`, `failed_count`, `errors: {key_id, reason}[]`
- **BulkCreateResult**: `created: CreateAPIKeyResponse[]`, `failed: {name, reason}[]`, `total`, `success_count`, `failure_count`

### Events (for webhooks)

- `apikey.created`: When a new API key is generated
- `apikey.revoked`: When a key is revoked
- `apikey.regenerated`: When a key is regenerated
- `apikey.expired`: When a key expires
- `apikey.rate_limit_approaching`: When usage reaches alert threshold
- `apikey.rate_limit_exceeded`: When rate limit is hit
- `apikey.ip_blocked`: When a request is blocked by IP restriction

### Error Scenarios

| Scenario | HTTP Status | Python | TypeScript | Java |
|----------|-------------|--------|------------|------|
| Key not found | 404 | `APIKeyNotFoundError` | `APIKeyNotFoundError` | `APIKeyNotFoundException` |
| Key already revoked | 409 | `KeyAlreadyRevokedError` | `KeyAlreadyRevokedError` | `KeyAlreadyRevokedException` |
| Key expired | 401 | `KeyExpiredError` | `KeyExpiredError` | `KeyExpiredException` |
| IP not allowed | 403 | `IPNotAllowedError` | `IPNotAllowedError` | `IPNotAllowedException` |
| Rate limit exceeded | 429 | `RateLimitError` | `RateLimitError` | `RateLimitException` |
| Permission denied | 403 | `PermissionDeniedError` | `PermissionDeniedError` | `PermissionDeniedException` |
| Invalid key format | 400 | `ValidationError` | `ValidationError` | `ValidationException` |
| Bulk operation partial failure | 207 | Returns `BulkResult` | Returns `BulkResult` | Returns `BulkResult` |

### Cross-Language Notes

- **Python**: Key generation should use `secrets.token_hex(16)` for the random portion. Extend `APIKeySummary` Pydantic model with new fields. Use `Literal["secret", "publishable"]` for type safety.
- **TypeScript**: Use `crypto.randomBytes(16).toString('hex')` for key generation. Define `APIKeyType` as a union type. Export all new types from `types.ts`.
- **Java**: Use `SecureRandom` for key generation. Add `APIKeyType` enum. Use Builder pattern for `CreateAPIKeyRequest` with new fields. `Optional<String>` for nullable scope fields.

---

## 3. Email Module (Enhancement)

### Overview

The Email module manages email template creation, rendering, and delivery for platform communications. This includes transactional emails (verification, password reset, invitations), marketing-style notifications, and custom tenant emails.

**Value Proposition**: A complete email infrastructure that allows tenants to customize every email the platform sends, with professional-grade template editing, localization, and delivery tracking -- reducing dependency on third-party email services like SendGrid or Mailgun for routine platform communications.

### Current Capabilities (Implemented)

| Capability | Status | Details |
|------------|--------|---------|
| Template CRUD | Done | create, list, get (by ID and slug), update, delete |
| Variable Substitution | Done | Variables array + template rendering |
| Send Direct Email | Done | `send()` with HTML/text, to/cc/bcc |
| Send Templated Email | Done | `send_template()` with variable values |
| SMTP Configuration | Done | Per-tenant SMTP config with TLS |
| Config Testing | Done | `test_config()` with optional recipient |
| Template Categories | Done | invitation, verification, notification, reminder, welcome, password_reset, alert |
| System Templates | Done | `is_system` flag for built-in templates |

### Competitive Analysis

| Feature | Auth0 | Clerk | WorkOS | Firebase | Supabase | Our SDK |
|---------|-------|-------|--------|----------|----------|---------|
| Template CRUD | Yes (6 types) | Yes (email + SMS) | Custom emails | Firebase Extensions | Yes (6 types) | Yes (7 categories) |
| Template Editor | Liquid templates | Revolvapp WYSIWYG | Dashboard | N/A | Go Templates + HTML | Variable substitution |
| Template Versioning | No | No | No | No | No | No |
| Localization | Liquid conditionals | Handlebars | 90+ locales built-in | Firebase i18n | No | No |
| Custom SMTP | Yes (required for custom templates) | No (Clerk handles delivery) | Custom domain | Firebase Extensions | Yes | Yes |
| Email Provider Integration | Mandrill, SendGrid, SES | Built-in | Built-in | Firebase Extensions | Resend, SendGrid, SES via SMTP | SMTP only |
| Send Email Hook | Actions (post-login) | `sms.created` webhook | Custom email delivery API | Cloud Functions | Send Email Auth Hook | No hooks |
| Delivery Tracking | No | No | No | No | No | `EmailSendResult` (success/fail only) |
| Email Logs / History | Auth0 Logs | No | No | No | No | No |
| Dark Mode Support | No | No | Yes (light/dark templates) | No | No | No |
| Preview / Render | Yes (preview in dashboard) | Yes (in editor) | Yes (branding previews) | No | No | No |
| Attachments | No | No | No | No | No | No |
| Batch Sending | No | No | No | No | No | No |

**Key Gaps Identified**:
1. No template versioning or version history
2. No localization / i18n support
3. No email delivery tracking (open, click, bounce)
4. No email send history / logs
5. No template preview / render endpoint
6. No dark mode template variants
7. No attachments support
8. No batch email sending
9. No provider abstraction (SMTP only)
10. No send hooks / custom delivery

### Requirements

#### Core Features (Must Have)

- **Template Versioning**: Track version history of templates. Allow reverting to previous versions. Auto-increment version on update.
  - API methods: `listTemplateVersions(templateId)`, `getTemplateVersion(templateId, version)`, `revertToVersion(templateId, version)`
  - Models: `TemplateVersion` with `version: int`, `html_content`, `text_content`, `subject`, `variables`, `created_at`, `created_by`, `change_notes`

- **Localization / i18n Support**: Support multiple language variants of each template. Templates can have locale-specific content with fallback to default locale.
  - API methods: `setTemplateLocale(templateId, locale, content)`, `getTemplateLocale(templateId, locale)`, `listTemplateLocales(templateId)`
  - Models: `TemplateLocale` with `locale: string` (e.g., "en-US", "es-ES"), `subject`, `html_content`, `text_content`
  - Field on `SendTemplateRequest`: `locale: string?` (defaults to tenant's configured locale)

- **Template Preview / Render**: Render a template with sample data without sending, for preview purposes.
  - API methods: `previewTemplate(templateId, variables, locale?)`, `previewTemplateBySlug(slug, variables, locale?)`
  - Models: `TemplatePreview` with `subject: string`, `html_content: string`, `text_content: string?`

- **Email Send History / Logs**: Track all sent emails with delivery status, timestamps, and metadata for debugging and compliance.
  - API methods: `listSendHistory(page, pageSize, templateSlug?, status?, startDate?, endDate?)`, `getSendDetails(messageId)`
  - Models: `EmailSendRecord` with `message_id`, `template_slug`, `to`, `subject`, `status: "queued" | "sent" | "delivered" | "bounced" | "failed"`, `sent_at`, `delivered_at`, `error`, `metadata`

- **Email Provider Abstraction**: Support multiple email delivery providers beyond raw SMTP. Add provider-based configuration for popular services.
  - API methods: `listProviders()`, `getProvider()`, `configureProvider(config)`
  - Models: `EmailProvider` with `type: "smtp" | "sendgrid" | "ses" | "resend" | "postmark"`, provider-specific config fields
  - Existing `EmailConfig` (SMTP) becomes one provider type

#### Enhanced Features (Should Have)

- **Delivery Tracking**: Track email opens, clicks, and bounces (requires provider support or tracking pixel/redirect).
  - Models: `EmailDeliveryEvent` with `message_id`, `event_type: "delivered" | "opened" | "clicked" | "bounced" | "complained"`, `timestamp`, `metadata`
  - API methods: `getDeliveryEvents(messageId)`

- **Attachments Support**: Allow attaching files to emails.
  - Field on `SendEmailRequest`: `attachments: Attachment[]`
  - Model: `Attachment` with `filename`, `content_type`, `content_base64` or `url`

- **Batch Email Sending**: Send the same template to multiple recipients with per-recipient variable substitution.
  - API methods: `sendBatch(request)`
  - Models: `BatchSendRequest` with `template_slug`, `recipients: BatchRecipient[]`, `BatchRecipient` with `to`, `variables`, `locale?`
  - Returns: `BatchSendResult` with `total`, `sent_count`, `failed_count`, `failures[]`

- **Template Categories Extension**: Add more categories relevant to platform lifecycle.
  - New categories: `security`, `billing`, `team_notification`, `system_announcement`, `digest`

- **Dark Mode Variants**: Support light/dark mode variants per template.
  - Fields on `EmailTemplate`: `html_content_dark: string?`

#### Future Features (Nice to Have)

- **Visual Template Editor SDK**: Provide a JavaScript-based WYSIWYG editor component that tenants can embed in their admin UI.
- **Email A/B Testing**: Send variants of a template and track which performs better.
- **Scheduled Sending**: Queue emails for future delivery at a specified time.
- **Unsubscribe Management**: Built-in unsubscribe link handling with preference center.
- **Domain Verification**: DKIM, SPF, DMARC verification for custom sending domains.

### API Surface

| Method | Description | Parameters | Returns |
|--------|------------|------------|---------|
| `send(request)` | Send direct email | `SendEmailRequest` | `EmailSendResult` |
| `sendTemplate(request)` | Send templated email | `SendTemplateRequest` | `EmailSendResult` |
| `sendBatch(request)` | Batch send template | `BatchSendRequest` | `BatchSendResult` |
| `listTemplates(page, pageSize, category?, ...)` | List templates | Pagination + filters | `TemplateListResponse` |
| `getTemplate(templateId)` | Get template by ID | `templateId: string` | `EmailTemplate` |
| `getTemplateBySlug(slug)` | Get by slug | `slug: string` | `EmailTemplate` |
| `createTemplate(request)` | Create template | `CreateTemplateRequest` | `EmailTemplate` |
| `updateTemplate(templateId, request)` | Update template | IDs + request | `EmailTemplate` |
| `deleteTemplate(templateId)` | Delete template | `templateId: string` | `void` |
| `previewTemplate(templateId, variables, locale?)` | Preview rendered | ID + variables | `TemplatePreview` |
| `listTemplateVersions(templateId)` | List versions | `templateId: string` | `TemplateVersion[]` |
| `getTemplateVersion(templateId, version)` | Get specific version | ID + version | `TemplateVersion` |
| `revertToVersion(templateId, version)` | Revert template | ID + version | `EmailTemplate` |
| `setTemplateLocale(templateId, locale, content)` | Set locale content | ID + locale + content | `TemplateLocale` |
| `getTemplateLocale(templateId, locale)` | Get locale content | ID + locale | `TemplateLocale` |
| `listTemplateLocales(templateId)` | List locales | `templateId: string` | `TemplateLocale[]` |
| `deleteTemplateLocale(templateId, locale)` | Remove locale | ID + locale | `void` |
| `listSendHistory(page, pageSize, ...)` | List send history | Pagination + filters | `EmailSendHistoryResponse` |
| `getSendDetails(messageId)` | Get send details | `messageId: string` | `EmailSendRecord` |
| `getConfig()` | Get email config | None | `EmailConfig` |
| `updateConfig(request)` | Update config | `UpdateEmailConfigRequest` | `EmailConfig` |
| `testConfig(recipient?)` | Test email config | Optional recipient | `EmailTestResult` |
| `listProviders()` | List available providers | None | `EmailProviderInfo[]` |
| `configureProvider(config)` | Set up provider | `ProviderConfig` | `EmailConfig` |

### Models

- **EmailTemplate** (enhanced): Add `version: int`, `locales: string[]`, `html_content_dark: string?`
- **TemplateVersion**: `version: int`, `template_id`, `html_content`, `text_content`, `subject`, `variables: string[]`, `change_notes: string?`, `created_at`, `created_by`
- **TemplateLocale**: `template_id`, `locale: string`, `subject`, `html_content`, `text_content?`, `variables: string[]`
- **TemplatePreview**: `subject: string`, `html_content: string`, `text_content: string?`
- **EmailSendRecord**: `message_id`, `template_id?`, `template_slug?`, `to: string[]`, `cc: string[]?`, `bcc: string[]?`, `subject`, `status`, `provider`, `sent_at`, `delivered_at?`, `error?`, `metadata: Record<string, any>`
- **Attachment**: `filename: string`, `content_type: string`, `content: string` (base64), `size_bytes: int`
- **BatchSendRequest**: `template_slug`, `recipients: BatchRecipient[]`, `locale?`
- **BatchRecipient**: `to: string`, `variables: Record<string, any>`, `locale?`, `metadata?`
- **BatchSendResult**: `batch_id`, `total`, `sent_count`, `failed_count`, `failures: {to, error}[]`
- **EmailProvider**: `type: "smtp" | "sendgrid" | "ses" | "resend" | "postmark"`, `config: ProviderSpecificConfig`, `is_active`, `verified_at`
- **EmailDeliveryEvent**: `message_id`, `event_type`, `timestamp`, `metadata`

### Events (for webhooks)

- `email.sent`: When an email is successfully sent
- `email.delivered`: When delivery is confirmed (provider-dependent)
- `email.bounced`: When an email bounces
- `email.failed`: When sending fails
- `email.template.created`: When a template is created
- `email.template.updated`: When a template is updated
- `email.template.deleted`: When a template is deleted

### Error Scenarios

| Scenario | HTTP Status | Python | TypeScript | Java |
|----------|-------------|--------|------------|------|
| Template not found | 404 | `TemplateNotFoundError` | `TemplateNotFoundError` | `TemplateNotFoundException` |
| Template slug exists | 409 | `TemplateSlugExistsError` | `TemplateSlugExistsError` | `TemplateSlugExistsException` |
| Email config not found | 404 | `EmailConfigError` | `EmailConfigError` | `EmailConfigException` |
| Email service unavailable | 503 | `EmailServiceUnavailableError` | `EmailServiceUnavailableError` | `EmailServiceUnavailableException` |
| Send failure | 502 | `EmailSendError` | `EmailSendError` | `EmailSendException` |
| Invalid template variables | 400 | `ValidationError` | `ValidationError` | `ValidationException` |
| Locale not found | 404 | `LocaleNotFoundError` | `LocaleNotFoundError` | `LocaleNotFoundException` |
| Version not found | 404 | `VersionNotFoundError` | `VersionNotFoundError` | `VersionNotFoundException` |
| Attachment too large | 413 | `AttachmentTooLargeError` | `AttachmentTooLargeError` | `AttachmentTooLargeException` |
| Batch too large | 400 | `BatchTooLargeError` | `BatchTooLargeError` | `BatchTooLargeException` |

### Cross-Language Notes

- **Python**: Use Pydantic v2 `model_validator` for template variable validation. `BatchSendRequest` should validate `recipients` length (max 1000). Use `typing.Literal` for provider types.
- **TypeScript**: Export `EmailProviderType` as a union type. `Attachment.content` should accept `Buffer | string` (auto-encode to base64). Use overloads for `previewTemplate` by ID vs slug.
- **Java**: Use `sealed interface` (Java 17) for provider config types. Builder pattern for `BatchSendRequest`. `Optional<String>` for nullable locale fields. Ensure thread-safe template rendering.

---

## 4. Settings Module (Enhancement)

### Overview

The Settings module manages tenant configuration across multiple categories (general, branding, features, integrations, security, notifications). It provides a typed, validated configuration system with default values, public/private visibility, and reset capabilities.

**Value Proposition**: A centralized, schema-validated configuration system that enables tenant self-service customization while maintaining platform-level defaults and constraints. This is essential for multi-tenant SaaS platforms where each tenant needs independent configuration.

### Current Capabilities (Implemented)

| Capability | Status | Details |
|------------|--------|---------|
| Get All Settings | Done | `get_all()` grouped by category |
| Get Category Settings | Done | `get_category(category)` |
| Update Category | Done | `update_category(category, settings)` |
| Get Individual Setting | Done | `get(key)` |
| Set Individual Setting | Done | `set(key, value)` |
| Reset Category | Done | `reset_category(category)` to defaults |
| Setting Definitions | Done | Schema with type, default, validation |
| Convenience Methods | Done | `get_value(key, default)`, `is_feature_enabled(feature)` |
| Categories | Done | general, branding, features, integrations, security, notifications |
| Validation Rules | Done | min, max, minLength, maxLength, pattern, enum |

### Competitive Analysis

| Feature | Auth0 | Clerk | WorkOS | Firebase | Supabase | Our SDK |
|---------|-------|-------|--------|----------|----------|---------|
| Tenant Settings CRUD | Tenant settings API | Instance settings | Dashboard config | Project settings | Project config | Yes |
| Branding Config | Logo, colors, CSS, custom domain | Theme, logo, colors | Logo, colors, CSS, dark mode | Limited | Limited | Logo, colors, CSS |
| Feature Toggles | Feature flags (actions) | Feature config | N/A | Remote Config | N/A | `features.*` settings |
| Security Policies | Password, MFA, session policies | Password, session config | Auth policies | Security rules | Auth config | Password + session settings |
| Setting Versioning | No | No | No | Remote Config versions | No | No |
| Environment Overrides | Per-tenant (dev/staging/prod) | Per-instance | Per-environment | Per-project | Per-project | No |
| Setting Import/Export | Deploy CLI (YAML/JSON) | No | No | Remote Config export | No | No |
| Audit Trail | Tenant logs | No | No | No | No | `updated_by` only |
| Hierarchical Defaults | Tenant > App defaults | Instance defaults | Org > Global | Project defaults | Project defaults | Category defaults |
| Dynamic Schema | Tenant settings schema | No | No | Remote Config parameters | No | `SettingDefinition` |
| Change Notifications | No | No | No | Remote Config listeners | Realtime | `settings.updated` event |
| Bulk Update | Yes (deploy CLI) | No | No | Yes | No | Per-category only |

**Key Gaps Identified**:
1. No setting versioning or change history
2. No environment-specific overrides (dev/staging/prod settings)
3. No setting import/export
4. No hierarchical defaults (platform > tenant > user-level)
5. No change audit trail beyond `updated_by`
6. No setting locking (prevent tenant from changing specific settings)
7. No computed/derived settings
8. No setting groups within categories
9. No sensitive setting encryption

### Requirements

#### Core Features (Must Have)

- **Setting Change History**: Track all changes to settings with before/after values, actor, and timestamp.
  - API methods: `getSettingHistory(key, page, pageSize)`, `getCategoryHistory(category, page, pageSize)`
  - Models: `SettingChange` with `key`, `old_value`, `new_value`, `changed_by`, `changed_at`, `change_source: "api" | "dashboard" | "import" | "system"`

- **Environment Overrides**: Allow settings to have different values per environment (development, staging, production). Production values are the default; dev/staging can override specific settings.
  - API methods: `getForEnvironment(key, environment)`, `setForEnvironment(key, value, environment)`, `listEnvironmentOverrides(environment)`
  - Models: `EnvironmentOverride` with `key`, `environment: "development" | "staging" | "production"`, `value`, `overridden_at`
  - Field on `SettingValue`: `environment_overrides: Record<string, any>?`

- **Setting Import/Export**: Export all settings as JSON/YAML for backup, migration, or environment promotion. Import settings with validation and conflict resolution.
  - API methods: `exportSettings(format?, categories?)`, `importSettings(data, strategy?)`
  - Models: `ExportResult` with `format`, `data`, `exported_at`, `category_count`, `setting_count`
  - `ImportResult` with `imported_count`, `skipped_count`, `errors: {key, reason}[]`, `strategy: "overwrite" | "skip_existing" | "merge"`

- **Setting Locking**: Allow platform admins to lock specific settings, preventing tenant modification. Locked settings display in the UI but cannot be changed.
  - API methods: `lockSetting(key, reason?)`, `unlockSetting(key)`, `listLockedSettings()`
  - Models: `LockedSetting` with `key`, `locked_by`, `locked_at`, `reason`, `locked_value`
  - Field on `SettingDefinition`: `is_locked: bool`

- **Sensitive Setting Encryption**: Mark specific settings as sensitive (e.g., API keys, passwords) and store them encrypted. These values are masked in API responses.
  - Field on `SettingDefinition`: `is_sensitive: bool`
  - Sensitive settings return `"***"` in list responses; full value only via dedicated endpoint
  - API methods: `getSensitiveValue(key)` (requires elevated permissions)

#### Enhanced Features (Should Have)

- **Hierarchical Defaults**: Support three-level defaults: platform-level > tenant-level > user-level. Each level inherits from above and can override.
  - API methods: `getUserSetting(userId, key)`, `setUserSetting(userId, key, value)`, `getEffectiveSetting(key, userId?, environment?)`
  - Models: `EffectiveSetting` with `value`, `source: "platform" | "tenant" | "user"`, `inherited: bool`

- **Setting Groups**: Organize settings within categories into logical groups for better UI rendering.
  - Field on `SettingDefinition`: `group: string?`, `group_label: string?`, `group_order: int?`

- **Computed / Derived Settings**: Define settings whose values are computed from other settings or external data.
  - Field on `SettingDefinition`: `is_computed: bool`, `compute_expression: string?`
  - Example: `security.overall_score` computed from individual security settings

- **Bulk Update Across Categories**: Update settings across multiple categories in a single API call.
  - API methods: `bulkUpdate(settings: Record<string, any>)`
  - Validates all before applying any

#### Future Features (Nice to Have)

- **Settings Approval Workflow**: Changes to sensitive or critical settings require approval from an admin before taking effect.
- **Settings Sync Across Environments**: Promote settings from staging to production with diff preview.
- **Feature Flag Integration**: Connect settings to the feature flags module for conditional configuration.
- **Settings Webhooks**: Dedicated webhook for setting changes with granular filtering by key pattern.

### API Surface

| Method | Description | Parameters | Returns |
|--------|------------|------------|---------|
| `getAll(includeDefinitions?)` | Get all settings | Optional flag | `AllSettingsResponse` |
| `getCategory(category)` | Get category settings | `category` | `CategorySettingsResponse` |
| `updateCategory(category, settings)` | Update category | `category`, `settings` | `CategorySettingsResponse` |
| `get(key)` | Get single setting | `key: string` | `SettingValue` |
| `set(key, value)` | Set single setting | `key`, `value` | `SettingValue` |
| `getValue(key, default?)` | Get value with fallback | `key`, optional default | `any` |
| `isFeatureEnabled(feature)` | Check feature flag | `feature: string` | `bool` |
| `resetCategory(category)` | Reset to defaults | `category` | `CategorySettingsResponse` |
| `getDefinitions(category?, isPublic?)` | Get definitions | Filters | `SettingDefinition[]` |
| `getSettingHistory(key, page, pageSize)` | Get change log | `key` + pagination | `SettingChangeListResponse` |
| `getCategoryHistory(category, page, pageSize)` | Category change log | `category` + pagination | `SettingChangeListResponse` |
| `getForEnvironment(key, env)` | Get env-specific | `key`, `environment` | `SettingValue` |
| `setForEnvironment(key, value, env)` | Set env-specific | `key`, `value`, `env` | `SettingValue` |
| `listEnvironmentOverrides(env)` | List env overrides | `environment` | `EnvironmentOverride[]` |
| `exportSettings(format?, categories?)` | Export settings | Optional format + categories | `ExportResult` |
| `importSettings(data, strategy?)` | Import settings | `data`, optional strategy | `ImportResult` |
| `lockSetting(key, reason?)` | Lock setting | `key`, optional reason | `LockedSetting` |
| `unlockSetting(key)` | Unlock setting | `key: string` | `void` |
| `listLockedSettings()` | List locked settings | None | `LockedSetting[]` |
| `getSensitiveValue(key)` | Get encrypted value | `key: string` | `SettingValue` |
| `bulkUpdate(settings)` | Bulk update | `Record<string, any>` | `BulkUpdateResult` |

### Models

- **SettingChange**: `id`, `tenant_id`, `key`, `old_value: any`, `new_value: any`, `changed_by: string`, `changed_at: DateTime`, `change_source: ChangeSource`
- **ChangeSource**: `api | dashboard | import | system`
- **SettingChangeListResponse**: `data: SettingChange[]`, `pagination: Pagination`
- **EnvironmentOverride**: `key`, `environment: Environment`, `value: any`, `overridden_at: DateTime`, `overridden_by: string`
- **Environment**: `development | staging | production`
- **ExportResult**: `format: "json" | "yaml"`, `data: string`, `exported_at`, `category_count`, `setting_count`, `tenant_id`
- **ImportResult**: `imported_count`, `skipped_count`, `error_count`, `errors: ImportError[]`, `strategy: ImportStrategy`
- **ImportStrategy**: `overwrite | skip_existing | merge`
- **ImportError**: `key`, `reason`, `value`
- **LockedSetting**: `key`, `locked_by`, `locked_at`, `reason?`, `locked_value: any`
- **EffectiveSetting**: `key`, `value`, `source: SettingSource`, `inherited: bool`, `definition: SettingDefinition?`
- **SettingSource**: `platform | tenant | user | environment_override`
- **BulkUpdateResult**: `updated_count`, `skipped_count`, `errors: {key, reason}[]`
- **SettingDefinition** (enhanced): Add `is_locked`, `is_sensitive`, `group`, `group_label`, `group_order`, `is_computed`, `compute_expression`

### Events (for webhooks)

- `settings.updated`: When any setting is changed (existing -- enhanced with before/after)
- `settings.imported`: When settings are imported
- `settings.exported`: When settings are exported
- `settings.locked`: When a setting is locked
- `settings.unlocked`: When a setting is unlocked
- `settings.reset`: When a category is reset to defaults

### Error Scenarios

| Scenario | HTTP Status | Python | TypeScript | Java |
|----------|-------------|--------|------------|------|
| Setting not found | 404 | `SettingNotFoundError` | `SettingNotFoundError` | `SettingNotFoundException` |
| Invalid setting value | 400 | `InvalidSettingValueError` | `InvalidSettingValueError` | `InvalidSettingValueException` |
| Invalid category | 400 | `InvalidCategoryError` | `InvalidCategoryError` | `InvalidCategoryException` |
| Setting is locked | 403 | `SettingLockedError` | `SettingLockedError` | `SettingLockedException` |
| Setting is readonly | 403 | `ReadonlySettingError` | `ReadonlySettingError` | `ReadonlySettingException` |
| Import validation failure | 400 | `ImportValidationError` | `ImportValidationError` | `ImportValidationException` |
| Sensitive value access denied | 403 | `AuthorizationError` | `AuthorizationError` | `AuthorizationException` |
| Environment not found | 400 | `InvalidEnvironmentError` | `InvalidEnvironmentError` | `InvalidEnvironmentException` |

### Cross-Language Notes

- **Python**: Use `typing.Any` for setting values. `ExportResult.data` should be `str` (serialized JSON/YAML). Use `pyyaml` for YAML export. `EffectiveSetting` uses `Literal` for source types.
- **TypeScript**: Use `unknown` for setting values with runtime type guards. `ExportResult` data should be a `string`. Provide typed helper methods like `getTyped<T>(key): T`.
- **Java**: Use `Object` for setting values with type-safe accessor methods (`getString()`, `getInt()`, `getBoolean()`). Builder pattern for `ImportSettings`. Use `@JsonSubTypes` for polymorphic SettingDefinition deserialization.

---

## 5. Invitations Module (Enhancement)

### Overview

The Invitations module manages the process of inviting users to join the platform, teams, organizations, or other entities. It handles the full lifecycle from creation through token-based validation to acceptance, including bulk operations and expiration management.

**Value Proposition**: A flexible, entity-agnostic invitation system that supports any onboarding flow -- from simple user registration to complex multi-step organizational onboarding with role assignment, custom metadata, and configurable workflows.

### Current Capabilities (Implemented)

| Capability | Status | Details |
|------------|--------|---------|
| Create Invitation | Done | With email, type, target, role, message, metadata |
| Bulk Create | Done | Up to 100 invitations at once |
| Validate Token | Done | Public endpoint, returns invitation details |
| Accept Invitation | Done | With optional name, password, metadata |
| Resend | Done | With optional expiry extension |
| Revoke | Done | Delete/cancel invitation |
| Cleanup | Done | Admin endpoint to purge expired invitations |
| Token Format | Done | 64-char hex (crypto secure) |
| Types | Done | user, team, organization, test, course, custom |
| Statuses | Done | pending, sent, viewed, accepted, expired, revoked, completed |
| Filtering | Done | By status, type, target_id, email, search, sort |
| Configuration | Done | TTL, resend cooldown, max active per email |

### Competitive Analysis

| Feature | Auth0 | Clerk | WorkOS | Firebase | Supabase | Our SDK |
|---------|-------|-------|--------|----------|----------|---------|
| Invitation CRUD | Org invitations | User + Org invitations | Invitations API | `inviteUserByEmail()` | `inviteUserByEmail()` | Yes (6 types) |
| Bulk Invitations | API batch | No | No | No | No | Yes (100 max) |
| Role Assignment | Org member roles | Organization roles | Roles on invite | No | No | `target_role` |
| Custom Message | No | No | No | No | No | Yes |
| Redirect URL | Yes (app login route) | Yes (`redirect_url`) | Yes (signup URL) | Yes (redirect URL) | Yes (redirect URL) | No |
| Invitation Expiry | Not documented | 30 days (fixed) | Not documented | Configurable | Configurable | Configurable (1-30 days) |
| Email Verified on Accept | Yes | Yes | Yes | Yes | Yes | Not implemented |
| Invitation Link Customization | Custom domain | Custom domain | Custom domain | `redirectTo` param | `redirectTo` param | No |
| Resend with Cooldown | No | No | No | No | No | Yes (configurable) |
| Invitation Templates | Auth0 email templates | Clerk email templates | WorkOS email templates | Firebase templates | Supabase templates | Integration with Email module |
| Multi-step Onboarding | No | Sign-up flow | Sign-up flow | No | No | `completed` status |
| Invitation Analytics | Dashboard | No | No | No | No | No |
| CSV Import | No | No | No | No | No | No |
| Magic Link Integration | Separate feature | Separate feature | Separate feature | N/A | Magic link auth | No |

**Key Gaps Identified**:
1. No redirect URL configuration (where to send user after acceptance)
2. No email verified on acceptance behavior
3. No invitation link customization / custom domain support
4. No invitation analytics (funnel: sent > viewed > accepted)
5. No CSV import for bulk invitations
6. No magic link integration
7. No invitation reminder scheduling
8. No invitation template customization (defaults to system template)
9. No invitation webhook/notification on status change
10. No invitation URL builder utility

### Requirements

#### Core Features (Must Have)

- **Redirect URL Configuration**: Allow specifying where the user is redirected after accepting an invitation.
  - Field on `CreateInvitationRequest`: `redirect_url: string?`
  - Field on `AcceptInvitationResponse`: `redirect_url: string`
  - Field on `InvitationConfig`: `default_redirect_url: string?`

- **Email Verification on Accept**: Automatically mark the invitee's email as verified when they accept an invitation (since they proved access to the email by having the token).
  - Field on `CreateInvitationRequest`: `verify_email_on_accept: bool` (default: true)
  - Field on `AcceptInvitationResponse`: `email_verified: bool`

- **Invitation Analytics**: Track conversion funnel metrics for invitations.
  - API methods: `getAnalytics(startDate?, endDate?, type?)`, `getConversionFunnel(startDate?, endDate?)`
  - Models: `InvitationAnalytics` with `total_sent`, `total_viewed`, `total_accepted`, `total_expired`, `total_revoked`, `view_rate`, `accept_rate`, `avg_time_to_accept_hours`
  - `ConversionFunnel` with `stages: {name, count, rate}[]`

- **Invitation Reminders**: Automatically send reminders for pending invitations at configurable intervals.
  - API methods: `setReminderSchedule(config)`, `getReminderSchedule()`
  - Models: `ReminderSchedule` with `enabled: bool`, `intervals_days: int[]` (e.g., [3, 7, 14]), `max_reminders: int`, `stop_on_view: bool`
  - Field on `Invitation`: `reminders_sent: int`, `last_reminder_at: DateTime?`

- **Invitation URL Builder**: Utility method to construct the invitation acceptance URL from a token and base URL.
  - API methods: `buildInvitationUrl(token, baseUrl?)` (client-side utility, no API call)
  - Configurable: `InvitationConfig.invitation_base_url: string?`

- **Custom Invitation Template**: Allow specifying which email template to use for the invitation email, overriding the default.
  - Field on `CreateInvitationRequest`: `email_template_slug: string?`
  - Default: system `invitation` template

- **Invitation Webhooks**: Emit webhook events for all invitation status changes.
  - Events: Already partially defined in webhook event types; ensure all transitions emit events

#### Enhanced Features (Should Have)

- **CSV Import**: Import invitations from a CSV file for large-scale onboarding.
  - API methods: `importFromCSV(file, defaults?)`, `getImportStatus(importId)`
  - Models: `CSVImportRequest` with `csv_data: string`, `column_mapping: Record<string, string>`, `defaults: Partial<CreateInvitationRequest>`
  - `CSVImportResult` with `import_id`, `total_rows`, `valid_rows`, `invalid_rows`, `errors: {row, reason}[]`, `status: "processing" | "completed" | "failed"`

- **Magic Link Integration**: Option to generate invitation links that double as magic links (one-click sign-in for returning users).
  - Field on `CreateInvitationRequest`: `magic_link_enabled: bool` (default: false)
  - When enabled, the invitation token also serves as a one-time sign-in token

- **Invitation Groups**: Group related invitations (e.g., "Q1 2026 onboarding batch") for tracking and management.
  - Field on `CreateInvitationRequest`: `group_id: string?`, `group_name: string?`
  - API methods: `listGroups()`, `getGroup(groupId)`, `getGroupAnalytics(groupId)`

- **Sender Customization**: Customize the "from" name and display for invitation emails per invitation.
  - Field on `CreateInvitationRequest`: `sender_name: string?`, `sender_email: string?`
  - Falls back to tenant's configured sender

#### Future Features (Nice to Have)

- **Invitation Approval Workflow**: Invitations require admin approval before being sent (useful for restricted organizations).
- **Invitation Landing Pages**: Host customizable landing pages for invitation acceptance (no app code required).
- **Invitation QR Codes**: Generate QR codes for invitations (useful for in-person onboarding events).
- **Conditional Invitations**: Invitations that only activate when a condition is met (e.g., "invite once the team reaches 5 members").

### API Surface

| Method | Description | Parameters | Returns |
|--------|------------|------------|---------|
| `list(page, pageSize, status?, type?, ...)` | List invitations | Pagination + filters | `InvitationListResponse` |
| `get(invitationId)` | Get invitation by ID | `invitationId: string` | `Invitation` |
| `create(request)` | Create invitation | `CreateInvitationRequest` | `Invitation` |
| `createBulk(request)` | Bulk create | `BulkInvitationRequest` | `BulkInvitationResult` |
| `revoke(invitationId)` | Revoke invitation | `invitationId: string` | `void` |
| `resend(invitationId, extendExpiry?)` | Resend invitation | ID + optional flag | `Invitation` |
| `validateToken(token)` | Validate token (public) | `token: string` | `ValidatedInvitation` |
| `accept(token, request?)` | Accept invitation (public) | `token`, optional request | `AcceptInvitationResponse` |
| `cleanup(request?)` | Cleanup expired | Optional config | `CleanupResult` |
| `getAnalytics(startDate?, endDate?, type?)` | Get analytics | Date range + type | `InvitationAnalytics` |
| `getConversionFunnel(startDate?, endDate?)` | Get funnel | Date range | `ConversionFunnel` |
| `setReminderSchedule(config)` | Set reminders | `ReminderSchedule` | `ReminderSchedule` |
| `getReminderSchedule()` | Get reminder config | None | `ReminderSchedule` |
| `importFromCSV(data, defaults?)` | CSV import | CSV data + defaults | `CSVImportResult` |
| `getImportStatus(importId)` | Check import status | `importId: string` | `CSVImportResult` |
| `buildInvitationUrl(token, baseUrl?)` | Build URL (client-side) | `token`, optional base URL | `string` |
| `listGroups()` | List invitation groups | None | `InvitationGroup[]` |
| `getGroup(groupId)` | Get group details | `groupId: string` | `InvitationGroup` |
| `getGroupAnalytics(groupId)` | Get group analytics | `groupId: string` | `InvitationAnalytics` |

### Models

- **Invitation** (enhanced): Add `redirect_url: string?`, `verify_email_on_accept: bool`, `email_template_slug: string?`, `reminders_sent: int`, `last_reminder_at: DateTime?`, `group_id: string?`, `magic_link_enabled: bool`
- **AcceptInvitationResponse** (enhanced): Add `redirect_url: string`, `email_verified: bool`
- **CreateInvitationRequest** (enhanced): Add `redirect_url: string?`, `verify_email_on_accept: bool?`, `email_template_slug: string?`, `group_id: string?`, `group_name: string?`, `sender_name: string?`, `magic_link_enabled: bool?`
- **InvitationAnalytics**: `total_sent`, `total_viewed`, `total_accepted`, `total_expired`, `total_revoked`, `view_rate: float`, `accept_rate: float`, `avg_time_to_accept_hours: float`, `period_start`, `period_end`
- **ConversionFunnel**: `stages: FunnelStage[]`
- **FunnelStage**: `name: string`, `count: int`, `rate: float`, `drop_off_rate: float`
- **ReminderSchedule**: `enabled: bool`, `intervals_days: int[]`, `max_reminders: int`, `stop_on_view: bool`, `reminder_template_slug: string?`
- **CSVImportRequest**: `csv_data: string`, `column_mapping: Record<string, string>`, `defaults: Partial<CreateInvitationRequest>?`
- **CSVImportResult**: `import_id`, `status: "processing" | "completed" | "failed"`, `total_rows`, `valid_rows`, `invalid_rows`, `created_count`, `errors: CSVImportError[]`
- **CSVImportError**: `row: int`, `email: string?`, `reason: string`
- **InvitationGroup**: `group_id`, `group_name`, `total_invitations`, `accepted_count`, `pending_count`, `created_at`
- **InvitationConfig** (enhanced): Add `default_redirect_url: string?`, `invitation_base_url: string?`, `default_verify_email_on_accept: bool`

### Events (for webhooks)

- `invitation.created`: When an invitation is created (existing)
- `invitation.sent`: When an invitation email is sent (existing)
- `invitation.viewed`: When the invitation link is clicked
- `invitation.accepted`: When the invitation is accepted (existing)
- `invitation.expired`: When an invitation expires (existing)
- `invitation.revoked`: When an invitation is revoked (existing)
- `invitation.reminder_sent`: When a reminder is sent
- `invitation.bulk_created`: When a bulk import completes

### Error Scenarios

| Scenario | HTTP Status | Python | TypeScript | Java |
|----------|-------------|--------|------------|------|
| Invitation not found | 404 | `InvitationNotFoundError` | `InvitationNotFoundError` | `InvitationNotFoundException` |
| Token not found | 404 | `TokenNotFoundError` | `TokenNotFoundError` | `TokenNotFoundException` |
| Token expired | 410 | `TokenExpiredError` | `TokenExpiredError` | `TokenExpiredException` |
| Token revoked | 410 | `TokenRevokedError` | `TokenRevokedError` | `TokenRevokedException` |
| Active invitation exists | 409 | `ActiveInvitationExistsError` | `ActiveInvitationExistsError` | `ActiveInvitationExistsException` |
| Resend cooldown | 429 | `ResendCooldownError` | `ResendCooldownError` | `ResendCooldownException` |
| Max active per email | 409 | `MaxInvitationsError` | `MaxInvitationsError` | `MaxInvitationsException` |
| Invalid CSV format | 400 | `CSVFormatError` | `CSVFormatError` | `CSVFormatException` |
| Import in progress | 409 | `ImportInProgressError` | `ImportInProgressError` | `ImportInProgressException` |

### Cross-Language Notes

- **Python**: `buildInvitationUrl()` is a pure function (no HTTP call). Use `urllib.parse.urljoin` for URL construction. CSV import uses `csv.DictReader` for parsing validation.
- **TypeScript**: `buildInvitationUrl()` uses `URL` constructor. CSV parsing via streaming for large files. Export `InvitationAnalytics` interface with computed properties.
- **Java**: `buildInvitationUrl()` uses `java.net.URI`. CSV import uses `OpenCSV` or similar. `InvitationAnalytics` uses `BigDecimal` for rate calculations. Builder pattern for `ReminderSchedule`.

---

## 6. Audit Logs Module (New -- P1)

### Overview

The Audit Logs module provides comprehensive, immutable logging of all significant actions performed within the platform. It captures who did what, when, where, and what changed -- enabling compliance with SOC 2, GDPR, HIPAA, and other regulatory frameworks. The module supports search, export, streaming, alerting, and SIEM integration.

**Value Proposition**: Enterprise-grade audit logging is a hard requirement for regulated industries and a strong expectation for any B2B SaaS platform. This module eliminates the need for customers to build their own audit infrastructure, provides compliance-ready exports, and enables real-time security monitoring.

### Competitive Analysis

| Feature | Auth0 | Clerk | WorkOS | Firebase | Supabase | Our SDK (Target) |
|---------|-------|-------|--------|----------|----------|------------------|
| Event Recording | Auto (all auth events) | Auto (user/org events) | SDK-driven + auto | Cloud Audit Logs | Postgres audit | SDK-driven + auto |
| Event Schema | Fixed (90+ event codes) | Fixed (webhook events) | Customizable with JSON Schema | Fixed (IAM events) | Custom (SQL) | Customizable with JSON Schema |
| Actor Tracking | User ID + connection | User/Org/Session | Actor object (id, name, type, metadata) | Principal (user/service) | Role-based | Actor object (id, name, type, metadata) |
| Target/Resource Tracking | Implicit in event | Implicit in payload | Targets array (id, type, metadata) | Resource name | Table-level | Targets array (id, type, metadata) |
| Before/After Tracking | No | No | No (metadata only) | No | Trigger-based | Yes (first-class diff) |
| Search API | Lucene query syntax | No (webhook only) | API with filters | Cloud Logging queries | SQL | Structured query API |
| Retention Policies | Plan-based (2-30 days) | N/A | Configurable | 30/400 days by type | Custom | Configurable per tenant |
| SIEM Export | Log Streams (Datadog, Splunk, S3) | No | Log Streams (Datadog, Splunk, S3, HTTP) | Cloud Logging export | No | Log Streams + bulk export |
| Admin Portal | Dashboard logs view | No | Admin Portal with audit view | Console | No | Embeddable log viewer (P3) |
| Real-time Streaming | Log Streams | Webhooks | Log Streams (near real-time) | Cloud Pub/Sub | Realtime | Webhooks + SSE |
| Integrity Verification | No | No | No | No | No | Hash chains |
| IP Geolocation | Yes (in log details) | No | Yes (context.location) | Yes | No | Yes |
| Alert Rules | No (use SIEM) | No | No (use SIEM) | Cloud Monitoring | No | Built-in alert rules |
| CSV/JSON Export | Dashboard export | No | CSV export via Admin Portal | Cloud Logging export | SQL export | CSV, JSON, CEF export |
| Log Retention | 2 days (free) to 30 days | N/A | Configurable | 30 days (_Default) | Custom | 90 days default, configurable |
| Idempotency | N/A | N/A | Yes (idempotency key) | N/A | N/A | Yes |

**Key Differentiators to Build**:
1. Before/after change tracking as first-class feature (no competitor has this natively)
2. Cryptographic integrity verification (hash chains) for tamper-evident logs
3. Built-in alert rules with pattern matching (competitors defer to SIEM)
4. Customizable event schemas with JSON Schema validation
5. Combined auto-capture + SDK-driven events

### Requirements

#### Core Features (Must Have)

- **Event Recording**: Record audit events with comprehensive context including actor, action, targets, timestamp, IP, user agent, and custom metadata.
  - API methods: `log(event)`, `logBatch(events)`
  - Models: `CreateAuditEventRequest` with all required fields
  - Auto-capture: Authentication events, CRUD operations, permission changes, setting changes

- **Structured Event Schema**: Define event types with categories and optional JSON Schema for metadata validation.
  - API methods: `listEventTypes()`, `getEventType(name)`, `createEventType(definition)`, `updateEventType(name, definition)`
  - Models: `AuditEventType` with `name`, `category`, `description`, `schema: JSONSchema?`, `severity: "info" | "warning" | "critical"`, `auto_capture: bool`
  - Standard categories: `auth`, `user`, `team`, `role`, `invitation`, `settings`, `apikey`, `webhook`, `data`, `admin`, `security`

- **Actor and Target Tracking**: Rich actor and target objects with type, name, metadata.
  - Models: `AuditActor` with `id`, `type: "user" | "service" | "system" | "api_key"`, `name`, `email?`, `ip_address`, `user_agent`, `metadata: Record<string, any>`
  - `AuditTarget` with `id`, `type: string` (e.g., "user", "team", "role", "setting"), `name?`, `metadata: Record<string, any>`
  - Events can have multiple targets (e.g., "added user X to team Y" has two targets)

- **Before/After Change Tracking**: Capture the state before and after a mutation for compliance-ready diffing.
  - Model: `AuditChange` with `field: string`, `old_value: any`, `new_value: any`, `type: string`
  - Field on `AuditLogEntry`: `changes: AuditChange[]?`
  - Example: `{field: "role", old_value: "viewer", new_value: "admin", type: "string"}`

- **Search and Query**: Full-featured search API with structured queries.
  - API methods: `list(query)`, `get(entryId)`, `getByActor(actorId, query)`, `getByResource(resourceType, resourceId, query)`
  - Query parameters: `event_type`, `actor_id`, `actor_type`, `target_id`, `target_type`, `severity`, `start_date`, `end_date`, `search` (text), `sort`, `page`, `page_size`
  - Models: `AuditLogQuery`, `AuditLogListResponse`

- **Configurable Retention Policies**: Per-tenant retention configuration with automatic archival.
  - API methods: `getRetentionPolicy()`, `setRetentionPolicy(policy)`
  - Models: `RetentionPolicy` with `retention_days: int` (minimum 90), `archive_enabled: bool`, `archive_destination: string?` (S3 bucket, GCS bucket), `auto_delete_after_archive: bool`
  - Default: 90 days, no archival

- **Bulk Export**: Export audit logs in multiple formats with filtering.
  - API methods: `exportLogs(query, format)`, `getExportStatus(exportId)`, `downloadExport(exportId)`
  - Formats: JSON Lines, CSV, CEF (Common Event Format)
  - Models: `ExportRequest` with `query: AuditLogQuery`, `format: "json" | "csv" | "cef"`, `destination: "download" | "s3" | "gcs"`
  - `ExportResult` with `export_id`, `status: "processing" | "completed" | "failed"`, `record_count`, `file_size_bytes`, `download_url?`, `expires_at`

- **Cryptographic Integrity Verification**: Hash chain for tamper-evident audit logs. Each entry includes a hash of the previous entry, creating a verifiable chain.
  - Field on `AuditLogEntry`: `integrity_hash: string`, `previous_hash: string`
  - API methods: `verifyIntegrity(startDate, endDate)`, `getIntegrityProof(entryId)`
  - Models: `IntegrityVerificationResult` with `verified: bool`, `entries_checked: int`, `first_invalid_entry_id: string?`, `reason: string?`
  - Algorithm: SHA-256 hash of `{previous_hash}.{entry_id}.{event_type}.{actor_id}.{timestamp}.{payload_hash}`

- **Idempotency**: Support idempotency keys to prevent duplicate event recording on retries.
  - Field on `CreateAuditEventRequest`: `idempotency_key: string?`
  - Server generates key from event content if not provided

- **IP Geolocation Enrichment**: Automatically enrich audit entries with geographic location derived from IP address.
  - Field on `AuditLogEntry`: `geo_location: GeoLocation?`
  - Model: `GeoLocation` with `country`, `country_code`, `region`, `city`, `latitude`, `longitude`, `timezone`

#### Enhanced Features (Should Have)

- **Real-Time Streaming**: Stream audit events to external systems via configurable channels.
  - API methods: `createStream(config)`, `listStreams()`, `getStream(streamId)`, `updateStream(streamId, config)`, `deleteStream(streamId)`, `testStream(streamId)`
  - Models: `AuditStream` with `id`, `name`, `destination_type: "webhook" | "datadog" | "splunk" | "s3" | "gcs" | "http"`, `destination_config`, `filter: AuditLogQuery?`, `is_active: bool`
  - Delivery: Near real-time (within 60 seconds of event)

- **Alert Rules**: Define pattern-based alert rules that trigger notifications when conditions are met.
  - API methods: `createAlertRule(rule)`, `listAlertRules()`, `getAlertRule(ruleId)`, `updateAlertRule(ruleId, rule)`, `deleteAlertRule(ruleId)`, `testAlertRule(ruleId)`
  - Models: `AlertRule` with `id`, `name`, `description`, `condition: AlertCondition`, `notification_channels: string[]`, `is_active: bool`, `cooldown_minutes: int`
  - `AlertCondition` with `event_type: string?`, `severity: string?`, `count_threshold: int`, `time_window_minutes: int`, `group_by: string?`
  - Example: "Alert when 5 failed logins in 10 minutes from same IP"

- **Log Streams to SIEM Providers**: Pre-built integrations with popular SIEM providers.
  - Supported destinations: Datadog, Splunk, AWS S3, Google Cloud Storage, Azure Blob, Generic HTTP POST
  - Each destination has typed configuration (e.g., `DatadogConfig` with `api_key`, `site`, `service_name`)

- **Admin Portal Integration**: Generate embeddable links for tenants to view their own audit logs in a read-only portal.
  - API methods: `generatePortalLink(organizationId, ttlMinutes?)`, returns a short-lived, signed URL

#### Future Features (Nice to Have)

- **Audit Log Analytics**: Dashboard showing event volume trends, top actors, most common events, security anomaly detection.
- **Natural Language Search**: Search audit logs using natural language queries (e.g., "show me all role changes by admin users last week").
- **Automated Compliance Reports**: Generate SOC 2, GDPR, HIPAA compliance reports from audit log data.
- **Cross-Tenant Audit Queries**: Platform-level queries across all tenants for super-admin use cases.
- **Audit Log Webhooks**: Dedicated event stream for audit-specific webhooks with guaranteed ordering.

### API Surface

| Method | Description | Parameters | Returns |
|--------|------------|------------|---------|
| `log(event)` | Record audit event | `CreateAuditEventRequest` | `AuditLogEntry` |
| `logBatch(events)` | Record multiple events | `CreateAuditEventRequest[]` | `BatchAuditResult` |
| `list(query)` | Search audit logs | `AuditLogQuery` | `AuditLogListResponse` |
| `get(entryId)` | Get single entry | `entryId: string` | `AuditLogEntry` |
| `getByActor(actorId, query?)` | Get entries by actor | `actorId` + optional query | `AuditLogListResponse` |
| `getByResource(type, id, query?)` | Get entries by resource | `type`, `id` + query | `AuditLogListResponse` |
| `listEventTypes()` | List event type definitions | None | `AuditEventType[]` |
| `getEventType(name)` | Get event type | `name: string` | `AuditEventType` |
| `createEventType(definition)` | Create custom event type | `CreateEventTypeRequest` | `AuditEventType` |
| `updateEventType(name, definition)` | Update event type | `name` + request | `AuditEventType` |
| `getRetentionPolicy()` | Get retention config | None | `RetentionPolicy` |
| `setRetentionPolicy(policy)` | Set retention config | `RetentionPolicy` | `RetentionPolicy` |
| `exportLogs(query, format)` | Start export | `AuditLogQuery`, `format` | `ExportResult` |
| `getExportStatus(exportId)` | Check export status | `exportId: string` | `ExportResult` |
| `downloadExport(exportId)` | Download export file | `exportId: string` | `bytes / stream` |
| `verifyIntegrity(startDate, endDate)` | Verify hash chain | Date range | `IntegrityVerificationResult` |
| `getIntegrityProof(entryId)` | Get proof for entry | `entryId: string` | `IntegrityProof` |
| `createStream(config)` | Create log stream | `CreateStreamRequest` | `AuditStream` |
| `listStreams()` | List log streams | None | `AuditStream[]` |
| `getStream(streamId)` | Get stream detail | `streamId: string` | `AuditStream` |
| `updateStream(streamId, config)` | Update stream | `streamId` + config | `AuditStream` |
| `deleteStream(streamId)` | Delete stream | `streamId: string` | `void` |
| `testStream(streamId)` | Test stream delivery | `streamId: string` | `StreamTestResult` |
| `createAlertRule(rule)` | Create alert rule | `CreateAlertRuleRequest` | `AlertRule` |
| `listAlertRules()` | List alert rules | None | `AlertRule[]` |
| `getAlertRule(ruleId)` | Get alert rule | `ruleId: string` | `AlertRule` |
| `updateAlertRule(ruleId, rule)` | Update alert rule | `ruleId` + request | `AlertRule` |
| `deleteAlertRule(ruleId)` | Delete alert rule | `ruleId: string` | `void` |
| `testAlertRule(ruleId)` | Test alert rule | `ruleId: string` | `AlertTestResult` |
| `generatePortalLink(orgId, ttl?)` | Generate portal URL | `orgId`, optional TTL | `PortalLink` |

### Models

- **AuditLogEntry**: `id: uuid`, `tenant_id: uuid`, `event_type: string`, `action: string`, `description: string?`, `actor: AuditActor`, `targets: AuditTarget[]`, `changes: AuditChange[]?`, `metadata: Record<string, any>?`, `severity: "info" | "warning" | "critical"`, `context: AuditContext`, `integrity_hash: string`, `previous_hash: string`, `idempotency_key: string?`, `created_at: DateTime`
- **AuditActor**: `id: string`, `type: "user" | "service" | "system" | "api_key"`, `name: string?`, `email: string?`, `ip_address: string?`, `user_agent: string?`, `metadata: Record<string, any>?`
- **AuditTarget**: `id: string`, `type: string`, `name: string?`, `metadata: Record<string, any>?`
- **AuditChange**: `field: string`, `old_value: any`, `new_value: any`, `type: string`
- **AuditContext**: `ip_address: string?`, `user_agent: string?`, `geo_location: GeoLocation?`, `session_id: string?`, `request_id: string?`, `source: "api" | "dashboard" | "system" | "webhook"`
- **GeoLocation**: `country: string`, `country_code: string`, `region: string?`, `city: string?`, `latitude: float?`, `longitude: float?`, `timezone: string?`
- **AuditEventType**: `name: string`, `category: string`, `description: string`, `severity: string`, `schema: JSONSchema?`, `auto_capture: bool`, `version: int`
- **AuditLogQuery**: `event_type: string?`, `event_types: string[]?`, `actor_id: string?`, `actor_type: string?`, `target_id: string?`, `target_type: string?`, `severity: string?`, `start_date: DateTime?`, `end_date: DateTime?`, `search: string?`, `sort: string?`, `page: int`, `page_size: int`
- **AuditLogListResponse**: `data: AuditLogEntry[]`, `pagination: Pagination`
- **CreateAuditEventRequest**: `event_type: string`, `action: string`, `description: string?`, `actor: AuditActor`, `targets: AuditTarget[]?`, `changes: AuditChange[]?`, `metadata: Record<string, any>?`, `severity: string?`, `idempotency_key: string?`
- **BatchAuditResult**: `logged_count: int`, `failed_count: int`, `errors: {index, reason}[]`
- **RetentionPolicy**: `retention_days: int`, `archive_enabled: bool`, `archive_destination: string?`, `archive_format: "json" | "parquet"`, `auto_delete_after_archive: bool`
- **ExportRequest**: `query: AuditLogQuery`, `format: "json" | "csv" | "cef"`, `destination: "download" | "s3" | "gcs"`, `destination_config: Record<string, string>?`
- **ExportResult**: `export_id`, `status`, `record_count`, `file_size_bytes`, `download_url?`, `expires_at`, `started_at`, `completed_at?`
- **IntegrityVerificationResult**: `verified: bool`, `entries_checked: int`, `first_invalid_entry_id: string?`, `reason: string?`, `verified_range: {start_date, end_date}`
- **IntegrityProof**: `entry_id`, `integrity_hash`, `previous_hash`, `chain_position: int`, `verification_data: string`
- **AuditStream**: `id`, `name`, `description?`, `destination_type`, `destination_config: Record<string, string>`, `filter: AuditLogQuery?`, `is_active: bool`, `last_delivery_at?`, `error_count: int`, `created_at`
- **AlertRule**: `id`, `name`, `description?`, `condition: AlertCondition`, `notification_channels: NotificationChannel[]`, `is_active: bool`, `cooldown_minutes: int`, `last_triggered_at?`, `trigger_count: int`, `created_at`
- **AlertCondition**: `event_type: string?`, `event_types: string[]?`, `severity: string?`, `actor_type: string?`, `count_threshold: int`, `time_window_minutes: int`, `group_by: string?` (e.g., "actor.ip_address")
- **NotificationChannel**: `type: "email" | "webhook" | "slack"`, `config: Record<string, string>`
- **PortalLink**: `url: string`, `expires_at: DateTime`, `organization_id: string`

### Standard Event Types (Pre-Defined)

| Event Type | Category | Severity | Auto-Capture | Description |
|------------|----------|----------|--------------|-------------|
| `auth.login.success` | auth | info | Yes | Successful login |
| `auth.login.failure` | auth | warning | Yes | Failed login attempt |
| `auth.logout` | auth | info | Yes | User logout |
| `auth.token.refreshed` | auth | info | Yes | Token refresh |
| `auth.mfa.enabled` | auth | info | Yes | MFA enabled |
| `auth.mfa.disabled` | auth | warning | Yes | MFA disabled |
| `auth.password.changed` | auth | info | Yes | Password changed |
| `auth.password.reset` | auth | info | Yes | Password reset |
| `user.created` | user | info | Yes | User created |
| `user.updated` | user | info | Yes | User profile updated |
| `user.deleted` | user | warning | Yes | User deleted |
| `user.activated` | user | info | Yes | User activated |
| `user.deactivated` | user | warning | Yes | User deactivated |
| `user.role.changed` | user | warning | Yes | User role changed |
| `team.created` | team | info | Yes | Team created |
| `team.updated` | team | info | Yes | Team updated |
| `team.deleted` | team | warning | Yes | Team deleted |
| `team.member.added` | team | info | Yes | Member added to team |
| `team.member.removed` | team | info | Yes | Member removed from team |
| `role.created` | role | info | Yes | Role created |
| `role.updated` | role | warning | Yes | Role updated |
| `role.deleted` | role | warning | Yes | Role deleted |
| `role.permission.changed` | role | warning | Yes | Role permissions changed |
| `invitation.created` | invitation | info | Yes | Invitation created |
| `invitation.accepted` | invitation | info | Yes | Invitation accepted |
| `invitation.revoked` | invitation | info | Yes | Invitation revoked |
| `settings.updated` | settings | info | Yes | Setting changed |
| `settings.security.changed` | settings | warning | Yes | Security setting changed |
| `apikey.created` | apikey | info | Yes | API key created |
| `apikey.revoked` | apikey | warning | Yes | API key revoked |
| `apikey.rate_limited` | apikey | warning | Yes | API key rate limited |
| `webhook.created` | webhook | info | Yes | Webhook created |
| `webhook.disabled` | webhook | warning | Yes | Webhook disabled |
| `admin.impersonation.start` | admin | critical | Yes | Admin started impersonation |
| `admin.impersonation.end` | admin | info | Yes | Admin ended impersonation |
| `data.exported` | data | info | Yes | Data export initiated |
| `data.deleted` | data | critical | Yes | Data deletion initiated |

### Events (for webhooks)

- `audit.event.created`: When a new audit event is recorded (useful for real-time dashboards)
- `audit.alert.triggered`: When an alert rule condition is met
- `audit.export.completed`: When an export finishes
- `audit.integrity.violation`: When integrity verification detects tampering
- `audit.stream.failed`: When a log stream delivery fails

### Error Scenarios

| Scenario | HTTP Status | Python | TypeScript | Java |
|----------|-------------|--------|------------|------|
| Entry not found | 404 | `AuditEntryNotFoundError` | `AuditEntryNotFoundError` | `AuditEntryNotFoundException` |
| Invalid event type | 400 | `InvalidEventTypeError` | `InvalidEventTypeError` | `InvalidEventTypeException` |
| Schema validation failure | 400 | `SchemaValidationError` | `SchemaValidationError` | `SchemaValidationException` |
| Export not found | 404 | `ExportNotFoundError` | `ExportNotFoundError` | `ExportNotFoundException` |
| Export too large | 413 | `ExportTooLargeError` | `ExportTooLargeError` | `ExportTooLargeException` |
| Retention policy violation | 400 | `RetentionPolicyError` | `RetentionPolicyError` | `RetentionPolicyException` |
| Integrity verification failure | 409 | `IntegrityViolationError` | `IntegrityViolationError` | `IntegrityViolationException` |
| Stream not found | 404 | `StreamNotFoundError` | `StreamNotFoundError` | `StreamNotFoundException` |
| Stream destination unreachable | 422 | `StreamTestError` | `StreamTestError` | `StreamTestException` |
| Alert rule not found | 404 | `AlertRuleNotFoundError` | `AlertRuleNotFoundError` | `AlertRuleNotFoundException` |
| Idempotency conflict | 409 | `IdempotencyConflictError` | `IdempotencyConflictError` | `IdempotencyConflictException` |
| Rate limit on log ingestion | 429 | `RateLimitError` | `RateLimitError` | `RateLimitException` |

### Cross-Language Notes

- **Python**: Use `dataclasses` or Pydantic for all models. Hash chain uses `hashlib.sha256`. `AuditContext` should auto-capture IP and user agent from request context when available. Provide `AuditMiddleware` for automatic Django/FastAPI integration.
- **TypeScript**: Export all types from `types.ts`. Provide `auditMiddleware()` for Express/Koa/Next.js. Use `crypto.createHash('sha256')` for integrity hashing. `AuditLogQuery` should support builder pattern: `query().eventType('user.created').since(date).build()`.
- **Java**: Use Builder pattern for `CreateAuditEventRequest` (many optional fields). `MessageDigest.getInstance("SHA-256")` for hashing. Provide `AuditInterceptor` for Spring Boot. `AuditLogQuery` uses fluent builder. `Optional<GeoLocation>` for nullable geo fields. Ensure immutability on `AuditLogEntry` (all fields final).

---

## 7. Admin Portal Components Module (New -- P3)

### Overview

The Admin Portal Components module provides embeddable, pre-built UI components that platform customers can drop into their admin dashboards. These components handle common administrative tasks like user management, audit log viewing, webhook configuration, API key management, and organization settings -- reducing months of custom UI development.

**Value Proposition**: Embeddable admin UI components are a key differentiator for developer-focused platforms. Clerk and WorkOS have demonstrated that pre-built components dramatically reduce time-to-value and increase platform stickiness. This module transforms our SDK from a backend-only library into a full-stack platform toolkit.

### Competitive Analysis

| Feature | Auth0 | Clerk | WorkOS | Firebase | Supabase | Our SDK (Target) |
|---------|-------|-------|--------|----------|----------|------------------|
| Auth Components | Universal Login (ACUL) | SignIn, SignUp, UserButton | AuthKit (full-page) | FirebaseUI | Auth UI | Planned (Auth module) |
| User Management | Dashboard only | UserProfile, UserButton | UsersManagement widget | Console | Dashboard | UserManagement component |
| Organization Management | Dashboard | OrganizationProfile, OrgSwitcher | OrgSwitcher widget | N/A | N/A | OrgManagement component |
| API Keys UI | Dashboard | API Keys tab in UserProfile | API Keys Widget | Console | Dashboard | APIKeysManager component |
| Audit Log Viewer | Dashboard | No | Admin Portal audit view | Console | No | AuditLogViewer component |
| Webhook Manager | Dashboard | No | No | Console | No | WebhookManager component |
| Settings Panel | Dashboard | No | No | Console | No | SettingsPanel component |
| Invitation Manager | Dashboard | No | No | No | No | InvitationManager component |
| Customization | ACUL (full React control) | Theme + CSS | Radix Themes + CSS | Limited | CSS | Theme + CSS + Slots |
| Dark Mode | No | Yes | Yes (light/dark) | No | No | Yes |
| Framework Support | React (ACUL) | React, Next.js, Vue, Svelte | React only | Web, React | React | React + Web Components |
| Localization | Yes (90+ locales) | Yes (partial) | Yes (90+ locales) | Limited | No | Yes (configurable) |
| Portal Links | No | No | Yes (generate portal links) | No | No | Yes (embeddable + portal links) |
| Component Granularity | Page-level | Component-level | Widget-level | N/A | N/A | Component-level |

**Key Design Decisions**:
1. Ship as Web Components (framework-agnostic) with React wrappers as first-class citizens
2. Provide both embeddable components and portal-link generation (hosted mode)
3. Support deep theming via CSS custom properties and slot-based customization
4. All components are optional and independently importable (tree-shakeable)

### Requirements

#### Core Features (Must Have)

- **UserManagement Component**: Embeddable user management table/list with search, filter, role assignment, status toggle, and user detail panel.
  - Component: `<UserManagement />`
  - Features: User list with pagination, search by name/email, filter by role/status, inline role change, activate/deactivate, view user details, invite new user
  - Props: `organizationId?`, `onUserSelect?`, `onUserInvite?`, `columns?`, `actions?`

- **AuditLogViewer Component**: Embeddable audit log viewer with search, filters, and export functionality.
  - Component: `<AuditLogViewer />`
  - Features: Log entry list with timeline view, search by keyword, filter by event type/actor/date range/severity, entry detail panel with before/after diff, export button
  - Props: `organizationId?`, `eventTypes?`, `onExport?`, `dateRange?`, `maxEntries?`

- **APIKeysManager Component**: Self-service API key management for end-users or organization admins.
  - Component: `<APIKeysManager />`
  - Features: List existing keys (prefix display only), create new key (with scope/permission selection), revoke key, copy key to clipboard (on creation), usage chart
  - Props: `scopeType?`, `scopeId?`, `availablePermissions?`, `onKeyCreated?`, `onKeyRevoked?`

- **WebhookManager Component**: Self-service webhook endpoint management.
  - Component: `<WebhookManager />`
  - Features: List webhooks with health status, create/edit webhook endpoint, event type selector (with hierarchical grouping), delivery log viewer, test endpoint button, health metrics chart
  - Props: `organizationId?`, `availableEvents?`, `onWebhookCreated?`

- **SettingsPanel Component**: Embeddable settings editor organized by category.
  - Component: `<SettingsPanel />`
  - Features: Category tabs/navigation, typed input fields based on setting definitions, validation feedback, reset to defaults, save confirmation
  - Props: `categories?`, `readonlyKeys?`, `onSave?`, `showResetButton?`

- **InvitationManager Component**: Invitation management with sending, tracking, and analytics.
  - Component: `<InvitationManager />`
  - Features: List invitations with status badges, send new invitation form, bulk import (CSV), resend/revoke actions, conversion funnel visualization
  - Props: `organizationId?`, `invitationType?`, `onInviteSent?`, `showAnalytics?`

- **Theme System**: Comprehensive theming via CSS custom properties for all components.
  - API: `setTheme(theme)` or `<PlatformProvider theme={theme}>`
  - Theme tokens: Colors (primary, secondary, background, surface, text, error, warning, success), typography (font family, sizes, weights), spacing, border radius, shadows
  - Built-in themes: `light`, `dark`, `system` (auto-detect)
  - Custom CSS override support

- **Portal Link Generation**: Server-side SDK method to generate short-lived, authenticated URLs for hosted versions of each component.
  - API methods: `generatePortalLink(componentName, organizationId, ttlMinutes?, permissions?)`
  - Returns: `PortalLink` with `url`, `expires_at`
  - Hosted portal renders the same component in a standalone page with branding

#### Enhanced Features (Should Have)

- **OrganizationSwitcher Component**: Allow users to switch between organizations/tenants.
  - Component: `<OrganizationSwitcher />`
  - Features: Current org display, dropdown with org list, create new org, org search (for many orgs)
  - Props: `onSwitch?`, `showCreateButton?`, `renderOrg?`

- **SessionManager Component**: Display and manage active sessions.
  - Component: `<SessionManager />`
  - Features: List active sessions with device/location, revoke individual sessions, revoke all other sessions
  - Props: `userId?`, `onSessionRevoked?`

- **TeamManager Component**: Embeddable team management.
  - Component: `<TeamManager />`
  - Features: Team list with hierarchy, create/edit team, manage team members, role assignment within team
  - Props: `organizationId?`, `onTeamSelect?`

- **Notification Preferences Component**: User-facing notification preference management.
  - Component: `<NotificationPreferences />`
  - Features: Channel enable/disable (email, SMS, push, in-app), category-level controls, digest frequency, quiet hours
  - Props: `userId?`, `channels?`, `categories?`

- **Slot-Based Customization**: Allow replacing specific parts of components with custom content.
  - Pattern: `<UserManagement header={<CustomHeader />} rowAction={<CustomAction />} />`
  - All components expose named slots for header, footer, empty state, loading state, error state, and action buttons

- **Localization**: All components support localization via locale prop and translation overrides.
  - API: `<PlatformProvider locale="es-ES" translations={customTranslations}>`
  - Built-in locales: en-US, en-GB, es-ES, fr-FR, de-DE, pt-BR, ja-JP, ko-KR, zh-CN
  - Translation keys exported for custom locale support

#### Future Features (Nice to Have)

- **BillingPortal Component**: Self-service billing management (plan selection, payment method, invoices).
- **Analytics Dashboard Component**: Embeddable analytics for usage metrics and product analytics.
- **File Manager Component**: File browser with upload, preview, and management.
- **Role Editor Component**: Visual role/permission editor with hierarchy visualization.
- **Drag-and-Drop Component Builder**: Admin tool for assembling custom portal pages from component library.

### Component Architecture

```
@platform/components (npm package)
  /core
    PlatformProvider.tsx    -- Context provider (auth, theme, locale)
    ThemeProvider.tsx       -- Theme system
    LocaleProvider.tsx      -- i18n support
  /components
    UserManagement/
    AuditLogViewer/
    APIKeysManager/
    WebhookManager/
    SettingsPanel/
    InvitationManager/
    OrganizationSwitcher/
    SessionManager/
    TeamManager/
    NotificationPreferences/
  /web-components
    platform-user-management.js
    platform-audit-log.js
    platform-api-keys.js
    ... (Web Component wrappers)
  /themes
    light.css
    dark.css
  /locales
    en-US.json
    es-ES.json
    ...
```

### SDK API Surface (Server-Side)

| Method | Description | Parameters | Returns |
|--------|------------|------------|---------|
| `generatePortalLink(component, orgId, ttl?, permissions?)` | Generate portal URL | Component name, org ID, TTL, permissions | `PortalLink` |
| `listPortalLinks(orgId)` | List active portal links | `orgId: string` | `PortalLink[]` |
| `revokePortalLink(linkId)` | Revoke a portal link | `linkId: string` | `void` |
| `getComponentConfig(component)` | Get component config | `component: string` | `ComponentConfig` |
| `updateComponentConfig(component, config)` | Update config | `component`, `config` | `ComponentConfig` |

### Models

- **PortalLink**: `id`, `url`, `component`, `organization_id`, `permissions: string[]`, `expires_at`, `created_at`, `created_by`
- **ComponentConfig**: `component: string`, `enabled: bool`, `allowed_actions: string[]`, `custom_css: string?`, `locale: string?`, `feature_flags: Record<string, bool>`
- **Theme**: `name`, `colors: ThemeColors`, `typography: ThemeTypography`, `spacing: ThemeSpacing`, `borderRadius: ThemeBorderRadius`, `shadows: ThemeShadows`, `mode: "light" | "dark" | "system"`
- **ThemeColors**: `primary`, `primaryForeground`, `secondary`, `secondaryForeground`, `background`, `foreground`, `muted`, `mutedForeground`, `accent`, `accentForeground`, `destructive`, `destructiveForeground`, `border`, `input`, `ring`, `success`, `warning`
- **TranslationOverrides**: `Record<string, string>` keyed by translation key (e.g., `"userManagement.title": "Manage Users"`)

### Events (for webhooks)

- `portal.link.created`: When a portal link is generated
- `portal.link.accessed`: When a portal link is used
- `portal.link.expired`: When a portal link expires
- `portal.action.performed`: When a user performs an action through the portal (with action details)

### Error Scenarios

| Scenario | HTTP Status | Python | TypeScript | Java |
|----------|-------------|--------|------------|------|
| Portal link expired | 401 | `PortalLinkExpiredError` | `PortalLinkExpiredError` | `PortalLinkExpiredException` |
| Portal link not found | 404 | `PortalLinkNotFoundError` | `PortalLinkNotFoundError` | `PortalLinkNotFoundException` |
| Component not enabled | 403 | `ComponentDisabledError` | `ComponentDisabledError` | `ComponentDisabledException` |
| Permission denied | 403 | `AuthorizationError` | `AuthorizationError` | `AuthorizationException` |
| Invalid theme | 400 | `ValidationError` | `ValidationError` | `ValidationException` |
| Organization not found | 404 | `NotFoundError` | `NotFoundError` | `NotFoundException` |

### Cross-Language Notes

- **TypeScript/React**: This is the primary implementation language for components. Ship as ESM + CJS with TypeScript declarations. Use Radix UI primitives for accessibility. TanStack Query for data fetching. CSS Modules + custom properties for styling. Ship Web Component wrappers using `@lit-labs/react`.
- **Python**: Server-side only -- provides `generate_portal_link()` and configuration methods. No UI components. Template helpers for Django/Jinja2 to embed portal links.
- **Java**: Server-side only -- provides `generatePortalLink()` and configuration methods. No UI components. Thymeleaf/Freemarker template helpers for embedding.
- **Web Components**: Framework-agnostic wrappers around React components using Lit or custom elements. These work in Vue, Svelte, Angular, and vanilla HTML. Distributed via CDN and npm.

---

## Appendix A: Event Type Taxonomy

All webhook event types across modules, organized hierarchically:

```
user.*
  user.created
  user.updated
  user.deleted
  user.activated
  user.deactivated

team.*
  team.created
  team.updated
  team.deleted
  team.member_added
  team.member_removed
  team.member_role_changed

invitation.*
  invitation.created
  invitation.sent
  invitation.viewed
  invitation.accepted
  invitation.expired
  invitation.revoked
  invitation.reminder_sent
  invitation.bulk_created

role.*
  role.created
  role.updated
  role.deleted
  role.assigned
  role.removed

session.*
  session.created
  session.expired

settings.*
  settings.updated
  settings.imported
  settings.exported
  settings.locked
  settings.unlocked
  settings.reset

apikey.*
  apikey.created
  apikey.revoked
  apikey.regenerated
  apikey.expired
  apikey.rate_limit_approaching
  apikey.rate_limit_exceeded
  apikey.ip_blocked

webhook.*
  webhook.created
  webhook.updated
  webhook.deleted
  webhook.disabled
  webhook.enabled

email.*
  email.sent
  email.delivered
  email.bounced
  email.failed
  email.template.created
  email.template.updated
  email.template.deleted

audit.*
  audit.event.created
  audit.alert.triggered
  audit.export.completed
  audit.integrity.violation
  audit.stream.failed

portal.*
  portal.link.created
  portal.link.accessed
  portal.link.expired
  portal.action.performed
```

## Appendix B: Cross-Module Dependencies

```
                    +------------------+
                    |    Settings      |
                    | (configuration)  |
                    +--------+---------+
                             |
              +--------------+---------------+
              |              |               |
     +--------v------+ +----v-----+  +------v-------+
     |   Webhooks    | |  Email   |  | Invitations  |
     | (event infra) | |(delivery)|  | (onboarding) |
     +--------+------+ +----+-----+  +------+-------+
              |              |               |
              +--------------+---------------+
                             |
                    +--------v---------+
                    |   Audit Logs     |
                    | (records events  |
                    |  from all above) |
                    +--------+---------+
                             |
                    +--------v---------+
                    |  API Keys        |
                    | (programmatic    |
                    |  access to all)  |
                    +--------+---------+
                             |
                    +--------v---------+
                    | Admin Portal     |
                    | Components       |
                    | (UI for all of   |
                    |  the above)      |
                    +------------------+
```

## Appendix C: Priority and Implementation Order

| Priority | Module | Type | Effort Estimate | Dependencies |
|----------|--------|------|----------------|--------------|
| P1 | Webhooks Enhancement | Enhancement | 2-3 weeks | None |
| P1 | API Keys Enhancement | Enhancement | 2-3 weeks | None |
| P1 | Audit Logs Module | New module | 4-6 weeks | Webhooks (for streaming) |
| P2 | Email Enhancement | Enhancement | 2-3 weeks | None |
| P2 | Settings Enhancement | Enhancement | 2 weeks | None |
| P2 | Invitations Enhancement | Enhancement | 2 weeks | Email (for templates) |
| P3 | Admin Portal Components | New module | 8-12 weeks | All modules above |

**Recommended Implementation Sequence**:
1. Webhooks core enhancements (exponential backoff, health, recovery, event types)
2. API Keys core enhancements (publishable keys, scoping, tags, activity log)
3. Audit Logs -- full new module (events, search, export, integrity, streams)
4. Email enhancements (versioning, i18n, preview, send history)
5. Settings enhancements (history, environments, import/export, locking)
6. Invitations enhancements (redirect, analytics, reminders, CSV import)
7. Admin Portal Components (React components, Web Components, portal links)

---

## Appendix D: Competitive Research Sources

- [Auth0 Log Streams - Custom Webhooks](https://auth0.com/docs/customize/log-streams/custom-log-streams)
- [Auth0 Email Templates](https://auth0.com/docs/customize/email/email-templates)
- [Auth0 Management API - Logs](https://auth0.com/docs/api/management/v2/logs/get-logs)
- [Auth0 Organization Invitations](https://auth0.com/docs/manage-users/organizations/configure-organizations/invite-members)
- [Auth0 Tenant Settings & Branding](https://auth0.com/docs/api/management/v2/branding/patch-branding)
- [Auth0 M2M Tokens](https://auth0.com/docs/secure/tokens/access-tokens/management-api-access-tokens)
- [Auth0 ACUL - Advanced Customization for Universal Login](https://auth0.com/docs/customize/login-pages/advanced-customizations)
- [Clerk Webhooks (Svix Integration)](https://clerk.com/docs/guides/development/webhooks/overview)
- [Clerk Email & SMS Templates](https://clerk.com/docs/guides/customizing-clerk/email-sms-templates)
- [Clerk Organization Invitations](https://clerk.com/docs/guides/organizations/invitations)
- [Clerk User Invitations](https://clerk.com/docs/guides/users/inviting)
- [Clerk API Keys (Beta)](https://clerk.com/docs/guides/development/machine-auth/api-keys)
- [Clerk Components Guide](https://clerk.com/articles/complete-guide-to-embeddable-uis-for-user-management)
- [WorkOS Webhooks & Events](https://workos.com/docs/events)
- [WorkOS Audit Logs](https://workos.com/docs/audit-logs)
- [WorkOS Audit Logs - Metadata Schema](https://workos.com/docs/audit-logs/metadata-schema)
- [WorkOS Audit Logs - Log Streams](https://workos.com/docs/audit-logs/log-streams)
- [WorkOS Audit Logs - Admin Portal](https://workos.com/docs/audit-logs/admin-portal)
- [WorkOS API Keys Widget](https://workos.com/docs/widgets/api-keys)
- [WorkOS Widgets](https://workos.com/docs/widgets)
- [WorkOS Invitations](https://workos.com/docs/authkit/invitations)
- [WorkOS Custom Emails](https://workos.com/docs/user-management/custom-emails)
- [WorkOS Branding](https://workos.com/docs/authkit/branding)
- [Svix Webhook Infrastructure](https://www.svix.com/)
- [Svix Retry Schedule](https://docs.svix.com/retries)
- [Svix Event Types](https://docs.svix.com/event-types)
- [Svix Application Portal](https://www.svix.com/application-portal/)
- [Firebase Auth Triggers](https://firebase.google.com/docs/functions/1st-gen/auth-events)
- [Firebase API Keys](https://firebase.google.com/docs/projects/api-keys)
- [Supabase Auth Hooks](https://supabase.com/docs/guides/auth/auth-hooks)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase API Keys](https://supabase.com/docs/guides/api/api-keys)
- [Supabase Invite User](https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail)
