"""
Notification module for the Shared Platform SDK.

Provides notification management, preferences, and event publishing.
"""

from shared_platform.notifications.client import NotificationClient
from shared_platform.notifications.models import (
    Notification,
    NotificationPreferences,
    NotificationCategory,
    ChannelSubscription,
    RegisteredDevice,
)
from shared_platform.notifications.events import (
    EmailNotificationEvent,
    SMSNotificationEvent,
    PushNotificationEvent,
    NotificationSentEvent,
)

__all__ = [
    "NotificationClient",
    "Notification",
    "NotificationPreferences",
    "NotificationCategory",
    "ChannelSubscription",
    "RegisteredDevice",
    "EmailNotificationEvent",
    "SMSNotificationEvent",
    "PushNotificationEvent",
    "NotificationSentEvent",
]
