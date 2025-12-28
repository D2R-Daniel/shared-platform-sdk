"""Email service module for shared platform SDK."""
from .models import (
    EmailTemplate,
    EmailTemplateSummary,
    EmailConfig,
    SendEmailRequest,
    SendTemplateRequest,
    EmailSendResult,
    CreateTemplateRequest,
    UpdateTemplateRequest,
    UpdateEmailConfigRequest,
    TemplateListResponse,
    TemplateCategory,
)
from .client import EmailClient
from .exceptions import (
    EmailError,
    EmailSendError,
    TemplateNotFoundError,
    TemplateSlugExistsError,
    EmailConfigError,
    SMTPConnectionError,
)

__all__ = [
    # Models
    "EmailTemplate",
    "EmailTemplateSummary",
    "EmailConfig",
    "SendEmailRequest",
    "SendTemplateRequest",
    "EmailSendResult",
    "CreateTemplateRequest",
    "UpdateTemplateRequest",
    "UpdateEmailConfigRequest",
    "TemplateListResponse",
    "TemplateCategory",
    # Client
    "EmailClient",
    # Exceptions
    "EmailError",
    "EmailSendError",
    "TemplateNotFoundError",
    "TemplateSlugExistsError",
    "EmailConfigError",
    "SMTPConnectionError",
]
