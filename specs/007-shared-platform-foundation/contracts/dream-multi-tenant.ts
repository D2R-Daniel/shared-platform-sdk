// @dream/multi-tenant — Public API Contract
// Version: 0.1.0
// Purpose: Multi-tenancy with configurable extraction and data isolation

import type { NextRequest, NextResponse } from 'next/server';

// === Configuration ===

export interface TenantConfig {
  mode: 'multi' | 'single';
  extractionSources?: ExtractionSource[]; // priority order, default: ['session']
  singleTenantId?: string; // required when mode === 'single'
  subdomainConfig?: SubdomainConfig;
  headerName?: string; // default: 'X-Tenant-ID'
  queryParam?: string; // default: 'tenantId' (dev mode only)
  statusEnforcement?: boolean; // default: true
}

type ExtractionSource = 'session' | 'subdomain' | 'header' | 'query';

export interface SubdomainConfig {
  baseDomain: string;
  excludeSubdomains?: string[]; // default: ['www', 'api', 'admin', 'auth', 'mail', 'cdn', 'static']
}

// === Factory Functions ===

export function createTenantConfig(config: TenantConfig): ResolvedTenantConfig;

// === Middleware ===

export function withTenant(config: ResolvedTenantConfig): (handler: ApiHandler) => ApiHandler;
export function extractTenantId(request: NextRequest, config: ResolvedTenantConfig): Promise<string | null>;
export function validateTenantStatus(tenantId: string): Promise<{ valid: boolean; status: OrganizationStatus; error?: string }>;

// === React Context ===

export function TenantProvider(props: {
  children: React.ReactNode;
  config?: TenantConfig;
}): JSX.Element;

export function useTenant(): TenantContext;

export interface TenantContext {
  tenantId: string | null;
  organization: Organization | null;
  isLoading: boolean;
  switchOrganization: (organizationId: string) => Promise<void>;
  organizations: Organization[]; // all orgs user belongs to
}
