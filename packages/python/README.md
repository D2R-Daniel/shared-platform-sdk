# Shared Platform SDK (Python)

A unified SDK for authentication, user management, and notifications across all platform services.

## Installation

```bash
pip install shared-platform
```

## Quick Start

```python
from shared_platform import AuthClient, UserClient, NotificationClient
from shared_platform.auth import UserContext

# Initialize clients
auth = AuthClient(
    issuer_url="https://auth.example.com",
    client_id="your-client-id",
)

users = UserClient(
    base_url="https://api.example.com",
)

notifications = NotificationClient(
    base_url="https://api.example.com",
)

# Authenticate
tokens = auth.login(username="user@example.com", password="password")

# Set token on other clients
users.set_access_token(tokens.access_token)
notifications.set_access_token(tokens.access_token)

# Get user context from token
context: UserContext = auth.get_user_context(tokens.access_token)
print(f"Hello, {context.name}!")
print(f"Roles: {context.roles}")

# Check permissions
if context.has_permission("users:read"):
    user_list = users.list(page=1, page_size=20)
    print(f"Found {user_list.pagination.total_items} users")

# Get notifications
unread = notifications.get_unread_count()
print(f"You have {unread['count']} unread notifications")
```

## Features

### Authentication

```python
from shared_platform import AuthClient
from shared_platform.auth import UserContext, TokenExpiredError

auth = AuthClient(issuer_url="https://auth.example.com")

# Login
tokens = auth.login(username="user@example.com", password="password")

# Refresh token
new_tokens = auth.refresh_token(tokens.refresh_token)

# Get user context
context = auth.get_user_context(tokens.access_token)

# Check permissions
if context.has_permission("users:write"):
    # Can create/update users
    pass

if context.is_admin():
    # Admin-only logic
    pass

# List sessions
sessions = auth.list_sessions(tokens.access_token)

# Logout
auth.logout(tokens.access_token)
```

### User Management

```python
from shared_platform import UserClient
from shared_platform.users import CreateUserRequest, User

users = UserClient(base_url="https://api.example.com", access_token=token)

# List users
result = users.list(
    page=1,
    page_size=20,
    search="john",
    status="active",
    role="admin",
)

# Get a user
user = users.get("user-id")

# Create a user
new_user = users.create(CreateUserRequest(
    email="new@example.com",
    name="New User",
    roles=["user"],
    send_invitation=True,
))

# Update a user
updated = users.update("user-id", UpdateUserRequest(name="Updated Name"))

# Update status
users.update_status("user-id", status="suspended", reason="Policy violation")

# Profile operations (current user)
profile = users.get_my_profile()
prefs = users.get_my_preferences()
users.change_password(current_password="old", new_password="new")
```

### Notifications

```python
from shared_platform import NotificationClient
from shared_platform.notifications import EmailNotificationEvent

notifications = NotificationClient(base_url="https://api.example.com", access_token=token)

# List notifications
result = notifications.list(status="unread")

# Mark as read
notifications.mark_as_read("notification-id")
notifications.mark_all_as_read()

# Preferences
prefs = notifications.get_preferences()
notifications.update_preferences(
    email_enabled=True,
    digest_frequency="daily",
)

# Register device for push
device = notifications.register_device(
    token="fcm-token",
    platform="android",
    name="My Phone",
)
```

### Event Publishing

```python
from shared_platform.notifications import (
    EmailNotificationEvent,
    EmailRecipient,
    EmailTemplate,
    EventSource,
)
import uuid

# Create email event
event = EmailNotificationEvent(
    event_id=str(uuid.uuid4()),
    tenant_id="tenant-123",
    recipient=EmailRecipient(
        email="user@example.com",
        name="John Doe",
    ),
    template=EmailTemplate(
        template_id="welcome_email",
        variables={"user_name": "John", "app_name": "MyApp"},
    ),
    category="account",
    source=EventSource(
        service="user-service",
        action="user_registered",
    ),
)

# Publish to your message broker
# kafka_producer.send("notifications", event.to_dict())
```

## Roles & Permissions

```python
from shared_platform.auth import ROLES, PERMISSIONS, get_role_permissions

# Get all permissions for a role
admin_perms = get_role_permissions("admin")
print(admin_perms)  # {'users:*', 'settings:*', ...}

# Check permission hierarchy
from shared_platform.auth import check_permission

granted = ["users:*", "reports:read"]
check_permission(granted, "users:create")  # True
check_permission(granted, "settings:read")  # False
```

## Error Handling

```python
from shared_platform.auth import (
    AuthError,
    TokenExpiredError,
    InvalidTokenError,
    UnauthorizedError,
)

try:
    tokens = auth.login(username="user@example.com", password="wrong")
except UnauthorizedError:
    print("Invalid credentials")

try:
    context = auth.get_user_context(expired_token)
except TokenExpiredError:
    # Refresh the token
    new_tokens = auth.refresh_token(refresh_token)
```

## Development

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Type checking
mypy src/

# Lint
ruff check src/
```
