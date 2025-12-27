"""
Authentication module for the Shared Platform SDK.

Provides OAuth2/OIDC authentication, token management, and user context.
"""

from shared_platform.auth.client import AuthClient
from shared_platform.auth.models import (
    TokenResponse,
    TokenIntrospection,
    UserInfo,
    UserContext,
    Session,
)
from shared_platform.auth.roles import Role, Permission, ROLES, PERMISSIONS
from shared_platform.auth.exceptions import (
    AuthError,
    TokenExpiredError,
    InvalidTokenError,
    UnauthorizedError,
)

__all__ = [
    "AuthClient",
    "TokenResponse",
    "TokenIntrospection",
    "UserInfo",
    "UserContext",
    "Session",
    "Role",
    "Permission",
    "ROLES",
    "PERMISSIONS",
    "AuthError",
    "TokenExpiredError",
    "InvalidTokenError",
    "UnauthorizedError",
]
