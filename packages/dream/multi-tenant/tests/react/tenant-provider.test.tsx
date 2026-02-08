import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useTenant } from '../../src/react/use-tenant';
import { MockTenantProvider } from '../../src/react/testing';
import type { Organization } from '../../src/react/tenant-context';

const mockOrg: Organization = {
  id: 'org-456',
  name: 'Acme Corp',
  slug: 'acme',
  status: 'active',
  planTier: 'enterprise',
};

const mockOrgs: Organization[] = [
  mockOrg,
  {
    id: 'org-789',
    name: 'Beta Inc',
    slug: 'beta',
    status: 'active',
    planTier: 'pro',
  },
];

describe('useTenant', () => {
  it('should throw when used outside TenantProvider', () => {
    expect(() => {
      renderHook(() => useTenant());
    }).toThrow(
      'useTenant must be used within a <TenantProvider>. Ensure <TenantProvider> is nested inside <AuthProvider> in your root layout.',
    );
  });
});

describe('MockTenantProvider', () => {
  it('should provide tenantId', () => {
    const { result } = renderHook(() => useTenant(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockTenantProvider tenantId="org-456" organization={mockOrg} organizations={mockOrgs}>
          {children}
        </MockTenantProvider>
      ),
    });

    expect(result.current.tenantId).toBe('org-456');
  });

  it('should provide organization', () => {
    const { result } = renderHook(() => useTenant(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockTenantProvider tenantId="org-456" organization={mockOrg} organizations={mockOrgs}>
          {children}
        </MockTenantProvider>
      ),
    });

    expect(result.current.organization).toEqual(mockOrg);
  });

  it('should provide organizations list', () => {
    const { result } = renderHook(() => useTenant(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockTenantProvider tenantId="org-456" organization={mockOrg} organizations={mockOrgs}>
          {children}
        </MockTenantProvider>
      ),
    });

    expect(result.current.organizations).toHaveLength(2);
    expect(result.current.organizations[0].name).toBe('Acme Corp');
    expect(result.current.organizations[1].name).toBe('Beta Inc');
  });

  it('should call onSwitchOrganization callback', async () => {
    const onSwitchOrganization = vi.fn();
    const { result } = renderHook(() => useTenant(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockTenantProvider
          tenantId="org-456"
          organization={mockOrg}
          organizations={mockOrgs}
          onSwitchOrganization={onSwitchOrganization}
        >
          {children}
        </MockTenantProvider>
      ),
    });

    await act(async () => {
      await result.current.switchOrganization('org-789');
    });

    expect(onSwitchOrganization).toHaveBeenCalledWith('org-789');
  });

  it('should default isLoading to false', () => {
    const { result } = renderHook(() => useTenant(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockTenantProvider tenantId="org-456" organization={mockOrg} organizations={mockOrgs}>
          {children}
        </MockTenantProvider>
      ),
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should support isLoading override', () => {
    const { result } = renderHook(() => useTenant(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockTenantProvider
          tenantId="org-456"
          organization={mockOrg}
          organizations={mockOrgs}
          isLoading={true}
        >
          {children}
        </MockTenantProvider>
      ),
    });

    expect(result.current.isLoading).toBe(true);
  });
});
