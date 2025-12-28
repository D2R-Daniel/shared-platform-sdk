"""API Keys service exceptions."""


class APIKeyError(Exception):
    """Base exception for API key operations."""
    pass


class APIKeyNotFoundError(APIKeyError):
    """Raised when an API key is not found."""
    def __init__(self, key_id: str):
        self.key_id = key_id
        super().__init__(f"API key not found: {key_id}")


class APIKeyExpiredError(APIKeyError):
    """Raised when an API key has expired."""
    def __init__(self, key_prefix: str = ""):
        self.key_prefix = key_prefix
        msg = f"API key has expired: {key_prefix}" if key_prefix else "API key has expired"
        super().__init__(msg)


class APIKeyRevokedError(APIKeyError):
    """Raised when an API key has been revoked."""
    def __init__(self, key_prefix: str = "", reason: str | None = None):
        self.key_prefix = key_prefix
        self.reason = reason
        msg = f"API key has been revoked: {key_prefix}"
        if reason:
            msg += f" ({reason})"
        super().__init__(msg)


class RateLimitExceededError(APIKeyError):
    """Raised when rate limit is exceeded."""
    def __init__(
        self,
        limit: int,
        reset_at: str | None = None,
        retry_after: int | None = None,
    ):
        self.limit = limit
        self.reset_at = reset_at
        self.retry_after = retry_after
        msg = f"Rate limit exceeded: {limit} requests/hour"
        if retry_after:
            msg += f". Retry after {retry_after} seconds"
        super().__init__(msg)


class IPNotAllowedError(APIKeyError):
    """Raised when request IP is not in allowed list."""
    def __init__(self, ip: str):
        self.ip = ip
        super().__init__(f"IP address not allowed: {ip}")
