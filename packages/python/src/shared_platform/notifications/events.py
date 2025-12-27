"""
Notification event models for event-driven notifications.

These models correspond to the Avro schemas in events/notifications/
"""

from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class EmailEventType(str, Enum):
    """Type of email event."""

    TRANSACTIONAL = "TRANSACTIONAL"
    MARKETING = "MARKETING"
    SYSTEM = "SYSTEM"
    DIGEST = "DIGEST"


class SMSEventType(str, Enum):
    """Type of SMS event."""

    TRANSACTIONAL = "TRANSACTIONAL"
    OTP = "OTP"
    ALERT = "ALERT"
    MARKETING = "MARKETING"


class PushEventType(str, Enum):
    """Type of push event."""

    ALERT = "ALERT"
    INFO = "INFO"
    ACTION_REQUIRED = "ACTION_REQUIRED"
    SILENT = "SILENT"


class Priority(str, Enum):
    """Notification priority."""

    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    URGENT = "URGENT"


class DeliveryStatus(str, Enum):
    """Delivery status."""

    SENT = "SENT"
    DELIVERED = "DELIVERED"
    FAILED = "FAILED"
    BOUNCED = "BOUNCED"
    REJECTED = "REJECTED"
    DEFERRED = "DEFERRED"
    EXPIRED = "EXPIRED"


class EmailRecipient(BaseModel):
    """Email recipient."""

    user_id: Optional[str] = None
    email: str
    name: Optional[str] = None
    locale: Optional[str] = None


class EmailTemplate(BaseModel):
    """Email template reference."""

    template_id: str
    version: Optional[str] = None
    variables: dict[str, str] = Field(default_factory=dict)


class EmailTracking(BaseModel):
    """Email tracking configuration."""

    enable_open_tracking: bool = True
    enable_click_tracking: bool = True
    campaign_id: Optional[str] = None
    tags: list[str] = Field(default_factory=list)


class EventSource(BaseModel):
    """Event source information."""

    service: str
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None


class EmailNotificationEvent(BaseModel):
    """
    Event to trigger an email notification.

    Publish this event to your message broker to send an email.
    """

    event_id: str
    event_type: EmailEventType = EmailEventType.TRANSACTIONAL
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    tenant_id: str
    recipient: EmailRecipient
    cc: list[EmailRecipient] = Field(default_factory=list)
    bcc: list[EmailRecipient] = Field(default_factory=list)
    template: EmailTemplate
    priority: Priority = Priority.NORMAL
    category: str
    tracking: EmailTracking = Field(default_factory=EmailTracking)
    reply_to: Optional[str] = None
    headers: dict[str, str] = Field(default_factory=dict)
    metadata: dict[str, str] = Field(default_factory=dict)
    correlation_id: Optional[str] = None
    source: EventSource

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for serialization."""
        return self.model_dump(mode="json")


class SMSRecipient(BaseModel):
    """SMS recipient."""

    user_id: Optional[str] = None
    phone_number: str
    name: Optional[str] = None
    country_code: Optional[str] = None


class SMSTemplate(BaseModel):
    """SMS template reference."""

    template_id: str
    version: Optional[str] = None
    variables: dict[str, str] = Field(default_factory=dict)


class SMSNotificationEvent(BaseModel):
    """
    Event to trigger an SMS notification.
    """

    event_id: str
    event_type: SMSEventType = SMSEventType.TRANSACTIONAL
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    tenant_id: str
    recipient: SMSRecipient
    template: Optional[SMSTemplate] = None
    message: Optional[str] = None  # Direct message if not using template
    priority: Priority = Priority.NORMAL
    category: str
    sender_id: Optional[str] = None
    validity_period: Optional[int] = None
    metadata: dict[str, str] = Field(default_factory=dict)
    correlation_id: Optional[str] = None
    source: EventSource

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for serialization."""
        return self.model_dump(mode="json")


class PushNotification(BaseModel):
    """Push notification content."""

    title: str
    body: str
    image_url: Optional[str] = None
    icon: Optional[str] = None
    badge: Optional[int] = None
    sound: Optional[str] = None
    click_action: Optional[str] = None
    tag: Optional[str] = None


class DeviceToken(BaseModel):
    """Device token for push notifications."""

    token: str
    platform: str  # IOS, ANDROID, WEB, HUAWEI
    app_id: Optional[str] = None


class PushTarget(BaseModel):
    """Push notification target."""

    user_id: Optional[str] = None
    device_tokens: list[DeviceToken] = Field(default_factory=list)
    topic: Optional[str] = None
    condition: Optional[str] = None


class PushNotificationEvent(BaseModel):
    """
    Event to trigger a push notification.
    """

    event_id: str
    event_type: PushEventType = PushEventType.ALERT
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    tenant_id: str
    target: PushTarget
    notification: PushNotification
    data: dict[str, str] = Field(default_factory=dict)
    priority: str = "HIGH"
    category: str
    ttl: Optional[int] = None
    collapse_key: Optional[str] = None
    metadata: dict[str, str] = Field(default_factory=dict)
    correlation_id: Optional[str] = None
    source: EventSource

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for serialization."""
        return self.model_dump(mode="json")


class ProviderInfo(BaseModel):
    """Delivery provider information."""

    name: str
    message_id: Optional[str] = None
    response_code: Optional[str] = None
    response_message: Optional[str] = None


class DeliveryTiming(BaseModel):
    """Delivery timing information."""

    queued_at: datetime
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    processing_time_ms: int


class NotificationSentEvent(BaseModel):
    """
    Event emitted when a notification has been sent.

    Subscribe to this event to track delivery status.
    """

    event_id: str
    timestamp: datetime
    original_event_id: str
    notification_type: str  # EMAIL, SMS, PUSH, IN_APP
    tenant_id: str
    recipient: dict[str, Any]
    status: DeliveryStatus
    status_details: Optional[str] = None
    provider: ProviderInfo
    timing: DeliveryTiming
    template_id: Optional[str] = None
    category: str
    metadata: dict[str, str] = Field(default_factory=dict)
    correlation_id: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for serialization."""
        return self.model_dump(mode="json")
