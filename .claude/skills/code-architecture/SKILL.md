# Code Architecture Skill

## Purpose
Review and design SDK architecture for maintainability, extensibility, and consistency.

## When to Use
- When designing new SDK modules
- When refactoring existing code
- When reviewing architectural decisions
- When planning major features

## Architecture Principles

### Single Responsibility
- Each class has one reason to change
- Clients handle API communication
- Models handle data representation
- Exceptions handle error cases

### Open/Closed
- Open for extension (new modules)
- Closed for modification (stable interfaces)
- Use inheritance/composition for variants

### Dependency Inversion
- Depend on abstractions, not concretions
- HTTP client injected, not hardcoded
- Configuration externalized

### Interface Segregation
- Small, focused interfaces
- Clients expose only relevant methods
- No "god" classes

## SDK Module Architecture

```
Module Structure:
├── models/          # Data transfer objects
├── client.ts        # API client implementation
├── types.ts         # Type definitions (TS) / interfaces
├── errors.ts        # Module-specific exceptions
└── index.ts         # Public exports
```

### Layer Responsibilities

**Client Layer**
- HTTP request/response handling
- Authentication header injection
- Error translation
- Response deserialization

**Model Layer**
- Data representation
- Serialization/deserialization
- Validation logic
- Type safety

**Exception Layer**
- Specific error types
- Error context preservation
- HTTP status mapping

## Design Patterns Used

### Builder Pattern (Client Construction)
```java
UserClient client = new UserClient.Builder()
    .baseUrl("https://api.example.com")
    .accessToken("token")
    .timeout(Duration.ofSeconds(30))
    .build();
```

### Factory Pattern (Response Creation)
```typescript
class ResponseFactory {
  static createUser(data: unknown): User {
    // Validate and create
    return new User(data);
  }
}
```

### Strategy Pattern (Authentication)
```python
class AuthStrategy(ABC):
    @abstractmethod
    def authenticate(self, request: Request) -> Request:
        pass

class BearerAuth(AuthStrategy):
    def authenticate(self, request: Request) -> Request:
        request.headers["Authorization"] = f"Bearer {self.token}"
        return request
```

## Cross-Cutting Concerns

### Logging
- Configurable log levels
- Request/response logging (sanitized)
- Error logging with context
- No sensitive data in logs

### Retry Logic
- Exponential backoff
- Configurable retry count
- Only retry transient errors
- Circuit breaker pattern

### Caching
- Optional response caching
- Cache invalidation strategy
- TTL-based expiration

## Module Dependency Graph

```
                    ┌─────────────┐
                    │   common    │
                    │ (HttpClient,│
                    │ Exceptions) │
                    └──────┬──────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
    ▼                      ▼                      ▼
┌───────┐            ┌───────────┐          ┌──────────┐
│ auth  │◄───────────│   users   │─────────►│  teams   │
└───────┘            └───────────┘          └──────────┘
    │                      │                      │
    ▼                      ▼                      ▼
┌───────┐            ┌───────────┐          ┌──────────┐
│ roles │            │invitations│          │ webhooks │
└───────┘            └───────────┘          └──────────┘
```

## Configuration Architecture

```yaml
# Configuration hierarchy
defaults:
  timeout: 30000
  retries: 3

environments:
  development:
    baseUrl: http://localhost:3000
  staging:
    baseUrl: https://staging.api.com
  production:
    baseUrl: https://api.com
    timeout: 60000
```

## Extensibility Points

### Custom HTTP Client
```typescript
interface HttpClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  // ...
}

// Users can provide custom implementation
const client = new UserClient({
  httpClient: new CustomHttpClient()
});
```

### Middleware/Interceptors
```typescript
client.use((request, next) => {
  // Pre-request logic
  const response = await next(request);
  // Post-response logic
  return response;
});
```
