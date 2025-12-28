"""Settings service models."""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field


class SettingCategory(str, Enum):
    """Categories for organizing settings."""
    GENERAL = "general"
    BRANDING = "branding"
    FEATURES = "features"
    INTEGRATIONS = "integrations"
    SECURITY = "security"
    NOTIFICATIONS = "notifications"


class SettingType(str, Enum):
    """Data types for settings."""
    BOOLEAN = "boolean"
    STRING = "string"
    NUMBER = "number"
    JSON = "json"
    ARRAY = "array"


class SettingValidationRules(BaseModel):
    """Validation rules for a setting value."""
    min: Optional[float] = None
    max: Optional[float] = None
    min_length: Optional[int] = Field(None, alias="minLength")
    max_length: Optional[int] = Field(None, alias="maxLength")
    pattern: Optional[str] = None
    enum: Optional[list[Any]] = None

    class Config:
        populate_by_name = True


class SettingDefinition(BaseModel):
    """Definition of a configurable setting."""
    key: str
    type: SettingType
    default_value: Any = None
    label: str
    description: Optional[str] = None
    category: SettingCategory
    is_public: bool = False
    is_readonly: bool = False
    validation_rules: Optional[SettingValidationRules] = None
    display_order: int = 0


class TenantSettings(BaseModel):
    """Settings for a specific tenant and category."""
    id: str
    tenant_id: str
    category: SettingCategory
    settings: dict[str, Any]
    updated_at: datetime
    updated_by: Optional[str] = None


class SettingValue(BaseModel):
    """A single setting value with its definition."""
    key: str
    value: Any
    definition: Optional[SettingDefinition] = None


class AllSettingsResponse(BaseModel):
    """Response containing all settings grouped by category."""
    tenant_id: str
    settings: dict[str, dict[str, Any]]
    definitions: Optional[dict[str, list[SettingDefinition]]] = None
    updated_at: Optional[datetime] = None


class CategorySettingsResponse(BaseModel):
    """Response containing settings for a single category."""
    tenant_id: str
    category: SettingCategory
    settings: dict[str, Any]
    updated_at: Optional[datetime] = None


class UpdateSettingsRequest(BaseModel):
    """Request to update settings."""
    settings: dict[str, Any]


class DefinitionsResponse(BaseModel):
    """Response containing setting definitions."""
    definitions: list[SettingDefinition]
