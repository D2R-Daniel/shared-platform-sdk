"""HTTP client for API key operations."""
from __future__ import annotations

from typing import Optional
import httpx
from .models import (
    APIKeyEnvironment,
    APIKeySummary,
    APIKeyUsage,
    CreateAPIKeyRequest,
    CreateAPIKeyResponse,
    UpdateAPIKeyRequest,
    ValidateAPIKeyRequest,
    ValidateAPIKeyResponse,
    APIKeyListResponse,
)
from .exceptions import (
    APIKeyNotFoundError,
)


class APIKeyClient:
    """Client for API key management operations."""

    def __init__(
        self,
        base_url: str,
        access_token: Optional[str] = None,
        timeout: float = 30.0,
    ):
        self.base_url = base_url.rstrip("/")
        self._access_token = access_token
        self._timeout = timeout
        self._client: Optional[httpx.Client] = None

    def _get_client(self) -> httpx.Client:
        if self._client is None:
            headers = {"Content-Type": "application/json"}
            if self._access_token:
                headers["Authorization"] = f"Bearer {self._access_token}"
            self._client = httpx.Client(
                base_url=self.base_url,
                timeout=self._timeout,
                headers=headers,
            )
        return self._client

    def set_access_token(self, token: str) -> None:
        """Update the access token."""
        self._access_token = token
        if self._client:
            self._client.headers["Authorization"] = f"Bearer {token}"

    def close(self) -> None:
        """Close the HTTP client."""
        if self._client:
            self._client.close()
            self._client = None

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()

    # API Key CRUD Operations

    def list(
        self,
        page: int = 1,
        page_size: int = 20,
        environment: Optional[APIKeyEnvironment] = None,
        is_active: Optional[bool] = None,
    ) -> APIKeyListResponse:
        """List API keys."""
        params = {
            "page": page,
            "page_size": page_size,
        }
        if environment:
            params["environment"] = environment.value
        if is_active is not None:
            params["is_active"] = is_active

        response = self._get_client().get("/api-keys", params=params)
        response.raise_for_status()
        return APIKeyListResponse(**response.json())

    def get(self, key_id: str) -> APIKeySummary:
        """Get an API key by ID (does not return full key)."""
        response = self._get_client().get(f"/api-keys/{key_id}")
        if response.status_code == 404:
            raise APIKeyNotFoundError(key_id)
        response.raise_for_status()
        return APIKeySummary(**response.json())

    def create(self, request: CreateAPIKeyRequest) -> CreateAPIKeyResponse:
        """Create a new API key."""
        response = self._get_client().post(
            "/api-keys",
            json=request.model_dump(exclude_none=True, mode="json"),
        )
        response.raise_for_status()
        return CreateAPIKeyResponse(**response.json())

    def update(self, key_id: str, request: UpdateAPIKeyRequest) -> APIKeySummary:
        """Update an API key."""
        response = self._get_client().put(
            f"/api-keys/{key_id}",
            json=request.model_dump(exclude_none=True),
        )
        if response.status_code == 404:
            raise APIKeyNotFoundError(key_id)
        response.raise_for_status()
        return APIKeySummary(**response.json())

    def revoke(self, key_id: str, reason: Optional[str] = None) -> None:
        """Revoke an API key."""
        body = {}
        if reason:
            body["reason"] = reason
        response = self._get_client().delete(f"/api-keys/{key_id}", json=body if body else None)
        if response.status_code == 404:
            raise APIKeyNotFoundError(key_id)
        response.raise_for_status()

    def regenerate(self, key_id: str) -> CreateAPIKeyResponse:
        """Regenerate an API key (invalidates old key)."""
        response = self._get_client().post(f"/api-keys/{key_id}/regenerate")
        if response.status_code == 404:
            raise APIKeyNotFoundError(key_id)
        response.raise_for_status()
        return CreateAPIKeyResponse(**response.json())

    # Usage Operations

    def get_usage(
        self,
        key_id: str,
        period: str = "day",
    ) -> APIKeyUsage:
        """Get usage statistics for an API key."""
        params = {"period": period}
        response = self._get_client().get(f"/api-keys/{key_id}/usage", params=params)
        if response.status_code == 404:
            raise APIKeyNotFoundError(key_id)
        response.raise_for_status()
        return APIKeyUsage(**response.json())

    # Validation Operations

    def validate(
        self,
        key: str,
        required_permission: Optional[str] = None,
    ) -> ValidateAPIKeyResponse:
        """Validate an API key."""
        body = {"key": key}
        if required_permission:
            body["required_permission"] = required_permission

        response = self._get_client().post("/api-keys/validate", json=body)
        response.raise_for_status()
        return ValidateAPIKeyResponse(**response.json())

    def is_valid(self, key: str) -> bool:
        """Check if an API key is valid (convenience method)."""
        result = self.validate(key)
        return result.valid

    def has_permission(self, key: str, permission: str) -> bool:
        """Check if an API key has a specific permission."""
        result = self.validate(key, required_permission=permission)
        return result.valid and (result.has_permission or False)
