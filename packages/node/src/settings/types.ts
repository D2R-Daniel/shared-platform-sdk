/**
 * Settings service types.
 */

export type SettingCategory =
  | 'general'
  | 'branding'
  | 'features'
  | 'integrations'
  | 'security'
  | 'notifications';

export type SettingType = 'boolean' | 'string' | 'number' | 'json' | 'array';

export interface SettingValidationRules {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: unknown[];
}

export interface SettingDefinition {
  key: string;
  type: SettingType;
  default_value?: unknown;
  label: string;
  description?: string;
  category: SettingCategory;
  is_public: boolean;
  is_readonly: boolean;
  validation_rules?: SettingValidationRules;
  display_order: number;
}

export interface TenantSettings {
  id: string;
  tenant_id: string;
  category: SettingCategory;
  settings: Record<string, unknown>;
  updated_at: string;
  updated_by?: string;
}

export interface SettingValue {
  key: string;
  value: unknown;
  definition?: SettingDefinition;
}

export interface AllSettingsResponse {
  tenant_id: string;
  settings: Record<string, Record<string, unknown>>;
  definitions?: Record<string, SettingDefinition[]>;
  updated_at?: string;
}

export interface CategorySettingsResponse {
  tenant_id: string;
  category: SettingCategory;
  settings: Record<string, unknown>;
  updated_at?: string;
}

export interface UpdateSettingsRequest {
  settings: Record<string, unknown>;
}

export interface DefinitionsResponse {
  definitions: SettingDefinition[];
}

export interface GetDefinitionsParams {
  category?: SettingCategory;
  is_public?: boolean;
}

export type ChangeSource = 'api' | 'dashboard' | 'import' | 'system';

export type Environment = 'development' | 'staging' | 'production';

export type SettingSource = 'platform' | 'tenant' | 'user' | 'environment_override';

export type ImportStrategy = 'overwrite' | 'skip_existing' | 'merge';

export type ExportFormat = 'json' | 'yaml';

export interface SettingChange {
  id: string;
  tenant_id: string;
  key: string;
  old_value: unknown;
  new_value: unknown;
  changed_by: string;
  changed_at: string;
  change_source: ChangeSource;
}

export interface SettingChangeListResponse {
  data: SettingChange[];
  total: number;
  page: number;
  page_size: number;
}

export interface EnvironmentOverride {
  key: string;
  environment: Environment;
  value: unknown;
  overridden_at: string;
  overridden_by: string;
}

export interface EnvironmentOverrideListResponse {
  data: EnvironmentOverride[];
  total: number;
  page: number;
  page_size: number;
}

export interface ExportResult {
  format: ExportFormat;
  data: string;
  exported_at: string;
  category_count: number;
  setting_count: number;
  tenant_id: string;
}

export interface ImportError {
  key: string;
  reason: string;
  value?: unknown;
}

export interface ImportResult {
  imported_count: number;
  skipped_count: number;
  error_count: number;
  errors: ImportError[];
}

export interface ImportSettingsRequest {
  data: string;
  format?: ExportFormat;
  strategy?: ImportStrategy;
}

export interface LockedSetting {
  key: string;
  locked_by: string;
  locked_at: string;
  reason?: string;
  locked_value: unknown;
}

export interface LockedSettingListResponse {
  data: LockedSetting[];
  total: number;
  page: number;
  page_size: number;
}

export interface EffectiveSetting {
  key: string;
  value: unknown;
  source: SettingSource;
  inherited: boolean;
  definition?: SettingDefinition;
}

export interface BulkUpdateItem {
  key: string;
  value: unknown;
}

export interface BulkUpdateError {
  key: string;
  reason: string;
}

export interface BulkUpdateResult {
  updated_count: number;
  skipped_count: number;
  errors: BulkUpdateError[];
}
