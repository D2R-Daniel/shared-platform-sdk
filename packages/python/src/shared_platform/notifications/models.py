"""
Notification data models.
"""

from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field


class Notification(BaseModel):
    """Notification model."""

    id: str
    type: str  # email, sms, push, in_app
    category: str
    title: str
    body: Optional[str] = None
    data: dict[str, Any] = Field(default_factory=dict)
    action_url: Optional[str] = None
    image_url: Optional[str] = None
    read: bool = False
    read_at: Optional[datetime] = None
    created_at: datetime


class Pagination(BaseModel):
    """Pagination info."""

    page: int
    page_size: int
    total_items: int
    total_pages: int
    has_next: bool = False
    has_previous: bool = False


class NotificationListResponse(BaseModel):
    """Paginated notification list."""

    data: list[Notification]
    pagination: Pagination


class NotificationPreferences(BaseModel):
    """Notification preferences."""

    email_enabled: bool = True
    sms_enabled: bool = False
    push_enabled: bool = True
    in_app_enabled: bool = True
    digest_frequency: str = "realtime"
    digest_time: Optional[str] = None
    quiet_hours: Optional[dict] = None
    categories: dict[str, dict[str, bool]] = Field(default_factory=dict)


class NotificationCategory(BaseModel):
    """Notification category."""

    id: str
    name: str
    description: Optional[str] = None
    default_channels: list[str] = Field(default_factory=list)
    required: bool = False
    configurable: bool = True


class ChannelSubscription(BaseModel):
    """Channel subscription."""

    id: str
    channel: str
    topic: str
    subscribed_at: datetime


class RegisteredDevice(BaseModel):
    """Registered device for push notifications."""

    id: str
    platform: str  # ios, android, web
    name: Optional[str] = None
    model: Optional[str] = None
    last_active_at: Optional[datetime] = None
    registered_at: datetime
