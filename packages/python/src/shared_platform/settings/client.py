"""HTTP client for settings operations."""
from __future__ import annotations

from typing import Any, Optional
import httpx
from .models import (
    SettingCategory,
    SettingDefinition,
    SettingValue,
    AllSettingsResponse,
    CategorySettingsResponse,
    UpdateSettingsRequest,
    DefinitionsResponse,
)
from .exceptions import (
    SettingNotFoundError,
    InvalidSettingValueError,
    InvalidCategoryError,
)


class SettingsClient:
    """Client for settings management operations."""

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

    # Settings Operations

    def get_all(self, include_definitions: bool = False) -> AllSettingsResponse:
        """Get all settings grouped by category."""
        params = {"include_definitions": include_definitions}
        response = self._get_client().get("/settings", params=params)
        response.raise_for_status()
        return AllSettingsResponse(**response.json())

    def get_category(self, category: SettingCategory) -> CategorySettingsResponse:
        """Get settings for a specific category."""
        response = self._get_client().get(f"/settings/{category.value}")
        if response.status_code == 400:
            raise InvalidCategoryError(category.value)
        response.raise_for_status()
        return CategorySettingsResponse(**response.json())

    def update_category(
        self,
        category: SettingCategory,
        settings: dict[str, Any],
    ) -> CategorySettingsResponse:
        """Update settings for a category."""
        response = self._get_client().put(
            f"/settings/{category.value}",
            json={"settings": settings},
        )
        if response.status_code == 400:
            data = response.json()
            error = data.get("error", "Invalid settings values")
            key = data.get("key", "unknown")
            raise InvalidSettingValueError(key, error)
        if response.status_code == 404:
            raise InvalidCategoryError(category.value)
        response.raise_for_status()
        return CategorySettingsResponse(**response.json())

    def get(self, key: str) -> SettingValue:
        """Get a single setting by key."""
        response = self._get_client().get(f"/settings/{key}")
        if response.status_code == 404:
            raise SettingNotFoundError(key)
        response.raise_for_status()
        return SettingValue(**response.json())

    def set(self, key: str, value: Any) -> SettingValue:
        """Set a single setting value."""
        response = self._get_client().put(
            f"/settings/{key}",
            json={"value": value},
        )
        if response.status_code == 400:
            data = response.json()
            error = data.get("error", "Invalid value")
            raise InvalidSettingValueError(key, error)
        if response.status_code == 404:
            raise SettingNotFoundError(key)
        response.raise_for_status()
        return SettingValue(**response.json())

    def reset_category(self, category: SettingCategory) -> CategorySettingsResponse:
        """Reset a category to default values."""
        response = self._get_client().post(f"/settings/reset/{category.value}")
        if response.status_code == 400:
            raise InvalidCategoryError(category.value)
        response.raise_for_status()
        return CategorySettingsResponse(**response.json())

    def get_definitions(
        self,
        category: Optional[SettingCategory] = None,
        is_public: Optional[bool] = None,
    ) -> list[SettingDefinition]:
        """Get setting definitions."""
        params = {}
        if category:
            params["category"] = category.value
        if is_public is not None:
            params["is_public"] = is_public

        response = self._get_client().get("/settings/definitions", params=params)
        response.raise_for_status()
        data = response.json()
        return [SettingDefinition(**d) for d in data.get("definitions", [])]

    # Convenience Methods

    def get_value(self, key: str, default: Any = None) -> Any:
        """Get a setting value, returning default if not found."""
        try:
            setting = self.get(key)
            return setting.value
        except SettingNotFoundError:
            return default

    def is_feature_enabled(self, feature: str) -> bool:
        """Check if a feature is enabled."""
        key = f"features.{feature}" if not feature.startswith("features.") else feature
        return bool(self.get_value(key, False))
