# Integration Testing Review Skill

## Purpose
Review integration tests that verify SDK interaction with real or simulated APIs.

## When to Use
- After writing integration tests
- When testing against staging environments
- When verifying end-to-end SDK functionality

## Review Checklist

### Test Environment
- [ ] Tests use dedicated test environment/credentials
- [ ] No production credentials in test code
- [ ] Environment variables for configuration
- [ ] Cleanup of test data after tests
- [ ] Isolation between test runs

### API Integration
- [ ] Tests verify actual HTTP requests/responses
- [ ] Authentication flow tested
- [ ] Pagination tested with real data
- [ ] Rate limiting handled appropriately
- [ ] Error responses from real API tested

### Data Management
- [ ] Test data created during setup
- [ ] Test data cleaned up in teardown
- [ ] Unique identifiers to avoid conflicts
- [ ] No hardcoded IDs that may not exist

### Reliability
- [ ] Retries for flaky network issues
- [ ] Timeouts configured appropriately
- [ ] Tests can run in parallel (if isolated)
- [ ] Deterministic assertions (avoid timing issues)

## Integration Test Patterns

### Python
```python
import pytest
import os
from shared_platform import PlatformClient

@pytest.fixture(scope="module")
def client():
    """Create client with test credentials."""
    return PlatformClient(
        base_url=os.environ["TEST_API_URL"],
        access_token=os.environ["TEST_ACCESS_TOKEN"]
    )

@pytest.fixture
def test_user(client):
    """Create and cleanup test user."""
    user = client.users.create({
        "email": f"test-{uuid4()}@example.com",
        "name": "Integration Test User"
    })
    yield user
    # Cleanup
    try:
        client.users.delete(user.id)
    except Exception:
        pass

class TestUserIntegration:
    def test_create_and_get_user(self, client, test_user):
        # Verify user was created
        fetched = client.users.get(test_user.id)
        assert fetched.id == test_user.id
        assert fetched.email == test_user.email

    def test_list_users_includes_created_user(self, client, test_user):
        users = client.users.list()
        user_ids = [u.id for u in users.data]
        assert test_user.id in user_ids

    def test_update_user(self, client, test_user):
        updated = client.users.update(test_user.id, {"name": "Updated Name"})
        assert updated.name == "Updated Name"
```

### TypeScript
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PlatformClient } from '../src';

describe('User Integration Tests', () => {
  let client: PlatformClient;
  let testUserId: string;

  beforeAll(() => {
    client = new PlatformClient({
      baseUrl: process.env.TEST_API_URL!,
      accessToken: process.env.TEST_ACCESS_TOKEN!
    });
  });

  afterAll(async () => {
    if (testUserId) {
      await client.users.delete(testUserId).catch(() => {});
    }
  });

  it('should create a user', async () => {
    const user = await client.users.create({
      email: `test-${Date.now()}@example.com`,
      name: 'Integration Test'
    });
    testUserId = user.id;
    expect(user.id).toBeDefined();
  });

  it('should get created user', async () => {
    const user = await client.users.get(testUserId);
    expect(user.id).toBe(testUserId);
  });
});
```

### Java
```java
@TestMethodOrder(OrderAnnotation.class)
class UserIntegrationTest {
    private static PlatformClient client;
    private static String testUserId;

    @BeforeAll
    static void setup() {
        client = new PlatformClient.Builder()
            .baseUrl(System.getenv("TEST_API_URL"))
            .accessToken(System.getenv("TEST_ACCESS_TOKEN"))
            .build();
    }

    @AfterAll
    static void cleanup() {
        if (testUserId != null) {
            try {
                client.users().delete(testUserId);
            } catch (Exception ignored) {}
        }
    }

    @Test
    @Order(1)
    void createUser() throws ApiException {
        CreateUserRequest request = new CreateUserRequest.Builder()
            .email("test-" + UUID.randomUUID() + "@example.com")
            .name("Integration Test")
            .build();
        User user = client.users().create(request);
        testUserId = user.getId();
        assertNotNull(testUserId);
    }

    @Test
    @Order(2)
    void getCreatedUser() throws ApiException {
        User user = client.users().get(testUserId);
        assertEquals(testUserId, user.getId());
    }
}
```

## Environment Configuration
```bash
# .env.test
TEST_API_URL=https://api-staging.example.com
TEST_ACCESS_TOKEN=test_token_xxx
TEST_TIMEOUT=30000
```
