"""
Authentication exceptions.
"""


class AuthError(Exception):
    """Base authentication error."""

    def __init__(self, error: str, description: str = ""):
        self.error = error
        self.description = description
        super().__init__(f"{error}: {description}" if description else error)


class TokenExpiredError(AuthError):
    """Token has expired."""

    def __init__(self, message: str = "Token has expired"):
        super().__init__("token_expired", message)


class InvalidTokenError(AuthError):
    """Token is invalid or malformed."""

    def __init__(self, message: str = "Invalid token"):
        super().__init__("invalid_token", message)


class UnauthorizedError(AuthError):
    """Authentication failed."""

    def __init__(self, message: str = "Unauthorized"):
        super().__init__("unauthorized", message)


class ForbiddenError(AuthError):
    """Access denied due to insufficient permissions."""

    def __init__(self, message: str = "Forbidden", required_permission: str = ""):
        self.required_permission = required_permission
        super().__init__("forbidden", message)


class RateLimitedError(AuthError):
    """Too many requests."""

    def __init__(self, retry_after: int = 0):
        self.retry_after = retry_after
        super().__init__("rate_limited", f"Rate limited. Retry after {retry_after} seconds.")
