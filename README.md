# Shared Platform Specs

Central repository for API contracts, event schemas, and shared data models. This is the **single source of truth** for platform specifications that generate language-specific SDKs.

## Architecture

```
shared-platform-specs/          (This Repo - Contracts)
         │
         │ Generates
         ▼
┌─────────────────────────────────────────────────────┐
│  shared-python   shared-java   shared-node          │
│  (PyPI)          (Maven)       (npm)                │
└─────────────────────────────────────────────────────┘
```

## Repository Structure

```
shared-platform-specs/
├── openapi/                    # REST API contracts (OpenAPI 3.0)
│   ├── auth/                   # Authentication endpoints
│   ├── users/                  # User management endpoints
│   └── notifications/          # Notification preferences
├── events/                     # Event schemas (Avro)
│   └── notifications/          # Notification events
├── models/                     # Shared data models (JSON Schema)
│   ├── auth/                   # Auth-related models
│   ├── users/                  # User models
│   └── notifications/          # Notification models
└── scripts/                    # SDK generation scripts
```

## Modules

### 1. Authentication (`openapi/auth/`, `models/auth/`)
- OAuth2/OIDC endpoint specifications
- JWT token schemas and claims
- Role and permission definitions
- User context model for authenticated requests

### 2. User Management (`openapi/users/`, `models/users/`)
- User CRUD operations
- Profile management
- Validation rules (email, password, phone)

### 3. Notifications (`events/notifications/`, `openapi/notifications/`)
- Event-driven notification system
- Email, SMS, Push notification events
- Template definitions
- Delivery confirmation events

## SDK Generation

### Prerequisites

```bash
# Install OpenAPI Generator
brew install openapi-generator

# Or via npm
npm install @openapitools/openapi-generator-cli -g
```

### Generate SDKs

```bash
# Generate all SDKs
make generate-all

# Generate specific language
make generate-python
make generate-java
make generate-node

# Or use the script directly
./scripts/generate-sdk.sh python
./scripts/generate-sdk.sh java
./scripts/generate-sdk.sh node
```

### Generated SDK Structure

Each generated SDK includes:
- `auth/` - Authentication client and utilities
- `users/` - User management client
- `notifications/` - Notification client and event models
- `models/` - All shared data models

## Usage in Projects

### Python
```python
from shared_platform import AuthClient, UserClient
from shared_platform.models import User, UserContext

# Initialize with your IdP
auth = AuthClient(issuer_url="https://auth.example.com")
users = UserClient(base_url="https://api.example.com")

# Get authenticated user context
context: UserContext = auth.get_user_context(token)

# Manage users
user: User = users.get(user_id)
```

### Node.js
```typescript
import { AuthClient, UserClient } from '@your-org/shared-platform';
import { User, UserContext } from '@your-org/shared-platform/models';

const auth = new AuthClient({ issuerUrl: 'https://auth.example.com' });
const users = new UserClient({ baseUrl: 'https://api.example.com' });

const context: UserContext = await auth.getUserContext(token);
const user: User = await users.get(userId);
```

## Development

### Adding New Models

1. Define the schema in `models/<module>/<name>.yaml`
2. Reference it in the relevant OpenAPI spec using `$ref`
3. Run `make generate-all` to update SDKs
4. Bump version in `VERSION` file

### Adding New Events

1. Create Avro schema in `events/<module>/<name>.avsc`
2. Update event documentation
3. Generate event classes for each language

### Versioning

This repository follows [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes to contracts
- **MINOR**: New endpoints, fields, or events (backward compatible)
- **PATCH**: Documentation, fixes (no contract changes)

## Best Practices

1. **Contract First**: Define specs before implementation
2. **Backward Compatibility**: Add fields as optional, deprecate before removing
3. **Consistent Naming**: Use snake_case for fields, PascalCase for types
4. **Documentation**: Every field should have a description
5. **Validation**: Include format, pattern, min/max constraints

## Related Repositories

| Repository | Description |
|------------|-------------|
| `shared-python` | Python SDK (generated) |
| `shared-java` | Java SDK (generated) |
| `shared-node` | Node.js SDK (generated) |
| `shared-cicd` | Reusable CI/CD workflows |
