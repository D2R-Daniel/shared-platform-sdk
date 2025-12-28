/**
 * Email service types.
 */

export type TemplateCategory =
  | 'invitation'
  | 'verification'
  | 'notification'
  | 'reminder'
  | 'welcome'
  | 'password_reset'
  | 'alert';

export interface EmailTemplate {
  id: string;
  tenant_id?: string;
  name: string;
  slug: string;
  subject: string;
  html_content: string;
  text_content?: string;
  variables: string[];
  category: TemplateCategory;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplateSummary {
  id: string;
  name: string;
  slug: string;
  category: TemplateCategory;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
}

export interface EmailConfig {
  id: string;
  tenant_id: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  use_tls: boolean;
  from_name: string;
  from_email: string;
  reply_to?: string;
  is_active: boolean;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SendEmailRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html_content: string;
  text_content?: string;
  from_name?: string;
  reply_to?: string;
}

export interface SendTemplateRequest {
  template_slug: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  variables: Record<string, string>;
  from_name?: string;
  reply_to?: string;
}

export interface EmailSendResult {
  success: boolean;
  message_id?: string;
  recipients_count: number;
  error?: string;
}

export interface CreateTemplateRequest {
  name: string;
  slug: string;
  subject: string;
  html_content: string;
  text_content?: string;
  variables?: string[];
  category: TemplateCategory;
}

export interface UpdateTemplateRequest {
  name?: string;
  subject?: string;
  html_content?: string;
  text_content?: string;
  variables?: string[];
  is_active?: boolean;
}

export interface UpdateEmailConfigRequest {
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_password?: string;
  use_tls?: boolean;
  from_name?: string;
  from_email?: string;
  reply_to?: string;
  is_active?: boolean;
}

export interface TemplateListResponse {
  data: EmailTemplate[];
  total: number;
  page: number;
  page_size: number;
}

export interface EmailTestResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ListTemplatesParams {
  page?: number;
  page_size?: number;
  category?: TemplateCategory;
  is_active?: boolean;
  search?: string;
}
