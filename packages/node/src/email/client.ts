/**
 * HTTP client for email operations.
 */

import {
  EmailTemplate,
  EmailConfig,
  SendEmailRequest,
  SendTemplateRequest,
  EmailSendResult,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  UpdateEmailConfigRequest,
  TemplateListResponse,
  EmailTestResult,
  ListTemplatesParams,
  TemplatePreview,
  TemplateVersion,
  TemplateVersionListResponse,
  TemplateLocale,
  TemplateLocaleListResponse,
  SetTemplateLocaleRequest,
  EmailProvider,
  EmailProviderListResponse,
  ConfigureProviderRequest,
  BatchSendRequest,
  BatchSendResult,
  EmailSendDetails,
  SendHistoryListResponse,
  ListSendHistoryParams,
} from './types';
import {
  TemplateNotFoundError,
  TemplateSlugExistsError,
  EmailConfigError,
  VersionNotFoundError,
  LocaleNotFoundError,
  ProviderConfigError,
  BatchTooLargeError,
} from './errors';

export interface EmailClientOptions {
  baseUrl: string;
  accessToken?: string;
  timeout?: number;
}

export class EmailClient {
  private baseUrl: string;
  private accessToken?: string;
  private timeout: number;

  constructor(options: EmailClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.accessToken = options.accessToken;
    this.timeout = options.timeout ?? 30000;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, unknown>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const status = response.status;
        let data: Record<string, unknown> = {};
        try {
          data = (await response.json()) as Record<string, unknown>;
        } catch {
          // ignore
        }
        if (status === 404) {
          throw new TemplateNotFoundError('unknown');
        }
        if (status === 409) {
          throw new TemplateSlugExistsError('unknown');
        }
        if (status === 413) {
          const recipientCount = (data.recipient_count as number) || 0;
          const maxRecipients = (data.max_recipients as number) || 0;
          throw new BatchTooLargeError(recipientCount, maxRecipients);
        }
        if (status === 422) {
          const providerType = (data.provider_type as string) || 'unknown';
          const message = (data.message as string) || undefined;
          throw new ProviderConfigError(providerType, message);
        }
        if (status === 503) {
          throw new EmailConfigError('Email service unavailable');
        }
        throw new Error(`HTTP ${status}: ${response.statusText}`);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Email Sending Operations

  async send(request: SendEmailRequest): Promise<EmailSendResult> {
    return this.request('POST', '/email/send', request);
  }

  async sendTemplate(request: SendTemplateRequest): Promise<EmailSendResult> {
    try {
      return await this.request('POST', '/email/send-template', request);
    } catch (error) {
      if (error instanceof TemplateNotFoundError) {
        throw new TemplateNotFoundError(request.template_slug);
      }
      throw error;
    }
  }

  // Template Operations

  async listTemplates(params?: ListTemplatesParams): Promise<TemplateListResponse> {
    return this.request('GET', '/email/templates', undefined, params as Record<string, unknown>);
  }

  async getTemplate(templateId: string): Promise<EmailTemplate> {
    try {
      return await this.request('GET', `/email/templates/${templateId}`);
    } catch (error) {
      if (error instanceof TemplateNotFoundError) {
        throw new TemplateNotFoundError(templateId);
      }
      throw error;
    }
  }

  async getTemplateBySlug(slug: string): Promise<EmailTemplate> {
    try {
      return await this.request('GET', `/email/templates/slug/${slug}`);
    } catch (error) {
      if (error instanceof TemplateNotFoundError) {
        throw new TemplateNotFoundError(slug);
      }
      throw error;
    }
  }

  async createTemplate(request: CreateTemplateRequest): Promise<EmailTemplate> {
    try {
      return await this.request('POST', '/email/templates', request);
    } catch (error) {
      if (error instanceof TemplateSlugExistsError) {
        throw new TemplateSlugExistsError(request.slug);
      }
      throw error;
    }
  }

  async updateTemplate(
    templateId: string,
    request: UpdateTemplateRequest
  ): Promise<EmailTemplate> {
    try {
      return await this.request('PUT', `/email/templates/${templateId}`, request);
    } catch (error) {
      if (error instanceof TemplateNotFoundError) {
        throw new TemplateNotFoundError(templateId);
      }
      throw error;
    }
  }

  async deleteTemplate(templateId: string): Promise<void> {
    try {
      await this.request('DELETE', `/email/templates/${templateId}`);
    } catch (error) {
      if (error instanceof TemplateNotFoundError) {
        throw new TemplateNotFoundError(templateId);
      }
      throw error;
    }
  }

  // Configuration Operations

  async getConfig(): Promise<EmailConfig> {
    try {
      return await this.request('GET', '/email/config');
    } catch (error) {
      if (error instanceof TemplateNotFoundError) {
        throw new EmailConfigError('No email configuration found');
      }
      throw error;
    }
  }

  async updateConfig(request: UpdateEmailConfigRequest): Promise<EmailConfig> {
    return this.request('PUT', '/email/config', request);
  }

  async testConfig(recipient?: string): Promise<EmailTestResult> {
    const body = recipient ? { recipient } : {};
    return this.request('POST', '/email/config/test', body);
  }

  // Template Preview Operations

  async previewTemplate(
    templateId: string,
    variables: Record<string, string>,
    locale?: string
  ): Promise<TemplatePreview> {
    try {
      return await this.request('POST', `/email/templates/${templateId}/preview`, {
        variables,
        locale,
      });
    } catch (error) {
      if (error instanceof TemplateNotFoundError) {
        throw new TemplateNotFoundError(templateId);
      }
      throw error;
    }
  }

  async previewTemplateBySlug(
    slug: string,
    variables: Record<string, string>,
    locale?: string
  ): Promise<TemplatePreview> {
    try {
      return await this.request('POST', `/email/templates/slug/${slug}/preview`, {
        variables,
        locale,
      });
    } catch (error) {
      if (error instanceof TemplateNotFoundError) {
        throw new TemplateNotFoundError(slug);
      }
      throw error;
    }
  }

  // Template Versioning Operations

  async listTemplateVersions(templateId: string): Promise<TemplateVersionListResponse> {
    try {
      return await this.request('GET', `/email/templates/${templateId}/versions`);
    } catch (error) {
      if (error instanceof TemplateNotFoundError) {
        throw new TemplateNotFoundError(templateId);
      }
      throw error;
    }
  }

  async getTemplateVersion(
    templateId: string,
    version: number
  ): Promise<TemplateVersion> {
    try {
      return await this.request(
        'GET',
        `/email/templates/${templateId}/versions/${version}`
      );
    } catch (error) {
      if (error instanceof TemplateNotFoundError) {
        throw new VersionNotFoundError(templateId, version);
      }
      throw error;
    }
  }

  async revertToVersion(
    templateId: string,
    version: number
  ): Promise<EmailTemplate> {
    try {
      return await this.request(
        'POST',
        `/email/templates/${templateId}/versions/${version}/revert`
      );
    } catch (error) {
      if (error instanceof TemplateNotFoundError) {
        throw new VersionNotFoundError(templateId, version);
      }
      throw error;
    }
  }

  // Locale/i18n Operations

  async setTemplateLocale(
    templateId: string,
    locale: string,
    content: SetTemplateLocaleRequest
  ): Promise<TemplateLocale> {
    try {
      return await this.request(
        'PUT',
        `/email/templates/${templateId}/locales/${locale}`,
        content
      );
    } catch (error) {
      if (error instanceof TemplateNotFoundError) {
        throw new TemplateNotFoundError(templateId);
      }
      throw error;
    }
  }

  async getTemplateLocale(
    templateId: string,
    locale: string
  ): Promise<TemplateLocale> {
    try {
      return await this.request(
        'GET',
        `/email/templates/${templateId}/locales/${locale}`
      );
    } catch (error) {
      if (error instanceof TemplateNotFoundError) {
        throw new LocaleNotFoundError(templateId, locale);
      }
      throw error;
    }
  }

  async listTemplateLocales(
    templateId: string
  ): Promise<TemplateLocaleListResponse> {
    try {
      return await this.request('GET', `/email/templates/${templateId}/locales`);
    } catch (error) {
      if (error instanceof TemplateNotFoundError) {
        throw new TemplateNotFoundError(templateId);
      }
      throw error;
    }
  }

  async deleteTemplateLocale(
    templateId: string,
    locale: string
  ): Promise<void> {
    try {
      await this.request(
        'DELETE',
        `/email/templates/${templateId}/locales/${locale}`
      );
    } catch (error) {
      if (error instanceof TemplateNotFoundError) {
        throw new LocaleNotFoundError(templateId, locale);
      }
      throw error;
    }
  }

  // Provider Operations

  async listProviders(): Promise<EmailProviderListResponse> {
    return this.request('GET', '/email/providers');
  }

  async configureProvider(
    config: ConfigureProviderRequest
  ): Promise<EmailProvider> {
    return this.request('POST', '/email/providers', config);
  }

  // Batch Send Operations

  async sendBatch(request: BatchSendRequest): Promise<BatchSendResult> {
    return this.request('POST', '/email/send-batch', request);
  }

  // Send History Operations

  async listSendHistory(
    params?: ListSendHistoryParams
  ): Promise<SendHistoryListResponse> {
    return this.request(
      'GET',
      '/email/history',
      undefined,
      params as Record<string, unknown>
    );
  }

  async getSendDetails(messageId: string): Promise<EmailSendDetails> {
    return this.request('GET', `/email/history/${messageId}`);
  }
}
