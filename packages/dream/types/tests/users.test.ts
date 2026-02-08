import { describe, it, expect } from 'vitest';
import type { User, UserStatus, UserCreateInput, UserUpdateInput } from '../src/users';

describe('User types', () => {
  it('User has required fields', () => {
    const user: User = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'alice@acme.com',
      name: 'Alice',
      status: 'active',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(user.id).toBeDefined();
    expect(user.email).toBe('alice@acme.com');
  });

  it('UserStatus is a union of valid statuses', () => {
    const statuses: UserStatus[] = ['active', 'suspended', 'deleted'];
    expect(statuses).toHaveLength(3);
  });

  it('User has optional fields', () => {
    const user: User = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'alice@acme.com',
      name: 'Alice',
      phone: '+14155551234',
      avatarUrl: 'https://example.com/avatar.jpg',
      status: 'active',
      emailVerified: true,
      metadata: { employeeId: 'EMP001' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(user.phone).toBe('+14155551234');
  });

  it('UserCreateInput omits auto-generated fields', () => {
    const input: UserCreateInput = {
      email: 'bob@acme.com',
      name: 'Bob',
    };
    expect(input.email).toBe('bob@acme.com');
  });
});
