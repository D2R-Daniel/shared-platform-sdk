# API Client Review Skill

## Purpose
Review API client implementations for proper HTTP handling, authentication, and error management.

## When to Use
- When implementing new API client classes
- When modifying HTTP client behavior
- When adding new endpoints to existing clients

## Review Checklist

### HTTP Client Design
- [ ] Base HTTP client handles common concerns (auth, headers, retries)
- [ ] Timeout configuration available
- [ ] Base URL configurable
- [ ] Proper Content-Type headers (application/json)
- [ ] Request/response logging capability

### Authentication
- [ ] Access token can be set after client creation
- [ ] Authorization header properly formatted
- [ ] Token refresh handling (if applicable)
- [ ] Secure token storage recommendations in docs

### Request Handling
- [ ] Query parameters properly URL-encoded
- [ ] Path parameters properly escaped
- [ ] Request body serialized to JSON
- [ ] Large payloads handled appropriately
- [ ] Multipart form data for file uploads

### Response Handling
- [ ] Response deserialized to typed objects
- [ ] HTTP status codes properly interpreted
- [ ] Empty responses handled (204 No Content)
- [ ] Pagination metadata extracted

### Error Handling
- [ ] Network errors caught and wrapped
- [ ] HTTP errors converted to SDK exceptions
- [ ] Error response body parsed for details
- [ ] Retry logic for transient failures (429, 503)
- [ ] Timeout errors handled

## HTTP Client Patterns

### Python (httpx)
```python
class HttpClient:
    def __init__(self, base_url: str, timeout: float = 30.0):
        self._client = httpx.Client(
            base_url=base_url,
            timeout=timeout,
            headers={"Content-Type": "application/json"}
        )

    def get(self, path: str, response_type: type[T]) -> T:
        response = self._client.get(path)
        response.raise_for_status()
        return response_type(**response.json())
```

### TypeScript (fetch/axios)
```typescript
class HttpClient {
  constructor(
    private baseUrl: string,
    private timeout: number = 30000
  ) {}

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new ApiException(response.status, await response.text());
    }
    return response.json() as T;
  }
}
```

### Java (HttpClient)
```java
public class HttpClient {
    private final java.net.http.HttpClient client;
    private final String baseUrl;
    private final ObjectMapper mapper;

    public <T> T get(String path, Class<T> responseType) throws ApiException {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + path))
            .header("Content-Type", "application/json")
            .GET()
            .build();
        HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            throw new ApiException(response.statusCode(), response.body());
        }
        return mapper.readValue(response.body(), responseType);
    }
}
```

## Common Endpoint Patterns

| Operation | HTTP Method | Path Pattern | Returns |
|-----------|-------------|--------------|---------|
| List | GET | `/resources` | ListResponse |
| Get | GET | `/resources/{id}` | Resource |
| Create | POST | `/resources` | Resource |
| Update | PUT | `/resources/{id}` | Resource |
| Patch | PATCH | `/resources/{id}` | Resource |
| Delete | DELETE | `/resources/{id}` | void |

## Error Status Mapping

| Status | Exception | Retry |
|--------|-----------|-------|
| 400 | ValidationError | No |
| 401 | AuthenticationError | No |
| 403 | AuthorizationError | No |
| 404 | NotFoundError | No |
| 409 | ConflictError | No |
| 429 | RateLimitError | Yes (with backoff) |
| 500 | ServerError | Yes (limited) |
| 502, 503, 504 | ServerError | Yes (with backoff) |
