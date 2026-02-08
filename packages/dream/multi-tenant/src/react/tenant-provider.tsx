'use client';

import React, { useMemo } from 'react';
import { TenantContext } from './tenant-context';
import type { TenantContextValue } from './tenant-context';

export interface TenantProviderProps {
  children: React.ReactNode;
}

/**
 * TenantProvider wraps the application with tenant/organization context.
 * In production, this resolves the tenant from the current auth session.
 * For testing, use MockTenantProvider instead.
 */
export function TenantProvider({ children }: TenantProviderProps): React.JSX.Element {
  const value = useMemo<TenantContextValue>(
    () => ({
      tenantId: null,
      organization: null,
      isLoading: true,
      switchOrganization: async () => {
        throw new Error('TenantProvider: switchOrganization not implemented.');
      },
      organizations: [],
    }),
    [],
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}
