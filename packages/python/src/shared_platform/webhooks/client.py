"""HTTP client for webhook operations."""
from __future__ import annotations

from typing import Optional
import httpx
from .models import (
    Webhook,
    WebhookDelivery,
    WebhookEvent,
    DeliveryStatus,
    WebhookListResponse,
    DeliveryListResponse,
    CreateWebhookRequest,
    UpdateWebhookRequest,
    WebhookTestResult,
    EventInfo,
)
from .exceptions import (
    WebhookNotFoundError,
    DeliveryNotFoundError,
)


class WebhookClient:
    """Client for webhook management operations."""

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

    # Webhook CRUD Operations

    def list(
        self,
        page: int = 1,
        page_size: int = 20,
        is_active: Optional[bool] = None,
        event: Optional[WebhookEvent] = None,
    ) -> WebhookListResponse:
        """List webhooks."""
        params = {
            "page": page,
            "page_size": page_size,
        }
        if is_active is not None:
            params["is_active"] = is_active
        if event:
            params["event"] = event.value

        response = self._get_client().get("/webhooks", params=params)
        response.raise_for_status()
        return WebhookListResponse(**response.json())

    def get(self, webhook_id: str) -> Webhook:
        """Get a webhook by ID."""
        response = self._get_client().get(f"/webhooks/{webhook_id}")
        if response.status_code == 404:
            raise WebhookNotFoundError(webhook_id)
        response.raise_for_status()
        return Webhook(**response.json())

    def create(self, request: CreateWebhookRequest) -> Webhook:
        """Create a new webhook."""
        response = self._get_client().post(
            "/webhooks",
            json=request.model_dump(exclude_none=True, mode="json"),
        )
        response.raise_for_status()
        return Webhook(**response.json())

    def update(self, webhook_id: str, request: UpdateWebhookRequest) -> Webhook:
        """Update a webhook."""
        response = self._get_client().put(
            f"/webhooks/{webhook_id}",
            json=request.model_dump(exclude_none=True, mode="json"),
        )
        if response.status_code == 404:
            raise WebhookNotFoundError(webhook_id)
        response.raise_for_status()
        return Webhook(**response.json())

    def delete(self, webhook_id: str) -> None:
        """Delete a webhook."""
        response = self._get_client().delete(f"/webhooks/{webhook_id}")
        if response.status_code == 404:
            raise WebhookNotFoundError(webhook_id)
        response.raise_for_status()

    def test(
        self,
        webhook_id: str,
        event: Optional[WebhookEvent] = None,
    ) -> WebhookTestResult:
        """Test a webhook by sending a test payload."""
        body = {}
        if event:
            body["event"] = event.value
        response = self._get_client().post(f"/webhooks/{webhook_id}/test", json=body)
        if response.status_code == 404:
            raise WebhookNotFoundError(webhook_id)
        response.raise_for_status()
        return WebhookTestResult(**response.json())

    def rotate_secret(self, webhook_id: str) -> Webhook:
        """Rotate the webhook secret."""
        response = self._get_client().post(f"/webhooks/{webhook_id}/rotate-secret")
        if response.status_code == 404:
            raise WebhookNotFoundError(webhook_id)
        response.raise_for_status()
        return Webhook(**response.json())

    # Delivery Operations

    def list_deliveries(
        self,
        webhook_id: str,
        page: int = 1,
        page_size: int = 20,
        status: Optional[DeliveryStatus] = None,
        event: Optional[WebhookEvent] = None,
    ) -> DeliveryListResponse:
        """List webhook deliveries."""
        params = {
            "page": page,
            "page_size": page_size,
        }
        if status:
            params["status"] = status.value
        if event:
            params["event"] = event.value

        response = self._get_client().get(
            f"/webhooks/{webhook_id}/deliveries",
            params=params,
        )
        if response.status_code == 404:
            raise WebhookNotFoundError(webhook_id)
        response.raise_for_status()
        return DeliveryListResponse(**response.json())

    def get_delivery(self, webhook_id: str, delivery_id: str) -> WebhookDelivery:
        """Get a webhook delivery by ID."""
        response = self._get_client().get(
            f"/webhooks/{webhook_id}/deliveries/{delivery_id}"
        )
        if response.status_code == 404:
            raise DeliveryNotFoundError(delivery_id)
        response.raise_for_status()
        return WebhookDelivery(**response.json())

    def retry_delivery(self, webhook_id: str, delivery_id: str) -> WebhookDelivery:
        """Retry a failed webhook delivery."""
        response = self._get_client().post(
            f"/webhooks/{webhook_id}/deliveries/{delivery_id}/retry"
        )
        if response.status_code == 404:
            raise DeliveryNotFoundError(delivery_id)
        response.raise_for_status()
        return WebhookDelivery(**response.json())

    # Event Operations

    def list_events(self) -> list[EventInfo]:
        """List available webhook events."""
        response = self._get_client().get("/webhooks/events")
        response.raise_for_status()
        data = response.json()
        return [EventInfo(**e) for e in data.get("events", [])]
