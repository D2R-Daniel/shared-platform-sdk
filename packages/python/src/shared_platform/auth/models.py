"""
Authentication data models.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class TokenResponse(BaseModel):
    """OAuth2 token response."""

    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="Bearer", description="Token type")
    expires_in: int = Field(..., description="Token lifetime in seconds")
    refresh_token: Optional[str] = Field(None, description="Refresh token")
    scope: Optional[str] = Field(None, description="Granted scopes")
    id_token: Optional[str] = Field(None, description="OIDC ID token")


class TokenIntrospection(BaseModel):
    """Token introspection response."""

    active: bool = Field(..., description="Whether token is valid")
    scope: Optional[str] = None
    client_id: Optional[str] = None
    username: Optional[str] = None
    token_type: Optional[str] = None
    exp: Optional[int] = Field(None, description="Expiration timestamp")
    iat: Optional[int] = Field(None, description="Issued at timestamp")
    sub: Optional[str] = Field(None, description="Subject (user ID)")
    aud: Optional[str] = Field(None, description="Audience")
    iss: Optional[str] = Field(None, description="Issuer")
    jti: Optional[str] = Field(None, description="Token ID")


class UserInfo(BaseModel):
    """OIDC UserInfo response."""

    sub: str = Field(..., description="User ID")
    email: Optional[str] = None
    email_verified: Optional[bool] = None
    name: Optional[str] = None
    given_name: Optional[str] = None
    family_name: Optional[str] = None
    picture: Optional[str] = None
    roles: list[str] = Field(default_factory=list)
    permissions: list[str] = Field(default_factory=list)
    tenant_id: Optional[str] = None


class UserContext(BaseModel):
    """
    Authenticated user context.

    This is the main object you'll use to check permissions
    and access user information in your application.
    """

    user_id: str = Field(..., description="User ID")
    email: Optional[str] = None
    email_verified: bool = False
    name: Optional[str] = None
    given_name: Optional[str] = None
    family_name: Optional[str] = None
    picture: Optional[str] = None
    roles: list[str] = Field(default_factory=list)
    permissions: list[str] = Field(default_factory=list)
    tenant_id: Optional[str] = None
    team_id: Optional[str] = None
    session_id: Optional[str] = None
    scopes: list[str] = Field(default_factory=list)
    is_authenticated: bool = True

    def has_permission(self, permission: str) -> bool:
        """
        Check if user has a specific permission.

        Supports wildcards: "users:*" matches "users:read"
        """
        for p in self.permissions:
            if p == "*":
                return True
            if p == permission:
                return True
            # Check wildcard
            if p.endswith(":*"):
                resource = p[:-2]
                if permission.startswith(f"{resource}:"):
                    return True
        return False

    def has_any_permission(self, permissions: list[str]) -> bool:
        """Check if user has any of the specified permissions."""
        return any(self.has_permission(p) for p in permissions)

    def has_all_permissions(self, permissions: list[str]) -> bool:
        """Check if user has all of the specified permissions."""
        return all(self.has_permission(p) for p in permissions)

    def has_role(self, role: str) -> bool:
        """Check if user has a specific role."""
        return role in self.roles

    def has_any_role(self, roles: list[str]) -> bool:
        """Check if user has any of the specified roles."""
        return any(r in self.roles for r in roles)

    def is_admin(self) -> bool:
        """Check if user is an admin or super_admin."""
        return self.has_any_role(["admin", "super_admin"])

    def is_super_admin(self) -> bool:
        """Check if user is a super_admin."""
        return self.has_role("super_admin")


class Session(BaseModel):
    """User session information."""

    id: str = Field(..., description="Session ID")
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    location: Optional[str] = None
    created_at: datetime
    last_active_at: datetime
    is_current: bool = False
