# SDK Design Review Skill

## Purpose
Review SDK design decisions for consistency, usability, and cross-language compatibility.

## When to Use
- When adding new modules to the SDK
- When designing new API client interfaces
- When reviewing cross-language consistency
- Before major SDK releases

## Review Checklist

### Cross-Language Consistency
- [ ] Same method names across Python, Node.js, and Java (accounting for naming conventions)
- [ ] Same parameter ordering across languages
- [ ] Same return type structures (mapped to language idioms)
- [ ] Same exception hierarchy
- [ ] Same module/package structure

### API Design
- [ ] Methods follow CRUD naming: `create`, `get`, `list`, `update`, `delete`
- [ ] Consistent pagination pattern (`page`, `pageSize`, `total`)
- [ ] Consistent filtering patterns
- [ ] Optional parameters use language-appropriate patterns (kwargs, options object, builder)
- [ ] Fluent interfaces where appropriate

### Model Design
- [ ] Models match YAML definitions in `models/` directory
- [ ] Models match OpenAPI specs in `openapi/` directory
- [ ] Proper serialization/deserialization
- [ ] Consistent date/time handling (ISO 8601)
- [ ] UUID handling consistent across languages

### Error Handling
- [ ] Base exception class in each language
- [ ] Module-specific exceptions extend base
- [ ] HTTP status codes mapped consistently:
  - 400 → ValidationError
  - 401 → AuthenticationError
  - 403 → AuthorizationError
  - 404 → NotFoundError
  - 429 → RateLimitError
  - 5xx → ServerError

### Documentation
- [ ] OpenAPI spec exists for new endpoints
- [ ] YAML model definitions exist
- [ ] Code examples in docstrings/comments
- [ ] README updated if needed

## Naming Convention Mapping

| Concept | Python | TypeScript | Java |
|---------|--------|------------|------|
| Method | `get_user` | `getUser` | `getUser` |
| Class | `UserClient` | `UserClient` | `UserClient` |
| Constant | `MAX_RETRIES` | `MAX_RETRIES` | `MAX_RETRIES` |
| File | `user_client.py` | `userClient.ts` | `UserClient.java` |
| Exception | `UserNotFoundError` | `UserNotFoundError` | `UserNotFoundException` |

## Module Structure Template

```
packages/
├── python/src/shared_platform/{module}/
│   ├── __init__.py      # Exports
│   ├── models.py        # Data models
│   ├── client.py        # API client
│   └── exceptions.py    # Module exceptions
├── node/src/{module}/
│   ├── index.ts         # Exports
│   ├── types.ts         # Type definitions
│   ├── client.ts        # API client
│   └── errors.ts        # Module exceptions
└── java/src/main/java/com/platform/sdk/{module}/
    ├── *Client.java     # API client
    ├── *.java           # Model classes
    └── *Exception.java  # Exception classes
```

## Checklist for New Modules

1. [ ] YAML model definition in `models/{module}/`
2. [ ] OpenAPI spec in `openapi/{module}/`
3. [ ] Python implementation with tests
4. [ ] Node.js implementation with tests
5. [ ] Java implementation with tests
6. [ ] Exports added to main package index
7. [ ] All tests passing
