# Shared Platform SDK - Claude Instructions

## Project Overview

This is a multi-language SDK providing client libraries for the Shared Platform API in Python, Node.js (TypeScript), and Java.

## Repository Structure

```
shared-platform-sdk/
├── models/                     # YAML model definitions
│   ├── auth/
│   ├── users/
│   ├── roles/
│   ├── teams/
│   ├── invitations/
│   ├── email/
│   ├── settings/
│   ├── webhooks/
│   └── apikeys/
├── openapi/                    # OpenAPI specifications
│   └── {module}/{module}-api.yaml
├── packages/
│   ├── python/                 # Python SDK
│   │   ├── src/shared_platform/
│   │   ├── tests/
│   │   └── pyproject.toml
│   ├── node/                   # Node.js SDK
│   │   ├── src/
│   │   └── package.json
│   └── java/                   # Java SDK
│       ├── src/main/java/com/platform/sdk/
│       ├── src/test/java/
│       └── pom.xml
└── .claude/
    ├── skills/                 # Claude skills
    └── workflows/              # Development workflows
```

## SDK Modules

| Module | Description |
|--------|-------------|
| auth | Authentication (login, tokens, sessions) |
| users | User management CRUD |
| roles | Role and permission management |
| teams | Team management |
| invitations | User invitation system |
| email | Email templates and sending |
| settings | Tenant configuration |
| webhooks | Webhook subscriptions and delivery |
| apikeys | API key management |

## Development Commands

### Python SDK
```bash
cd packages/python

# Install dependencies
poetry install

# Run tests
poetry run pytest

# Run specific test file
poetry run pytest tests/test_users.py -v

# Type checking
poetry run mypy src/
```

### Node.js SDK
```bash
cd packages/node

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Type checking
npm run typecheck
```

### Java SDK
```bash
cd packages/java

# Set Java 17 (required)
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home

# Run tests
mvn test

# Build
mvn package

# Run specific test class
mvn test -Dtest="UserClientTest"
```

## Code Style Guidelines

### Python
- Use type hints for all functions
- Use `from __future__ import annotations` for forward references
- Follow PEP 8 naming (snake_case)
- Use Google-style docstrings
- Prefer dataclasses or Pydantic for models

### TypeScript
- Explicit types for all function parameters and returns
- No `any` types without justification
- Use interfaces for data structures
- Use async/await over raw promises
- Export types from `types.ts`

### Java
- Use Builder pattern for complex objects
- Prefer immutable objects
- Use Optional for nullable returns (not parameters)
- Add JavaDoc for public APIs
- Follow Google Java Style Guide

## Cross-Language Consistency

All SDKs must maintain consistency:

| Concept | Python | TypeScript | Java |
|---------|--------|------------|------|
| List items | `list()` | `list()` | `list()` |
| Get item | `get(id)` | `get(id)` | `get(id)` |
| Create item | `create(request)` | `create(request)` | `create(request)` |
| Update item | `update(id, request)` | `update(id, request)` | `update(id, request)` |
| Delete item | `delete(id)` | `delete(id)` | `delete(id)` |

## Error Handling

HTTP status codes map to exceptions consistently:

| Status | Python | TypeScript | Java |
|--------|--------|------------|------|
| 400 | `ValidationError` | `ValidationError` | `ValidationException` |
| 401 | `AuthenticationError` | `AuthenticationError` | `AuthenticationException` |
| 403 | `AuthorizationError` | `AuthorizationError` | `AuthorizationException` |
| 404 | `NotFoundError` | `NotFoundError` | `NotFoundException` |
| 429 | `RateLimitError` | `RateLimitError` | `RateLimitException` |
| 5xx | `ServerError` | `ServerError` | `ServerException` |

## Adding New Modules

Follow the SDD Workflow in `.claude/workflows/SDD-WORKFLOW.md`:

1. Create YAML model in `models/{module}/`
2. Create OpenAPI spec in `openapi/{module}/`
3. Implement in Python with tests
4. Implement in Node.js with tests
5. Implement in Java with tests
6. Update exports in all packages

## Skills Available

Review skills in `.claude/skills/`:

- **typescript-reviewer**: TypeScript code review
- **python-reviewer**: Python code review
- **java-reviewer**: Java code review
- **sdk-design-reviewer**: Cross-language SDK design
- **api-client-reviewer**: HTTP client patterns
- **unit-testing-reviewer**: Test quality review
- **integration-testing-reviewer**: Integration test patterns
- **documentation-reviewer**: Documentation quality
- **release-manager**: Version and release management
- **security-reviewer**: Security best practices
- **code-architecture**: Architecture review
- **excel-generator**: Report generation

## Workflows

See `.claude/workflows/`:

- **DEVELOPMENT-WORKFLOW.md**: Step-by-step module development
- **SDD-WORKFLOW.md**: Specification-driven development

## Testing Requirements

All changes must pass tests in all three SDKs:

```bash
# Run all tests
cd packages/python && poetry run pytest
cd packages/node && npm test
cd packages/java && mvn test
```

## Commit Guidelines

Use conventional commits:

```
feat(module): description   # New feature
fix(module): description    # Bug fix
docs(module): description   # Documentation
refactor(module): description # Refactoring
test(module): description   # Tests
```

Example:
```
feat(webhooks): add webhook signature verification

- Add HMAC-SHA256 signature generation
- Add signature verification utility
- Add tests for edge cases
```
