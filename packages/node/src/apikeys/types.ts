/**
 * API Keys service types.
 */

export type APIKeyEnvironment = 'live' | 'test';

export type APIKeyErrorCode =
  | 'key_not_found'
  | 'key_expired'
  | 'key_revoked'
  | 'ip_not_allowed'
  | 'rate_limited'
  | 'permission_denied';

export interface APIKey {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  key: string;
  key_prefix: string;
  environment: APIKeyEnvironment;
  permissions: string[];
  rate_limit: number;
  allowed_ips?: string[];
  allowed_origins?: string[];
  expires_at?: string;
  last_used_at?: string;
  last_used_ip?: string;
  usage_count: number;
  revoked_at?: string;
  revoked_by?: string;
  revoke_reason?: string;
  created_at: string;
  created_by: string;
}

export interface APIKeySummary {
  id: string;
  name: string;
  description?: string;
  key_prefix: string;
  environment: APIKeyEnvironment;
  permissions: string[];
  rate_limit: number;
  allowed_ips?: string[];
  allowed_origins?: string[];
  expires_at?: string;
  last_used_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateAPIKeyRequest {
  name: string;
  description?: string;
  environment?: APIKeyEnvironment;
  permissions?: string[];
  rate_limit?: number;
  allowed_ips?: string[];
  allowed_origins?: string[];
  expires_in_days?: number;
}

export interface CreateAPIKeyResponse {
  id: string;
  name: string;
  key: string;
  key_prefix: string;
  environment: APIKeyEnvironment;
  permissions: string[];
  rate_limit: number;
  expires_at?: string;
  created_at: string;
}

export interface UpdateAPIKeyRequest {
  name?: string;
  description?: string;
  permissions?: string[];
  rate_limit?: number;
  allowed_ips?: string[];
  allowed_origins?: string[];
}

export interface ValidateAPIKeyRequest {
  key: string;
  required_permission?: string;
}

export interface ValidateAPIKeyResponse {
  valid: boolean;
  tenant_id?: string;
  permissions?: string[];
  has_permission?: boolean;
  error?: string;
  error_code?: APIKeyErrorCode;
}

export interface APIKeyUsage {
  key_id: string;
  period: string;
  requests_count: number;
  requests_by_endpoint: Record<string, number>;
  error_count: number;
  rate_limit_hits: number;
  avg_latency_ms: number;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset_at: string;
  retry_after?: number;
}

export interface APIKeyListResponse {
  data: APIKeySummary[];
  total: number;
  page: number;
  page_size: number;
}

export interface ListAPIKeysParams {
  page?: number;
  page_size?: number;
  environment?: APIKeyEnvironment;
  is_active?: boolean;
}
