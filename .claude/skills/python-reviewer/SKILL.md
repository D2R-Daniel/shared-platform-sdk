# Python Code Review Skill

## Purpose
Review Python code in the Python SDK for type hints, best practices, and PEP compliance.

## When to Use
- After implementing new Python features in `packages/python/`
- When modifying existing Python code
- Before committing Python changes

## Review Checklist

### Type Hints
- [ ] All function parameters have type hints
- [ ] Return types are annotated
- [ ] Uses `from __future__ import annotations` for forward references
- [ ] Proper use of Optional, Union, List, Dict from typing
- [ ] Generic types used where applicable
- [ ] TypedDict for complex dictionary structures

### Code Quality
- [ ] Follows PEP 8 naming conventions (snake_case)
- [ ] Docstrings for public classes and methods (Google style)
- [ ] No unused imports
- [ ] Proper use of `@dataclass` for data models
- [ ] Uses `@property` for computed attributes
- [ ] Context managers for resource management

### SDK Patterns
- [ ] Client classes use `httpx` for HTTP calls
- [ ] Models use Pydantic or dataclasses
- [ ] Exceptions inherit from base SDK exception
- [ ] Proper `__init__.py` exports
- [ ] Type stubs (`.pyi`) if needed for complex types

### Error Handling
- [ ] Custom exceptions extend SDKException base class
- [ ] HTTP errors properly caught and re-raised
- [ ] Error messages are descriptive
- [ ] No bare `except:` clauses

## Common Issues

### Avoid
```python
# Bad: No type hints
def get_user(user_id):
    return self._client.get(f"/users/{user_id}")

# Bad: Mutable default argument
def process(items=[]):
    items.append("new")

# Bad: Bare except
try:
    result = client.fetch()
except:
    pass
```

### Prefer
```python
# Good: Type hints
def get_user(self, user_id: str) -> User:
    return self._client.get(f"/users/{user_id}", response_type=User)

# Good: None default
def process(items: list[str] | None = None) -> list[str]:
    items = items or []
    items.append("new")
    return items

# Good: Specific exception handling
try:
    result = client.fetch()
except ApiException as e:
    logger.error(f"API error: {e}")
    raise
```

## File Patterns
- `packages/python/src/shared_platform/**/*.py` - Source files
- `packages/python/src/shared_platform/**/models.py` - Data models
- `packages/python/src/shared_platform/**/exceptions.py` - Exception classes
- `packages/python/src/shared_platform/**/client.py` - Client implementations
