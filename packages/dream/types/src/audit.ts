export type AuditEventType =
  | 'auth.login' | 'auth.logout' | 'auth.lockout' | 'auth.unlock'
  | 'user.created' | 'user.updated' | 'user.suspended' | 'user.deleted'
  | 'role.created' | 'role.updated' | 'role.assigned' | 'role.unassigned'
  | 'organization.created' | 'organization.updated' | 'organization.suspended'
  | 'team.created' | 'team.updated' | 'team.member_added' | 'team.member_removed'
  | 'invitation.created' | 'invitation.accepted' | 'invitation.revoked'
  | string; // Allow product-specific events

export interface AuditEvent {
  id: string;
  tenantId: string;
  actorId: string;
  actorEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  ipAddress: string;
  requestId: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface AuditQueryParams {
  tenantId: string;
  startDate?: Date;
  endDate?: Date;
  actorId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  page?: number;
  pageSize?: number;
}
