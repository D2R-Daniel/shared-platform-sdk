"""Webhooks service exceptions."""


class WebhookError(Exception):
    """Base exception for webhook operations."""
    pass


class WebhookNotFoundError(WebhookError):
    """Raised when a webhook is not found."""
    def __init__(self, webhook_id: str):
        self.webhook_id = webhook_id
        super().__init__(f"Webhook not found: {webhook_id}")


class DeliveryNotFoundError(WebhookError):
    """Raised when a webhook delivery is not found."""
    def __init__(self, delivery_id: str):
        self.delivery_id = delivery_id
        super().__init__(f"Webhook delivery not found: {delivery_id}")


class DeliveryFailedError(WebhookError):
    """Raised when webhook delivery fails."""
    def __init__(self, webhook_id: str, message: str):
        self.webhook_id = webhook_id
        super().__init__(f"Webhook delivery failed for {webhook_id}: {message}")


class InvalidSignatureError(WebhookError):
    """Raised when webhook signature verification fails."""
    def __init__(self, message: str = "Invalid webhook signature"):
        super().__init__(message)
