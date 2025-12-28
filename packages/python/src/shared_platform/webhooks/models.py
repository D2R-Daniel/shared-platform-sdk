"""Webhooks service models."""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field


class WebhookEvent(str, Enum):
    """Available webhook event types."""
    # User events
    USER_CREATED = "user.created"
    USER_UPDATED = "user.updated"
    USER_DELETED = "user.deleted"
    USER_ACTIVATED = "user.activated"
    USER_DEACTIVATED = "user.deactivated"
    # Team events
    TEAM_CREATED = "team.created"
    TEAM_UPDATED = "team.updated"
    TEAM_DELETED = "team.deleted"
    TEAM_MEMBER_ADDED = "team.member_added"
    TEAM_MEMBER_REMOVED = "team.member_removed"
    TEAM_MEMBER_ROLE_CHANGED = "team.member_role_changed"
    # Invitation events
    INVITATION_CREATED = "invitation.created"
    INVITATION_SENT = "invitation.sent"
    INVITATION_ACCEPTED = "invitation.accepted"
    INVITATION_EXPIRED = "invitation.expired"
    INVITATION_REVOKED = "invitation.revoked"
    # Role events
    ROLE_CREATED = "role.created"
    ROLE_UPDATED = "role.updated"
    ROLE_DELETED = "role.deleted"
    ROLE_ASSIGNED = "role.assigned"
    ROLE_REMOVED = "role.removed"
    # Session events
    SESSION_CREATED = "session.created"
    SESSION_EXPIRED = "session.expired"
    # Settings events
    SETTINGS_UPDATED = "settings.updated"


class DeliveryStatus(str, Enum):
    """Webhook delivery status."""
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    RETRYING = "retrying"


class Webhook(BaseModel):
    """Webhook configuration."""
    id: str
    tenant_id: str
    name: str
    description: Optional[str] = None
    url: str
    secret: str
    events: list[WebhookEvent]
    headers: Optional[dict[str, str]] = None
    is_active: bool = True
    retry_count: int = 3
    timeout_seconds: int = 30
    created_at: datetime
    updated_at: datetime


class WebhookSummary(BaseModel):
    """Webhook summary for list responses."""
    id: str
    name: str
    url: str
    events: list[WebhookEvent]
    is_active: bool
    created_at: datetime


class WebhookDelivery(BaseModel):
    """Record of a webhook delivery attempt."""
    id: str
    webhook_id: str
    event: WebhookEvent
    payload: dict[str, Any]
    request_headers: Optional[dict[str, str]] = None
    response_status: Optional[int] = None
    response_headers: Optional[dict[str, str]] = None
    response_body: Optional[str] = None
    duration_ms: Optional[int] = None
    attempts: int = 1
    status: DeliveryStatus
    error_message: Optional[str] = None
    next_retry_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    created_at: datetime


class CreateWebhookRequest(BaseModel):
    """Request to create a webhook."""
    name: str
    description: Optional[str] = None
    url: str
    events: list[WebhookEvent]
    headers: Optional[dict[str, str]] = None
    retry_count: int = 3
    timeout_seconds: int = 30


class UpdateWebhookRequest(BaseModel):
    """Request to update a webhook."""
    name: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    events: Optional[list[WebhookEvent]] = None
    headers: Optional[dict[str, str]] = None
    is_active: Optional[bool] = None
    retry_count: Optional[int] = None
    timeout_seconds: Optional[int] = None


class WebhookTestResult(BaseModel):
    """Result of testing a webhook."""
    success: bool
    status_code: Optional[int] = None
    duration_ms: Optional[int] = None
    error: Optional[str] = None


class WebhookListResponse(BaseModel):
    """Response containing a list of webhooks."""
    data: list[Webhook]
    total: int
    page: int
    page_size: int


class DeliveryListResponse(BaseModel):
    """Response containing a list of deliveries."""
    data: list[WebhookDelivery]
    total: int
    page: int
    page_size: int


class WebhookPayload(BaseModel):
    """Standard webhook payload format."""
    id: str
    event: WebhookEvent
    timestamp: datetime
    tenant_id: str
    data: dict[str, Any]


class EventInfo(BaseModel):
    """Information about a webhook event."""
    name: WebhookEvent
    description: str
    category: str
