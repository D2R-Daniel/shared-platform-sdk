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
