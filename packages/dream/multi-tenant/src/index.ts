// @dream/multi-tenant — Barrel export
// Server-side: config, extraction, status enforcement

export { createTenantConfig } from './config';
export type {
  TenantConfig,
  ResolvedTenantConfig,
  ResolvedSubdomainConfig,
  ExtractionSource,
} from './config';

export {
  extractTenantFromSubdomain,
  extractTenantFromHeader,
  extractTenantFromQuery,
} from './extraction';
export type { SubdomainConfig } from './extraction';

export { checkTenantStatus } from './status';
export type { OrganizationStatus, TenantStatusResult } from './status';
