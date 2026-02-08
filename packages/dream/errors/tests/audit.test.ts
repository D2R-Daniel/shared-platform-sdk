import { describe, it, expect, vi } from 'vitest';
import {
  InMemoryAuditEmitter,
  createAuditEmitter,
  type AuditEmitter,
  type AuditEventInput,
} from '../src/audit';

const makeEvent = (overrides?: Partial<AuditEventInput>): AuditEventInput => ({
  actorId: 'usr_actor123',
  action: 'user.updated',
  resourceType: 'user',
  resourceId: 'usr_target456',
  tenantId: 'tnt_acme',
  ipAddress: '192.168.1.1',
  requestId: 'req_abc789',
  ...overrides,
});

describe('InMemoryAuditEmitter', () => {
  it('stores emitted events', async () => {
    const emitter = new InMemoryAuditEmitter();
    const event = makeEvent();

    await emitter.emit(event);

    expect(emitter.events).toHaveLength(1);
    expect(emitter.events[0]).toEqual(event);
  });

  it('stores multiple events in order', async () => {
    const emitter = new InMemoryAuditEmitter();

    await emitter.emit(makeEvent({ action: 'user.created' }));
    await emitter.emit(makeEvent({ action: 'user.updated' }));
    await emitter.emit(makeEvent({ action: 'user.deleted' }));

    expect(emitter.events).toHaveLength(3);
    expect(emitter.events[0].action).toBe('user.created');
    expect(emitter.events[1].action).toBe('user.updated');
    expect(emitter.events[2].action).toBe('user.deleted');
  });

  it('emit returns a promise', async () => {
    const emitter = new InMemoryAuditEmitter();
    const result = emitter.emit(makeEvent());

    expect(result).toBeInstanceOf(Promise);
    await result;
  });

  it('stores events with all required fields', async () => {
    const emitter = new InMemoryAuditEmitter();
    const event = makeEvent({
      beforeState: { name: 'Old Name' },
      afterState: { name: 'New Name' },
    });

    await emitter.emit(event);

    const stored = emitter.events[0];
    expect(stored.actorId).toBe('usr_actor123');
    expect(stored.action).toBe('user.updated');
    expect(stored.resourceType).toBe('user');
    expect(stored.resourceId).toBe('usr_target456');
    expect(stored.tenantId).toBe('tnt_acme');
    expect(stored.ipAddress).toBe('192.168.1.1');
    expect(stored.requestId).toBe('req_abc789');
    expect(stored.beforeState).toEqual({ name: 'Old Name' });
    expect(stored.afterState).toEqual({ name: 'New Name' });
  });

  it('clear() removes all events', async () => {
    const emitter = new InMemoryAuditEmitter();
    await emitter.emit(makeEvent());
    await emitter.emit(makeEvent());

    expect(emitter.events).toHaveLength(2);

    emitter.clear();

    expect(emitter.events).toHaveLength(0);
  });
});

describe('createAuditEmitter', () => {
  it('accepts a custom emit function', async () => {
    const customEmit = vi.fn().mockResolvedValue(undefined);
    const emitter = createAuditEmitter(customEmit);
    const event = makeEvent();

    await emitter.emit(event);

    expect(customEmit).toHaveBeenCalledOnce();
    expect(customEmit).toHaveBeenCalledWith(event);
  });

  it('returns an object satisfying AuditEmitter interface', () => {
    const emitter = createAuditEmitter(vi.fn());

    expect(typeof emitter.emit).toBe('function');
  });

  it('propagates the promise from custom emit', async () => {
    const customEmit = vi.fn().mockResolvedValue(undefined);
    const emitter = createAuditEmitter(customEmit);

    const result = emitter.emit(makeEvent());

    expect(result).toBeInstanceOf(Promise);
    await result;
  });

  it('propagates errors from custom emit', async () => {
    const customEmit = vi.fn().mockRejectedValue(new Error('DB write failed'));
    const emitter = createAuditEmitter(customEmit);

    await expect(emitter.emit(makeEvent())).rejects.toThrow('DB write failed');
  });
});
