# Unit Testing Review Skill

## Purpose
Review unit tests across all SDK languages for coverage, quality, and best practices.

## When to Use
- After writing new unit tests
- When reviewing test coverage
- Before merging code with new functionality

## Review Checklist

### Test Structure
- [ ] Tests follow Arrange-Act-Assert pattern
- [ ] Each test focuses on single behavior
- [ ] Test names describe expected behavior
- [ ] Setup/teardown properly used
- [ ] Tests are independent (no shared state)

### Coverage
- [ ] All public methods have tests
- [ ] Happy path covered
- [ ] Error cases covered
- [ ] Edge cases covered (null, empty, boundary values)
- [ ] Exception throwing tested

### Mocking
- [ ] HTTP calls mocked (not hitting real APIs)
- [ ] External dependencies mocked
- [ ] Mock responses match real API responses
- [ ] Mock verification for important calls

### Assertions
- [ ] Specific assertions (not just "not null")
- [ ] Error messages helpful for debugging
- [ ] All relevant fields verified
- [ ] Exception type and message verified

## Language-Specific Patterns

### Python (pytest)
```python
import pytest
from unittest.mock import Mock, patch
from shared_platform.users import UserClient, UserNotFoundError

class TestUserClient:
    @pytest.fixture
    def client(self):
        return UserClient(base_url="https://api.example.com")

    @pytest.fixture
    def mock_http(self):
        with patch.object(UserClient, '_http_client') as mock:
            yield mock

    def test_get_user_returns_user(self, client, mock_http):
        # Arrange
        mock_http.get.return_value = {"id": "123", "name": "Test"}

        # Act
        user = client.get("123")

        # Assert
        assert user.id == "123"
        assert user.name == "Test"

    def test_get_user_not_found_raises_exception(self, client, mock_http):
        # Arrange
        mock_http.get.side_effect = ApiException(404, "Not found")

        # Act & Assert
        with pytest.raises(UserNotFoundError) as exc:
            client.get("invalid")
        assert "invalid" in str(exc.value)
```

### TypeScript (Jest/Vitest)
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserClient, UserNotFoundError } from '../src/users';

describe('UserClient', () => {
  let client: UserClient;
  let mockFetch: vi.Mock;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
    client = new UserClient({ baseUrl: 'https://api.example.com' });
  });

  it('should return user when found', async () => {
    // Arrange
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '123', name: 'Test' })
    });

    // Act
    const user = await client.get('123');

    // Assert
    expect(user.id).toBe('123');
    expect(user.name).toBe('Test');
  });

  it('should throw UserNotFoundError when user not found', async () => {
    // Arrange
    mockFetch.mockResolvedValue({ ok: false, status: 404 });

    // Act & Assert
    await expect(client.get('invalid')).rejects.toThrow(UserNotFoundError);
  });
});
```

### Java (JUnit 5 + Mockito)
```java
import org.junit.jupiter.api.*;
import org.mockito.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class UserClientTest {
    @Mock
    private HttpClient httpClient;

    @InjectMocks
    private UserClient userClient;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getUser_returnsUser_whenFound() throws ApiException {
        // Arrange
        User expected = new User("123", "Test");
        when(httpClient.get("/users/123", User.class)).thenReturn(expected);

        // Act
        User result = userClient.get("123");

        // Assert
        assertEquals("123", result.getId());
        assertEquals("Test", result.getName());
    }

    @Test
    void getUser_throwsUserNotFoundException_whenNotFound() {
        // Arrange
        when(httpClient.get("/users/invalid", User.class))
            .thenThrow(new ApiException(404, "Not found"));

        // Act & Assert
        UserNotFoundException ex = assertThrows(
            UserNotFoundException.class,
            () -> userClient.get("invalid")
        );
        assertTrue(ex.getMessage().contains("invalid"));
    }
}
```

## Test File Locations
- Python: `packages/python/tests/`
- Node.js: `packages/node/src/**/*.test.ts`
- Java: `packages/java/src/test/java/`
