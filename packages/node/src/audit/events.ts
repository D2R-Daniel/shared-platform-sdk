/**
 * Standard audit event type constants.
 *
 * Use these constants instead of raw strings for type safety and discoverability.
 */

// Authentication events
export const AUTH_LOGIN_SUCCESS = 'auth.login.success' as const;
export const AUTH_LOGIN_FAILURE = 'auth.login.failure' as const;
export const AUTH_LOGOUT = 'auth.logout' as const;
export const AUTH_PASSWORD_CHANGE = 'auth.password.change' as const;
export const AUTH_PASSWORD_RESET = 'auth.password.reset' as const;
export const AUTH_MFA_ENABLED = 'auth.mfa.enabled' as const;
export const AUTH_MFA_DISABLED = 'auth.mfa.disabled' as const;
export const AUTH_SESSION_CREATED = 'auth.session.created' as const;
export const AUTH_SESSION_REVOKED = 'auth.session.revoked' as const;
export const AUTH_TOKEN_REFRESHED = 'auth.token.refreshed' as const;

// User management events
export const USER_CREATED = 'user.created' as const;
export const USER_UPDATED = 'user.updated' as const;
export const USER_DELETED = 'user.deleted' as const;
export const USER_SUSPENDED = 'user.suspended' as const;
export const USER_ACTIVATED = 'user.activated' as const;
export const USER_ROLE_ASSIGNED = 'user.role.assigned' as const;
export const USER_ROLE_REMOVED = 'user.role.removed' as const;
export const USER_INVITED = 'user.invited' as const;
export const USER_INVITATION_ACCEPTED = 'user.invitation.accepted' as const;

// Team events
export const TEAM_CREATED = 'team.created' as const;
export const TEAM_UPDATED = 'team.updated' as const;
export const TEAM_DELETED = 'team.deleted' as const;
export const TEAM_MEMBER_ADDED = 'team.member.added' as const;
export const TEAM_MEMBER_REMOVED = 'team.member.removed' as const;
export const TEAM_MEMBER_ROLE_CHANGED = 'team.member.role.changed' as const;

// Resource events
export const RESOURCE_CREATED = 'resource.created' as const;
export const RESOURCE_UPDATED = 'resource.updated' as const;
export const RESOURCE_DELETED = 'resource.deleted' as const;
export const RESOURCE_ACCESSED = 'resource.accessed' as const;

// Settings events
export const SETTINGS_UPDATED = 'settings.updated' as const;
export const SETTINGS_RESET = 'settings.reset' as const;

// Webhook events
export const WEBHOOK_CREATED = 'webhook.created' as const;
export const WEBHOOK_UPDATED = 'webhook.updated' as const;
export const WEBHOOK_DELETED = 'webhook.deleted' as const;

// API Key events
export const APIKEY_CREATED = 'apikey.created' as const;
export const APIKEY_REVOKED = 'apikey.revoked' as const;
export const APIKEY_ROTATED = 'apikey.rotated' as const;

// Audit system events
export const AUDIT_EXPORT_REQUESTED = 'audit.export.requested' as const;
export const AUDIT_EXPORT_COMPLETED = 'audit.export.completed' as const;
export const AUDIT_INTEGRITY_VIOLATION = 'audit.integrity.violation' as const;
export const AUDIT_STREAM_CREATED = 'audit.stream.created' as const;
export const AUDIT_STREAM_FAILED = 'audit.stream.failed' as const;
export const AUDIT_ALERT_TRIGGERED = 'audit.alert.triggered' as const;

// System events
export const SYSTEM_ERROR = 'system.error' as const;
export const SYSTEM_WARNING = 'system.warning' as const;

/**
 * All standard event types grouped by category.
 */
export const AUDIT_EVENT_CATEGORIES = {
  auth: [
    AUTH_LOGIN_SUCCESS,
    AUTH_LOGIN_FAILURE,
    AUTH_LOGOUT,
    AUTH_PASSWORD_CHANGE,
    AUTH_PASSWORD_RESET,
    AUTH_MFA_ENABLED,
    AUTH_MFA_DISABLED,
    AUTH_SESSION_CREATED,
    AUTH_SESSION_REVOKED,
    AUTH_TOKEN_REFRESHED,
  ],
  user: [
    USER_CREATED,
    USER_UPDATED,
    USER_DELETED,
    USER_SUSPENDED,
    USER_ACTIVATED,
    USER_ROLE_ASSIGNED,
    USER_ROLE_REMOVED,
    USER_INVITED,
    USER_INVITATION_ACCEPTED,
  ],
  team: [
    TEAM_CREATED,
    TEAM_UPDATED,
    TEAM_DELETED,
    TEAM_MEMBER_ADDED,
    TEAM_MEMBER_REMOVED,
    TEAM_MEMBER_ROLE_CHANGED,
  ],
  resource: [
    RESOURCE_CREATED,
    RESOURCE_UPDATED,
    RESOURCE_DELETED,
    RESOURCE_ACCESSED,
  ],
  settings: [SETTINGS_UPDATED, SETTINGS_RESET],
  webhook: [WEBHOOK_CREATED, WEBHOOK_UPDATED, WEBHOOK_DELETED],
  apikey: [APIKEY_CREATED, APIKEY_REVOKED, APIKEY_ROTATED],
  audit: [
    AUDIT_EXPORT_REQUESTED,
    AUDIT_EXPORT_COMPLETED,
    AUDIT_INTEGRITY_VIOLATION,
    AUDIT_STREAM_CREATED,
    AUDIT_STREAM_FAILED,
    AUDIT_ALERT_TRIGGERED,
  ],
  system: [SYSTEM_ERROR, SYSTEM_WARNING],
} as const;

/**
 * Flat array of all standard event type strings.
 */
export const ALL_AUDIT_EVENT_TYPES = Object.values(AUDIT_EVENT_CATEGORIES).flat();
