"""
Shared Platform SDK

A unified SDK for authentication, user management, and notifications
across all platform services.

Usage:
    from shared_platform import AuthClient, UserClient, NotificationClient
    from shared_platform.models import User, UserContext
    from shared_platform.events import EmailNotificationEvent
"""

from shared_platform.auth import AuthClient
from shared_platform.users import UserClient
from shared_platform.notifications import NotificationClient

__version__ = "0.1.0"
__all__ = [
    "AuthClient",
    "UserClient",
    "NotificationClient",
    "__version__",
]
