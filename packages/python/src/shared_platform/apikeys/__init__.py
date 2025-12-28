"""API Keys service module for shared platform SDK."""
from .models import (
    APIKeyEnvironment,
    APIKey,
    APIKeySummary,
    APIKeyUsage,
    RateLimitInfo,
    CreateAPIKeyRequest,
    CreateAPIKeyResponse,
    UpdateAPIKeyRequest,
    ValidateAPIKeyRequest,
    ValidateAPIKeyResponse,
    APIKeyListResponse,
    APIKeyErrorCode,
)
from .client import APIKeyClient
from .exceptions import (
    APIKeyError,
    APIKeyNotFoundError,
    APIKeyExpiredError,
    APIKeyRevokedError,
    RateLimitExceededError,
    IPNotAllowedError,
)

__all__ = [
    # Models
    "APIKeyEnvironment",
    "APIKey",
    "APIKeySummary",
    "APIKeyUsage",
    "RateLimitInfo",
    "CreateAPIKeyRequest",
    "CreateAPIKeyResponse",
    "UpdateAPIKeyRequest",
    "ValidateAPIKeyRequest",
    "ValidateAPIKeyResponse",
    "APIKeyListResponse",
    "APIKeyErrorCode",
    # Client
    "APIKeyClient",
    # Exceptions
    "APIKeyError",
    "APIKeyNotFoundError",
    "APIKeyExpiredError",
    "APIKeyRevokedError",
    "RateLimitExceededError",
    "IPNotAllowedError",
]
