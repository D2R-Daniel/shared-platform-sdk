"""Webhooks service module for shared platform SDK."""
from .models import (
    WebhookEvent,
    Webhook,
    WebhookSummary,
    WebhookDelivery,
    DeliveryStatus,
    WebhookListResponse,
    DeliveryListResponse,
    CreateWebhookRequest,
    UpdateWebhookRequest,
    WebhookTestResult,
    WebhookPayload,
)
from .client import WebhookClient
from .signature import generate_signature, verify_signature
from .exceptions import (
    WebhookError,
    WebhookNotFoundError,
    DeliveryNotFoundError,
    DeliveryFailedError,
    InvalidSignatureError,
)

__all__ = [
    # Models
    "WebhookEvent",
    "Webhook",
    "WebhookSummary",
    "WebhookDelivery",
    "DeliveryStatus",
    "WebhookListResponse",
    "DeliveryListResponse",
    "CreateWebhookRequest",
    "UpdateWebhookRequest",
    "WebhookTestResult",
    "WebhookPayload",
    # Client
    "WebhookClient",
    # Signature utilities
    "generate_signature",
    "verify_signature",
    # Exceptions
    "WebhookError",
    "WebhookNotFoundError",
    "DeliveryNotFoundError",
    "DeliveryFailedError",
    "InvalidSignatureError",
]
