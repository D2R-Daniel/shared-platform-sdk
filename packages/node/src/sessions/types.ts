/**
 * Session management type definitions.
 */

import { AssuranceLevel } from '../auth/types';

/**
 * Session status.
 */
export type SessionStatus = 'active' | 'expired' | 'revoked';

/**
 * Device type classification.
 */
export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';

/**
 * Session activity action types.
 */
export enum ActivityType {
  SessionCreated = 'session_created',
  LoginSucceeded = 'login_succeeded',
  LoginFailed = 'login_failed',
  MfaVerified = 'mfa_verified',
  PasswordChanged = 'password_changed',
  TokenRefreshed = 'token_refreshed',
  SessionExtended = 'session_extended',
  PermissionsChanged = 'permissions_changed',
  SensitiveActionPerformed = 'sensitive_action_performed',
}

/**
 * Action to take when concurrent session limit is reached.
 */
export type ConcurrentLimitAction = 'deny_new' | 'revoke_oldest';

/**
 * Device information extracted from user-agent and client hints.
 */
export interface DeviceInfo {
  /** Raw user-agent string */
  userAgent: string;
  /** Parsed browser name (e.g. "Chrome") */
  browserName?: string;
  /** Parsed browser version */
  browserVersion?: string;
  /** Operating system name (e.g. "macOS") */
  osName?: string;
  /** Operating system version */
  osVersion?: string;
  /** Classified device type */
  deviceType: DeviceType;
  /** User-assigned device name (if registered) */
  deviceName?: string;
  /** Whether the device is mobile */
  isMobile: boolean;
  /** Whether the user-agent appears to be a bot */
  isBot: boolean;
}

/**
 * Approximate geo-location of a session.
 */
export interface GeoLocation {
  /** City name */
  city?: string;
  /** Region or state */
  region?: string;
  /** ISO 3166-1 alpha-2 country code */
  country?: string;
  /** Full country name */
  countryName?: string;
  /** Latitude */
  latitude?: number;
  /** Longitude */
  longitude?: number;
  /** IANA timezone identifier */
  timezone?: string;
}

/**
 * Full session detail with device and location information.
 */
export interface SessionDetail {
  /** Unique session identifier */
  id: string;
  /** User who owns this session */
  userId: string;
  /** Current session status */
  status: SessionStatus;
  /** When the session was created */
  createdAt: string;
  /** When the session was last active */
  lastActiveAt: string;
  /** Absolute session expiration time */
  expiresAt: string;
  /** Idle timeout expiration (resets on activity) */
  idleExpiresAt?: string;
  /** Whether this is the caller's current session */
  isCurrent: boolean;
  /** Client IP address */
  ipAddress: string;
  /** Device information */
  device: DeviceInfo;
  /** Approximate geo-location */
  geoLocation?: GeoLocation;
  /** Method used to authenticate (e.g. "password", "sso", "social:google") */
  authenticationMethod: string;
  /** Whether MFA was verified in this session */
  mfaVerified: boolean;
  /** Assurance level of this session */
  assuranceLevel: AssuranceLevel;
  /** Reason for revocation (if status is 'revoked') */
  revocationReason?: string;
}

/**
 * Session activity log entry.
 */
export interface SessionActivity {
  /** Activity entry ID */
  id: string;
  /** Session this activity belongs to */
  sessionId: string;
  /** Type of activity */
  action: ActivityType;
  /** When the activity occurred */
  timestamp: string;
  /** IP address at the time of the activity */
  ipAddress: string;
  /** Additional context for the activity */
  details?: Record<string, unknown>;
}

/**
 * Session policy configuration for a tenant.
 */
export interface SessionPolicy {
  /** Maximum session lifetime in minutes (0 = unlimited) */
  maxSessionLifetimeMinutes: number;
  /** Idle timeout in minutes (0 = no idle timeout) */
  idleTimeoutMinutes: number;
  /** Maximum concurrent sessions per user (0 = unlimited) */
  maxConcurrentSessions: number;
  /** What to do when the concurrent session limit is reached */
  onConcurrentLimitReached: ConcurrentLimitAction;
  /** Whether to bind sessions to the originating IP address */
  bindToIP: boolean;
  /** Whether to bind sessions to the originating device fingerprint */
  bindToDevice: boolean;
  /** Whether to require MFA for new session creation */
  requireMFAForNewSession: boolean;
}

/**
 * Aggregate session statistics for admin dashboards.
 */
export interface SessionStats {
  /** Total number of active sessions */
  totalActiveSessions: number;
  /** Number of unique users with active sessions */
  uniqueUsers: number;
  /** Session count by device type */
  sessionsByDeviceType: Record<DeviceType, number>;
  /** Session count by authentication method */
  sessionsByAuthMethod: Record<string, number>;
  /** Session count by country code */
  sessionsByCountry: Record<string, number>;
  /** Average session duration in minutes */
  averageSessionDurationMinutes: number;
  /** Peak concurrent sessions in the current period */
  peakConcurrentSessions: number;
}

/**
 * Options for listing sessions (user-facing).
 */
export interface SessionListOptions {
  /** Filter by session status */
  status?: SessionStatus;
  /** Page number (1-based) */
  page?: number;
  /** Page size (default: 20) */
  pageSize?: number;
  /** Sort by field */
  sortBy?: 'createdAt' | 'lastActiveAt';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Options for listing sessions (admin-facing).
 */
export interface AdminSessionListOptions extends SessionListOptions {
  /** Filter by device type */
  deviceType?: DeviceType;
  /** Filter by country code */
  country?: string;
  /** Filter by authentication method */
  authMethod?: string;
  /** Filter sessions created after this timestamp */
  createdAfter?: string;
  /** Filter sessions created before this timestamp */
  createdBefore?: string;
}

/**
 * Paginated session list response.
 */
export interface SessionListResponse {
  data: SessionDetail[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Paginated activity list response.
 */
export interface SessionActivityResponse {
  data: SessionActivity[];
  total: number;
  page: number;
  pageSize: number;
}
