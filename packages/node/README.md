# Shared Platform SDK (Node.js/TypeScript)

A unified SDK for authentication, user management, and notifications across all platform services.

## Installation

```bash
npm install @platform/shared-sdk
# or
yarn add @platform/shared-sdk
# or
pnpm add @platform/shared-sdk
```

## Quick Start

```typescript
import { AuthClient, UserClient, NotificationClient } from '@platform/shared-sdk';
import type { UserContext } from '@platform/shared-sdk';

// Initialize clients
const auth = new AuthClient({
  issuerUrl: 'https://auth.example.com',
  clientId: 'your-client-id',
});

const users = new UserClient({
  baseUrl: 'https://api.example.com',
});

const notifications = new NotificationClient({
  baseUrl: 'https://api.example.com',
});

// Authenticate
const tokens = await auth.login('user@example.com', 'password');

// Set token on other clients
users.setAccessToken(tokens.accessToken);
notifications.setAccessToken(tokens.accessToken);

// Get user context from token
const context: UserContext = auth.getUserContext(tokens.accessToken);
console.log(`Hello, ${context.name}!`);
console.log(`Roles: ${context.roles}`);

// Check permissions
if (context.hasPermission('users:read')) {
  const userList = await users.list({ page: 1, pageSize: 20 });
  console.log(`Found ${userList.pagination.totalItems} users`);
}

// Get notifications
const unread = await notifications.getUnreadCount();
console.log(`You have ${unread.count} unread notifications`);
```

## Features

### Authentication

```typescript
import { AuthClient } from '@platform/shared-sdk/auth';

const auth = new AuthClient({ issuerUrl: 'https://auth.example.com' });

// Login
const tokens = await auth.login('user@example.com', 'password');

// Refresh token
const newTokens = await auth.refreshToken(tokens.refreshToken!);

// Get user context (decoded from JWT)
const context = auth.getUserContext(tokens.accessToken);

// Check permissions
if (context.hasPermission('users:write')) {
  // Can create/update users
}

if (context.isAdmin()) {
  // Admin-only logic
}

// List sessions
const sessions = await auth.listSessions(tokens.accessToken);

// Logout
await auth.logout(tokens.accessToken);
```

### User Management

```typescript
import { UserClient } from '@platform/shared-sdk/users';
import type { CreateUserRequest, User } from '@platform/shared-sdk/users';

const users = new UserClient({
  baseUrl: 'https://api.example.com',
  accessToken: token,
});

// List users
const result = await users.list({
  page: 1,
  pageSize: 20,
  search: 'john',
  status: 'active',
  role: 'admin',
});

// Get a user
const user = await users.get('user-id');

// Create a user
const newUser = await users.create({
  email: 'new@example.com',
  name: 'New User',
  roles: ['user'],
  sendInvitation: true,
});

// Update a user
const updated = await users.update('user-id', { name: 'Updated Name' });

// Update status
await users.updateStatus('user-id', 'suspended', 'Policy violation');

// Profile operations (current user)
const profile = await users.getMyProfile();
const prefs = await users.getMyPreferences();
await users.changePassword('oldPassword', 'newPassword');
```

### Notifications

```typescript
import { NotificationClient } from '@platform/shared-sdk/notifications';

const notifications = new NotificationClient({
  baseUrl: 'https://api.example.com',
  accessToken: token,
});

// List notifications
const result = await notifications.list({ status: 'unread' });

// Mark as read
await notifications.markAsRead('notification-id');
await notifications.markAllAsRead();

// Preferences
const prefs = await notifications.getPreferences();
await notifications.updatePreferences({
  emailEnabled: true,
  digestFrequency: 'daily',
});

// Register device for push
const device = await notifications.registerDevice(
  'fcm-token',
  'android',
  'My Phone'
);
```

### Event Types

```typescript
import type {
  EmailNotificationEvent,
  SMSNotificationEvent,
  PushNotificationEvent,
} from '@platform/shared-sdk/notifications';

// Create email event for publishing to message broker
const emailEvent: EmailNotificationEvent = {
  eventId: crypto.randomUUID(),
  eventType: 'TRANSACTIONAL',
  timestamp: new Date(),
  tenantId: 'tenant-123',
  recipient: {
    email: 'user@example.com',
    name: 'John Doe',
  },
  template: {
    templateId: 'welcome_email',
    variables: { userName: 'John', appName: 'MyApp' },
  },
  category: 'account',
  source: {
    service: 'user-service',
    action: 'user_registered',
  },
};

// Publish to your message broker
// kafkaProducer.send('notifications', JSON.stringify(emailEvent));
```

## Roles & Permissions

```typescript
import { ROLES, PERMISSIONS, getRolePermissions, checkPermission } from '@platform/shared-sdk/auth';

// Get all permissions for a role (including inherited)
const adminPerms = getRolePermissions('admin');
console.log(adminPerms); // Set { 'users:*', 'settings:*', ... }

// Check permission with wildcards
const granted = ['users:*', 'reports:read'];
checkPermission(granted, 'users:create'); // true
checkPermission(granted, 'settings:read'); // false
```

## Error Handling

```typescript
import {
  AuthError,
  TokenExpiredError,
  InvalidTokenError,
  UnauthorizedError,
} from '@platform/shared-sdk/auth';

try {
  const tokens = await auth.login('user@example.com', 'wrong');
} catch (error) {
  if (error instanceof UnauthorizedError) {
    console.log('Invalid credentials');
  }
}

try {
  const context = auth.getUserContext(expiredToken);
} catch (error) {
  if (error instanceof TokenExpiredError) {
    // Refresh the token
    const newTokens = await auth.refreshToken(refreshToken);
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Type check
npm run typecheck

# Run tests
npm test
```
