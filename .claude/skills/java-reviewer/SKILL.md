# Java Code Review Skill

## Purpose
Review Java code in the Java SDK for type safety, best practices, and consistency.

## When to Use
- After implementing new Java features in `packages/java/`
- When modifying existing Java code
- Before committing Java changes

## Review Checklist

### Code Quality
- [ ] Follows Java naming conventions (camelCase for methods, PascalCase for classes)
- [ ] Proper use of access modifiers (private, public, protected)
- [ ] Final fields for immutable data
- [ ] No unused imports
- [ ] Proper JavaDoc for public APIs
- [ ] Consistent indentation and formatting

### SDK Patterns
- [ ] Client classes use Builder pattern
- [ ] DTOs use immutable design where possible
- [ ] Exceptions extend base SDK exception hierarchy
- [ ] Proper use of generics
- [ ] Consistent null handling (Optional or null checks)

### Design Patterns
- [ ] Builder pattern for complex object construction
- [ ] Factory pattern for creating related objects
- [ ] Singleton avoided unless necessary (prefer dependency injection)
- [ ] Interface segregation for client contracts

### Exception Handling
- [ ] Custom exceptions extend base SDK exception
- [ ] HTTP status codes mapped to specific exceptions
- [ ] No swallowed exceptions
- [ ] Descriptive error messages

## Common Issues

### Avoid
```java
// Bad: No null safety
public User getUser(String id) {
    return httpClient.get("/users/" + id, User.class);
}

// Bad: Mutable DTO
public class UserRequest {
    public String name;  // Public mutable field
}

// Bad: Swallowed exception
try {
    return client.fetch();
} catch (Exception e) {
    return null;
}
```

### Prefer
```java
// Good: Null handling with exception
public User getUser(String id) throws ApiException {
    try {
        return httpClient.get("/users/" + id, User.class);
    } catch (ApiException e) {
        if (e.getStatusCode() == 404) {
            throw new UserNotFoundException(id);
        }
        throw e;
    }
}

// Good: Immutable DTO with Builder
public class UserRequest {
    private final String name;

    private UserRequest(Builder builder) {
        this.name = builder.name;
    }

    public static class Builder {
        private String name;
        public Builder name(String name) {
            this.name = name;
            return this;
        }
        public UserRequest build() {
            return new UserRequest(this);
        }
    }
}

// Good: Proper exception handling
try {
    return client.fetch();
} catch (ApiException e) {
    logger.error("API error: {}", e.getMessage());
    throw e;
}
```

## File Patterns
- `packages/java/src/main/java/com/platform/sdk/**/*.java` - Source files
- `packages/java/src/test/java/com/platform/sdk/**/*.java` - Test files
- `packages/java/pom.xml` - Maven configuration
