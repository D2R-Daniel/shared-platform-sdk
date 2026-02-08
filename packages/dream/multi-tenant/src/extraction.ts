export interface SubdomainConfig {
  baseDomain: string;
  excludeSubdomains?: string[];
}

const DEFAULT_EXCLUDED_SUBDOMAINS = ['www', 'api', 'admin', 'auth', 'mail', 'cdn', 'static'];

export function extractTenantFromSubdomain(
  hostname: string,
  config: SubdomainConfig,
): string | null {
  const { baseDomain, excludeSubdomains } = config;
  const excluded = excludeSubdomains ?? DEFAULT_EXCLUDED_SUBDOMAINS;

  // hostname must end with .baseDomain and have something before it
  if (!hostname.endsWith(`.${baseDomain}`)) {
    return null;
  }

  const subdomain = hostname.slice(0, hostname.length - baseDomain.length - 1);

  // No subdomain or contains dots (nested subdomain — not a tenant)
  if (!subdomain || subdomain.includes('.')) {
    return null;
  }

  if (excluded.includes(subdomain)) {
    return null;
  }

  return subdomain;
}

export function extractTenantFromHeader(
  headers: Headers,
  headerName: string,
): string | null {
  return headers.get(headerName) ?? null;
}

export function extractTenantFromQuery(
  url: string,
  paramName: string,
): string | null {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get(paramName) ?? null;
  } catch {
    return null;
  }
}
