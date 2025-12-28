/**
 * API Keys service errors.
 */

export class APIKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIKeyError';
  }
}

export class APIKeyNotFoundError extends APIKeyError {
  public readonly keyId: string;

  constructor(keyId: string) {
    super(`API key not found: ${keyId}`);
    this.name = 'APIKeyNotFoundError';
    this.keyId = keyId;
  }
}

export class APIKeyExpiredError extends APIKeyError {
  public readonly keyPrefix?: string;

  constructor(keyPrefix?: string) {
    const msg = keyPrefix
      ? `API key has expired: ${keyPrefix}`
      : 'API key has expired';
    super(msg);
    this.name = 'APIKeyExpiredError';
    this.keyPrefix = keyPrefix;
  }
}

export class APIKeyRevokedError extends APIKeyError {
  public readonly keyPrefix?: string;
  public readonly reason?: string;

  constructor(keyPrefix?: string, reason?: string) {
    let msg = keyPrefix
      ? `API key has been revoked: ${keyPrefix}`
      : 'API key has been revoked';
    if (reason) {
      msg += ` (${reason})`;
    }
    super(msg);
    this.name = 'APIKeyRevokedError';
    this.keyPrefix = keyPrefix;
    this.reason = reason;
  }
}

export class RateLimitExceededError extends APIKeyError {
  public readonly limit: number;
  public readonly resetAt?: string;
  public readonly retryAfter?: number;

  constructor(limit: number, resetAt?: string, retryAfter?: number) {
    let msg = `Rate limit exceeded: ${limit} requests/hour`;
    if (retryAfter) {
      msg += `. Retry after ${retryAfter} seconds`;
    }
    super(msg);
    this.name = 'RateLimitExceededError';
    this.limit = limit;
    this.resetAt = resetAt;
    this.retryAfter = retryAfter;
  }
}

export class IPNotAllowedError extends APIKeyError {
  public readonly ip: string;

  constructor(ip: string) {
    super(`IP address not allowed: ${ip}`);
    this.name = 'IPNotAllowedError';
    this.ip = ip;
  }
}
