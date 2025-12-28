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
