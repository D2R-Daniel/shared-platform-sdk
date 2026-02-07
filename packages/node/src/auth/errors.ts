/**
 * Authentication errors
 */

export class AuthError extends Error {
  constructor(
    public readonly error: string,
    public readonly description: string = ''
  ) {
    super(description ? `${error}: ${description}` : error);
    this.name = 'AuthError';
  }
}

export class TokenExpiredError extends AuthError {
  constructor(message: string = 'Token has expired') {
    super('token_expired', message);
    this.name = 'TokenExpiredError';
  }
}

export class InvalidTokenError extends AuthError {
  constructor(message: string = 'Invalid token') {
    super('invalid_token', message);
    this.name = 'InvalidTokenError';
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message: string = 'Unauthorized') {
    super('unauthorized', message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AuthError {
  public readonly requiredPermission?: string;

  constructor(message: string = 'Forbidden', requiredPermission?: string) {
    super('forbidden', message);
    this.name = 'ForbiddenError';
    this.requiredPermission = requiredPermission;
  }
}

export class StepUpRequiredError extends AuthError {
  public readonly currentLevel: string;
  public readonly requiredLevel: string;
  public readonly stepUpUrl?: string;

  constructor(
    currentLevel: string,
    requiredLevel: string,
    stepUpUrl?: string
  ) {
    super(
      'step_up_required',
      `Step-up authentication required: current=${currentLevel}, required=${requiredLevel}`
    );
    this.name = 'StepUpRequiredError';
    this.currentLevel = currentLevel;
    this.requiredLevel = requiredLevel;
    this.stepUpUrl = stepUpUrl;
  }
}

export class DiscoveryError extends AuthError {
  constructor(message: string = 'Failed to fetch OIDC discovery document') {
    super('discovery_error', message);
    this.name = 'DiscoveryError';
  }
}

export class JWKSError extends AuthError {
  constructor(message: string = 'Failed to fetch or process JWKS') {
    super('jwks_error', message);
    this.name = 'JWKSError';
  }
}

export class TokenValidationError extends AuthError {
  public readonly errorCode: string;

  constructor(
    errorCode: string,
    message: string = 'Token validation failed'
  ) {
    super('token_validation_error', message);
    this.name = 'TokenValidationError';
    this.errorCode = errorCode;
  }
}
