/**
 * Audit module errors.
 */

export class AuditError extends Error {
  public readonly details: Record<string, unknown>;

  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = 'AuditError';
    this.details = details;
  }
}

export class AuditEntryNotFoundError extends AuditError {
  constructor(entryId: string) {
    super(`Audit log entry not found: ${entryId}`, { entryId });
    this.name = 'AuditEntryNotFoundError';
  }
}

export class InvalidEventTypeError extends AuditError {
  constructor(eventType: string) {
    super(`Invalid audit event type: ${eventType}`, { eventType });
    this.name = 'InvalidEventTypeError';
  }
}

export class SchemaValidationError extends AuditError {
  constructor(eventType: string, message: string) {
    super(`Schema validation failed for event type '${eventType}': ${message}`, {
      eventType,
    });
    this.name = 'SchemaValidationError';
  }
}

export class ExportNotFoundError extends AuditError {
  constructor(exportId: string) {
    super(`Export not found: ${exportId}`, { exportId });
    this.name = 'ExportNotFoundError';
  }
}

export class ExportTooLargeError extends AuditError {
  constructor(message: string = 'Export exceeds maximum allowed size') {
    super(message);
    this.name = 'ExportTooLargeError';
  }
}

export class RetentionPolicyError extends AuditError {
  constructor(message: string) {
    super(`Retention policy error: ${message}`);
    this.name = 'RetentionPolicyError';
  }
}

export class IntegrityViolationError extends AuditError {
  constructor(entryId?: string) {
    super(
      entryId
        ? `Integrity violation detected at entry: ${entryId}`
        : 'Integrity violation detected',
      entryId ? { entryId } : {}
    );
    this.name = 'IntegrityViolationError';
  }
}

export class StreamNotFoundError extends AuditError {
  constructor(streamId: string) {
    super(`Audit stream not found: ${streamId}`, { streamId });
    this.name = 'StreamNotFoundError';
  }
}

export class StreamTestError extends AuditError {
  constructor(streamId: string, message: string) {
    super(`Stream test failed for '${streamId}': ${message}`, { streamId });
    this.name = 'StreamTestError';
  }
}

export class AlertRuleNotFoundError extends AuditError {
  constructor(ruleId: string) {
    super(`Alert rule not found: ${ruleId}`, { ruleId });
    this.name = 'AlertRuleNotFoundError';
  }
}

export class IdempotencyConflictError extends AuditError {
  constructor(idempotencyKey: string) {
    super(`Idempotency conflict: event already logged with key '${idempotencyKey}'`, {
      idempotencyKey,
    });
    this.name = 'IdempotencyConflictError';
  }
}
