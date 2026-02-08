import { useContext } from 'react';
import { TenantContext } from './tenant-context';
import type { TenantContextValue } from './tenant-context';

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (context === null) {
    throw new Error(
      'useTenant must be used within a <TenantProvider>. Ensure <TenantProvider> is nested inside <AuthProvider> in your root layout.',
    );
  }
  return context;
}
