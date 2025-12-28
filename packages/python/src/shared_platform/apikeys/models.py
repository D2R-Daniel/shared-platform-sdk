"""API Keys service models."""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field


class APIKeyEnvironment(str, Enum):
    """API key environment type."""
    LIVE = "live"
    TEST = "test"


class APIKeyErrorCode(str, Enum):
    """API key validation error codes."""
    KEY_NOT_FOUND = "key_not_found"
    KEY_EXPIRED = "key_expired"
    KEY_REVOKED = "key_revoked"
    IP_NOT_ALLOWED = "ip_not_allowed"
    RATE_LIMITED = "rate_limited"
    PERMISSION_DENIED = "permission_denied"


class APIKey(BaseModel):
    """Full API key model (only returned on creation)."""
    id: str
    tenant_id: str
    name: str
    description: Optional[str] = None
    key: str
    key_prefix: str
    environment: APIKeyEnvironment
    permissions: list[str] = Field(default_factory=list)
    rate_limit: int = 1000
    allowed_ips: Optional[list[str]] = None
    allowed_origins: Optional[list[str]] = None
    expires_at: Optional[datetime] = None
    last_used_at: Optional[datetime] = None
    last_used_ip: Optional[str] = None
    usage_count: int = 0
    revoked_at: Optional[datetime] = None
    revoked_by: Optional[str] = None
    revoke_reason: Optional[str] = None
    created_at: datetime
    created_by: str


class APIKeySummary(BaseModel):
    """API key summary (does not include full key)."""
    id: str
    name: str
    description: Optional[str] = None
    key_prefix: str
    environment: APIKeyEnvironment
    permissions: list[str] = Field(default_factory=list)
    rate_limit: int
    allowed_ips: Optional[list[str]] = None
    allowed_origins: Optional[list[str]] = None
    expires_at: Optional[datetime] = None
    last_used_at: Optional[datetime] = None
    is_active: bool
    created_at: datetime


class CreateAPIKeyRequest(BaseModel):
    """Request to create an API key."""
    name: str
    description: Optional[str] = None
    environment: APIKeyEnvironment = APIKeyEnvironment.LIVE
    permissions: Optional[list[str]] = None
    rate_limit: int = 1000
    allowed_ips: Optional[list[str]] = None
    allowed_origins: Optional[list[str]] = None
    expires_in_days: Optional[int] = None


class CreateAPIKeyResponse(BaseModel):
    """Response when creating an API key (includes full key)."""
    id: str
    name: str
    key: str
    key_prefix: str
    environment: APIKeyEnvironment
    permissions: list[str]
    rate_limit: int
    expires_at: Optional[datetime] = None
    created_at: datetime


class UpdateAPIKeyRequest(BaseModel):
    """Request to update an API key."""
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[list[str]] = None
    rate_limit: Optional[int] = None
    allowed_ips: Optional[list[str]] = None
    allowed_origins: Optional[list[str]] = None


class ValidateAPIKeyRequest(BaseModel):
    """Request to validate an API key."""
    key: str
    required_permission: Optional[str] = None


class ValidateAPIKeyResponse(BaseModel):
    """API key validation result."""
    valid: bool
    tenant_id: Optional[str] = None
    permissions: Optional[list[str]] = None
    has_permission: Optional[bool] = None
    error: Optional[str] = None
    error_code: Optional[APIKeyErrorCode] = None


class APIKeyUsage(BaseModel):
    """API key usage statistics."""
    key_id: str
    period: str
    requests_count: int
    requests_by_endpoint: dict[str, int] = Field(default_factory=dict)
    error_count: int = 0
    rate_limit_hits: int = 0
    avg_latency_ms: float = 0.0


class RateLimitInfo(BaseModel):
    """Rate limit status for an API key."""
    limit: int
    remaining: int
    reset_at: datetime
    retry_after: Optional[int] = None


class APIKeyListResponse(BaseModel):
    """Response containing a list of API keys."""
    data: list[APIKeySummary]
    total: int
    page: int
    page_size: int
