import React, { useMemo } from 'react';
import { TenantContext } from './tenant-context';
import type { TenantContextValue, Organization } from './tenant-context';

export interface MockTenantProviderProps {
  children: React.ReactNode;
  tenantId: string | null;
  organization: Organization | null;
  organizations: Organization[];
  isLoading?: boolean;
  onSwitchOrganization?: (organizationId: string) => Promise<void>;
}

export function MockTenantProvider({
  children,
  tenantId,
  organization,
  organizations,
  isLoading = false,
  onSwitchOrganization,
}: MockTenantProviderProps): React.JSX.Element {
  const value = useMemo<TenantContextValue>(
    () => ({
      tenantId,
      organization,
      isLoading,
      switchOrganization: onSwitchOrganization ?? (async () => {}),
      organizations,
    }),
    [tenantId, organization, isLoading, onSwitchOrganization, organizations],
  );

  return React.createElement(TenantContext.Provider, { value }, children);
}
