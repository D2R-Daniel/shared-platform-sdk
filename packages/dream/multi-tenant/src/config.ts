export type ExtractionSource = 'session' | 'subdomain' | 'header' | 'query';

export interface TenantConfig {
  mode: 'multi' | 'single';
  extractionSources?: ExtractionSource[];
  singleTenantId?: string;
  subdomainConfig?: { baseDomain: string; excludeSubdomains?: string[] };
  headerName?: string;
  queryParam?: string;
  statusEnforcement?: boolean;
}

export interface ResolvedSubdomainConfig {
  baseDomain: string;
  excludeSubdomains: string[];
}

export interface ResolvedTenantConfig {
  mode: 'multi' | 'single';
  extractionSources: ExtractionSource[];
  singleTenantId: string | null;
  subdomainConfig: ResolvedSubdomainConfig | null;
  headerName: string;
  queryParam: string;
  statusEnforcement: boolean;
}

const DEFAULT_EXCLUDED_SUBDOMAINS = ['www', 'api', 'admin', 'auth', 'mail', 'cdn', 'static'];

export function createTenantConfig(config: TenantConfig): ResolvedTenantConfig {
  if (config.mode === 'single' && !config.singleTenantId) {
    throw new Error('singleTenantId is required when mode is "single"');
  }

  let subdomainConfig: ResolvedSubdomainConfig | null = null;
  if (config.subdomainConfig) {
    const customExcludes = config.subdomainConfig.excludeSubdomains ?? [];
    const mergedExcludes = Array.from(
      new Set([...DEFAULT_EXCLUDED_SUBDOMAINS, ...customExcludes]),
    );
    subdomainConfig = {
      baseDomain: config.subdomainConfig.baseDomain,
      excludeSubdomains: mergedExcludes,
    };
  }

  return {
    mode: config.mode,
    extractionSources: config.extractionSources ?? ['session'],
    singleTenantId: config.singleTenantId ?? null,
    subdomainConfig,
    headerName: config.headerName ?? 'X-Tenant-ID',
    queryParam: config.queryParam ?? 'tenantId',
    statusEnforcement: config.statusEnforcement ?? true,
  };
}
