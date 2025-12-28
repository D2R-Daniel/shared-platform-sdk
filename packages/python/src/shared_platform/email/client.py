"""HTTP client for email operations."""
from __future__ import annotations

from typing import Optional
import httpx
from .models import (
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
    TemplateCategory,
)
from .exceptions import (
    TemplateNotFoundError,
    TemplateSlugExistsError,
    EmailConfigError,
    EmailSendError,
)


class EmailClient:
    """Client for email operations."""

    def __init__(
        self,
        base_url: str,
        access_token: Optional[str] = None,
        timeout: float = 30.0,
    ):
        self.base_url = base_url.rstrip("/")
        self._access_token = access_token
        self._timeout = timeout
        self._client: Optional[httpx.Client] = None

    def _get_client(self) -> httpx.Client:
        if self._client is None:
            headers = {"Content-Type": "application/json"}
            if self._access_token:
                headers["Authorization"] = f"Bearer {self._access_token}"
            self._client = httpx.Client(
                base_url=self.base_url,
                timeout=self._timeout,
                headers=headers,
            )
        return self._client

    def set_access_token(self, token: str) -> None:
        """Update the access token."""
        self._access_token = token
        if self._client:
            self._client.headers["Authorization"] = f"Bearer {token}"

    def close(self) -> None:
        """Close the HTTP client."""
        if self._client:
            self._client.close()
            self._client = None

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()

    # Email Sending Operations

    def send(self, request: SendEmailRequest) -> EmailSendResult:
        """Send an email directly."""
        response = self._get_client().post(
            "/email/send",
            json=request.model_dump(exclude_none=True),
        )
        if response.status_code == 503:
            raise EmailConfigError("Email service unavailable")
        response.raise_for_status()
        return EmailSendResult(**response.json())

    def send_template(self, request: SendTemplateRequest) -> EmailSendResult:
        """Send an email using a template."""
        response = self._get_client().post(
            "/email/send-template",
            json=request.model_dump(exclude_none=True),
        )
        if response.status_code == 404:
            raise TemplateNotFoundError(request.template_slug)
        if response.status_code == 503:
            raise EmailConfigError("Email service unavailable")
        response.raise_for_status()
        return EmailSendResult(**response.json())

    # Template Operations

    def list_templates(
        self,
        page: int = 1,
        page_size: int = 20,
        category: Optional[TemplateCategory] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
    ) -> TemplateListResponse:
        """List email templates."""
        params = {
            "page": page,
            "page_size": page_size,
        }
        if category:
            params["category"] = category.value
        if is_active is not None:
            params["is_active"] = is_active
        if search:
            params["search"] = search

        response = self._get_client().get("/email/templates", params=params)
        response.raise_for_status()
        return TemplateListResponse(**response.json())

    def get_template(self, template_id: str) -> EmailTemplate:
        """Get an email template by ID."""
        response = self._get_client().get(f"/email/templates/{template_id}")
        if response.status_code == 404:
            raise TemplateNotFoundError(template_id)
        response.raise_for_status()
        return EmailTemplate(**response.json())

    def get_template_by_slug(self, slug: str) -> EmailTemplate:
        """Get an email template by slug."""
        response = self._get_client().get(f"/email/templates/slug/{slug}")
        if response.status_code == 404:
            raise TemplateNotFoundError(slug)
        response.raise_for_status()
        return EmailTemplate(**response.json())

    def create_template(self, request: CreateTemplateRequest) -> EmailTemplate:
        """Create a new email template."""
        response = self._get_client().post(
            "/email/templates",
            json=request.model_dump(exclude_none=True),
        )
        if response.status_code == 409:
            raise TemplateSlugExistsError(request.slug)
        response.raise_for_status()
        return EmailTemplate(**response.json())

    def update_template(
        self,
        template_id: str,
        request: UpdateTemplateRequest,
    ) -> EmailTemplate:
        """Update an email template."""
        response = self._get_client().put(
            f"/email/templates/{template_id}",
            json=request.model_dump(exclude_none=True),
        )
        if response.status_code == 404:
            raise TemplateNotFoundError(template_id)
        response.raise_for_status()
        return EmailTemplate(**response.json())

    def delete_template(self, template_id: str) -> None:
        """Delete an email template."""
        response = self._get_client().delete(f"/email/templates/{template_id}")
        if response.status_code == 404:
            raise TemplateNotFoundError(template_id)
        response.raise_for_status()

    # Configuration Operations

    def get_config(self) -> EmailConfig:
        """Get email configuration."""
        response = self._get_client().get("/email/config")
        if response.status_code == 404:
            raise EmailConfigError("No email configuration found")
        response.raise_for_status()
        return EmailConfig(**response.json())

    def update_config(self, request: UpdateEmailConfigRequest) -> EmailConfig:
        """Update email configuration."""
        response = self._get_client().put(
            "/email/config",
            json=request.model_dump(exclude_none=True),
        )
        response.raise_for_status()
        return EmailConfig(**response.json())

    def test_config(self, recipient: Optional[str] = None) -> EmailTestResult:
        """Test email configuration."""
        body = {}
        if recipient:
            body["recipient"] = recipient
        response = self._get_client().post("/email/config/test", json=body)
        response.raise_for_status()
        return EmailTestResult(**response.json())
