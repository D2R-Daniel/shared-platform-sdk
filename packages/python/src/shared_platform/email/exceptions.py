"""Email service exceptions."""


class EmailError(Exception):
    """Base exception for email operations."""
    pass


class EmailSendError(EmailError):
    """Raised when email sending fails."""
    def __init__(self, message: str, recipients: list[str] | None = None):
        self.recipients = recipients or []
        super().__init__(message)


class TemplateNotFoundError(EmailError):
    """Raised when an email template is not found."""
    def __init__(self, identifier: str):
        self.identifier = identifier
        super().__init__(f"Email template not found: {identifier}")


class TemplateSlugExistsError(EmailError):
    """Raised when attempting to create a template with an existing slug."""
    def __init__(self, slug: str):
        self.slug = slug
        super().__init__(f"Email template with slug already exists: {slug}")


class EmailConfigError(EmailError):
    """Raised when email configuration is invalid or missing."""
    def __init__(self, message: str = "Email configuration error"):
        super().__init__(message)


class SMTPConnectionError(EmailError):
    """Raised when SMTP connection fails."""
    def __init__(self, host: str, port: int, message: str | None = None):
        self.host = host
        self.port = port
        error_msg = f"Failed to connect to SMTP server {host}:{port}"
        if message:
            error_msg += f": {message}"
        super().__init__(error_msg)
