/**
 * Session management errors.
 */

export class SessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SessionError';
  }
}

export class SessionNotFoundError extends SessionError {
  public readonly sessionId: string;

  constructor(sessionId: string) {
    super(`Session not found: ${sessionId}`);
    this.name = 'SessionNotFoundError';
    this.sessionId = sessionId;
  }
}

export class CannotRevokeCurrentError extends SessionError {
  public readonly sessionId: string;

  constructor(sessionId: string) {
    super(`Cannot revoke the current session: ${sessionId}. Use revokeAllSessions to include the current session.`);
    this.name = 'CannotRevokeCurrentError';
    this.sessionId = sessionId;
  }
}

export class SessionAlreadyRevokedError extends SessionError {
  public readonly sessionId: string;

  constructor(sessionId: string) {
    super(`Session is already revoked: ${sessionId}`);
    this.name = 'SessionAlreadyRevokedError';
    this.sessionId = sessionId;
  }
}

export class ConcurrentLimitReachedError extends SessionError {
  public readonly limit: number;
  public readonly currentCount: number;

  constructor(limit: number, currentCount: number) {
    super(`Concurrent session limit reached: ${currentCount}/${limit}`);
    this.name = 'ConcurrentLimitReachedError';
    this.limit = limit;
    this.currentCount = currentCount;
  }
}

export class IPMismatchError extends SessionError {
  public readonly expectedIP: string;
  public readonly actualIP: string;

  constructor(expectedIP: string, actualIP: string) {
    super(`IP address mismatch: expected ${expectedIP}, got ${actualIP}`);
    this.name = 'IPMismatchError';
    this.expectedIP = expectedIP;
    this.actualIP = actualIP;
  }
}

export class DeviceMismatchError extends SessionError {
  constructor(message: string = 'Device fingerprint does not match the session') {
    super(message);
    this.name = 'DeviceMismatchError';
  }
}

export class AdminRequiredError extends SessionError {
  constructor(message: string = 'Admin privileges required for this operation') {
    super(message);
    this.name = 'AdminRequiredError';
  }
}

export class InvalidSessionPolicyError extends SessionError {
  public readonly field: string;
  public readonly reason: string;

  constructor(field: string, reason: string) {
    super(`Invalid session policy: ${field} - ${reason}`);
    this.name = 'InvalidSessionPolicyError';
    this.field = field;
    this.reason = reason;
  }
}
