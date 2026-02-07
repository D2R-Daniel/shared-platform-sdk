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

export type ProviderType = 'smtp' | 'sendgrid' | 'ses' | 'resend' | 'postmark';

export type EmailSendStatus = 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed';

export type DeliveryEventType = 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained';

export interface TemplateVersion {
  version: number;
  template_id: string;
  html_content: string;
  text_content?: string;
  subject: string;
  variables: string[];
  change_notes?: string;
  created_at: string;
  created_by: string;
}

export interface TemplateVersionListResponse {
  data: TemplateVersion[];
  total: number;
  page: number;
  page_size: number;
}

export interface TemplateLocale {
  template_id: string;
  locale: string;
  subject: string;
  html_content: string;
  text_content?: string;
  variables: string[];
}

export interface TemplateLocaleListResponse {
  data: TemplateLocale[];
  total: number;
}

export interface TemplatePreview {
  subject: string;
  html_content: string;
  text_content?: string;
}

export interface SetTemplateLocaleRequest {
  subject: string;
  html_content: string;
  text_content?: string;
  variables?: string[];
}

export interface Attachment {
  filename: string;
  content_type: string;
  content: string;
  size_bytes: number;
}

export interface BatchRecipient {
  to: string;
  variables: Record<string, string>;
  locale?: string;
  metadata?: Record<string, unknown>;
}

export interface BatchSendRequest {
  template_slug: string;
  recipients: BatchRecipient[];
  locale?: string;
}

export interface BatchSendFailure {
  to: string;
  error: string;
}

export interface BatchSendResult {
  batch_id: string;
  total: number;
  sent_count: number;
  failed_count: number;
  failures: BatchSendFailure[];
}

export interface EmailSendRecord {
  message_id: string;
  template_id?: string;
  template_slug?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  status: EmailSendStatus;
  provider?: string;
  sent_at?: string;
  delivered_at?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface SendHistoryListResponse {
  data: EmailSendRecord[];
  total: number;
  page: number;
  page_size: number;
}

export interface ListSendHistoryParams {
  page?: number;
  page_size?: number;
  status?: EmailSendStatus;
  template_slug?: string;
  to?: string;
  from_date?: string;
  to_date?: string;
}

export interface EmailDeliveryEvent {
  message_id: string;
  event_type: DeliveryEventType;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface EmailSendDetails {
  record: EmailSendRecord;
  events: EmailDeliveryEvent[];
}

export interface EmailProvider {
  type: ProviderType;
  config: Record<string, unknown>;
  is_active: boolean;
  verified_at?: string;
}

export interface ConfigureProviderRequest {
  type: ProviderType;
  config: Record<string, unknown>;
  is_active?: boolean;
}

export interface EmailProviderListResponse {
  data: EmailProvider[];
  total: number;
}
