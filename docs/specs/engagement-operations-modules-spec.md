# Engagement & Operations Modules -- Detailed Requirements Specification

**Document**: Engagement & Operations Modules (Notifications, Analytics, Rate Limiting)
**Version**: 1.0
**Date**: 2026-02-07
**Status**: Draft
**Branch**: `006-platform-component-expansion`
**Scope**: 3 new modules to close remaining competitive gaps

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Notifications / In-App Messaging Module (P2 -- New)](#2-notifications--in-app-messaging-module-p2----new)
3. [Analytics & Reporting Module (P3 -- New)](#3-analytics--reporting-module-p3----new)
4. [Rate Limiting Module (P2 -- New)](#4-rate-limiting-module-p2----new)
5. [Cross-Cutting Concerns](#5-cross-cutting-concerns)
6. [Appendix: Competitive Feature Matrix Summary](#6-appendix-competitive-feature-matrix-summary)

---

## 1. Executive Summary

This specification defines requirements for three new modules in the Shared Platform SDK. These modules address the remaining competitive gaps identified after the completion of the identity-access, auth-security, organization, and platform-infrastructure module groups. Together they cover **user engagement** (notifications), **operational intelligence** (analytics), and **traffic governance** (rate limiting) -- all essential for a GA-ready platform competing with Auth0, Clerk, WorkOS, Firebase Auth, and Supabase Auth.

### Scope

| Module | Priority | Status | Target |
|--------|----------|--------|--------|
| Notifications / In-App Messaging | P2 | New -- extends existing skeleton | GA |
| Analytics & Reporting | P3 | New | GA |
| Rate Limiting | P2 | New | GA |

### Drivers

- **Competitive parity**: Auth0 bundles attack-protection rate limiting and log-stream analytics. Clerk ships dashboard analytics with user growth and retention metrics. Dedicated notification infrastructure (Novu, Knock, OneSignal) has become a developer expectation for modern platforms.
- **Customer requests**: Enterprise customers require configurable rate limiting, admin-facing analytics dashboards, and multi-channel notifications beyond email.
- **Platform maturity**: These modules are the final layer needed for a complete, self-contained platform SDK that does not require customers to integrate 3-4 additional third-party services.

### Existing Baseline

The SDK already contains a **Notifications skeleton** (implemented in all three languages) with basic models (`Notification`, `NotificationPreferences`, `NotificationCategory`, `ChannelSubscription`, `RegisteredDevice`) and client methods for listing, reading, preferences, device registration, and subscriptions. This specification extends that skeleton into a full-featured notification infrastructure module and defines two entirely new modules.

---

## 2. Notifications / In-App Messaging Module (P2 -- New)

### Overview

The Notifications module provides a unified, multi-channel notification infrastructure for the platform. It goes beyond the existing Email module (transactional email sending) to deliver in-app notifications, push notifications (web push via VAPID, mobile push via FCM/APNs), SMS notifications, and notification digests. The module includes an in-app notification center (bell icon, notification feed), user-level preference management, notification templates with variable substitution, digest/batching to reduce notification fatigue, real-time delivery via WebSocket/SSE, and comprehensive read/unread tracking.

**Value Proposition**: A single, integrated notification layer eliminates the need for customers to integrate Novu, Knock, or OneSignal alongside the platform SDK. Developers get multi-channel notifications with one API call, and end users get a consistent notification experience with granular preference control.

### Competitive Analysis

| Feature | Auth0 | Clerk | WorkOS | Novu | Knock | OneSignal | Our SDK (Current) | Our SDK (Proposed) |
|---------|-------|-------|--------|------|-------|-----------|-------------------|-------------------|
| In-App Notification Feed | No | No | No | Yes (Inbox component) | Yes (Feed component) | Yes | Basic list only | Full feed with real-time |
| Push Notifications (Web) | Guardian only | No | No | Yes (via provider) | Yes | Yes (core feature) | Device registration only | Full VAPID web push |
| Push Notifications (Mobile) | Guardian MFA | No | No | Yes (FCM/APNs) | Yes (FCM/APNs) | Yes (core feature) | Device registration only | FCM/APNs integration |
| SMS Notifications | MFA OTP only | SMS OTP only | No | Yes (via provider) | Yes | Yes | No | Notification SMS |
| Notification Templates | No | No | No | Yes (Liquid syntax) | Yes (per-channel) | Yes (rich content) | No | Variable substitution |
| Notification Preferences | Guardian prefs | No | No | Yes (per-subscriber) | Yes (preference sets) | Yes (per-user) | Basic toggle model | Granular per-category/channel |
| Digest / Batching | No | No | No | Yes (digest action) | Yes (batching + throttle) | No | No | Configurable digest |
| Real-Time Delivery | No | No | No | Yes (WebSocket) | Yes (WebSocket) | Yes | No | WebSocket + SSE |
| Workflow Orchestration | Actions (limited) | No | No | Yes (visual + code) | Yes (workflow engine) | Journeys | No | Trigger-based workflows |
| Topic / Category System | No | No | No | Yes (topics) | Yes (categories) | Tags + segments | Basic categories | Hierarchical categories |
| Multi-Tenancy Support | Per-tenant | Per-instance | Per-org | Yes (multi-tenant) | Yes (tenant-aware) | Yes (app-scoped) | Per-tenant | Per-tenant |
| Presence / Online Status | No | No | No | Yes | No | No | No | Optional presence |
| Embeddable UI Components | No | User components | Admin Portal | React Inbox | React components | SDKs + widgets | No | React/Web components |

**Key Competitive Insights**:
- **Novu** is the closest architectural model: open-source, API-first, multi-channel with workflow orchestration and embeddable inbox. Their digest action and subscriber preference system are well-designed.
- **Knock** differentiates with batching, throttling, and a flexible preference model. Their workflow-centric API (trigger a workflow, not send a notification) is an elegant abstraction.
- **OneSignal** leads in push notification scale and segmentation, with robust analytics on delivery and engagement.
- **Auth0, Clerk, WorkOS** do not offer general notification infrastructure -- this is a clear differentiation opportunity for our SDK.

### Current Capabilities (Existing Skeleton)

| Capability | Status | Details |
|------------|--------|---------|
| Notification CRUD | Partial | list, get, delete with pagination |
| Read/Unread Tracking | Partial | markAsRead, markAllAsRead, getUnreadCount |
| Notification Preferences | Partial | Basic toggle model (email/sms/push/in_app enabled + digest frequency) |
| Categories | Partial | List categories, basic model with default_channels |
| Channel Subscriptions | Partial | subscribe, unsubscribe, list subscriptions |
| Device Registration | Partial | register/unregister device for push |
| Test Notification | Partial | sendTest per channel |

### Requirements

#### Core Features (Must Have)

- **Notification Trigger API**: Replace the current passive model (server pushes to client) with an active trigger model inspired by Novu/Knock. Sending a notification means triggering a workflow that routes to the appropriate channels based on user preferences and category configuration.
  - API methods: `send(request)`, `sendBulk(requests)`, `sendToTopic(topicId, request)`
  - Models: `SendNotificationRequest` with `recipient_id`, `template_id` or `content`, `channel_overrides`, `payload: Record<string, any>`, `idempotency_key`
  - The `send()` call is asynchronous -- it returns a `NotificationSendResult` with a `request_id` for tracking

- **Notification Templates**: Support reusable notification templates with variable substitution using `{{ variable }}` syntax. Templates define content per channel (in-app title/body, push title/body/image, SMS body, email subject/body).
  - API methods: `createTemplate(request)`, `listTemplates(params)`, `getTemplate(templateId)`, `updateTemplate(templateId, request)`, `deleteTemplate(templateId)`, `renderPreview(templateId, payload)`
  - Models: `NotificationTemplate` with `id`, `name`, `description`, `category`, `channels: ChannelTemplate[]`, `variables: TemplateVariable[]`, `version`, `is_active`
  - Model: `ChannelTemplate` with `channel: "in_app" | "push" | "sms" | "email"`, `title`, `body`, `image_url`, `action_url`, `cta_text`
  - Model: `TemplateVariable` with `name`, `type: "string" | "number" | "boolean" | "datetime" | "url"`, `required`, `default_value`, `description`

- **Multi-Channel Delivery**: Deliver notifications across four channels: in-app, push (web + mobile), SMS, and email (delegating to existing Email module). Channel routing is determined by: (1) template channel configuration, (2) user preferences, (3) channel availability (device registered, phone number on file, etc.).
  - API methods: `getDeliveryStatus(requestId)`, `listDeliveries(notificationId)`
  - Models: `NotificationDelivery` with `id`, `notification_id`, `channel`, `status: "pending" | "sent" | "delivered" | "failed" | "bounced"`, `sent_at`, `delivered_at`, `failure_reason`, `provider_message_id`

- **In-App Notification Feed**: A paginated, real-time notification feed that powers the "bell icon" UX pattern. Supports categories, read/unread filtering, and dismissal. The feed is per-user and tenant-scoped.
  - API methods: Enhanced `list()` with cursor-based pagination for infinite scroll, `dismiss(notificationId)`, `dismissAll(category?)`, `getUnreadCount()` (enhanced to return per-category counts)
  - Models: Enhanced `Notification` with `dismissed`, `dismissed_at`, `priority: "low" | "normal" | "high" | "urgent"`, `expires_at`, `group_key`
  - Model: `NotificationFeedResponse` with `data: Notification[]`, `cursor`, `has_more`, `unread_count`

- **Real-Time Delivery (WebSocket / SSE)**: Provide a real-time connection for in-app notifications so clients receive new notifications instantly without polling.
  - API methods: `connectRealTime(options)` returns a connection handle; `onNotification(callback)`, `onUnreadCountChange(callback)`, `disconnect()`
  - Models: `RealTimeConnection` with `status: "connecting" | "connected" | "disconnected" | "reconnecting"`, `reconnect_attempts`
  - Protocols: WebSocket primary, SSE fallback. Connection includes heartbeat and automatic reconnection with exponential backoff.
  - Authentication: Bearer token sent on connection handshake; token refresh handled transparently.

- **Notification Preferences (Enhanced)**: Granular preference management at the category-channel matrix level. Users can opt in/out of specific categories on specific channels. Some categories are mandatory (security alerts) and cannot be disabled.
  - API methods: Enhanced `getPreferences()`, `updatePreferences(request)`, `updateCategoryPreference(categoryId, channelPrefs)`, `resetPreferences()`
  - Models: Enhanced `NotificationPreferences` with `global_enabled`, `channels: Record<ChannelType, ChannelPreference>`, `categories: Record<string, CategoryPreference>`, `quiet_hours: QuietHoursConfig`, `digest_config: DigestConfig`
  - Model: `ChannelPreference` with `enabled`, `delivery_schedule: "realtime" | "digest"` per channel
  - Model: `CategoryPreference` with `category_id`, `channels: Record<ChannelType, boolean>`, `is_muted`, `is_mandatory` (read-only, set by admin)

- **Digest / Batching**: Aggregate multiple notifications of the same category or group key into periodic summary digests. Configurable per user and per category.
  - API methods: `getDigestConfig()`, `updateDigestConfig(config)`
  - Models: `DigestConfig` with `enabled`, `frequency: "hourly" | "daily" | "weekly"`, `delivery_time: string` (e.g., "09:00"), `delivery_day: string` (for weekly, e.g., "monday"), `timezone`, `categories: string[]` (categories to digest)
  - Model: `DigestEntry` with `count`, `category`, `latest_notification`, `summary_text`
  - Digest notifications are themselves a special notification type delivered on the configured schedule

- **Push Notification Providers**: Server-side integration with push notification delivery services.
  - API methods (admin): `configurePushProvider(config)`, `getPushProvider()`, `testPushProvider()`
  - Models: `PushProviderConfig` with `web_push: VAPIDConfig`, `fcm: FCMConfig`, `apns: APNsConfig`
  - Model: `VAPIDConfig` with `public_key`, `private_key`, `subject`
  - Model: `FCMConfig` with `project_id`, `service_account_json` or `server_key`
  - Model: `APNsConfig` with `key_id`, `team_id`, `bundle_id`, `private_key`, `environment: "sandbox" | "production"`

- **SMS Notification Provider**: Configuration for SMS delivery beyond OTP (which is handled by the Passwordless module).
  - API methods (admin): `configureSmsProvider(config)`, `getSmsProvider()`, `testSmsProvider()`
  - Models: `SmsProviderConfig` with `provider: "twilio" | "vonage" | "messagebird" | "sns"`, `credentials: Record<string, string>`, `from_number`, `is_active`

- **Topics / Subscription Groups**: Allow users to subscribe to notification topics (e.g., "product-updates", "team-activity", "billing-alerts") beyond the admin-defined categories. Topics enable pub/sub-style notification delivery.
  - API methods: `createTopic(request)`, `listTopics(params)`, `getTopic(topicId)`, `deleteTopic(topicId)`, `addTopicSubscribers(topicId, subscriberIds)`, `removeTopicSubscribers(topicId, subscriberIds)`, `listTopicSubscribers(topicId, params)`
  - Models: `NotificationTopic` with `id`, `key`, `name`, `description`, `subscriber_count`, `created_at`

#### Enhanced Features (Should Have)

- **Notification Workflows**: Define multi-step notification workflows with delay, digest, and conditional logic. Workflows chain actions: e.g., send in-app immediately, wait 1 hour, if not read send push, wait 24 hours, if still not read send email.
  - API methods: `createWorkflow(request)`, `listWorkflows(params)`, `getWorkflow(workflowId)`, `updateWorkflow(workflowId, request)`, `deleteWorkflow(workflowId)`, `triggerWorkflow(workflowId, request)`
  - Models: `NotificationWorkflow` with `id`, `name`, `trigger_identifier`, `steps: WorkflowStep[]`, `is_active`
  - Model: `WorkflowStep` with `type: "send" | "delay" | "digest" | "condition"`, `channel`, `template_id`, `delay_duration`, `condition: StepCondition`
  - Model: `StepCondition` with `field`, `operator`, `value` (e.g., `{ field: "notification.read", operator: "equals", value: false }`)

- **Notification Grouping / Stacking**: Group related notifications in the feed (e.g., "Alice, Bob, and 3 others commented on your post") using a `group_key`.
  - API methods: `listGrouped(params)` returns grouped notifications
  - Models: `NotificationGroup` with `group_key`, `count`, `latest`, `actors: ActorSummary[]`, `summary_template`

- **Scheduled Notifications**: Schedule notifications for future delivery.
  - API methods: `schedule(request)` with `send_at: DateTime`, `cancelScheduled(scheduleId)`
  - Models: `ScheduledNotification` with `id`, `notification_request`, `send_at`, `status: "scheduled" | "sent" | "cancelled"`, `created_at`

- **Notification Actions**: Support actionable notifications with buttons/CTAs (e.g., "Approve" / "Reject" on an access request notification).
  - Models: `NotificationAction` with `id`, `label`, `action_type: "primary" | "secondary" | "destructive"`, `action_url` or `action_callback_key`
  - API methods: `executeAction(notificationId, actionId)` returns `ActionResult`

- **Subscriber Presence Tracking**: Detect whether a user is currently online/active to inform routing decisions (e.g., skip push if user is active in-app).
  - API methods: `getPresence(userId)`, `setPresence(status)`
  - Models: `PresenceStatus` with `user_id`, `is_online`, `last_seen_at`, `active_channels: string[]`

#### Future Features (Nice to Have)

- **Embeddable Notification Center**: Pre-built React component and Web Component for rendering an in-app notification center (bell icon with dropdown feed, preferences panel). Similar to Novu's `<Inbox />` and Knock's `<NotificationFeed />`.
- **Notification Analytics Dashboard**: Visual dashboard showing delivery rates, open rates, click rates, opt-out trends, and channel performance.
- **A/B Testing for Notifications**: Test different notification content/timing variants and measure engagement.
- **AI-Powered Send Time Optimization**: Use historical engagement data to determine optimal send times per user.
- **Rich Push Content**: Support for images, action buttons, and custom layouts in push notifications.
- **Internationalization**: Template localization with per-locale content variants and automatic locale detection from user profile.

### API Surface

| Method | Description | Parameters | Returns |
|--------|------------|------------|---------|
| **Sending** | | | |
| `send(request)` | Send a notification | `SendNotificationRequest` | `NotificationSendResult` |
| `sendBulk(requests)` | Send multiple notifications | `SendNotificationRequest[]` | `BulkSendResult` |
| `sendToTopic(topicId, request)` | Send to all topic subscribers | `topicId`, `TopicNotificationRequest` | `NotificationSendResult` |
| `schedule(request)` | Schedule a notification | `ScheduleNotificationRequest` | `ScheduledNotification` |
| `cancelScheduled(scheduleId)` | Cancel a scheduled notification | `scheduleId: string` | `void` |
| `getDeliveryStatus(requestId)` | Get delivery status | `requestId: string` | `NotificationDeliveryStatus` |
| **Feed** | | | |
| `list(params)` | List notification feed | `ListNotificationsParams` (cursor-based) | `NotificationFeedResponse` |
| `get(notificationId)` | Get notification by ID | `notificationId: string` | `Notification` |
| `delete(notificationId)` | Delete a notification | `notificationId: string` | `void` |
| `markAsRead(notificationId)` | Mark as read | `notificationId: string` | `Notification` |
| `markAllAsRead(category?, before?)` | Mark all as read | Optional `category`, `before` | `{ updated_count: int }` |
| `dismiss(notificationId)` | Dismiss notification | `notificationId: string` | `Notification` |
| `dismissAll(category?)` | Dismiss all | Optional `category` | `{ updated_count: int }` |
| `getUnreadCount()` | Get unread counts | None | `UnreadCountResponse` |
| `listGrouped(params)` | List grouped notifications | `ListGroupedParams` | `NotificationGroupResponse` |
| **Preferences** | | | |
| `getPreferences()` | Get notification preferences | None | `NotificationPreferences` |
| `updatePreferences(request)` | Update preferences | `UpdatePreferencesRequest` | `NotificationPreferences` |
| `updateCategoryPreference(categoryId, prefs)` | Update single category | `categoryId`, `CategoryPreferenceUpdate` | `CategoryPreference` |
| `resetPreferences()` | Reset to defaults | None | `NotificationPreferences` |
| `getDigestConfig()` | Get digest configuration | None | `DigestConfig` |
| `updateDigestConfig(config)` | Update digest config | `DigestConfigUpdate` | `DigestConfig` |
| **Categories** | | | |
| `listCategories()` | List notification categories | None | `NotificationCategory[]` |
| `getCategory(categoryId)` | Get category detail | `categoryId: string` | `NotificationCategory` |
| `createCategory(request)` | Create category (admin) | `CreateCategoryRequest` | `NotificationCategory` |
| `updateCategory(categoryId, request)` | Update category (admin) | `categoryId`, `UpdateCategoryRequest` | `NotificationCategory` |
| `deleteCategory(categoryId)` | Delete category (admin) | `categoryId: string` | `void` |
| **Templates** | | | |
| `createTemplate(request)` | Create notification template | `CreateTemplateRequest` | `NotificationTemplate` |
| `listTemplates(params)` | List templates | `ListTemplatesParams` | `TemplateListResponse` |
| `getTemplate(templateId)` | Get template by ID | `templateId: string` | `NotificationTemplate` |
| `updateTemplate(templateId, request)` | Update template | `templateId`, `UpdateTemplateRequest` | `NotificationTemplate` |
| `deleteTemplate(templateId)` | Delete template | `templateId: string` | `void` |
| `renderPreview(templateId, payload)` | Preview rendered template | `templateId`, `Record<string, any>` | `RenderedTemplate` |
| **Topics** | | | |
| `createTopic(request)` | Create a topic | `CreateTopicRequest` | `NotificationTopic` |
| `listTopics(params)` | List topics | `ListTopicsParams` | `TopicListResponse` |
| `getTopic(topicId)` | Get topic | `topicId: string` | `NotificationTopic` |
| `deleteTopic(topicId)` | Delete topic | `topicId: string` | `void` |
| `addTopicSubscribers(topicId, subscriberIds)` | Subscribe users to topic | `topicId`, `string[]` | `void` |
| `removeTopicSubscribers(topicId, subscriberIds)` | Unsubscribe users from topic | `topicId`, `string[]` | `void` |
| `listTopicSubscribers(topicId, params)` | List topic subscribers | `topicId`, `ListSubscribersParams` | `TopicSubscriberListResponse` |
| **Devices** | | | |
| `listDevices()` | List registered devices | None | `RegisteredDevice[]` |
| `registerDevice(request)` | Register device for push | `RegisterDeviceRequest` | `RegisteredDevice` |
| `unregisterDevice(deviceId)` | Unregister device | `deviceId: string` | `void` |
| `updateDevice(deviceId, request)` | Update device metadata | `deviceId`, `UpdateDeviceRequest` | `RegisteredDevice` |
| **Real-Time** | | | |
| `connectRealTime(options)` | Open real-time connection | `RealTimeOptions` | `RealTimeConnection` |
| `onNotification(callback)` | Register notification listener | `(notification: Notification) => void` | `Unsubscribe` |
| `onUnreadCountChange(callback)` | Register unread count listener | `(counts: UnreadCountResponse) => void` | `Unsubscribe` |
| `disconnect()` | Close real-time connection | None | `void` |
| **Subscriptions** | | | |
| `listSubscriptions()` | List channel subscriptions | None | `ChannelSubscription[]` |
| `subscribe(channel, topic, endpoint?)` | Subscribe to channel | `channel`, `topic`, optional `endpoint` | `ChannelSubscription` |
| `unsubscribe(subscriptionId)` | Unsubscribe | `subscriptionId: string` | `void` |
| **Admin** | | | |
| `configurePushProvider(config)` | Configure push provider | `PushProviderConfig` | `PushProviderConfig` |
| `getPushProvider()` | Get push provider config | None | `PushProviderConfig` |
| `testPushProvider()` | Test push provider | None | `ProviderTestResult` |
| `configureSmsProvider(config)` | Configure SMS provider | `SmsProviderConfig` | `SmsProviderConfig` |
| `getSmsProvider()` | Get SMS provider config | None | `SmsProviderConfig` |
| `testSmsProvider()` | Test SMS provider | None | `ProviderTestResult` |
| **Workflows** | | | |
| `createWorkflow(request)` | Create notification workflow | `CreateWorkflowRequest` | `NotificationWorkflow` |
| `listWorkflows(params)` | List workflows | `ListWorkflowsParams` | `WorkflowListResponse` |
| `getWorkflow(workflowId)` | Get workflow | `workflowId: string` | `NotificationWorkflow` |
| `updateWorkflow(workflowId, request)` | Update workflow | `workflowId`, `UpdateWorkflowRequest` | `NotificationWorkflow` |
| `deleteWorkflow(workflowId)` | Delete workflow | `workflowId: string` | `void` |
| `triggerWorkflow(workflowId, request)` | Trigger a workflow | `workflowId`, `TriggerWorkflowRequest` | `NotificationSendResult` |

### Models

#### Core Models

- **Notification** (enhanced): `id`, `type: ChannelType`, `category`, `title`, `body`, `data: Record<string, any>`, `action_url`, `image_url`, `read: bool`, `read_at: DateTime?`, `dismissed: bool`, `dismissed_at: DateTime?`, `priority: "low" | "normal" | "high" | "urgent"`, `expires_at: DateTime?`, `group_key: string?`, `actions: NotificationAction[]`, `created_at: DateTime`

- **NotificationFeedResponse**: `data: Notification[]`, `cursor: string?`, `has_more: bool`, `unread_count: int`, `unread_by_category: Record<string, int>`

- **UnreadCountResponse**: `total: int`, `by_category: Record<string, int>`, `by_priority: Record<string, int>`

#### Sending Models

- **SendNotificationRequest**: `recipient_id: string`, `template_id: string?`, `content: InlineContent?`, `channel_overrides: Record<ChannelType, ChannelContent>?`, `payload: Record<string, any>`, `category: string`, `priority: Priority`, `group_key: string?`, `idempotency_key: string?`, `actions: NotificationAction[]?`

- **InlineContent**: `title: string`, `body: string`, `image_url: string?`, `action_url: string?`

- **NotificationSendResult**: `request_id: string`, `notification_id: string`, `status: "accepted" | "queued" | "processing"`, `channels_targeted: ChannelType[]`

- **BulkSendResult**: `accepted: int`, `rejected: int`, `results: NotificationSendResult[]`, `errors: { recipient_id: string, reason: string }[]`

- **TopicNotificationRequest**: `template_id: string?`, `content: InlineContent?`, `payload: Record<string, any>`, `category: string`, `priority: Priority`

#### Template Models

- **NotificationTemplate**: `id`, `name`, `description`, `category`, `channels: ChannelTemplate[]`, `variables: TemplateVariable[]`, `version: int`, `is_active: bool`, `created_at`, `updated_at`

- **ChannelTemplate**: `channel: ChannelType`, `title: string` (supports `{{ var }}`), `body: string` (supports `{{ var }}`), `image_url: string?`, `action_url: string?`, `cta_text: string?`

- **TemplateVariable**: `name: string`, `type: "string" | "number" | "boolean" | "datetime" | "url"`, `required: bool`, `default_value: any?`, `description: string?`

- **RenderedTemplate**: `channels: Record<ChannelType, RenderedChannel>`
- **RenderedChannel**: `title: string`, `body: string`, `image_url: string?`, `action_url: string?`

#### Preference Models

- **NotificationPreferences** (enhanced): `global_enabled: bool`, `channels: Record<ChannelType, ChannelPreference>`, `categories: Record<string, CategoryPreference>`, `quiet_hours: QuietHoursConfig?`, `digest: DigestConfig`

- **ChannelPreference**: `enabled: bool`, `delivery_schedule: "realtime" | "digest"`

- **CategoryPreference**: `category_id: string`, `channels: Record<ChannelType, bool>`, `is_muted: bool`, `is_mandatory: bool` (read-only)

- **QuietHoursConfig**: `enabled: bool`, `start_time: string` (HH:MM), `end_time: string` (HH:MM), `timezone: string`, `channels_affected: ChannelType[]`

- **DigestConfig**: `enabled: bool`, `frequency: "hourly" | "daily" | "weekly"`, `delivery_time: string`, `delivery_day: string?`, `timezone: string`, `categories: string[]`

#### Delivery Models

- **NotificationDelivery**: `id`, `notification_id`, `channel: ChannelType`, `status: DeliveryStatus`, `sent_at: DateTime?`, `delivered_at: DateTime?`, `failure_reason: string?`, `provider_message_id: string?`, `attempts: int`

- **DeliveryStatus**: `pending | sent | delivered | failed | bounced | skipped`

#### Provider Models

- **PushProviderConfig**: `web_push: VAPIDConfig?`, `fcm: FCMConfig?`, `apns: APNsConfig?`
- **VAPIDConfig**: `public_key: string`, `private_key: string`, `subject: string`
- **FCMConfig**: `project_id: string`, `service_account_json: string?`, `server_key: string?`
- **APNsConfig**: `key_id: string`, `team_id: string`, `bundle_id: string`, `private_key: string`, `environment: "sandbox" | "production"`
- **SmsProviderConfig**: `provider: "twilio" | "vonage" | "messagebird" | "sns"`, `credentials: Record<string, string>`, `from_number: string`, `is_active: bool`
- **ProviderTestResult**: `success: bool`, `message: string`, `provider: string`, `latency_ms: int`

#### Topic Models

- **NotificationTopic**: `id`, `key: string`, `name: string`, `description: string?`, `subscriber_count: int`, `created_at: DateTime`

#### Workflow Models

- **NotificationWorkflow**: `id`, `name`, `description`, `trigger_identifier: string`, `steps: WorkflowStep[]`, `is_active: bool`, `created_at`, `updated_at`
- **WorkflowStep**: `id`, `type: "send" | "delay" | "digest" | "condition"`, `channel: ChannelType?`, `template_id: string?`, `delay_duration: string?` (ISO 8601 duration), `condition: StepCondition?`, `order: int`
- **StepCondition**: `field: string`, `operator: "equals" | "not_equals" | "exists" | "gt" | "lt"`, `value: any`

#### Real-Time Models

- **RealTimeConnection**: `status: "connecting" | "connected" | "disconnected" | "reconnecting"`, `reconnect_attempts: int`, `connected_at: DateTime?`
- **RealTimeOptions**: `channels: ChannelType[]?`, `categories: string[]?`, `auto_reconnect: bool` (default true), `reconnect_max_attempts: int` (default 10)

#### Enums

- **ChannelType**: `in_app | push | sms | email`
- **Priority**: `low | normal | high | urgent`
- **DeliveryStatus**: `pending | sent | delivered | failed | bounced | skipped`

### Events (for webhooks)

- `notification.sent`: When a notification is successfully sent to at least one channel
- `notification.delivered`: When delivery is confirmed (push acknowledged, email accepted, etc.)
- `notification.failed`: When all delivery attempts fail for a notification
- `notification.read`: When a user reads a notification
- `notification.dismissed`: When a user dismisses a notification
- `notification.preference_updated`: When a user updates their notification preferences
- `notification.topic.created`: When a new topic is created
- `notification.topic.deleted`: When a topic is deleted
- `notification.template.created`: When a new template is created
- `notification.template.updated`: When a template is updated
- `notification.digest.sent`: When a digest summary is delivered
- `notification.workflow.triggered`: When a workflow is triggered
- `notification.provider.configured`: When a push/SMS provider is configured
- `notification.device.registered`: When a new device is registered for push
- `notification.device.unregistered`: When a device is unregistered

### Error Scenarios

| Scenario | HTTP Status | Python | TypeScript | Java |
|----------|-------------|--------|------------|------|
| Notification not found | 404 | `NotificationNotFoundError` | `NotificationNotFoundError` | `NotificationNotFoundException` |
| Template not found | 404 | `TemplateNotFoundError` | `TemplateNotFoundError` | `TemplateNotFoundException` |
| Topic not found | 404 | `TopicNotFoundError` | `TopicNotFoundError` | `TopicNotFoundException` |
| Workflow not found | 404 | `WorkflowNotFoundError` | `WorkflowNotFoundError` | `WorkflowNotFoundException` |
| Invalid template variables | 400 | `TemplateRenderError` | `TemplateRenderError` | `TemplateRenderException` |
| Required template variable missing | 400 | `MissingVariableError` | `MissingVariableError` | `MissingVariableException` |
| Recipient not found | 404 | `RecipientNotFoundError` | `RecipientNotFoundError` | `RecipientNotFoundException` |
| No valid delivery channel | 422 | `NoDeliveryChannelError` | `NoDeliveryChannelError` | `NoDeliveryChannelException` |
| Push provider not configured | 422 | `ProviderNotConfiguredError` | `ProviderNotConfiguredError` | `ProviderNotConfiguredException` |
| SMS provider not configured | 422 | `ProviderNotConfiguredError` | `ProviderNotConfiguredError` | `ProviderNotConfiguredException` |
| Invalid provider credentials | 400 | `ProviderConfigError` | `ProviderConfigError` | `ProviderConfigException` |
| Real-time connection failed | N/A | `ConnectionError` | `ConnectionError` | `ConnectionException` |
| Duplicate idempotency key | 409 | `DuplicateNotificationError` | `DuplicateNotificationError` | `DuplicateNotificationException` |
| Category is mandatory (cannot disable) | 403 | `MandatoryCategoryError` | `MandatoryCategoryError` | `MandatoryCategoryException` |
| Rate limit exceeded | 429 | `RateLimitError` | `RateLimitError` | `RateLimitException` |

### Cross-Language Notes

- **Python**:
  - Real-time connection uses `websockets` library with async context manager pattern. Provide both sync (`connect_realtime()` runs an internal event loop) and async (`async_connect_realtime()`) variants.
  - Template rendering uses `jinja2`-compatible `{{ }}` syntax for familiarity.
  - Callbacks for `on_notification` accept both sync and async callables.
  - Digest config timezone validation uses `zoneinfo` (Python 3.9+).

- **TypeScript**:
  - Real-time connection uses native `WebSocket` in browser environments and `ws` library in Node.js. Provide `EventEmitter`-style API: `client.on('notification', callback)`.
  - Template types should use generics for payload typing: `send<TPayload>(request: SendNotificationRequest<TPayload>)`.
  - Export all types from `notifications/types.ts`.
  - `RealTimeConnection` should implement `AsyncIterable<Notification>` for `for await` support.

- **Java**:
  - Real-time connection uses `java.net.http.WebSocket` (Java 11+) with `CompletableFuture`-based API.
  - Builder pattern for all complex request objects (`SendNotificationRequest.Builder`, `NotificationTemplate.Builder`, etc.).
  - Use `Optional<T>` for nullable returns (e.g., `Optional<Notification> get(String id)`).
  - Callbacks use `java.util.function.Consumer<Notification>` interface.
  - Digest config timezone validation uses `java.time.ZoneId`.
  - `RegisteredDevice` uses `Instant` for timestamp fields.

---

## 3. Analytics & Reporting Module (P3 -- New)

### Overview

The Analytics & Reporting module provides platform administrators with quantitative insights into authentication activity, user growth, security posture, tenant utilization, and feature adoption. It surfaces pre-built metrics, supports custom event tracking, and enables data export for integration with external BI tools. The module powers both API-driven analytics consumption and scheduled report delivery.

**Value Proposition**: Platform administrators currently have no visibility into how their platform is being used. Auth0 provides log streams and basic stats, Clerk offers a redesigned dashboard with user growth and retention metrics, and tools like Mixpanel/PostHog provide deep product analytics. Our Analytics module provides purpose-built, identity-platform-specific analytics that are richer than what Auth0/Clerk offer, without requiring customers to pipe data into a separate analytics platform.

### Competitive Analysis

| Feature | Auth0 | Clerk | WorkOS | Mixpanel | PostHog | Our SDK (Proposed) |
|---------|-------|-------|--------|----------|---------|-------------------|
| Login Success/Failure Rates | Log streams (manual) | Basic dashboard | No | Custom events | Custom events | Built-in metric |
| User Growth (DAU/MAU/WAU) | No native metric | Yes (redesigned 2025) | No | Yes | Yes | Built-in metric |
| User Retention/Churn | No | Yes (2025 update) | No | Yes (cohorts) | Yes (retention) | Built-in metric |
| Organization Analytics | No | Yes (2025 update) | No | Custom events | Custom events | Built-in metric |
| MFA Adoption Rate | No metric | No | No | Custom events | Custom events | Built-in metric |
| Authentication Method Distribution | Log analysis | Basic breakdown | No | Custom events | Custom events | Built-in metric |
| Security Analytics | Attack Protection dashboard | No | No | Custom events | Custom events | Built-in metric |
| Funnel Analysis | No | No | No | Yes (core feature) | Yes | Built-in funnels |
| Custom Event Tracking | Log extensions | Webhooks to analytics | No | Yes (core feature) | Yes (core feature) | Yes |
| Data Export (CSV/JSON) | Log export | No | No | Yes | Yes | Yes (CSV, JSON, PDF) |
| Scheduled Reports | No | No | No | Yes (email digests) | Yes (subscriptions) | Yes |
| Pre-Built Dashboards | Basic tenant stats | Redesigned overview | Usage dashboard | Templates | Templates | Pre-built + custom |
| Real-Time Analytics | No | No | No | Live view | Live events | Yes (streaming) |
| API Access to Metrics | Management API (logs) | No public API | Usage API | Query API | HogQL API | Full query API |
| Anomaly Detection | Attack protection alerts | No | No | Alerts | Alerts | Threshold alerts |
| Time-Based Filtering | 7-day log window | Daily/Weekly/Monthly | No | Flexible | Flexible | Flexible |

**Key Competitive Insights**:
- **Auth0** offers log streams that can be piped to Datadog/Splunk for analytics, but no native analytics API. Their tenant stats page shows only 12 months of basic data in a table with no charts.
- **Clerk** significantly improved their dashboard in May 2025 with user growth metrics, retention/churn charts, and organization activity breakdowns with daily/weekly/monthly filtering.
- **Mixpanel** is the gold standard for event-based product analytics with funnel analysis, cohort analysis, and AI-powered query building. Our module should provide identity-platform-specific metrics natively while allowing custom event tracking for platform-specific use cases.
- **PostHog** offers self-hosted, open-source analytics with SQL access. Their model of combining analytics + session replay + feature flags is instructive for our integrated approach.
- **No competitor** in the identity space offers a comprehensive, API-driven analytics module as part of their SDK. This is a strong differentiation opportunity.

### Requirements

#### Core Features (Must Have)

- **Authentication Analytics**: Pre-built metrics for login activity.
  - API methods: `getAuthMetrics(params)`, `getAuthMethodDistribution(params)`, `getLoginTimeSeries(params)`
  - Metrics: `total_logins`, `successful_logins`, `failed_logins`, `success_rate`, `unique_users`, `avg_login_duration_ms`, `peak_hour`, `logins_by_method: Record<string, int>` (password, social, sso, passwordless, passkey, mfa)
  - Models: `AuthMetrics`, `AuthMethodDistribution`, `TimeSeriesData`
  - Time granularity: hourly, daily, weekly, monthly
  - Filters: `start_date`, `end_date`, `tenant_id`, `auth_method`, `status`

- **User Growth Metrics**: Track signups, active users, retention, and churn over time.
  - API methods: `getUserGrowthMetrics(params)`, `getActiveUserMetrics(params)`, `getRetentionMetrics(params)`, `getChurnMetrics(params)`
  - Metrics: `total_users`, `new_signups`, `dau` (daily active users), `wau` (weekly active users), `mau` (monthly active users), `dau_mau_ratio`, `retention_rate`, `churn_rate`, `reactivated_users`
  - Models: `UserGrowthMetrics`, `ActiveUserMetrics`, `RetentionCohort`, `ChurnMetrics`
  - Filters: `start_date`, `end_date`, `tenant_id`, `signup_method`, `user_segment`

- **Security Analytics**: Aggregate security-related signals for threat detection and compliance reporting.
  - API methods: `getSecurityMetrics(params)`, `getFailedLoginAnalysis(params)`, `getMfaAdoptionMetrics(params)`, `getBreachedPasswordMetrics(params)`
  - Metrics: `failed_login_attempts`, `unique_ips_blocked`, `brute_force_detections`, `mfa_enrollment_rate`, `mfa_usage_rate`, `breached_passwords_detected`, `suspicious_login_count`, `account_lockouts`
  - Models: `SecurityMetrics`, `FailedLoginAnalysis`, `MfaAdoptionMetrics`, `BreachedPasswordMetrics`
  - Includes: Top failed IPs, geographic distribution of failures, time-of-day heatmap

- **Tenant / Organization Analytics**: Per-tenant and cross-tenant utilization metrics.
  - API methods: `getTenantMetrics(params)`, `getTenantComparison(tenantIds, params)`, `getTenantGrowthMetrics(params)`
  - Metrics: `active_tenants`, `new_tenants`, `user_distribution` (users per tenant histogram), `feature_utilization: Record<string, float>`, `api_usage_per_tenant`, `storage_per_tenant`
  - Models: `TenantMetrics`, `TenantComparison`, `TenantGrowthMetrics`
  - Filters: `start_date`, `end_date`, `tenant_id`, `subscription_plan`

- **Pre-Built Report Definitions**: Out-of-the-box report types that can be generated on demand or scheduled.
  - API methods: `listReportDefinitions()`, `getReportDefinition(reportId)`
  - Pre-built reports:
    - `auth-summary`: Authentication activity summary (logins, failures, methods)
    - `user-growth`: User growth and retention report
    - `security-overview`: Security posture report (threats, MFA, breaches)
    - `tenant-utilization`: Tenant utilization and comparison
    - `api-usage`: API usage summary by endpoint, key, and tenant
    - `compliance-audit`: Compliance-ready audit log summary
  - Models: `ReportDefinition` with `id`, `name`, `description`, `category`, `parameters: ReportParameter[]`, `available_formats: ExportFormat[]`

- **Report Generation and Export**: Generate reports in multiple formats and download them.
  - API methods: `generateReport(reportId, params)`, `getGeneratedReport(generationId)`, `downloadReport(generationId, format)`, `listGeneratedReports(params)`
  - Models: `GeneratedReport` with `id`, `report_definition_id`, `status: "pending" | "generating" | "completed" | "failed"`, `parameters`, `format`, `file_size_bytes`, `download_url`, `expires_at`, `created_at`
  - Export formats: `csv`, `json`, `pdf`

- **Time Series Query API**: A general-purpose time series query endpoint for building custom dashboards.
  - API methods: `query(request)` with flexible metric selection, grouping, and filtering
  - Models: `AnalyticsQuery` with `metrics: string[]`, `dimensions: string[]`, `filters: QueryFilter[]`, `time_range: TimeRange`, `granularity: "hour" | "day" | "week" | "month"`, `order_by: string`, `limit: int`
  - Model: `QueryFilter` with `field: string`, `operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "not_in" | "contains"`, `value: any`
  - Model: `TimeRange` with `start: DateTime`, `end: DateTime`, `preset: "last_24h" | "last_7d" | "last_30d" | "last_90d" | "last_year" | "custom"`
  - Model: `AnalyticsQueryResult` with `data: TimeSeriesDataPoint[]`, `metadata: QueryMetadata`, `total_count: int`
  - Model: `TimeSeriesDataPoint` with `timestamp: DateTime`, `values: Record<string, number>`, `dimensions: Record<string, string>`

#### Enhanced Features (Should Have)

- **Custom Event Tracking**: Allow platform operators to track custom events beyond the built-in metrics (e.g., "feature_used", "onboarding_step_completed").
  - API methods: `trackEvent(request)`, `trackEvents(requests)`, `listCustomEventTypes()`, `createCustomEventType(request)`
  - Models: `CustomEvent` with `event_type: string`, `user_id: string?`, `tenant_id: string?`, `properties: Record<string, any>`, `timestamp: DateTime?`
  - Model: `CustomEventType` with `name`, `description`, `properties_schema: Record<string, PropertySchema>`, `created_at`

- **Funnel Analysis**: Define conversion funnels and measure drop-off between steps.
  - API methods: `createFunnel(request)`, `listFunnels()`, `getFunnel(funnelId)`, `getFunnelResults(funnelId, params)`, `deleteFunnel(funnelId)`
  - Models: `Funnel` with `id`, `name`, `steps: FunnelStep[]`, `created_at`
  - Model: `FunnelStep` with `name`, `event_type`, `filters: QueryFilter[]?`
  - Model: `FunnelResults` with `steps: FunnelStepResult[]`, `overall_conversion_rate`, `time_range`
  - Model: `FunnelStepResult` with `step_name`, `entered: int`, `completed: int`, `conversion_rate`, `avg_time_to_next: Duration?`, `drop_off_rate`
  - Pre-built funnels: signup-to-activation, trial-to-paid, invite-to-join

- **Scheduled Report Delivery**: Automate recurring report generation and delivery via email or webhook.
  - API methods: `createScheduledReport(request)`, `listScheduledReports()`, `getScheduledReport(scheduleId)`, `updateScheduledReport(scheduleId, request)`, `deleteScheduledReport(scheduleId)`, `pauseScheduledReport(scheduleId)`, `resumeScheduledReport(scheduleId)`
  - Models: `ScheduledReport` with `id`, `report_definition_id`, `parameters`, `format`, `schedule: CronExpression | "daily" | "weekly" | "monthly"`, `delivery: DeliveryConfig`, `is_active`, `last_run_at`, `next_run_at`
  - Model: `DeliveryConfig` with `type: "email" | "webhook"`, `recipients: string[]` (email addresses), `webhook_url: string?`, `include_attachment: bool`

- **Anomaly Detection and Alerts**: Automatic detection of unusual patterns with configurable alert thresholds.
  - API methods: `listAlertRules()`, `createAlertRule(request)`, `getAlertRule(ruleId)`, `updateAlertRule(ruleId, request)`, `deleteAlertRule(ruleId)`, `listTriggeredAlerts(params)`, `acknowledgeAlert(alertId)`
  - Models: `AlertRule` with `id`, `name`, `metric`, `condition: "above" | "below" | "change_percent"`, `threshold: number`, `window: Duration`, `notification_channels: string[]`, `is_active`
  - Model: `TriggeredAlert` with `id`, `rule_id`, `metric`, `actual_value`, `threshold`, `triggered_at`, `acknowledged: bool`, `acknowledged_by: string?`

- **Real-Time Metrics Stream**: Live streaming of metrics for real-time dashboards.
  - API methods: `streamMetrics(metrics, options)` returns a streaming connection
  - Updates at configurable intervals (minimum 5 seconds)
  - Models: `MetricsStreamOptions` with `metrics: string[]`, `interval_seconds: int`, `filters: QueryFilter[]`

#### Future Features (Nice to Have)

- **Embeddable Analytics Dashboard**: Pre-built React components for embedding analytics dashboards into admin portals (`<AuthAnalytics />`, `<UserGrowthChart />`, `<SecurityOverview />`).
- **Cohort Analysis**: Define user cohorts based on behavior and track metrics over time for each cohort.
- **Data Warehouse Connectors**: Export analytics data to Snowflake, BigQuery, or Redshift for advanced analysis.
- **AI-Powered Insights**: Natural language query interface ("Show me login failures by country this week") powered by LLM.
- **Benchmarking**: Anonymous, aggregated industry benchmarks (e.g., "Your MFA adoption rate of 45% is above the industry average of 32%").
- **Revenue Analytics**: Connect subscription data to user metrics for LTV, MRR, and revenue attribution analysis.

### API Surface

| Method | Description | Parameters | Returns |
|--------|------------|------------|---------|
| **Authentication Analytics** | | | |
| `getAuthMetrics(params)` | Get auth metrics summary | `AuthMetricsParams` | `AuthMetrics` |
| `getAuthMethodDistribution(params)` | Auth method breakdown | `TimeRangeParams` | `AuthMethodDistribution` |
| `getLoginTimeSeries(params)` | Login time series data | `TimeSeriesParams` | `TimeSeriesData` |
| **User Analytics** | | | |
| `getUserGrowthMetrics(params)` | User growth summary | `TimeRangeParams` | `UserGrowthMetrics` |
| `getActiveUserMetrics(params)` | DAU/WAU/MAU metrics | `TimeRangeParams` | `ActiveUserMetrics` |
| `getRetentionMetrics(params)` | Retention cohort analysis | `RetentionParams` | `RetentionCohort[]` |
| `getChurnMetrics(params)` | Churn analysis | `TimeRangeParams` | `ChurnMetrics` |
| **Security Analytics** | | | |
| `getSecurityMetrics(params)` | Security overview | `TimeRangeParams` | `SecurityMetrics` |
| `getFailedLoginAnalysis(params)` | Failed login deep-dive | `TimeRangeParams` | `FailedLoginAnalysis` |
| `getMfaAdoptionMetrics(params)` | MFA enrollment/usage | `TimeRangeParams` | `MfaAdoptionMetrics` |
| `getBreachedPasswordMetrics(params)` | Breached password stats | `TimeRangeParams` | `BreachedPasswordMetrics` |
| **Tenant Analytics** | | | |
| `getTenantMetrics(params)` | Per-tenant metrics | `TenantMetricsParams` | `TenantMetrics` |
| `getTenantComparison(ids, params)` | Compare tenants | `tenantIds`, `TimeRangeParams` | `TenantComparison` |
| `getTenantGrowthMetrics(params)` | Tenant growth over time | `TimeRangeParams` | `TenantGrowthMetrics` |
| **Custom Events** | | | |
| `trackEvent(request)` | Track a custom event | `TrackEventRequest` | `void` |
| `trackEvents(requests)` | Track multiple events | `TrackEventRequest[]` | `BatchTrackResult` |
| `listCustomEventTypes()` | List custom event types | None | `CustomEventType[]` |
| `createCustomEventType(request)` | Define a new event type | `CreateEventTypeRequest` | `CustomEventType` |
| **Query** | | | |
| `query(request)` | General analytics query | `AnalyticsQuery` | `AnalyticsQueryResult` |
| `streamMetrics(metrics, options)` | Real-time metric stream | `string[]`, `MetricsStreamOptions` | `MetricsStream` |
| **Funnels** | | | |
| `createFunnel(request)` | Create a funnel | `CreateFunnelRequest` | `Funnel` |
| `listFunnels()` | List funnels | None | `Funnel[]` |
| `getFunnel(funnelId)` | Get funnel | `funnelId: string` | `Funnel` |
| `getFunnelResults(funnelId, params)` | Get funnel conversion data | `funnelId`, `TimeRangeParams` | `FunnelResults` |
| `deleteFunnel(funnelId)` | Delete funnel | `funnelId: string` | `void` |
| **Reports** | | | |
| `listReportDefinitions()` | List available reports | None | `ReportDefinition[]` |
| `getReportDefinition(reportId)` | Get report definition | `reportId: string` | `ReportDefinition` |
| `generateReport(reportId, params)` | Generate a report | `reportId`, `GenerateReportRequest` | `GeneratedReport` |
| `getGeneratedReport(generationId)` | Get generation status | `generationId: string` | `GeneratedReport` |
| `downloadReport(generationId, format)` | Download report file | `generationId`, `ExportFormat` | `bytes / stream` |
| `listGeneratedReports(params)` | List generated reports | `ListReportsParams` | `GeneratedReportListResponse` |
| **Scheduled Reports** | | | |
| `createScheduledReport(request)` | Create schedule | `CreateScheduledReportRequest` | `ScheduledReport` |
| `listScheduledReports()` | List schedules | None | `ScheduledReport[]` |
| `getScheduledReport(scheduleId)` | Get schedule | `scheduleId: string` | `ScheduledReport` |
| `updateScheduledReport(id, request)` | Update schedule | `scheduleId`, `UpdateScheduledReportRequest` | `ScheduledReport` |
| `deleteScheduledReport(scheduleId)` | Delete schedule | `scheduleId: string` | `void` |
| `pauseScheduledReport(scheduleId)` | Pause schedule | `scheduleId: string` | `ScheduledReport` |
| `resumeScheduledReport(scheduleId)` | Resume schedule | `scheduleId: string` | `ScheduledReport` |
| **Alerts** | | | |
| `listAlertRules()` | List alert rules | None | `AlertRule[]` |
| `createAlertRule(request)` | Create alert rule | `CreateAlertRuleRequest` | `AlertRule` |
| `getAlertRule(ruleId)` | Get alert rule | `ruleId: string` | `AlertRule` |
| `updateAlertRule(ruleId, request)` | Update alert rule | `ruleId`, `UpdateAlertRuleRequest` | `AlertRule` |
| `deleteAlertRule(ruleId)` | Delete alert rule | `ruleId: string` | `void` |
| `listTriggeredAlerts(params)` | List triggered alerts | `ListAlertsParams` | `TriggeredAlertListResponse` |
| `acknowledgeAlert(alertId)` | Acknowledge alert | `alertId: string` | `TriggeredAlert` |

### Models

#### Authentication Metrics

- **AuthMetrics**: `total_logins: int`, `successful_logins: int`, `failed_logins: int`, `success_rate: float`, `unique_users: int`, `avg_login_duration_ms: float`, `peak_hour: int` (0-23), `logins_by_method: Record<string, int>`, `time_range: TimeRange`

- **AuthMethodDistribution**: `methods: AuthMethodStat[]`, `total: int`, `time_range: TimeRange`
- **AuthMethodStat**: `method: string`, `count: int`, `percentage: float`, `success_rate: float`

- **TimeSeriesData**: `data_points: TimeSeriesDataPoint[]`, `granularity: string`, `time_range: TimeRange`
- **TimeSeriesDataPoint**: `timestamp: DateTime`, `values: Record<string, number>`, `dimensions: Record<string, string>`

#### User Growth Metrics

- **UserGrowthMetrics**: `total_users: int`, `new_signups: int`, `signups_change_percent: float`, `net_growth: int`, `time_range: TimeRange`, `time_series: TimeSeriesData`

- **ActiveUserMetrics**: `dau: int`, `wau: int`, `mau: int`, `dau_mau_ratio: float`, `dau_change_percent: float`, `wau_change_percent: float`, `mau_change_percent: float`, `time_range: TimeRange`, `time_series: TimeSeriesData`

- **RetentionCohort**: `cohort_date: DateTime`, `cohort_size: int`, `retention_by_period: RetentionPeriod[]`
- **RetentionPeriod**: `period: int`, `retained: int`, `retention_rate: float`

- **ChurnMetrics**: `churned_users: int`, `churn_rate: float`, `reactivated_users: int`, `reactivation_rate: float`, `avg_lifetime_days: float`, `time_range: TimeRange`

#### Security Metrics

- **SecurityMetrics**: `failed_login_attempts: int`, `unique_ips_blocked: int`, `brute_force_detections: int`, `suspicious_logins: int`, `account_lockouts: int`, `mfa_enrollment_rate: float`, `mfa_challenge_success_rate: float`, `breached_passwords_detected: int`, `time_range: TimeRange`

- **FailedLoginAnalysis**: `total_failures: int`, `by_reason: Record<string, int>`, `top_failed_ips: IPFailureEntry[]`, `geographic_distribution: GeoEntry[]`, `hourly_heatmap: int[]` (24 entries), `time_range: TimeRange`
- **IPFailureEntry**: `ip: string`, `count: int`, `last_attempt: DateTime`, `is_blocked: bool`
- **GeoEntry**: `country: string`, `region: string?`, `count: int`, `percentage: float`

- **MfaAdoptionMetrics**: `total_users: int`, `enrolled_users: int`, `enrollment_rate: float`, `by_method: Record<string, int>`, `mfa_challenges_total: int`, `mfa_challenges_successful: int`, `challenge_success_rate: float`, `time_range: TimeRange`

- **BreachedPasswordMetrics**: `total_checks: int`, `breached_detected: int`, `detection_rate: float`, `passwords_changed_after_detection: int`, `avg_time_to_change_hours: float`, `time_range: TimeRange`

#### Tenant Metrics

- **TenantMetrics**: `active_tenants: int`, `new_tenants: int`, `churned_tenants: int`, `total_users: int`, `avg_users_per_tenant: float`, `median_users_per_tenant: int`, `feature_utilization: Record<string, float>`, `time_range: TimeRange`

- **TenantComparison**: `tenants: TenantMetricEntry[]`, `time_range: TimeRange`
- **TenantMetricEntry**: `tenant_id: string`, `tenant_name: string`, `total_users: int`, `active_users: int`, `logins: int`, `api_calls: int`, `storage_bytes: int`

- **TenantGrowthMetrics**: `new_tenants_series: TimeSeriesData`, `active_tenants_series: TimeSeriesData`, `churned_tenants_series: TimeSeriesData`

#### Custom Events

- **CustomEvent**: `event_type: string`, `user_id: string?`, `tenant_id: string?`, `properties: Record<string, any>`, `timestamp: DateTime`
- **CustomEventType**: `name: string`, `description: string`, `properties_schema: Record<string, PropertySchema>`, `event_count: int`, `created_at: DateTime`
- **PropertySchema**: `type: "string" | "number" | "boolean" | "datetime"`, `required: bool`, `description: string?`
- **BatchTrackResult**: `accepted: int`, `rejected: int`, `errors: { index: int, reason: string }[]`

#### Funnel Models

- **Funnel**: `id`, `name`, `description`, `steps: FunnelStep[]`, `created_at`, `updated_at`
- **FunnelStep**: `name: string`, `event_type: string`, `filters: QueryFilter[]?`, `order: int`
- **FunnelResults**: `funnel_id`, `steps: FunnelStepResult[]`, `overall_conversion_rate: float`, `avg_completion_time: Duration?`, `time_range: TimeRange`
- **FunnelStepResult**: `step_name: string`, `entered: int`, `completed: int`, `conversion_rate: float`, `drop_off_rate: float`, `avg_time_to_next: Duration?`

#### Query Models

- **AnalyticsQuery**: `metrics: string[]`, `dimensions: string[]?`, `filters: QueryFilter[]?`, `time_range: TimeRange`, `granularity: "hour" | "day" | "week" | "month"`, `order_by: string?`, `order_direction: "asc" | "desc"?`, `limit: int?`
- **QueryFilter**: `field: string`, `operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "not_in" | "contains"`, `value: any`
- **TimeRange**: `start: DateTime?`, `end: DateTime?`, `preset: "last_24h" | "last_7d" | "last_30d" | "last_90d" | "last_year" | "custom"?`
- **AnalyticsQueryResult**: `data: TimeSeriesDataPoint[]`, `metadata: QueryMetadata`, `total_count: int`
- **QueryMetadata**: `query_time_ms: int`, `rows_scanned: int`, `cache_hit: bool`

#### Report Models

- **ReportDefinition**: `id: string`, `name: string`, `description: string`, `category: string`, `parameters: ReportParameter[]`, `available_formats: ExportFormat[]`
- **ReportParameter**: `name: string`, `type: "string" | "date" | "select" | "multiselect"`, `required: bool`, `options: string[]?`, `default_value: any?`
- **GeneratedReport**: `id: string`, `report_definition_id: string`, `status: "pending" | "generating" | "completed" | "failed"`, `parameters: Record<string, any>`, `format: ExportFormat`, `file_size_bytes: int?`, `download_url: string?`, `expires_at: DateTime?`, `error_message: string?`, `created_at: DateTime`, `completed_at: DateTime?`
- **ExportFormat**: `csv | json | pdf`

#### Scheduled Report Models

- **ScheduledReport**: `id`, `name`, `report_definition_id`, `parameters: Record<string, any>`, `format: ExportFormat`, `schedule: ScheduleConfig`, `delivery: DeliveryConfig`, `is_active: bool`, `last_run_at: DateTime?`, `next_run_at: DateTime`, `created_at`, `updated_at`
- **ScheduleConfig**: `type: "daily" | "weekly" | "monthly" | "cron"`, `time: string` (HH:MM), `day_of_week: string?`, `day_of_month: int?`, `cron_expression: string?`, `timezone: string`
- **DeliveryConfig**: `type: "email" | "webhook"`, `recipients: string[]`, `webhook_url: string?`, `webhook_headers: Record<string, string>?`, `include_attachment: bool`, `message: string?`

#### Alert Models

- **AlertRule**: `id`, `name`, `description`, `metric: string`, `condition: "above" | "below" | "change_percent"`, `threshold: number`, `window_minutes: int`, `notification_channels: string[]`, `is_active: bool`, `created_at`, `updated_at`
- **TriggeredAlert**: `id`, `rule_id`, `rule_name`, `metric`, `actual_value: number`, `threshold: number`, `condition`, `triggered_at: DateTime`, `acknowledged: bool`, `acknowledged_by: string?`, `acknowledged_at: DateTime?`, `resolved: bool`, `resolved_at: DateTime?`

#### Stream Models

- **MetricsStream**: `status: "connecting" | "connected" | "disconnected"`, `on(callback)`, `close()`
- **MetricsStreamOptions**: `metrics: string[]`, `interval_seconds: int` (min 5), `filters: QueryFilter[]?`

### Events (for webhooks)

- `analytics.alert.triggered`: When a metric threshold is breached
- `analytics.alert.resolved`: When a metric returns to normal
- `analytics.report.generated`: When a report is ready for download
- `analytics.report.failed`: When report generation fails
- `analytics.scheduled_report.delivered`: When a scheduled report is delivered
- `analytics.custom_event.new_type`: When a new custom event type is first seen
- `analytics.anomaly.detected`: When anomalous behavior is detected

### Error Scenarios

| Scenario | HTTP Status | Python | TypeScript | Java |
|----------|-------------|--------|------------|------|
| Invalid time range | 400 | `InvalidTimeRangeError` | `InvalidTimeRangeError` | `InvalidTimeRangeException` |
| Unsupported metric name | 400 | `InvalidMetricError` | `InvalidMetricError` | `InvalidMetricException` |
| Query too broad (timeout) | 408 | `QueryTimeoutError` | `QueryTimeoutError` | `QueryTimeoutException` |
| Report not found | 404 | `ReportNotFoundError` | `ReportNotFoundError` | `ReportNotFoundException` |
| Report generation failed | 500 | `ReportGenerationError` | `ReportGenerationError` | `ReportGenerationException` |
| Report download expired | 410 | `ReportExpiredError` | `ReportExpiredError` | `ReportExpiredException` |
| Funnel not found | 404 | `FunnelNotFoundError` | `FunnelNotFoundError` | `FunnelNotFoundException` |
| Alert rule not found | 404 | `AlertRuleNotFoundError` | `AlertRuleNotFoundError` | `AlertRuleNotFoundException` |
| Schedule conflict | 409 | `ScheduleConflictError` | `ScheduleConflictError` | `ScheduleConflictException` |
| Invalid cron expression | 400 | `InvalidScheduleError` | `InvalidScheduleError` | `InvalidScheduleException` |
| Export format not supported | 400 | `UnsupportedFormatError` | `UnsupportedFormatError` | `UnsupportedFormatException` |
| Custom event schema mismatch | 400 | `EventSchemaError` | `EventSchemaError` | `EventSchemaException` |
| Rate limit exceeded | 429 | `RateLimitError` | `RateLimitError` | `RateLimitException` |
| Insufficient permissions | 403 | `AuthorizationError` | `AuthorizationError` | `AuthorizationException` |

### Cross-Language Notes

- **Python**:
  - Report download returns `bytes` or streams via `httpx.Response.iter_bytes()`. Provide both `download_report()` (full content) and `download_report_stream()` (streaming) variants.
  - Time series data should use `pandas.DataFrame` conversion utility: `result.to_dataframe()` for users who prefer pandas.
  - Query builder uses method chaining: `client.query().metric("logins").filter("tenant_id", "eq", "t1").time_range("last_7d").execute()`.
  - `trackEvent()` supports async batching: events are queued locally and flushed periodically or on explicit `flush()` call, similar to Mixpanel's Python SDK.

- **TypeScript**:
  - Report download returns `ReadableStream` in browser and `Buffer` in Node.js. Detect environment automatically.
  - Time series types use generics: `AnalyticsQueryResult<TDataPoint>`.
  - Query builder supports fluent API: `client.query().metric('logins').filter({ field: 'tenant_id', operator: 'eq', value: 't1' }).timeRange('last_7d').execute()`.
  - Real-time metrics stream uses `AsyncIterableIterator<MetricsUpdate>`.
  - Export all analytics types from `analytics/types.ts`.

- **Java**:
  - Report download returns `InputStream` for streaming. Provide `downloadReport(generationId, format)` returning `byte[]` and `downloadReportStream(generationId, format)` returning `InputStream`.
  - Query builder uses Builder pattern: `AnalyticsQuery.builder().metric("logins").filter("tenant_id", QueryOperator.EQ, "t1").timeRange(TimeRange.LAST_7D).build()`.
  - Time series data provides `toMap()` and `toList()` conversion utilities.
  - Custom event tracking uses `CompletableFuture<Void>` for async fire-and-forget with local batching.
  - All analytics models are immutable with `@JsonDeserialize(builder = ...)` Jackson annotations.

---

## 4. Rate Limiting Module (P2 -- New)

### Overview

The Rate Limiting module provides a standalone, configurable rate limiting system for the platform. It manages per-endpoint, per-user, per-tenant, and per-IP rate limits with support for multiple algorithms (sliding window, token bucket), configurable policies tied to subscription plans, burst allowances, and bypass rules. The module exposes standard rate limit headers, provides real-time status queries, and emits events when limits are approached or exceeded.

**Value Proposition**: Rate limiting is currently implicit in the platform (server-side enforcement only) with no SDK visibility, no configurability, and no per-tenant customization. This module makes rate limiting a first-class, configurable feature that platform operators can tune per plan/tier, and SDK consumers can query proactively. This is essential for multi-tenant SaaS platforms where different customer tiers need different resource allocations.

### Competitive Analysis

| Feature | Auth0 | Clerk | WorkOS | Cloudflare | Kong | Our SDK (Proposed) |
|---------|-------|-------|--------|------------|------|-------------------|
| Per-Endpoint Limits | Yes (fixed) | Yes (fixed) | Yes (fixed) | Yes (configurable) | Yes (plugin) | Yes (configurable) |
| Per-User Limits | No | No | No | No (per-IP) | Consumer groups | Yes |
| Per-Tenant Limits | Per-tenant env | Per-instance | Per-environment | No | No | Yes |
| Per-IP Limits | Yes | Yes | Yes | Yes (core feature) | Yes | Yes |
| Sliding Window | No (fixed) | Unknown | Unknown | Yes | Yes (advanced) | Yes |
| Token Bucket | No | No | No | Throttle mode | Yes | Yes |
| Rate Limit Headers | Yes (X-RateLimit-*) | Limited | Yes | Yes | Yes | Yes (full set) |
| Configurable per Plan | No (fixed tiers) | No | No | Yes (rules) | Consumer groups | Yes (policy system) |
| Burst Allowance | Yes (burst limits) | No | No | Yes (throttle) | Yes | Yes |
| Bypass Rules | No | No | No | Skip rules | No | Yes (per-key, per-role) |
| Real-Time Status | No | No | No | Analytics | No | Yes (query API) |
| Rate Limit Events | No | No | No | Firewall events | No | Yes (webhook events) |
| Management API | No | No | No | Yes (rules API) | Plugin config | Yes (full CRUD) |
| Custom Key Functions | No | No | No | Yes (composite keys) | Yes | Yes (composite keys) |
| Dynamic Adjustment | No | No | No | No | No | Yes (runtime updates) |

**Key Competitive Insights**:
- **Auth0** enforces rate limits per tenant environment with fixed thresholds (e.g., 2 req/s for free tier Management API, 10 burst). Headers include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`. Customers cannot customize these limits.
- **Cloudflare** is the industry leader for rate limiting at scale. They use a sliding window counter algorithm with 0.003% error rate across 400 million requests. Their 2025 throttling feature drops excess requests like a leaky bucket. Key innovation: composite rate limit keys (IP + path + header combinations).
- **Kong** offers both basic and advanced rate limiting plugins. The advanced plugin supports sliding window, Redis Sentinel for distributed state, consumer groups for per-customer policies, and the ability to selectively exclude requests from counting via `disable_penalty`.
- **No identity platform competitor** (Auth0, Clerk, WorkOS) exposes rate limiting as a configurable SDK module. They all enforce fixed, opaque limits. This is a significant differentiation opportunity -- our SDK lets platform operators define and manage their own rate limiting policies.

### Requirements

#### Core Features (Must Have)

- **Rate Limit Policy CRUD**: Define reusable rate limit policies that specify limits, windows, algorithms, and burst allowances. Policies are assigned to tenants, plans, endpoints, or users.
  - API methods: `createPolicy(request)`, `listPolicies(params)`, `getPolicy(policyId)`, `updatePolicy(policyId, request)`, `deletePolicy(policyId)`
  - Models: `RateLimitPolicy` with `id`, `name`, `description`, `limits: RateLimit[]`, `algorithm: "sliding_window" | "token_bucket" | "fixed_window"`, `burst: BurstConfig?`, `is_active: bool`, `priority: int`, `created_at`, `updated_at`
  - Model: `RateLimit` with `scope: "endpoint" | "user" | "tenant" | "ip" | "api_key"`, `max_requests: int`, `window_seconds: int`, `window_unit: "second" | "minute" | "hour" | "day"` (convenience alias)

- **Rate Limit Rules**: Bind policies to specific targets (endpoints, users, tenants, IP ranges, API keys, or combinations).
  - API methods: `createRule(request)`, `listRules(params)`, `getRule(ruleId)`, `updateRule(ruleId, request)`, `deleteRule(ruleId)`, `enableRule(ruleId)`, `disableRule(ruleId)`
  - Models: `RateLimitRule` with `id`, `name`, `policy_id`, `target: RuleTarget`, `conditions: RuleCondition[]?`, `is_active: bool`, `priority: int`, `created_at`
  - Model: `RuleTarget` with `type: "endpoint" | "user" | "tenant" | "ip" | "api_key" | "role"`, `value: string?` (specific target, or `"*"` for all), `method: string?` (HTTP method), `path_pattern: string?` (glob/regex)
  - Model: `RuleCondition` with `field: "plan" | "role" | "header" | "ip_range" | "country"`, `operator: "eq" | "neq" | "in" | "not_in" | "matches"`, `value: any`

- **Per-Plan/Tier Configuration**: Map rate limit policies to subscription plans so that different pricing tiers automatically get different rate limits.
  - API methods: `assignPolicyToPlan(planId, policyId)`, `getPlanPolicy(planId)`, `removePlanPolicy(planId)`, `listPlanPolicies()`
  - Models: `PlanRateLimitMapping` with `plan_id: string`, `plan_name: string`, `policy_id: string`, `policy_name: string`

- **Rate Limit Check / Query**: Proactively check the current rate limit status for a given identity or request context without consuming a request count.
  - API methods: `checkRateLimit(request)`, `getRateLimitStatus(scope, identifier)`
  - Models: `RateLimitCheckRequest` with `scope: string`, `identifier: string`, `endpoint: string?`, `method: string?`
  - Model: `RateLimitStatus` with `limit: int`, `remaining: int`, `reset_at: DateTime`, `retry_after_seconds: int?`, `is_limited: bool`, `policy_id: string`, `algorithm: string`, `burst_remaining: int?`

- **Rate Limit Headers**: Standardized response headers included in all API responses when rate limiting is active. The SDK provides utilities to parse these headers from HTTP responses.
  - Headers: `X-RateLimit-Limit` (max requests in window), `X-RateLimit-Remaining` (remaining requests), `X-RateLimit-Reset` (UTC epoch seconds when window resets), `X-RateLimit-Policy` (policy name/ID), `Retry-After` (seconds to wait, present on 429 responses)
  - API methods (client-side utility): `parseRateLimitHeaders(headers)` returns `RateLimitInfo`
  - Models: `RateLimitInfo` with `limit: int`, `remaining: int`, `reset_at: DateTime`, `policy: string?`, `retry_after: int?`

- **Sliding Window Algorithm**: Default algorithm that tracks requests in a sliding time window for accurate rate limiting without the boundary-burst problem of fixed windows.
  - Configuration: `window_seconds: int` defines the window size
  - Accuracy target: less than 1% error rate under normal load
  - Implementation: Sliding window counter approach (weighted average of current and previous window counts)

- **Token Bucket Algorithm**: Alternative algorithm that allows controlled bursting while maintaining a long-term average rate.
  - Configuration: `refill_rate: int` (tokens per second), `bucket_size: int` (max tokens / burst capacity), `initial_tokens: int?`
  - Models: `TokenBucketConfig` with `refill_rate`, `bucket_size`, `initial_tokens`
  - Use case: APIs where short bursts are acceptable (e.g., batch operations) but sustained high load should be throttled

- **Burst Allowance**: Allow temporary spikes above the base rate limit for better UX during legitimate usage patterns.
  - Models: `BurstConfig` with `max_burst: int` (additional requests above base limit), `burst_window_seconds: int`, `cooldown_seconds: int` (time after burst before burst allowance refills)
  - Behavior: When base limit is reached, burst allowance kicks in. Burst allowance has its own smaller window and a cooldown period before it replenishes.

- **Rate Limit Bypass**: Exempt specific API keys, roles, or IP addresses from rate limiting.
  - API methods: `createBypassRule(request)`, `listBypassRules()`, `deleteBypassRule(bypassId)`
  - Models: `BypassRule` with `id`, `type: "api_key" | "role" | "ip" | "user"`, `value: string`, `reason: string`, `created_by`, `expires_at: DateTime?`, `created_at`

- **Real-Time Rate Limit Events**: Emit events when rate limits are approached, hit, or when suspicious patterns are detected.
  - Events emitted via the existing webhooks infrastructure
  - Configurable threshold for "approaching" alerts (default 80% of limit)

#### Enhanced Features (Should Have)

- **Composite Rate Limit Keys**: Define rate limit keys that combine multiple dimensions (e.g., rate limit by IP + endpoint, or by user + tenant + endpoint). This prevents a single user from consuming an entire tenant's rate limit on a specific endpoint.
  - Models: `CompositeKey` with `dimensions: string[]` (e.g., `["ip", "endpoint"]`, `["user", "tenant", "endpoint"]`)
  - Field on `RateLimit`: `key: CompositeKey?`

- **Dynamic Rate Limit Adjustment**: Update rate limits at runtime without redeploying. Changes take effect immediately for new requests.
  - API methods: `adjustLimit(ruleId, newLimit)` -- temporary override that reverts after a specified duration
  - Models: `LimitAdjustment` with `rule_id`, `original_limit`, `adjusted_limit`, `reason`, `expires_at`, `created_at`

- **Rate Limit Analytics**: Usage analytics for rate limiting -- how often limits are hit, which tenants/users/endpoints are most constrained.
  - API methods: `getRateLimitAnalytics(params)`, `getTopLimitedEntities(params)`
  - Models: `RateLimitAnalytics` with `total_requests`, `limited_requests`, `limit_rate: float`, `by_scope: Record<string, int>`, `by_policy: Record<string, int>`, `time_range: TimeRange`
  - Model: `LimitedEntity` with `scope`, `identifier`, `limited_count`, `total_requests`, `limit_rate`, `primary_policy`

- **Distributed Rate Limiting**: Support for distributed rate limiting across multiple server instances using Redis or a compatible distributed store.
  - API methods (admin): `configureDistributedStore(config)`, `getDistributedStoreStatus()`
  - Models: `DistributedStoreConfig` with `type: "redis" | "redis_cluster" | "redis_sentinel"`, `connection_url`, `key_prefix`, `sync_interval_ms`
  - Implementation: Use Redis MULTI/EXEC for atomic increment operations, with configurable sync intervals for eventually-consistent distributed counting

- **Penalty Box / Throttle Mode**: Instead of hard-rejecting requests with 429, optionally slow down (throttle) requests by adding artificial latency, or move rate-limited clients into a "penalty box" with further reduced limits.
  - Models: `ThrottleConfig` with `mode: "reject" | "throttle" | "penalty_box"`, `throttle_delay_ms: int?`, `penalty_box_limit: int?`, `penalty_box_duration_seconds: int?`
  - Behavior in `throttle` mode: Requests above the limit are delayed (not rejected) up to a maximum delay, after which they are rejected
  - Behavior in `penalty_box` mode: Clients that exceed limits are moved to a penalty box with lower limits for a configurable duration

- **Cost-Based Rate Limiting**: Assign different "costs" to different operations. A simple GET might cost 1 token, while a complex report generation might cost 10. This provides fairer resource allocation.
  - Models: `EndpointCost` with `path_pattern: string`, `method: string`, `cost: int`
  - API methods: `setEndpointCosts(costs)`, `getEndpointCosts()`
  - Field on `RateLimit`: `cost_based: bool` (when true, `max_requests` represents max cost units, not max requests)

#### Future Features (Nice to Have)

- **Self-Service Rate Limit Dashboard**: Embeddable widget showing current rate limit status, usage graphs, and limit configuration for end-users.
- **Adaptive Rate Limiting**: Automatically adjust rate limits based on server load, error rates, and latency metrics. When the server is under stress, limits are temporarily reduced; when healthy, they expand.
- **Geographic Rate Limiting**: Apply different rate limits based on the client's geographic location (useful for compliance or to prevent abuse from specific regions).
- **Rate Limit Marketplace**: Pre-built rate limit policy templates for common use cases (free tier, pro tier, enterprise tier, anti-abuse, DDoS protection).
- **Client-Side Rate Limit Awareness**: SDK middleware that automatically respects rate limit headers by queuing or delaying requests client-side, preventing 429 errors before they happen.

### API Surface

| Method | Description | Parameters | Returns |
|--------|------------|------------|---------|
| **Policies** | | | |
| `createPolicy(request)` | Create rate limit policy | `CreatePolicyRequest` | `RateLimitPolicy` |
| `listPolicies(params)` | List policies | `ListPoliciesParams` | `PolicyListResponse` |
| `getPolicy(policyId)` | Get policy by ID | `policyId: string` | `RateLimitPolicy` |
| `updatePolicy(policyId, request)` | Update policy | `policyId`, `UpdatePolicyRequest` | `RateLimitPolicy` |
| `deletePolicy(policyId)` | Delete policy | `policyId: string` | `void` |
| **Rules** | | | |
| `createRule(request)` | Create rate limit rule | `CreateRuleRequest` | `RateLimitRule` |
| `listRules(params)` | List rules | `ListRulesParams` | `RuleListResponse` |
| `getRule(ruleId)` | Get rule by ID | `ruleId: string` | `RateLimitRule` |
| `updateRule(ruleId, request)` | Update rule | `ruleId`, `UpdateRuleRequest` | `RateLimitRule` |
| `deleteRule(ruleId)` | Delete rule | `ruleId: string` | `void` |
| `enableRule(ruleId)` | Enable a rule | `ruleId: string` | `RateLimitRule` |
| `disableRule(ruleId)` | Disable a rule | `ruleId: string` | `RateLimitRule` |
| **Plan Mapping** | | | |
| `assignPolicyToPlan(planId, policyId)` | Map policy to plan | `planId`, `policyId` | `PlanRateLimitMapping` |
| `getPlanPolicy(planId)` | Get plan's policy | `planId: string` | `PlanRateLimitMapping` |
| `removePlanPolicy(planId)` | Remove plan mapping | `planId: string` | `void` |
| `listPlanPolicies()` | List all plan mappings | None | `PlanRateLimitMapping[]` |
| **Status & Check** | | | |
| `checkRateLimit(request)` | Check rate limit status | `RateLimitCheckRequest` | `RateLimitStatus` |
| `getRateLimitStatus(scope, identifier)` | Get current status | `scope`, `identifier` | `RateLimitStatus` |
| `parseRateLimitHeaders(headers)` | Parse rate limit headers | `Record<string, string>` | `RateLimitInfo` |
| **Bypass** | | | |
| `createBypassRule(request)` | Create bypass rule | `CreateBypassRuleRequest` | `BypassRule` |
| `listBypassRules()` | List bypass rules | None | `BypassRule[]` |
| `deleteBypassRule(bypassId)` | Delete bypass rule | `bypassId: string` | `void` |
| **Adjustments** | | | |
| `adjustLimit(ruleId, request)` | Temporarily adjust limit | `ruleId`, `AdjustLimitRequest` | `LimitAdjustment` |
| `listAdjustments(ruleId)` | List active adjustments | `ruleId: string` | `LimitAdjustment[]` |
| `revertAdjustment(adjustmentId)` | Revert adjustment early | `adjustmentId: string` | `void` |
| **Endpoint Costs** | | | |
| `setEndpointCosts(costs)` | Set endpoint cost map | `EndpointCost[]` | `void` |
| `getEndpointCosts()` | Get endpoint cost map | None | `EndpointCost[]` |
| **Analytics** | | | |
| `getRateLimitAnalytics(params)` | Rate limiting usage analytics | `AnalyticsParams` | `RateLimitAnalytics` |
| `getTopLimitedEntities(params)` | Most rate-limited entities | `TopLimitedParams` | `LimitedEntity[]` |
| **Distributed Store** | | | |
| `configureDistributedStore(config)` | Configure distributed backend | `DistributedStoreConfig` | `DistributedStoreConfig` |
| `getDistributedStoreStatus()` | Get store health | None | `DistributedStoreStatus` |

### Models

#### Policy Models

- **RateLimitPolicy**: `id: string`, `name: string`, `description: string?`, `limits: RateLimit[]`, `algorithm: RateLimitAlgorithm`, `burst: BurstConfig?`, `throttle: ThrottleConfig?`, `is_active: bool`, `priority: int` (higher = evaluated first), `created_at: DateTime`, `updated_at: DateTime`

- **RateLimit**: `scope: RateLimitScope`, `max_requests: int`, `window_seconds: int`, `window_unit: "second" | "minute" | "hour" | "day"?` (convenience), `key: CompositeKey?`, `cost_based: bool` (default false)

- **RateLimitAlgorithm**: `sliding_window | token_bucket | fixed_window`

- **RateLimitScope**: `endpoint | user | tenant | ip | api_key`

- **BurstConfig**: `max_burst: int`, `burst_window_seconds: int`, `cooldown_seconds: int`

- **TokenBucketConfig**: `refill_rate: int`, `bucket_size: int`, `initial_tokens: int?`

- **ThrottleConfig**: `mode: "reject" | "throttle" | "penalty_box"`, `throttle_delay_ms: int?`, `penalty_box_limit: int?`, `penalty_box_duration_seconds: int?`

#### Rule Models

- **RateLimitRule**: `id: string`, `name: string`, `description: string?`, `policy_id: string`, `target: RuleTarget`, `conditions: RuleCondition[]?`, `is_active: bool`, `priority: int`, `created_at: DateTime`, `updated_at: DateTime`

- **RuleTarget**: `type: RateLimitScope | "role"`, `value: string?` (null = all, `"*"` = wildcard), `method: string?` (GET, POST, etc., null = all), `path_pattern: string?` (glob pattern, e.g., `/api/v1/users/*`)

- **RuleCondition**: `field: "plan" | "role" | "header" | "ip_range" | "country" | "user_agent"`, `operator: "eq" | "neq" | "in" | "not_in" | "matches"`, `value: any`

- **CompositeKey**: `dimensions: string[]` (e.g., `["ip", "endpoint"]`)

#### Plan Mapping Models

- **PlanRateLimitMapping**: `plan_id: string`, `plan_name: string`, `policy_id: string`, `policy_name: string`, `created_at: DateTime`

#### Status Models

- **RateLimitCheckRequest**: `scope: string`, `identifier: string`, `endpoint: string?`, `method: string?`, `cost: int?` (for cost-based limits)

- **RateLimitStatus**: `limit: int`, `remaining: int`, `used: int`, `reset_at: DateTime`, `retry_after_seconds: int?`, `is_limited: bool`, `policy_id: string`, `policy_name: string`, `algorithm: RateLimitAlgorithm`, `scope: RateLimitScope`, `burst_remaining: int?`, `burst_total: int?`

- **RateLimitInfo** (parsed from headers): `limit: int`, `remaining: int`, `reset_at: DateTime`, `policy: string?`, `retry_after: int?`

#### Bypass Models

- **BypassRule**: `id: string`, `type: "api_key" | "role" | "ip" | "user"`, `value: string`, `reason: string`, `created_by: string`, `expires_at: DateTime?`, `is_active: bool`, `created_at: DateTime`

#### Adjustment Models

- **LimitAdjustment**: `id: string`, `rule_id: string`, `original_limit: int`, `adjusted_limit: int`, `reason: string`, `expires_at: DateTime`, `created_by: string`, `is_active: bool`, `created_at: DateTime`

- **AdjustLimitRequest**: `new_limit: int`, `reason: string`, `duration_minutes: int`

#### Cost Models

- **EndpointCost**: `path_pattern: string`, `method: string` (or `"*"`), `cost: int`, `description: string?`

#### Analytics Models

- **RateLimitAnalytics**: `total_requests: int`, `limited_requests: int`, `limit_rate: float`, `by_scope: Record<RateLimitScope, ScopeAnalytics>`, `by_policy: Record<string, PolicyAnalytics>`, `time_range: TimeRange`
- **ScopeAnalytics**: `total: int`, `limited: int`, `rate: float`
- **PolicyAnalytics**: `policy_id: string`, `policy_name: string`, `total: int`, `limited: int`, `rate: float`

- **LimitedEntity**: `scope: RateLimitScope`, `identifier: string`, `limited_count: int`, `total_requests: int`, `limit_rate: float`, `primary_policy: string`, `last_limited_at: DateTime`

- **TopLimitedParams**: `scope: RateLimitScope?`, `time_range: TimeRange`, `limit: int` (top N, default 10)

#### Distributed Store Models

- **DistributedStoreConfig**: `type: "redis" | "redis_cluster" | "redis_sentinel"`, `connection_url: string`, `key_prefix: string` (default `"rl:"`), `sync_interval_ms: int` (default 100), `sentinel_master_name: string?`, `sentinel_nodes: string[]?`

- **DistributedStoreStatus**: `type: string`, `connected: bool`, `latency_ms: float`, `keys_count: int`, `memory_usage_bytes: int?`, `last_sync_at: DateTime`

### Events (for webhooks)

- `ratelimit.limit_approached`: When usage reaches 80% of the limit (configurable threshold)
- `ratelimit.limit_exceeded`: When a request is rejected due to rate limiting
- `ratelimit.burst_used`: When burst allowance is consumed
- `ratelimit.penalty_box_entered`: When a client enters the penalty box
- `ratelimit.penalty_box_exited`: When a client exits the penalty box
- `ratelimit.policy.created`: When a new rate limit policy is created
- `ratelimit.policy.updated`: When a policy is updated
- `ratelimit.policy.deleted`: When a policy is deleted
- `ratelimit.rule.created`: When a new rule is created
- `ratelimit.rule.enabled`: When a rule is enabled
- `ratelimit.rule.disabled`: When a rule is disabled
- `ratelimit.bypass.created`: When a bypass rule is created
- `ratelimit.bypass.expired`: When a bypass rule expires
- `ratelimit.adjustment.applied`: When a temporary limit adjustment is applied
- `ratelimit.adjustment.reverted`: When a limit adjustment is reverted
- `ratelimit.distributed_store.connected`: When the distributed store connects
- `ratelimit.distributed_store.disconnected`: When the distributed store loses connection

### Error Scenarios

| Scenario | HTTP Status | Python | TypeScript | Java |
|----------|-------------|--------|------------|------|
| Rate limit exceeded | 429 | `RateLimitExceededError` | `RateLimitExceededError` | `RateLimitExceededException` |
| Policy not found | 404 | `PolicyNotFoundError` | `PolicyNotFoundError` | `PolicyNotFoundException` |
| Rule not found | 404 | `RuleNotFoundError` | `RuleNotFoundError` | `RuleNotFoundException` |
| Bypass rule not found | 404 | `BypassNotFoundError` | `BypassNotFoundError` | `BypassNotFoundException` |
| Invalid algorithm configuration | 400 | `InvalidAlgorithmConfigError` | `InvalidAlgorithmConfigError` | `InvalidAlgorithmConfigException` |
| Invalid path pattern | 400 | `InvalidPathPatternError` | `InvalidPathPatternError` | `InvalidPathPatternException` |
| Policy in use (cannot delete) | 409 | `PolicyInUseError` | `PolicyInUseError` | `PolicyInUseException` |
| Conflicting rules | 409 | `RuleConflictError` | `RuleConflictError` | `RuleConflictException` |
| Distributed store unreachable | 503 | `StoreUnavailableError` | `StoreUnavailableError` | `StoreUnavailableException` |
| Invalid composite key dimensions | 400 | `InvalidCompositeKeyError` | `InvalidCompositeKeyError` | `InvalidCompositeKeyException` |
| Plan not found | 404 | `PlanNotFoundError` | `PlanNotFoundError` | `PlanNotFoundException` |
| Adjustment already active | 409 | `AdjustmentActiveError` | `AdjustmentActiveError` | `AdjustmentActiveException` |
| Invalid window configuration | 400 | `ValidationError` | `ValidationError` | `ValidationException` |
| Insufficient permissions | 403 | `AuthorizationError` | `AuthorizationError` | `AuthorizationException` |

### Cross-Language Notes

- **Python**:
  - `parseRateLimitHeaders()` accepts both `httpx.Response` and `dict` header inputs for framework flexibility.
  - Provide a middleware/decorator for popular frameworks: `@rate_limit_aware` decorator that automatically retries with exponential backoff on 429 responses.
  - The `checkRateLimit()` method is synchronous by default; provide `async_check_rate_limit()` for async contexts.
  - Token bucket state is thread-safe using `threading.Lock` for local rate limiting.
  - Policy creation supports `with` context manager for transactional policy + rule creation.

- **TypeScript**:
  - `parseRateLimitHeaders()` accepts both `Headers` (Fetch API), `AxiosResponse`, and plain `Record<string, string>` for broad compatibility.
  - Provide middleware factories for Express (`rateLimitMiddleware()`), Fastify, and Next.js API routes.
  - Export a `RateLimitAwareClient` wrapper that automatically handles 429 responses with retry logic.
  - All configuration types use strict discriminated unions for algorithm config (e.g., `SlidingWindowConfig | TokenBucketConfig | FixedWindowConfig`).
  - Export all types from `ratelimit/types.ts`.

- **Java**:
  - `parseRateLimitHeaders()` accepts `HttpResponse<?>` (Java 11+), `Map<String, List<String>>`, and Spring's `HttpHeaders`.
  - Provide Spring Boot auto-configuration: `@EnableRateLimiting` annotation and `RateLimitInterceptor` for Spring MVC.
  - Builder pattern for all policy and rule creation: `RateLimitPolicy.builder().name("...").algorithm(Algorithm.SLIDING_WINDOW).limit(RateLimit.builder()...).build()`.
  - Token bucket implementation uses `java.util.concurrent.atomic.AtomicLong` for thread-safe token counting.
  - Distributed store integration uses Lettuce (Redis client) with `CompletableFuture`-based async operations.
  - All models are immutable with `@Builder` and `@Value` (Lombok) or manual builder implementations.

---

## 5. Cross-Cutting Concerns

### Pagination Consistency

All list endpoints across the three new modules follow the existing SDK pagination pattern:

| Module | Primary Pagination | Reason |
|--------|-------------------|--------|
| Notifications (feed) | Cursor-based | Infinite scroll UX, real-time inserts |
| Notifications (admin: templates, topics, workflows) | Page-based | Standard admin listing |
| Analytics (query results) | Page-based with `limit`/`offset` | BI-tool compatibility |
| Analytics (reports) | Page-based | Standard admin listing |
| Rate Limiting (all) | Page-based | Standard admin listing |

Cursor-based pagination model:
```
{ data: T[], cursor: string?, has_more: bool }
```

Page-based pagination model (existing):
```
{ data: T[], pagination: { page, page_size, total_items, total_pages, has_next, has_previous } }
```

### Authentication & Authorization

All three modules require authentication via Bearer token. Authorization follows existing patterns:

| Operation Type | Required Permission |
|---------------|-------------------|
| Read own notifications | `notifications:read` (user-level) |
| Send notifications | `notifications:send` (admin) |
| Manage templates/workflows | `notifications:manage` (admin) |
| Configure providers | `notifications:admin` (super-admin) |
| Read analytics | `analytics:read` (admin) |
| Manage reports/alerts | `analytics:manage` (admin) |
| Track custom events | `analytics:write` (service) |
| Read rate limit status | `ratelimit:read` (user or admin) |
| Manage policies/rules | `ratelimit:manage` (admin) |
| Create bypass rules | `ratelimit:admin` (super-admin) |

### Error Handling Consistency

All three modules follow the existing SDK error hierarchy:

```
PlatformError (base)
├── ValidationError (400)
├── AuthenticationError (401)
├── AuthorizationError (403)
├── NotFoundError (404)
│   ├── NotificationNotFoundError
│   ├── TemplateNotFoundError
│   ├── TopicNotFoundError
│   ├── ReportNotFoundError
│   ├── PolicyNotFoundError
│   ├── RuleNotFoundError
│   └── ...
├── ConflictError (409)
│   ├── DuplicateNotificationError
│   ├── PolicyInUseError
│   ├── RuleConflictError
│   └── ...
├── RateLimitError (429)
│   └── RateLimitExceededError
├── ServerError (5xx)
└── ConnectionError (network)
```

### Idempotency

- **Notifications**: `send()` accepts `idempotency_key` to prevent duplicate sends. The server deduplicates within a 24-hour window.
- **Analytics**: `trackEvent()` is idempotent when the same event (user_id + event_type + timestamp) is sent multiple times.
- **Rate Limiting**: `checkRateLimit()` is a read-only operation and does not consume rate limit tokens.

### Multi-Tenancy

All three modules are tenant-scoped by default:

- **Notifications**: Templates, categories, topics, and workflows are per-tenant. Notification delivery respects tenant boundaries. Cross-tenant notifications require explicit admin permission.
- **Analytics**: Metrics are automatically scoped to the authenticated tenant unless the caller has platform-admin permissions for cross-tenant queries.
- **Rate Limiting**: Policies and rules can be global (platform-level) or per-tenant. Per-tenant rate limits ensure one tenant cannot consume the entire platform's capacity.

### SDK Module Structure

Each module follows the established directory pattern:

**Python** (`packages/python/src/shared_platform/{module}/`):
```
{module}/
├── __init__.py
├── client.py        # Main client class
├── models.py        # Pydantic models
├── exceptions.py    # Module-specific exceptions
└── events.py        # Webhook event constants (if applicable)
```

**TypeScript** (`packages/node/src/{module}/`):
```
{module}/
├── index.ts         # Public exports
├── client.ts        # Main client class
├── types.ts         # TypeScript interfaces and types
├── errors.ts        # Module-specific error classes
└── events.ts        # Webhook event constants (if applicable)
```

**Java** (`packages/java/src/main/java/com/platform/sdk/{module}/`):
```
{module}/
├── {Module}Client.java          # Main client class (Builder pattern)
├── {Model}.java                 # One file per model (immutable)
├── Create{Model}Request.java    # Request objects
├── Update{Model}Request.java    # Request objects
├── {Model}ListResponse.java     # Paginated responses
├── List{Model}Params.java       # Query parameter objects
├── {Module}Exception.java       # Module base exception
└── {Specific}Exception.java     # Specific exceptions
```

---

## 6. Appendix: Competitive Feature Matrix Summary

### Notification Infrastructure Coverage

| Capability | Auth0 | Clerk | WorkOS | Firebase | Supabase | Novu | Knock | OneSignal | **Our SDK** |
|------------|-------|-------|--------|----------|----------|------|-------|-----------|-------------|
| In-App Feed | - | - | - | - | - | Yes | Yes | Yes | **Yes** |
| Push (Web) | Guardian | - | - | FCM | - | Yes | Yes | Yes | **Yes** |
| Push (Mobile) | Guardian | - | - | FCM | - | Yes | Yes | Yes | **Yes** |
| SMS (non-OTP) | - | - | - | - | - | Yes | Yes | Yes | **Yes** |
| Email Integration | Log streams | - | - | - | - | Yes | Yes | Yes | **Yes** (via Email module) |
| Templates | - | - | - | - | - | Yes | Yes | Yes | **Yes** |
| Preferences | - | - | - | - | - | Yes | Yes | Yes | **Yes** |
| Digest/Batch | - | - | - | - | - | Yes | Yes | - | **Yes** |
| Real-Time | - | - | - | Realtime DB | Realtime | Yes | Yes | - | **Yes** |
| Workflows | Actions | - | - | Functions | Edge Fn | Yes | Yes | Journeys | **Yes** |

### Analytics Coverage

| Capability | Auth0 | Clerk | WorkOS | Mixpanel | PostHog | **Our SDK** |
|------------|-------|-------|--------|----------|---------|-------------|
| Auth Metrics | Logs only | Basic | - | Custom | Custom | **Native** |
| User Growth | - | Yes (2025) | - | Yes | Yes | **Native** |
| Retention/Churn | - | Yes (2025) | - | Yes | Yes | **Native** |
| Security Analytics | Attack Protection | - | - | Custom | Custom | **Native** |
| Tenant Analytics | - | Org analytics | Usage | Custom | Custom | **Native** |
| Funnel Analysis | - | - | - | Yes | Yes | **Yes** |
| Custom Events | - | Via webhooks | - | Yes | Yes | **Yes** |
| Data Export | CSV (limited) | - | - | Yes | Yes | **CSV/JSON/PDF** |
| Scheduled Reports | - | - | - | Yes | Yes | **Yes** |
| Alert/Anomaly | Attack alerts | - | - | Yes | Yes | **Yes** |
| API Access | Log API | - | Usage API | Query API | HogQL | **Full Query API** |

### Rate Limiting Coverage

| Capability | Auth0 | Clerk | WorkOS | Cloudflare | Kong | **Our SDK** |
|------------|-------|-------|--------|------------|------|-------------|
| Per-Endpoint | Fixed | Fixed | Fixed | Config | Plugin | **Configurable** |
| Per-User | - | - | - | - | Consumer | **Yes** |
| Per-Tenant | Per-env | Per-instance | Per-env | - | - | **Yes** |
| Per-IP | Yes | Yes | Yes | Yes | Yes | **Yes** |
| Sliding Window | - | - | - | Yes | Yes (adv) | **Yes** |
| Token Bucket | - | - | - | Throttle | Yes | **Yes** |
| Standard Headers | Yes | Limited | Yes | Yes | Yes | **Yes** |
| Per-Plan Config | Fixed tiers | - | - | Rules | Groups | **Yes** |
| Burst Allowance | Limited | - | - | Yes | Yes | **Yes** |
| Bypass Rules | - | - | - | Skip rules | - | **Yes** |
| Real-Time Query | - | - | - | Analytics | - | **Yes** |
| Management API | - | - | - | Yes | Plugin API | **Full CRUD** |
| Cost-Based | - | - | - | - | - | **Yes** |
| Distributed Store | - | - | - | Edge (built-in) | Redis | **Redis** |

---

*End of specification. This document should be reviewed by the Platform SDK Team, Security Team, and Product Team before implementation begins.*
