import { createContext } from 'react';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: string;
  planTier: string;
}

export interface TenantContextValue {
  tenantId: string | null;
  organization: Organization | null;
  isLoading: boolean;
  switchOrganization: (organizationId: string) => Promise<void>;
  organizations: Organization[];
}

export const TenantContext = createContext<TenantContextValue | null>(null);
