"""Settings service module for shared platform SDK."""
from .models import (
    SettingCategory,
    TenantSettings,
    SettingDefinition,
    SettingValue,
    AllSettingsResponse,
    CategorySettingsResponse,
    UpdateSettingsRequest,
    SettingValidationRules,
)
from .client import SettingsClient
from .exceptions import (
    SettingsError,
    SettingNotFoundError,
    InvalidSettingValueError,
    InvalidCategoryError,
)

__all__ = [
    # Models
    "SettingCategory",
    "TenantSettings",
    "SettingDefinition",
    "SettingValue",
    "AllSettingsResponse",
    "CategorySettingsResponse",
    "UpdateSettingsRequest",
    "SettingValidationRules",
    # Client
    "SettingsClient",
    # Exceptions
    "SettingsError",
    "SettingNotFoundError",
    "InvalidSettingValueError",
    "InvalidCategoryError",
]
