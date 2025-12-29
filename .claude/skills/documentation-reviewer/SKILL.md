# Documentation Review Skill

## Purpose
Review SDK documentation for completeness, accuracy, and usability.

## When to Use
- After adding new SDK features
- When updating README files
- When writing API documentation
- Before releases

## Review Checklist

### Code Documentation
- [ ] All public classes have doc comments
- [ ] All public methods have doc comments
- [ ] Parameters documented with types and descriptions
- [ ] Return values documented
- [ ] Exceptions documented
- [ ] Code examples in doc comments

### README Quality
- [ ] Installation instructions clear
- [ ] Quick start example works
- [ ] All major features documented
- [ ] Configuration options explained
- [ ] Links to detailed documentation

### API Reference
- [ ] OpenAPI specs up to date
- [ ] All endpoints documented
- [ ] Request/response examples provided
- [ ] Error responses documented
- [ ] Authentication explained

### Examples
- [ ] Examples compile/run without modification
- [ ] Examples cover common use cases
- [ ] Examples handle errors appropriately
- [ ] Examples use realistic data

## Documentation Standards by Language

### Python (Google-style docstrings)
```python
def create_user(self, request: CreateUserRequest) -> User:
    """Create a new user.

    Creates a new user in the system with the specified details.

    Args:
        request: The user creation request containing name and email.

    Returns:
        The created user object.

    Raises:
        ValidationError: If the request data is invalid.
        ConflictError: If a user with the same email already exists.

    Example:
        >>> client = UserClient(base_url="https://api.example.com")
        >>> user = client.create_user(CreateUserRequest(
        ...     name="John Doe",
        ...     email="john@example.com"
        ... ))
        >>> print(user.id)
        'usr_123abc'
    """
```

### TypeScript (TSDoc)
```typescript
/**
 * Create a new user.
 *
 * Creates a new user in the system with the specified details.
 *
 * @param request - The user creation request containing name and email
 * @returns The created user object
 * @throws {ValidationError} If the request data is invalid
 * @throws {ConflictError} If a user with the same email already exists
 *
 * @example
 * ```typescript
 * const client = new UserClient({ baseUrl: 'https://api.example.com' });
 * const user = await client.createUser({
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * });
 * console.log(user.id); // 'usr_123abc'
 * ```
 */
async createUser(request: CreateUserRequest): Promise<User>
```

### Java (Javadoc)
```java
/**
 * Create a new user.
 *
 * <p>Creates a new user in the system with the specified details.
 *
 * @param request the user creation request containing name and email
 * @return the created user object
 * @throws ValidationException if the request data is invalid
 * @throws ConflictException if a user with the same email already exists
 *
 * <pre>{@code
 * UserClient client = new UserClient.Builder()
 *     .baseUrl("https://api.example.com")
 *     .build();
 * User user = client.createUser(new CreateUserRequest.Builder()
 *     .name("John Doe")
 *     .email("john@example.com")
 *     .build());
 * System.out.println(user.getId()); // "usr_123abc"
 * }</pre>
 */
public User createUser(CreateUserRequest request) throws ApiException
```

## README Template

```markdown
# Shared Platform SDK - {Language}

## Installation

{Package manager install command}

## Quick Start

{Minimal working example}

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| baseUrl | string | - | API base URL (required) |
| accessToken | string | - | Authentication token |
| timeout | number | 30000 | Request timeout in ms |

## Modules

- [Users](./docs/users.md) - User management
- [Auth](./docs/auth.md) - Authentication
- [Teams](./docs/teams.md) - Team management

## Error Handling

{Common error handling patterns}

## Contributing

{Contribution guidelines}
```
