// === Types ===

export interface PlatformErrorOptions {
  status: number;
  code: string;
  message: string;
  userMessage: string;
  requestId?: string;
  param?: string;
}

export interface SubclassErrorOptions {
  code: string;
  message: string;
  userMessage: string;
  requestId?: string;
  param?: string;
}

export interface RateLimitErrorOptions extends SubclassErrorOptions {
  retryAfter?: number;
}

// === Error JSON shape (matches API error response contract) ===

export interface PlatformErrorJSON {
  code: string;
  message: string;
  userMessage: string;
  requestId?: string;
  param?: string;
}

// === Base Class ===

export class PlatformError extends Error {
  readonly status: number;
  readonly code: string;
  readonly userMessage: string;
  readonly requestId?: string;
  readonly param?: string;

  constructor(options: PlatformErrorOptions) {
    super(options.message);
    this.name = 'PlatformError';
    this.status = options.status;
    this.code = options.code;
    this.userMessage = options.userMessage;
    this.requestId = options.requestId;
    this.param = options.param;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON(): PlatformErrorJSON {
    const json: PlatformErrorJSON = {
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
    };

    if (this.requestId !== undefined) {
      json.requestId = this.requestId;
    }

    if (this.param !== undefined) {
      json.param = this.param;
    }

    return json;
  }
}

// === Subclasses ===

export class ValidationError extends PlatformError {
  constructor(options: SubclassErrorOptions) {
    super({ ...options, status: 400 });
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends PlatformError {
  constructor(options: SubclassErrorOptions) {
    super({ ...options, status: 401 });
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends PlatformError {
  constructor(options: SubclassErrorOptions) {
    super({ ...options, status: 403 });
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends PlatformError {
  constructor(options: SubclassErrorOptions) {
    super({ ...options, status: 404 });
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends PlatformError {
  constructor(options: SubclassErrorOptions) {
    super({ ...options, status: 409 });
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends PlatformError {
  readonly retryAfter?: number;

  constructor(options: RateLimitErrorOptions) {
    super({ ...options, status: 429 });
    this.name = 'RateLimitError';
    this.retryAfter = options.retryAfter;
  }
}

export class ServerError extends PlatformError {
  constructor(options: SubclassErrorOptions) {
    super({ ...options, status: 500 });
    this.name = 'ServerError';
  }
}
