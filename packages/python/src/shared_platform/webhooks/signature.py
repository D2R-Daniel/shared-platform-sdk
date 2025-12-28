"""Webhook signature utilities."""
from __future__ import annotations

import hashlib
import hmac
import time
from typing import Optional

from .exceptions import InvalidSignatureError


def generate_signature(
    payload: str | bytes,
    secret: str,
    timestamp: Optional[int] = None,
) -> tuple[str, int]:
    """
    Generate HMAC-SHA256 signature for webhook payload.

    Args:
        payload: The raw JSON payload (string or bytes)
        secret: The webhook secret key
        timestamp: Optional Unix timestamp (defaults to current time)

    Returns:
        Tuple of (signature, timestamp)
    """
    if timestamp is None:
        timestamp = int(time.time())

    if isinstance(payload, str):
        payload = payload.encode("utf-8")

    # Create signed payload: timestamp.payload
    signed_payload = f"{timestamp}.".encode("utf-8") + payload

    # Generate HMAC-SHA256 signature
    signature = hmac.new(
        secret.encode("utf-8"),
        signed_payload,
        hashlib.sha256,
    ).hexdigest()

    return f"sha256={signature}", timestamp


def verify_signature(
    payload: str | bytes,
    signature: str,
    secret: str,
    timestamp: int,
    tolerance_seconds: int = 300,
) -> bool:
    """
    Verify HMAC-SHA256 signature for webhook payload.

    Args:
        payload: The raw JSON payload (string or bytes)
        signature: The signature from X-Webhook-Signature header
        secret: The webhook secret key
        timestamp: The timestamp from X-Webhook-Timestamp header
        tolerance_seconds: Maximum age of request in seconds (default 5 minutes)

    Returns:
        True if signature is valid

    Raises:
        InvalidSignatureError: If signature is invalid or request is too old
    """
    # Check timestamp tolerance
    current_time = int(time.time())
    if abs(current_time - timestamp) > tolerance_seconds:
        raise InvalidSignatureError("Request timestamp is too old or in the future")

    if isinstance(payload, str):
        payload = payload.encode("utf-8")

    # Recreate the signed payload
    signed_payload = f"{timestamp}.".encode("utf-8") + payload

    # Generate expected signature
    expected = hmac.new(
        secret.encode("utf-8"),
        signed_payload,
        hashlib.sha256,
    ).hexdigest()
    expected_signature = f"sha256={expected}"

    # Constant-time comparison to prevent timing attacks
    if not hmac.compare_digest(signature, expected_signature):
        raise InvalidSignatureError("Signature mismatch")

    return True


def parse_signature_header(header: str) -> str:
    """
    Parse the X-Webhook-Signature header value.

    Args:
        header: The header value (e.g., "sha256=abc123...")

    Returns:
        The signature value
    """
    if header.startswith("sha256="):
        return header
    return f"sha256={header}"
