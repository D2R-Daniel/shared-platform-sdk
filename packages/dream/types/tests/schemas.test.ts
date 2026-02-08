import { describe, it, expect } from 'vitest';
import { userSchema, userCreateSchema, organizationSchema, roleSchema } from '../src/schemas/index';

describe('Zod schemas', () => {
  describe('userSchema', () => {
    it('validates a correct user', () => {
      const result = userSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'alice@acme.com',
        name: 'Alice',
        status: 'active',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = userSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'not-an-email',
        name: 'Alice',
        status: 'active',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid status', () => {
      const result = userSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'alice@acme.com',
        name: 'Alice',
        status: 'invalid',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('userCreateSchema', () => {
    it('validates minimal create input', () => {
      const result = userCreateSchema.safeParse({
        email: 'bob@acme.com',
        name: 'Bob',
      });
      expect(result.success).toBe(true);
    });

    it('validates phone in E.164 format', () => {
      const result = userCreateSchema.safeParse({
        email: 'bob@acme.com',
        name: 'Bob',
        phone: '+14155551234',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid phone format', () => {
      const result = userCreateSchema.safeParse({
        email: 'bob@acme.com',
        name: 'Bob',
        phone: '555-1234',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('organizationSchema', () => {
    it('validates organization with required fields', () => {
      const result = organizationSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Acme Corp',
        slug: 'acme-corp',
        status: 'active',
        planTier: 'professional',
        currency: 'USD',
        region: 'us-east',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid slug format', () => {
      const result = organizationSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Acme Corp',
        slug: 'INVALID SLUG!',
        status: 'active',
        planTier: 'professional',
        currency: 'USD',
        region: 'us-east',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('roleSchema', () => {
    it('validates a role with permissions array', () => {
      const result = roleSchema.safeParse({
        id: '1',
        name: 'Admin',
        slug: 'admin',
        hierarchyLevel: 10,
        isBuiltIn: true,
        isActive: true,
        organizationId: null,
        permissions: ['users:*', 'roles:*'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(result.success).toBe(true);
    });

    it('rejects hierarchy level below 0', () => {
      const result = roleSchema.safeParse({
        id: '1',
        name: 'Admin',
        slug: 'admin',
        hierarchyLevel: -1,
        isBuiltIn: true,
        isActive: true,
        organizationId: null,
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(result.success).toBe(false);
    });

    it('rejects hierarchy level above 100', () => {
      const result = roleSchema.safeParse({
        id: '1',
        name: 'Admin',
        slug: 'admin',
        hierarchyLevel: 101,
        isBuiltIn: true,
        isActive: true,
        organizationId: null,
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(result.success).toBe(false);
    });
  });
});
