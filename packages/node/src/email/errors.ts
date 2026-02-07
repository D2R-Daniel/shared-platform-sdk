/**
 * Email service errors.
 */

export class EmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailError';
  }
}

export class EmailSendError extends EmailError {
  public readonly recipients: string[];

  constructor(message: string, recipients: string[] = []) {
    super(message);
    this.name = 'EmailSendError';
    this.recipients = recipients;
  }
}

export class TemplateNotFoundError extends EmailError {
  public readonly identifier: string;

  constructor(identifier: string) {
    super(`Email template not found: ${identifier}`);
    this.name = 'TemplateNotFoundError';
    this.identifier = identifier;
  }
}

export class TemplateSlugExistsError extends EmailError {
  public readonly slug: string;

  constructor(slug: string) {
    super(`Email template with slug already exists: ${slug}`);
    this.name = 'TemplateSlugExistsError';
    this.slug = slug;
  }
}

export class EmailConfigError extends EmailError {
  constructor(message: string = 'Email configuration error') {
    super(message);
    this.name = 'EmailConfigError';
  }
}

export class SMTPConnectionError extends EmailError {
  public readonly host: string;
  public readonly port: number;

  constructor(host: string, port: number, message?: string) {
    const errorMsg = message
      ? `Failed to connect to SMTP server ${host}:${port}: ${message}`
      : `Failed to connect to SMTP server ${host}:${port}`;
    super(errorMsg);
    this.name = 'SMTPConnectionError';
    this.host = host;
    this.port = port;
  }
}

export class LocaleNotFoundError extends EmailError {
  public readonly templateId: string;
  public readonly locale: string;

  constructor(templateId: string, locale: string) {
    super(`Locale '${locale}' not found for template '${templateId}'`);
    this.name = 'LocaleNotFoundError';
    this.templateId = templateId;
    this.locale = locale;
  }
}

export class VersionNotFoundError extends EmailError {
  public readonly templateId: string;
  public readonly version: number;

  constructor(templateId: string, version: number) {
    super(`Version ${version} not found for template '${templateId}'`);
    this.name = 'VersionNotFoundError';
    this.templateId = templateId;
    this.version = version;
  }
}

export class AttachmentTooLargeError extends EmailError {
  public readonly filename: string;
  public readonly sizeBytes: number;
  public readonly maxBytes: number;

  constructor(filename: string, sizeBytes: number, maxBytes: number) {
    super(
      `Attachment '${filename}' is ${sizeBytes} bytes, exceeding limit of ${maxBytes} bytes`
    );
    this.name = 'AttachmentTooLargeError';
    this.filename = filename;
    this.sizeBytes = sizeBytes;
    this.maxBytes = maxBytes;
  }
}

export class BatchTooLargeError extends EmailError {
  public readonly recipientCount: number;
  public readonly maxRecipients: number;

  constructor(recipientCount: number, maxRecipients: number) {
    super(
      `Batch contains ${recipientCount} recipients, exceeding limit of ${maxRecipients}`
    );
    this.name = 'BatchTooLargeError';
    this.recipientCount = recipientCount;
    this.maxRecipients = maxRecipients;
  }
}

export class ProviderConfigError extends EmailError {
  public readonly providerType: string;

  constructor(providerType: string, message?: string) {
    const msg = message
      ? `Provider '${providerType}' configuration error: ${message}`
      : `Provider '${providerType}' configuration error`;
    super(msg);
    this.name = 'ProviderConfigError';
    this.providerType = providerType;
  }
}

export class ProviderUnavailableError extends EmailError {
  public readonly providerType: string;

  constructor(providerType: string) {
    super(`Email provider '${providerType}' is unavailable`);
    this.name = 'ProviderUnavailableError';
    this.providerType = providerType;
  }
}
