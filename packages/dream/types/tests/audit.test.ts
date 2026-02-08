import { describe, it, expect } from 'vitest';
import type { AuditEvent, AuditEventType, AuditQueryParams } from '../src/audit';

describe('AuditEvent types', () => {
  it('AuditEvent has required fields', () => {
    const event: AuditEvent = {
      id: 'evt-1',
      tenantId: 'org-1',
      actorId: 'usr-1',
      actorEmail: 'alice@acme.com',
      action: 'user.created',
      resourceType: 'user',
      resourceId: 'usr-2',
      ipAddress: '192.168.1.1',
      requestId: 'req-1',
      timestamp: new Date(),
    };
    expect(event.action).toBe('user.created');
  });

  it('AuditEvent has optional before/after state', () => {
    const event: AuditEvent = {
      id: 'evt-1',
      tenantId: 'org-1',
      actorId: 'usr-1',
      actorEmail: 'alice@acme.com',
      action: 'user.updated',
      resourceType: 'user',
      resourceId: 'usr-2',
      beforeState: { name: 'Old Name' },
      afterState: { name: 'New Name' },
      ipAddress: '192.168.1.1',
      requestId: 'req-1',
      timestamp: new Date(),
    };
    expect(event.beforeState).toEqual({ name: 'Old Name' });
  });
});
