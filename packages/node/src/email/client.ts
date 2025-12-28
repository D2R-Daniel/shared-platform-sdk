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
} from './types';
import {
  TemplateNotFoundError,
  TemplateSlugExistsError,
  EmailConfigError,
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
        if (status === 404) {
          throw new TemplateNotFoundError('unknown');
        }
        if (status === 409) {
          throw new TemplateSlugExistsError('unknown');
        }
        if (status === 503) {
          throw new EmailConfigError('Email service unavailable');
        }
        throw new Error(`HTTP ${status}: ${response.statusText}`);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return response.json();
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
}
