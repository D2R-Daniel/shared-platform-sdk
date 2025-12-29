# Security Review Skill

## Purpose
Review SDK code for security vulnerabilities and best practices.

## When to Use
- When reviewing authentication code
- When handling sensitive data
- When making HTTP requests
- Before security-sensitive releases

## Review Checklist

### Authentication & Authorization
- [ ] Tokens not logged or exposed in errors
- [ ] Tokens stored securely (not in code)
- [ ] Token transmission over HTTPS only
- [ ] Token validation on every request
- [ ] Proper token expiration handling

### Data Handling
- [ ] Sensitive data not logged
- [ ] PII handled according to requirements
- [ ] Passwords never stored in plaintext
- [ ] API keys masked in logs/errors
- [ ] Secure random number generation

### HTTP Security
- [ ] HTTPS enforced (no HTTP fallback)
- [ ] Certificate validation enabled
- [ ] No sensitive data in URLs
- [ ] Proper timeout configuration
- [ ] Request size limits

### Input Validation
- [ ] All inputs validated
- [ ] SQL injection prevention (parameterized queries)
- [ ] Command injection prevention
- [ ] Path traversal prevention
- [ ] XSS prevention (if applicable)

### Dependencies
- [ ] No known vulnerable dependencies
- [ ] Dependencies regularly updated
- [ ] Minimal dependency footprint
- [ ] Trusted sources only

## Common Vulnerabilities

### Token Exposure
```python
# BAD: Token in log
logger.info(f"Request with token: {token}")

# GOOD: Token masked
logger.info(f"Request with token: {token[:8]}...")
```

### Sensitive Data in URLs
```python
# BAD: Token in query parameter
requests.get(f"/api?token={token}")

# GOOD: Token in header
requests.get("/api", headers={"Authorization": f"Bearer {token}"})
```

### Insecure Random
```python
# BAD: Predictable random
import random
token = random.randint(0, 999999)

# GOOD: Cryptographic random
import secrets
token = secrets.token_hex(32)
```

### Path Traversal
```python
# BAD: Unsanitized path
file_path = f"/uploads/{user_input}"

# GOOD: Validated path
import os
safe_name = os.path.basename(user_input)
file_path = f"/uploads/{safe_name}"
```

## SDK-Specific Security

### API Key Generation
```python
# Format: sk_live_<32-char-hex> or sk_test_<32-char-hex>
import secrets
key = f"sk_live_{secrets.token_hex(16)}"
```

### Webhook Signature Verification
```python
import hmac
import hashlib

def verify_signature(payload: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)
```

### Secure Token Storage Recommendations

Document that users should:
- Store tokens in environment variables
- Use secret management services (AWS Secrets Manager, HashiCorp Vault)
- Never commit tokens to source control
- Rotate tokens regularly

## Dependency Scanning

### Python
```bash
# Using pip-audit
pip install pip-audit
pip-audit

# Using safety
pip install safety
safety check
```

### Node.js
```bash
npm audit
npm audit fix
```

### Java
```bash
# Using OWASP Dependency-Check
mvn org.owasp:dependency-check-maven:check
```

## Security Headers

When documenting API usage, recommend:

```
Content-Type: application/json
Authorization: Bearer <token>
X-Request-ID: <uuid>  # For tracing
```
