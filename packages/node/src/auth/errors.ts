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
