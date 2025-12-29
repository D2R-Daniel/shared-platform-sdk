# SDK Development Workflow

## Overview
This workflow guides the development of new SDK modules across Python, Node.js, and Java.

## Phase 1: Requirements & Design

### 1.1 Gather Requirements
- [ ] Identify the API endpoints to wrap
- [ ] Document required operations (CRUD, custom actions)
- [ ] List data models needed
- [ ] Identify error cases and exceptions
- [ ] Note any cross-module dependencies

### 1.2 Create YAML Model Definitions
```
models/{module}/{module}.yaml
```
Define all data models with:
- Field names, types, and constraints
- Required vs optional fields
- Relationships to other models
- Enums for fixed value sets

### 1.3 Create OpenAPI Specification
```
openapi/{module}/{module}-api.yaml
```
Document all endpoints with:
- HTTP methods and paths
- Request/response schemas
- Authentication requirements
- Error responses

## Phase 2: Python SDK Implementation

### 2.1 Create Module Structure
```
packages/python/src/shared_platform/{module}/
├── __init__.py
├── models.py
├── client.py
└── exceptions.py
```

### 2.2 Implement Models
- Create dataclasses or Pydantic models
- Add type hints
- Implement serialization methods
- Add validation logic

### 2.3 Implement Client
- Create client class with constructor
- Implement CRUD methods
- Add proper error handling
- Write docstrings

### 2.4 Implement Exceptions
- Create module-specific exception classes
- Extend base SDK exceptions
- Map HTTP status codes

### 2.5 Update Exports
- Add to `__init__.py`
- Update main package `__init__.py`

### 2.6 Write Tests
```
packages/python/tests/test_{module}.py
```
- Unit tests for all methods
- Mock HTTP responses
- Test error cases

### 2.7 Verify
```bash
cd packages/python
poetry run pytest tests/test_{module}.py -v
```

## Phase 3: Node.js SDK Implementation

### 3.1 Create Module Structure
```
packages/node/src/{module}/
├── index.ts
├── types.ts
├── client.ts
└── errors.ts
```

### 3.2 Implement Types
- Define interfaces for all models
- Define request/response types
- Export from types.ts

### 3.3 Implement Client
- Create client class
- Implement async methods
- Add TypeScript types
- Handle errors properly

### 3.4 Implement Errors
- Create error classes
- Extend base SDK errors

### 3.5 Update Exports
- Export from index.ts
- Update main src/index.ts

### 3.6 Write Tests
```
packages/node/src/{module}/*.test.ts
```
- Unit tests with mocked fetch
- Test all methods
- Test error cases

### 3.7 Verify
```bash
cd packages/node
npm test
```

## Phase 4: Java SDK Implementation

### 4.1 Create Module Structure
```
packages/java/src/main/java/com/platform/sdk/{module}/
├── {Model}.java           # One per model
├── {Module}Client.java    # Main client
└── {Module}Exception.java # Exceptions
```

### 4.2 Implement Models
- Create Java classes with fields
- Add getters/setters or use records
- Implement Builder pattern for complex objects
- Add Jackson annotations for JSON

### 4.3 Implement Client
- Create client with Builder pattern
- Implement CRUD methods
- Handle exceptions properly
- Add JavaDoc comments

### 4.4 Implement Exceptions
- Create exception hierarchy
- Extend base SDK exceptions

### 4.5 Write Tests
```
packages/java/src/test/java/com/platform/sdk/{module}/
```
- JUnit 5 tests
- Mockito for mocking
- Test all methods

### 4.6 Verify
```bash
cd packages/java
mvn test
```

## Phase 5: Cross-Language Verification

### 5.1 Consistency Check
- [ ] Method names follow language conventions
- [ ] Parameter ordering consistent
- [ ] Return types equivalent
- [ ] Exception types mapped correctly
- [ ] Module structure parallel

### 5.2 Run All Tests
```bash
# Python
cd packages/python && poetry run pytest

# Node.js
cd packages/node && npm test

# Java
cd packages/java && mvn test
```

### 5.3 Documentation Review
- [ ] README updated if needed
- [ ] API docs generated
- [ ] Code examples work

## Phase 6: Commit & Review

### 6.1 Commit Changes
```bash
git add .
git commit -m "feat({module}): add {module} module to SDK

- Add YAML models and OpenAPI spec
- Implement Python SDK with tests
- Implement Node.js SDK with tests
- Implement Java SDK with tests"
```

### 6.2 Code Review
Use skills:
- `sdk-design-reviewer` for cross-language consistency
- `python-reviewer` for Python code
- `typescript-reviewer` for Node.js code
- `java-reviewer` for Java code
- `unit-testing-reviewer` for test coverage

## Quick Reference

### File Naming Conventions

| Language | Client | Model | Exception |
|----------|--------|-------|-----------|
| Python | `client.py` | `models.py` | `exceptions.py` |
| Node.js | `client.ts` | `types.ts` | `errors.ts` |
| Java | `{Module}Client.java` | `{Model}.java` | `{Module}Exception.java` |

### Test Commands

```bash
# Run all tests
cd packages/python && poetry run pytest
cd packages/node && npm test
cd packages/java && mvn test

# Run specific module tests
cd packages/python && poetry run pytest tests/test_{module}.py
cd packages/node && npm test -- --grep "{module}"
cd packages/java && mvn test -Dtest="{Module}*Test"
```
