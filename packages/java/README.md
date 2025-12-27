# Shared Platform SDK (Java)

A unified SDK for authentication, user management, and notifications across all platform services.

## Installation

### Maven

```xml
<dependency>
    <groupId>com.platform</groupId>
    <artifactId>shared-sdk</artifactId>
    <version>0.1.0</version>
</dependency>
```

### Gradle

```groovy
implementation 'com.platform:shared-sdk:0.1.0'
```

## Quick Start

```java
import com.platform.sdk.auth.AuthClient;
import com.platform.sdk.auth.UserContext;
import com.platform.sdk.users.UserClient;
import com.platform.sdk.notifications.NotificationClient;

// Initialize clients
AuthClient auth = new AuthClient.Builder()
    .issuerUrl("https://auth.example.com")
    .clientId("your-client-id")
    .build();

UserClient users = new UserClient.Builder()
    .baseUrl("https://api.example.com")
    .build();

NotificationClient notifications = new NotificationClient.Builder()
    .baseUrl("https://api.example.com")
    .build();

// Authenticate
TokenResponse tokens = auth.login("user@example.com", "password");

// Set token on other clients
users.setAccessToken(tokens.getAccessToken());
notifications.setAccessToken(tokens.getAccessToken());

// Get user context from token
UserContext context = auth.getUserContext(tokens.getAccessToken());
System.out.println("Hello, " + context.getName());
System.out.println("Roles: " + context.getRoles());

// Check permissions
if (context.hasPermission("users:read")) {
    UserListResponse result = users.list(new ListUsersParams().page(1).pageSize(20));
    System.out.println("Found " + result.getPagination().getTotalItems() + " users");
}
```

## Features

### Authentication

```java
import com.platform.sdk.auth.*;

AuthClient auth = new AuthClient.Builder()
    .issuerUrl("https://auth.example.com")
    .build();

// Login
TokenResponse tokens = auth.login("user@example.com", "password");

// Refresh token
TokenResponse newTokens = auth.refreshToken(tokens.getRefreshToken());

// Get user context
UserContext context = auth.getUserContext(tokens.getAccessToken());

// Check permissions
if (context.hasPermission("users:write")) {
    // Can create/update users
}

if (context.isAdmin()) {
    // Admin-only logic
}

// List sessions
List<Session> sessions = auth.listSessions(tokens.getAccessToken());

// Logout
auth.logout(tokens.getAccessToken());
```

### User Management

```java
import com.platform.sdk.users.*;

UserClient users = new UserClient.Builder()
    .baseUrl("https://api.example.com")
    .accessToken(token)
    .build();

// List users
UserListResponse result = users.list(new ListUsersParams()
    .page(1)
    .pageSize(20)
    .search("john")
    .status("active"));

// Get a user
User user = users.get("user-id");

// Create a user
User newUser = users.create(new CreateUserRequest()
    .email("new@example.com")
    .name("New User")
    .roles(List.of("user"))
    .sendInvitation(true));

// Update a user
User updated = users.update("user-id", new UpdateUserRequest().name("Updated Name"));

// Profile operations (current user)
UserProfile profile = users.getMyProfile();
UserPreferences prefs = users.getMyPreferences();
users.changePassword("oldPassword", "newPassword");
```

### Notifications

```java
import com.platform.sdk.notifications.*;

NotificationClient notifications = new NotificationClient.Builder()
    .baseUrl("https://api.example.com")
    .accessToken(token)
    .build();

// List notifications
NotificationListResponse result = notifications.list(new ListNotificationsParams()
    .status("unread"));

// Mark as read
notifications.markAsRead("notification-id");
notifications.markAllAsRead();

// Preferences
NotificationPreferences prefs = notifications.getPreferences();
notifications.updatePreferences(new UpdatePreferencesRequest()
    .emailEnabled(true)
    .digestFrequency("daily"));

// Register device for push
RegisteredDevice device = notifications.registerDevice(
    "fcm-token", "android", "My Phone", null);
```

## Building

```bash
# Build
mvn clean package

# Run tests
mvn test

# Install to local repository
mvn install
```

## Status

This Java SDK provides a basic structure. Full implementation is pending.
For complete functionality, consider using the Python or Node.js SDKs.
