# Specification-Driven Development (SDD) Workflow

## Overview
This workflow ensures SDK development starts with specifications (YAML models and OpenAPI) before implementation.

## Principles

1. **Spec First**: Define models and APIs in YAML/OpenAPI before coding
2. **Language Agnostic**: Specs are language-independent
3. **Single Source of Truth**: Specs define the contract
4. **Consistency**: All SDKs implement the same spec

## Workflow Phases

### Phase 1: Specification

#### 1.1 Define Data Models
Create YAML model definitions in `models/{module}/{module}.yaml`:

```yaml
# models/users/users.yaml

User:
  description: Represents a user in the system
  fields:
    id:
      type: string
      format: uuid
      required: true
      description: Unique identifier
    email:
      type: string
      format: email
      required: true
      max_length: 255
    name:
      type: string
      required: true
      max_length: 100
    is_active:
      type: boolean
      default: true
    created_at:
      type: datetime
      required: true
    updated_at:
      type: datetime

CreateUserRequest:
  description: Request to create a new user
  fields:
    email:
      type: string
      format: email
      required: true
    name:
      type: string
      required: true
    password:
      type: string
      required: true
      min_length: 8
```

#### 1.2 Define API Endpoints
Create OpenAPI specification in `openapi/{module}/{module}-api.yaml`:

```yaml
# openapi/users/users-api.yaml
openapi: 3.0.3
info:
  title: Users API
  version: 1.0.0

paths:
  /users:
    get:
      summary: List users
      operationId: listUsers
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: page_size
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: List of users
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserListResponse'

    post:
      summary: Create user
      operationId: createUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          description: Created user
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          $ref: '#/components/responses/ValidationError'
        '409':
          $ref: '#/components/responses/ConflictError'
```

### Phase 2: Specification Review

#### 2.1 Review Checklist
- [ ] All fields have types and descriptions
- [ ] Required vs optional clearly marked
- [ ] Validation constraints defined
- [ ] Error responses documented
- [ ] Pagination pattern consistent
- [ ] Naming conventions followed

#### 2.2 Cross-Reference
- [ ] Models used in API match definitions
- [ ] Request/Response schemas complete
- [ ] Error codes documented
- [ ] Examples provided

### Phase 3: Implementation from Spec

#### 3.1 Model Generation Approach

**Python (from YAML)**
```python
# Generate dataclass from YAML spec
@dataclass
class User:
    """Represents a user in the system."""
    id: str
    email: str
    name: str
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime | None = None
```

**TypeScript (from YAML)**
```typescript
// Generate interface from YAML spec
interface User {
  /** Unique identifier */
  id: string;
  /** User email address */
  email: string;
  /** User display name */
  name: string;
  /** Whether user is active */
  isActive: boolean;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt?: Date;
}
```

**Java (from YAML)**
```java
// Generate class from YAML spec
public class User {
    /** Unique identifier */
    private String id;
    /** User email address */
    private String email;
    /** User display name */
    private String name;
    /** Whether user is active */
    private boolean isActive = true;
    /** Creation timestamp */
    private Instant createdAt;
    /** Last update timestamp */
    private Instant updatedAt;

    // Getters, setters, builder...
}
```

#### 3.2 Client Generation Approach

From OpenAPI `operationId`:
- `listUsers` → Python: `list_users()`, TS: `listUsers()`, Java: `listUsers()`
- `createUser` → Python: `create_user()`, TS: `createUser()`, Java: `createUser()`
- `getUser` → Python: `get_user()`, TS: `getUser()`, Java: `getUser()`

### Phase 4: Validation

#### 4.1 Spec Compliance Tests
```python
def test_user_model_matches_spec():
    """Verify User model matches YAML specification."""
    spec = load_yaml("models/users/users.yaml")
    user_spec = spec["User"]

    # Check all required fields exist
    for field_name, field_def in user_spec["fields"].items():
        assert hasattr(User, field_name), f"Missing field: {field_name}"
        if field_def.get("required"):
            # Verify field is required in model
            pass
```

#### 4.2 API Compliance Tests
```python
def test_client_implements_all_operations():
    """Verify client implements all OpenAPI operations."""
    spec = load_openapi("openapi/users/users-api.yaml")

    for path, methods in spec["paths"].items():
        for method, details in methods.items():
            operation_id = details["operationId"]
            method_name = to_snake_case(operation_id)
            assert hasattr(UserClient, method_name), f"Missing: {method_name}"
```

### Phase 5: Documentation Generation

#### 5.1 Generate API Docs from OpenAPI
```bash
# Generate HTML documentation
npx redoc-cli bundle openapi/users/users-api.yaml -o docs/users-api.html

# Generate markdown
npx widdershins openapi/users/users-api.yaml -o docs/users-api.md
```

#### 5.2 Sync README with Specs
Ensure README examples match current API specification.

## Quick Reference

### Spec File Locations
```
models/
├── users/users.yaml
├── auth/auth.yaml
├── teams/teams.yaml
└── ...

openapi/
├── users/users-api.yaml
├── auth/auth-api.yaml
├── teams/teams-api.yaml
└── ...
```

### Type Mapping

| YAML Type | Python | TypeScript | Java |
|-----------|--------|------------|------|
| string | str | string | String |
| integer | int | number | int/Integer |
| boolean | bool | boolean | boolean/Boolean |
| datetime | datetime | Date | Instant |
| uuid | str | string | String |
| array | list | Array | List |
| object | dict | object | Map |
