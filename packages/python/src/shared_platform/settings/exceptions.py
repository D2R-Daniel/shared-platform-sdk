"""Settings service exceptions."""


class SettingsError(Exception):
    """Base exception for settings operations."""
    pass


class SettingNotFoundError(SettingsError):
    """Raised when a setting is not found."""
    def __init__(self, key: str):
        self.key = key
        super().__init__(f"Setting not found: {key}")


class InvalidSettingValueError(SettingsError):
    """Raised when a setting value is invalid."""
    def __init__(self, key: str, message: str):
        self.key = key
        super().__init__(f"Invalid value for setting '{key}': {message}")


class InvalidCategoryError(SettingsError):
    """Raised when an invalid category is specified."""
    def __init__(self, category: str):
        self.category = category
        super().__init__(f"Invalid settings category: {category}")
