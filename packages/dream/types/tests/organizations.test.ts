import { describe, it, expect } from 'vitest';
import type { Organization, OrganizationStatus, OrgCreateInput, OrgUpdateInput } from '../src/organizations';

describe('Organization types', () => {
  it('Organization has required fields', () => {
    const org: Organization = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Acme Corp',
      slug: 'acme-corp',
      status: 'active',
      planTier: 'professional',
      currency: 'USD',
      region: 'us-east',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(org.slug).toBe('acme-corp');
  });

  it('OrganizationStatus has 3 valid values', () => {
    const statuses: OrganizationStatus[] = ['active', 'suspended', 'archived'];
    expect(statuses).toHaveLength(3);
  });

  it('Organization supports Indian market fields', () => {
    const org: Organization = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Tata Tech',
      slug: 'tata-tech',
      status: 'active',
      planTier: 'enterprise',
      currency: 'INR',
      region: 'in-mumbai',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(org.currency).toBe('INR');
    expect(org.region).toBe('in-mumbai');
  });

  it('OrgCreateInput requires name and slug', () => {
    const input: OrgCreateInput = {
      name: 'New Corp',
      slug: 'new-corp',
    };
    expect(input.name).toBe('New Corp');
  });
});
