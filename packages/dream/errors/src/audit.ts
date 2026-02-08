// === Types ===

export interface AuditEventInput {
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  tenantId: string;
  ipAddress: string;
  requestId: string;
}

export interface AuditEmitter {
  emit(event: AuditEventInput): Promise<void>;
}

// === InMemoryAuditEmitter (for testing and development) ===

export class InMemoryAuditEmitter implements AuditEmitter {
  readonly events: AuditEventInput[] = [];

  async emit(event: AuditEventInput): Promise<void> {
    this.events.push(event);
  }

  clear(): void {
    this.events.length = 0;
  }
}

// === Factory ===

export function createAuditEmitter(
  emitFn: (event: AuditEventInput) => Promise<void>,
): AuditEmitter {
  return {
    emit: emitFn,
  };
}
