"""
User management module for the Shared Platform SDK.

Provides user CRUD operations, profile management, and user queries.
"""

from shared_platform.users.client import UserClient
from shared_platform.users.models import (
    User,
    UserSummary,
    UserProfile,
    UserPreferences,
    UserStatus,
    CreateUserRequest,
    UpdateUserRequest,
    InviteUserRequest,
    UserListResponse,
)

__all__ = [
    "UserClient",
    "User",
    "UserSummary",
    "UserProfile",
    "UserPreferences",
    "UserStatus",
    "CreateUserRequest",
    "UpdateUserRequest",
    "InviteUserRequest",
    "UserListResponse",
]
