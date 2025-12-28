"""Email service models."""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class TemplateCategory(str, Enum):
    """Email template categories."""
    INVITATION = "invitation"
    VERIFICATION = "verification"
    NOTIFICATION = "notification"
    REMINDER = "reminder"
    WELCOME = "welcome"
    PASSWORD_RESET = "password_reset"
    ALERT = "alert"


class EmailTemplate(BaseModel):
    """Email template with variable substitution support."""
    id: str
    tenant_id: Optional[str] = None
    name: str
    slug: str
    subject: str
    html_content: str
    text_content: Optional[str] = None
    variables: list[str] = Field(default_factory=list)
    category: TemplateCategory
    is_system: bool = False
    is_active: bool = True
    created_at: datetime
    updated_at: datetime


class EmailTemplateSummary(BaseModel):
    """Email template summary for list responses."""
    id: str
    name: str
    slug: str
    category: TemplateCategory
    is_system: bool
    is_active: bool
    created_at: datetime


class EmailConfig(BaseModel):
    """SMTP configuration for tenant email sending."""
    id: str
    tenant_id: str
    smtp_host: str
    smtp_port: int = 587
    smtp_user: str
    use_tls: bool = True
    from_name: str
    from_email: str
    reply_to: Optional[str] = None
    is_active: bool = True
    verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class SendEmailRequest(BaseModel):
    """Request to send an email directly."""
    to: list[str]
    cc: Optional[list[str]] = None
    bcc: Optional[list[str]] = None
    subject: str
    html_content: str
    text_content: Optional[str] = None
    from_name: Optional[str] = None
    reply_to: Optional[str] = None


class SendTemplateRequest(BaseModel):
    """Request to send a templated email."""
    template_slug: str
    to: list[str]
    cc: Optional[list[str]] = None
    bcc: Optional[list[str]] = None
    variables: dict[str, str] = Field(default_factory=dict)
    from_name: Optional[str] = None
    reply_to: Optional[str] = None


class EmailSendResult(BaseModel):
    """Result of sending an email."""
    success: bool
    message_id: Optional[str] = None
    recipients_count: int
    error: Optional[str] = None


class CreateTemplateRequest(BaseModel):
    """Request to create an email template."""
    name: str
    slug: str
    subject: str
    html_content: str
    text_content: Optional[str] = None
    variables: list[str] = Field(default_factory=list)
    category: TemplateCategory


class UpdateTemplateRequest(BaseModel):
    """Request to update an email template."""
    name: Optional[str] = None
    subject: Optional[str] = None
    html_content: Optional[str] = None
    text_content: Optional[str] = None
    variables: Optional[list[str]] = None
    is_active: Optional[bool] = None


class UpdateEmailConfigRequest(BaseModel):
    """Request to update email configuration."""
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    use_tls: Optional[bool] = None
    from_name: Optional[str] = None
    from_email: Optional[str] = None
    reply_to: Optional[str] = None
    is_active: Optional[bool] = None


class TemplateListResponse(BaseModel):
    """Response containing a list of templates."""
    data: list[EmailTemplate]
    total: int
    page: int
    page_size: int


class EmailTestResult(BaseModel):
    """Result of testing email configuration."""
    success: bool
    message: Optional[str] = None
    error: Optional[str] = None
