# Auth & Security Modules - Comprehensive Requirements Specification

**Version**: 1.0.0
**Date**: 2026-02-06
**Status**: Draft
**Authors**: Platform SDK Team
**Reviewers**: Security Team, Product Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Authentication Module Enhancements (Existing)](#2-authentication-module-enhancements)
3. [MFA/2FA Module (P1 - New)](#3-mfa2fa-module)
4. [Passwordless Auth Module (P2 - New)](#4-passwordless-auth-module)
5. [Passkeys/WebAuthn Module (P2 - New)](#5-passkeyswebauthn-module)
6. [Session Management Module (P2 - New)](#6-session-management-module)
7. [Breached Password Check Module (P4 - New)](#7-breached-password-check-module)
8. [Cross-Cutting Concerns](#8-cross-cutting-concerns)
9. [Appendix: Competitive Feature Matrix](#9-appendix-competitive-feature-matrix)

---

## 1. Executive Summary

This specification defines requirements for six auth and security modules in the Shared Platform SDK. The goal is to achieve competitive parity with Auth0, Clerk, WorkOS, Firebase Auth, and Supabase Auth while establishing differentiation through superior developer experience, cross-language consistency, and composable design.

### Scope

| Module | Priority | Status | Target |
|--------|----------|--------|--------|
| Authentication (enhanced) | P0 | Existing - needs enhancements | GA |
| MFA/2FA | P1 | New | GA |
| Passwordless Auth | P2 | New | GA |
| Passkeys/WebAuthn | P2 | New | GA |
| Session Management | P2 | New | GA |
| Breached Password Check | P4 | New | GA |

### Drivers

- **Competitive parity**: Auth0, Clerk, and WorkOS all ship MFA, passwordless, and session management as standard. Our current SDK only covers basic OAuth2 flows.
- **Customer requests**: Enterprise customers have explicitly requested MFA enforcement, session management, and passkey support.
- **Platform maturity**: These modules are table-stakes for a GA-ready identity platform competing in the CIAM space.

### Existing Auth Module Capabilities (Baseline)

The current `AuthClient` provides:
- OAuth2 password grant login
- Token refresh (access + refresh tokens)
- Token revocation and introspection
- OIDC UserInfo endpoint
- JWT-based UserContext extraction (with role/permission helpers)
- Basic session listing and termination
- Logout

All three SDKs (Python, TypeScript, Java) implement these features consistently.

---

## 2. Authentication Module Enhancements

### Overview

The existing Authentication module covers basic OAuth2/OIDC flows. To reach competitive parity, it needs enhancements for authorization code flow with PKCE (browser/mobile), client credentials flow (machine-to-machine), step-up authentication triggers, adaptive/risk-based authentication signals, and improved JWT validation with JWKS auto-rotation.

### Competitive Analysis

| Feature | Auth0 | Clerk | WorkOS | Firebase | Supabase | Our SDK |
|---------|-------|-------|--------|----------|----------|---------|
| Authorization Code + PKCE | Yes | Yes | Yes (AuthKit) | Yes | Yes | Partial |
| Client Credentials (M2M) | Yes | Yes | Yes | Yes (service accounts) | Yes (service role) | Not implemented |
| Step-up Authentication | Yes | No | No | No | No | No |
| Adaptive/Risk-based Auth | Yes (Adaptive MFA) | Partial (Client Trust) | No | No | No | No |
| JWKS Auto-rotation | Yes | Yes | Yes | Yes | Yes | No |
| Token Binding | Yes | Yes (session binding) | Yes (sealed sessions) | No | No | No |
| Social Login Orchestration | Yes (50+ providers) | Yes (20+ providers) | Yes (Google, Microsoft, GitHub, Apple) | Yes (15+ providers) | Yes (20+ providers) | No |
| Anonymous Authentication | No | No | No | Yes | Yes | No |
| Device Authorization Flow | Yes | No | No | No | No | No |

**Key gaps vs. competitors**:
- Auth0 leads with Adaptive MFA and step-up authentication -- these are enterprise differentiators
- Clerk and WorkOS offer turnkey social login that our SDK does not orchestrate
- Firebase and Supabase offer anonymous auth, useful for progressive profiling
- All competitors auto-rotate JWKS; our SDK does not yet implement JWKS fetching with caching

### Requirements

#### Core Features (Must Have)

1. **Authorization Code Flow with PKCE**
   - Full support for browser and mobile OAuth2 flows
   - PKCE code verifier/challenge generation
   - State parameter generation and validation (CSRF protection)
   - Authorization URL builder with configurable scopes, audience, and redirect URI
   - Code exchange for tokens
   - API methods:
     - `buildAuthorizationUrl(options)` -- generate redirect URL with PKCE
     - `exchangeCode(code, codeVerifier, redirectUri)` -- exchange auth code for tokens
   - Models: `AuthorizationUrlOptions`, `PKCEChallenge`

2. **Client Credentials Flow (Machine-to-Machine)**
   - Service-to-service authentication without user interaction
   - Configurable audience and scopes
   - Auto-caching of M2M tokens with TTL-based expiry
   - API methods:
     - `getClientCredentialsToken(options)` -- obtain M2M access token
   - Models: `ClientCredentialsOptions`

3. **JWKS Auto-Rotation and Signature Verification**
   - Fetch JWKS from `/.well-known/jwks.json`
   - Cache JWKS with configurable TTL (default: 1 hour)
   - Auto-refresh on key-not-found (handle key rotation)
   - Full JWT signature verification (RS256, RS384, RS512, ES256, ES384, ES512)
   - API methods:
     - `validateToken(token, options)` -- verify token signature + claims
     - `getSigningKeys()` -- fetch/cache JWKS
   - Models: `TokenValidationOptions` (audience, issuer, algorithms, clockTolerance)

4. **OIDC Discovery**
   - Auto-discovery via `/.well-known/openid-configuration`
   - Cache discovered endpoints
   - API methods:
     - `discover()` -- fetch and cache OIDC configuration
   - Models: `OIDCDiscoveryDocument`

#### Enhanced Features (Should Have)

5. **Step-Up Authentication**
   - Request elevated authentication level for sensitive operations
   - Check current authentication assurance level (AAL) from token claims
   - Trigger re-authentication with specific factors
   - API methods:
     - `requireStepUp(accessToken, aclLevel)` -- check and trigger step-up
     - `getAssuranceLevel(accessToken)` -- extract AAL from token
   - Models: `AssuranceLevel` (enum: aal1, aal2, aal3), `StepUpRequest`

6. **Social Login URL Builder**
   - Generate OAuth2 redirect URLs for social providers
   - Support for Google, Microsoft, GitHub, Apple, Facebook, LinkedIn, Twitter/X, Slack
   - Configurable scopes per provider
   - API methods:
     - `buildSocialLoginUrl(provider, options)` -- generate social login redirect
   - Models: `SocialProvider` (enum), `SocialLoginOptions`

7. **Token Auto-Refresh Middleware**
   - Background token refresh before expiry (proactive refresh)
   - Configurable refresh threshold (default: 60 seconds before expiry)
   - Thread-safe token refresh (prevent thundering herd)
   - Callback/event on token refresh
   - API methods:
     - `enableAutoRefresh(options)` -- enable proactive token refresh
     - `onTokenRefresh(callback)` -- register refresh callback

#### Future Features (Nice to Have)

8. **Device Authorization Flow (RFC 8628)**
   - For input-constrained devices (TVs, CLI tools)
   - API methods: `startDeviceAuthorization()`, `pollDeviceToken(deviceCode)`

9. **Anonymous Authentication**
   - Create anonymous sessions for progressive profiling
   - Link anonymous session to real account
   - API methods: `loginAnonymously()`, `linkAccount(anonymousToken, credentials)`

10. **Token Exchange (RFC 8693)**
    - Exchange tokens between services/audiences
    - API methods: `exchangeToken(subjectToken, options)`

### API Surface

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `buildAuthorizationUrl(options)` | Generate PKCE authorization URL | `AuthorizationUrlOptions` | `{ url: string, codeVerifier: string, state: string }` |
| `exchangeCode(code, verifier, redirectUri)` | Exchange auth code for tokens | `string, string, string` | `TokenResponse` |
| `getClientCredentialsToken(options)` | Get M2M token | `ClientCredentialsOptions` | `TokenResponse` |
| `validateToken(token, options)` | Verify JWT signature + claims | `string, TokenValidationOptions` | `TokenValidationResult` |
| `discover()` | Fetch OIDC discovery document | none | `OIDCDiscoveryDocument` |
| `requireStepUp(token, level)` | Check/trigger step-up auth | `string, AssuranceLevel` | `StepUpResult` |
| `buildSocialLoginUrl(provider, options)` | Generate social login URL | `SocialProvider, SocialLoginOptions` | `{ url: string, state: string }` |
| `enableAutoRefresh(options)` | Enable proactive token refresh | `AutoRefreshOptions` | `void` |

### New Models

- **AuthorizationUrlOptions**: `redirectUri: string`, `scope: string`, `audience?: string`, `state?: string`, `prompt?: string`, `loginHint?: string`, `additionalParams?: map`
- **PKCEChallenge**: `codeVerifier: string`, `codeChallenge: string`, `codeChallengeMethod: string`
- **ClientCredentialsOptions**: `audience: string`, `scope?: string`
- **TokenValidationOptions**: `audience?: string`, `issuer?: string`, `algorithms?: string[]`, `clockToleranceSeconds?: int`
- **TokenValidationResult**: `valid: boolean`, `claims: map`, `error?: string`
- **OIDCDiscoveryDocument**: `issuer: string`, `authorizationEndpoint: string`, `tokenEndpoint: string`, `userinfoEndpoint: string`, `jwksUri: string`, `supportedScopes: string[]`, `supportedResponseTypes: string[]`, `supportedGrantTypes: string[]`
- **AssuranceLevel**: enum `AAL1` (single factor), `AAL2` (multi-factor), `AAL3` (hardware key)
- **StepUpRequest**: `requiredLevel: AssuranceLevel`, `maxAge?: int`
- **StepUpResult**: `satisfied: boolean`, `currentLevel: AssuranceLevel`, `redirectUrl?: string`
- **SocialProvider**: enum `GOOGLE`, `MICROSOFT`, `GITHUB`, `APPLE`, `FACEBOOK`, `LINKEDIN`, `TWITTER`, `SLACK`
- **SocialLoginOptions**: `redirectUri: string`, `scope?: string`, `state?: string`

### Events (for webhooks)

- `auth.login.succeeded`: User successfully authenticated
- `auth.login.failed`: Authentication attempt failed
- `auth.token.refreshed`: Token was refreshed
- `auth.token.revoked`: Token was revoked
- `auth.step_up.required`: Step-up authentication triggered
- `auth.step_up.completed`: Step-up authentication completed

### Error Scenarios

| Scenario | HTTP Status | Error Code | SDK Exception |
|----------|-------------|------------|---------------|
| Invalid PKCE verifier | 400 | `invalid_grant` | `AuthError` / `AuthenticationError` / `AuthException` |
| Invalid authorization code | 400 | `invalid_grant` | `AuthError` / `AuthenticationError` / `AuthException` |
| Expired authorization code | 400 | `invalid_grant` | `TokenExpiredError` / `TokenExpiredError` / `TokenExpiredException` |
| Invalid client credentials | 401 | `invalid_client` | `UnauthorizedError` / `UnauthorizedError` / `UnauthorizedException` |
| JWKS fetch failure | 500 | `jwks_error` | `AuthError` / `AuthenticationError` / `AuthException` |
| Token signature invalid | 401 | `invalid_token` | `InvalidTokenError` / `InvalidTokenError` / `InvalidTokenException` |
| Step-up required | 403 | `step_up_required` | `StepUpRequiredError` (new) |
| Unsupported social provider | 400 | `unsupported_provider` | `ValidationError` |

### Cross-Language Notes

- **Python**: Use `cryptography` library for JWKS/JWT verification. PKCE code verifier generation via `secrets.token_urlsafe(32)`. Consider async variant `AsyncAuthClient` using `httpx.AsyncClient`.
- **TypeScript**: Use `jose` library for JWKS/JWT. PKCE via `crypto.subtle.digest()`. All methods are already async.
- **Java**: Use `com.nimbusds:nimbus-jose-jwt` for JWKS/JWT. PKCE via `java.security.MessageDigest`. Builder pattern for all option objects.

---

## 3. MFA/2FA Module

### Overview

Multi-Factor Authentication (MFA) adds a second verification factor after primary authentication. This module provides factor enrollment, challenge/verify flows, recovery codes, and administrative MFA policy enforcement. MFA is a P1 requirement -- enterprise customers consider it a hard prerequisite for adoption.

### Competitive Analysis

| Feature | Auth0 | Clerk | WorkOS | Firebase | Supabase |
|---------|-------|-------|--------|----------|----------|
| TOTP (Authenticator Apps) | Yes | Yes | Yes | Yes | Yes |
| SMS OTP | Yes | Yes | Yes | Yes | Yes (via Twilio) |
| Email OTP | Yes | No | No | No | Yes |
| Push Notifications | Yes (Guardian) | No | No | No | No |
| WebAuthn as MFA | Yes | No | No | No | Planned |
| Recovery/Backup Codes | Yes | Yes | No | No | No |
| Adaptive/Risk-based MFA | Yes | Partial | No | No | No |
| MFA Enrollment API | Yes | Yes | Yes | Yes | Yes |
| MFA Challenge/Verify API | Yes | Yes | Yes | Yes | Yes |
| Per-user MFA Enforcement | Yes | Yes | No | Yes | No |
| Per-tenant MFA Policy | Yes | No | No | No | No |
| Factor Management (list/delete) | Yes | Yes | Yes | Yes | Yes |
| Step-up MFA | Yes | No | No | No | No |
| Remember Device | Yes | No | No | No | No |

**Key observations**:
- Auth0 is the clear leader with the most comprehensive MFA feature set including push notifications, adaptive MFA, and per-tenant policies
- Clerk offers a clean developer experience with TOTP, SMS, and backup codes
- WorkOS takes a composable, unopinionated approach -- just TOTP and SMS with explicit enroll/challenge/verify flows
- Supabase stands out by making TOTP free and enabled by default on all projects
- Recovery codes are important but only Auth0 and Clerk provide them

**Our approach**: Follow WorkOS's composable pattern with Auth0's breadth. Support TOTP, SMS OTP, Email OTP, and recovery codes at launch. WebAuthn as MFA and adaptive MFA as follow-up.

### Requirements

#### Core Features (Must Have)

1. **TOTP Factor Enrollment**
   - Generate TOTP secret and provisioning URI
   - Return QR code data (base64 or otpauth:// URI) for authenticator app scanning
   - Verify initial TOTP code to confirm enrollment
   - Support standard parameters: SHA-1/SHA-256 algorithm, 6 or 8 digits, 30-second period
   - API methods:
     - `enrollTOTP(accessToken)` -- initiate TOTP enrollment, returns secret + QR
     - `verifyTOTPEnrollment(accessToken, factorId, code)` -- confirm enrollment with initial code
   - Models: `TOTPEnrollment`, `TOTPFactor`

2. **SMS Factor Enrollment**
   - Register phone number for SMS-based OTP
   - Send verification SMS during enrollment
   - Verify phone number with received OTP code
   - API methods:
     - `enrollSMS(accessToken, phoneNumber)` -- register phone for SMS MFA
     - `verifySMSEnrollment(accessToken, factorId, code)` -- confirm phone with OTP
   - Models: `SMSFactor`

3. **Email Factor Enrollment**
   - Register email address for email-based OTP
   - Send verification email during enrollment
   - Verify with received OTP code
   - API methods:
     - `enrollEmail(accessToken, email)` -- register email for MFA
     - `verifyEmailEnrollment(accessToken, factorId, code)` -- confirm email with OTP
   - Models: `EmailFactor`

4. **MFA Challenge and Verification**
   - Create challenge for an enrolled factor
   - Verify challenge response (OTP code)
   - Return new tokens with elevated AAL on successful verification
   - Support challenge expiration (configurable, default: 5 minutes for TOTP, 10 minutes for SMS/Email)
   - API methods:
     - `createChallenge(accessToken, factorId)` -- initiate MFA challenge
     - `verifyChallenge(accessToken, challengeId, code)` -- verify the challenge response
   - Models: `MFAChallenge`, `MFAChallengeVerification`

5. **Factor Management**
   - List all enrolled factors for a user
   - Delete/unenroll a specific factor
   - Get factor details
   - API methods:
     - `listFactors(accessToken)` -- list all enrolled MFA factors
     - `getFactor(accessToken, factorId)` -- get factor details
     - `deleteFactor(accessToken, factorId)` -- unenroll a factor
   - Models: `MFAFactor` (polymorphic: TOTPFactor, SMSFactor, EmailFactor)

6. **Recovery Codes**
   - Generate recovery codes during initial MFA enrollment (10 single-use codes)
   - Regenerate recovery codes (invalidates previous set)
   - Verify a recovery code as MFA factor
   - API methods:
     - `generateRecoveryCodes(accessToken)` -- generate new recovery codes
     - `verifyRecoveryCode(accessToken, code)` -- use a recovery code for MFA
   - Models: `RecoveryCodes`

7. **MFA Login Flow Integration**
   - When MFA is required, login returns an `mfa_token` instead of access/refresh tokens
   - The `mfa_token` is used to complete the MFA challenge
   - Support `mfa_required` response from the token endpoint
   - API methods:
     - Enhanced `login()` returns `LoginResult` which can be either `TokenResponse` or `MFARequired`
   - Models: `LoginResult`, `MFARequired`

#### Enhanced Features (Should Have)

8. **MFA Policy Enforcement (Admin)**
   - Set MFA requirement at tenant level (disabled, optional, required)
   - Set MFA requirement per role (e.g., require MFA for admins)
   - Grace period for MFA enrollment after policy change
   - API methods:
     - `setMFAPolicy(adminToken, tenantId, policy)` -- set tenant MFA policy
     - `getMFAPolicy(adminToken, tenantId)` -- get current MFA policy
   - Models: `MFAPolicy`, `MFAPolicyLevel` (enum: disabled, optional, required, required_for_admins)

9. **Remember Device / Trusted Device**
   - After successful MFA, optionally skip MFA on the same device for a configurable period
   - Device fingerprinting and trust token
   - API methods:
     - `trustDevice(accessToken, options)` -- mark current device as trusted
     - `listTrustedDevices(accessToken)` -- list trusted devices
     - `revokeTrustedDevice(accessToken, deviceId)` -- remove a trusted device
   - Models: `TrustedDevice`, `TrustDeviceOptions` (duration)

10. **MFA Status in UserContext**
    - Include MFA-related claims in JWT/UserContext:
      - `mfa_verified: boolean` -- whether MFA was completed in this session
      - `assurance_level: AAL` -- current authentication assurance level
      - `mfa_methods: string[]` -- MFA methods used in this session
    - Extend existing `UserContext` model

#### Future Features (Nice to Have)

11. **Push Notification MFA**
    - Mobile push notification for approve/deny
    - Requires companion mobile SDK
    - API methods: `enrollPush()`, `createPushChallenge()`, `getPushChallengeStatus()`

12. **Adaptive MFA**
    - Risk-based MFA triggers (new device, impossible travel, suspicious IP)
    - Configurable risk thresholds
    - Machine learning-based risk scoring
    - API methods: `getRiskAssessment()`, `setAdaptiveMFAPolicy()`

13. **WebAuthn as MFA Factor**
    - Use hardware security keys or platform authenticators as a second factor
    - Distinct from passkeys (WebAuthn as primary auth) -- this is WebAuthn as a supplementary MFA factor
    - Cross-references with the Passkeys/WebAuthn module (Section 5)

### API Surface

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `enrollTOTP(accessToken)` | Start TOTP enrollment | `string` | `TOTPEnrollment` |
| `verifyTOTPEnrollment(accessToken, factorId, code)` | Confirm TOTP setup | `string, string, string` | `MFAFactor` |
| `enrollSMS(accessToken, phoneNumber)` | Start SMS enrollment | `string, string` | `SMSEnrollment` |
| `verifySMSEnrollment(accessToken, factorId, code)` | Confirm SMS setup | `string, string, string` | `MFAFactor` |
| `enrollEmail(accessToken, email)` | Start email enrollment | `string, string` | `EmailEnrollment` |
| `verifyEmailEnrollment(accessToken, factorId, code)` | Confirm email setup | `string, string, string` | `MFAFactor` |
| `createChallenge(accessToken, factorId)` | Create MFA challenge | `string, string` | `MFAChallenge` |
| `verifyChallenge(accessToken, challengeId, code)` | Verify MFA challenge | `string, string, string` | `MFAChallengeVerification` |
| `listFactors(accessToken)` | List enrolled factors | `string` | `MFAFactor[]` |
| `getFactor(accessToken, factorId)` | Get factor details | `string, string` | `MFAFactor` |
| `deleteFactor(accessToken, factorId)` | Remove enrolled factor | `string, string` | `void` |
| `generateRecoveryCodes(accessToken)` | Generate backup codes | `string` | `RecoveryCodes` |
| `verifyRecoveryCode(accessToken, code)` | Use a recovery code | `string, string` | `MFAChallengeVerification` |
| `setMFAPolicy(adminToken, tenantId, policy)` | Set tenant MFA policy | `string, string, MFAPolicy` | `MFAPolicy` |
| `getMFAPolicy(adminToken, tenantId)` | Get tenant MFA policy | `string, string` | `MFAPolicy` |
| `trustDevice(accessToken, options)` | Trust current device | `string, TrustDeviceOptions` | `TrustedDevice` |
| `listTrustedDevices(accessToken)` | List trusted devices | `string` | `TrustedDevice[]` |
| `revokeTrustedDevice(accessToken, deviceId)` | Remove trusted device | `string, string` | `void` |

### Models

```
TOTPEnrollment:
  factorId: string (UUID)
  secret: string (base32-encoded)
  uri: string (otpauth:// URI for QR code)
  qrCode: string (base64-encoded PNG, optional)
  algorithm: string (SHA1 | SHA256)
  digits: int (6 | 8)
  period: int (seconds, default 30)

SMSEnrollment:
  factorId: string (UUID)
  phoneNumber: string (E.164 format)
  status: string (pending_verification | verified)

EmailEnrollment:
  factorId: string (UUID)
  email: string
  status: string (pending_verification | verified)

MFAFactor:
  id: string (UUID)
  type: string (totp | sms | email | recovery_code | webauthn | push)
  status: string (unverified | verified)
  createdAt: datetime
  lastUsedAt: datetime (nullable)
  friendlyName: string (nullable, user-assigned label)
  // Type-specific fields:
  phoneNumber: string (masked, e.g. "+1***1234", for SMS)
  email: string (masked, e.g. "u***@example.com", for email)

MFAChallenge:
  id: string (UUID)
  factorId: string (UUID)
  factorType: string
  expiresAt: datetime
  status: string (pending | verified | expired)

MFAChallengeVerification:
  accessToken: string (new token with elevated AAL)
  tokenType: string
  expiresIn: int
  refreshToken: string (nullable)
  assuranceLevel: string (aal2)

RecoveryCodes:
  codes: string[] (array of 10 single-use codes)
  generatedAt: datetime
  remainingCount: int

MFARequired:
  mfaToken: string (temporary token for MFA flow)
  availableFactors: MFAFactor[] (list of enrolled factors)
  message: string (e.g. "Multi-factor authentication required")

LoginResult:
  // Union type - either a TokenResponse or MFARequired
  type: string (authenticated | mfa_required)
  tokenResponse: TokenResponse (nullable)
  mfaRequired: MFARequired (nullable)

MFAPolicy:
  enforcement: string (disabled | optional | required | required_for_admins)
  allowedFactors: string[] (totp, sms, email, webauthn, push)
  gracePeriodDays: int (nullable)
  rememberDeviceDays: int (nullable)

TrustedDevice:
  id: string (UUID)
  name: string (derived from user agent)
  browserName: string
  browserVersion: string
  osName: string
  osVersion: string
  ipAddress: string
  lastUsedAt: datetime
  expiresAt: datetime
  isCurrent: boolean
```

### Events (for webhooks)

- `mfa.factor.enrolled`: User enrolled a new MFA factor
- `mfa.factor.deleted`: User removed an MFA factor
- `mfa.challenge.created`: MFA challenge was initiated
- `mfa.challenge.verified`: MFA challenge was successfully verified
- `mfa.challenge.failed`: MFA challenge verification failed
- `mfa.recovery_code.used`: A recovery code was consumed
- `mfa.recovery_code.regenerated`: Recovery codes were regenerated
- `mfa.policy.updated`: Tenant MFA policy was changed
- `mfa.device.trusted`: A device was marked as trusted
- `mfa.device.revoked`: A trusted device was revoked

### Error Scenarios

| Scenario | HTTP Status | Error Code | SDK Exception (Python / TS / Java) |
|----------|-------------|------------|-------------------------------------|
| MFA required but no factor enrolled | 403 | `mfa_required` | `MFARequiredError` / `MFARequiredError` / `MFARequiredException` |
| Invalid TOTP code | 400 | `invalid_otp` | `InvalidOTPError` / `InvalidOTPError` / `InvalidOTPException` |
| Expired MFA challenge | 400 | `challenge_expired` | `ChallengeExpiredError` / `ChallengeExpiredError` / `ChallengeExpiredException` |
| Invalid MFA token | 401 | `invalid_mfa_token` | `InvalidTokenError` / `InvalidTokenError` / `InvalidTokenException` |
| Factor already enrolled | 409 | `factor_already_exists` | `ConflictError` / `ConflictError` / `ConflictException` |
| Cannot delete last factor when MFA required | 400 | `last_factor` | `ValidationError` / `ValidationError` / `ValidationException` |
| Invalid recovery code | 400 | `invalid_recovery_code` | `InvalidOTPError` / `InvalidOTPError` / `InvalidOTPException` |
| All recovery codes consumed | 400 | `no_recovery_codes` | `ValidationError` / `ValidationError` / `ValidationException` |
| MFA rate limited (too many attempts) | 429 | `mfa_rate_limited` | `RateLimitedError` / `RateLimitError` / `RateLimitException` |
| Invalid phone number format | 400 | `invalid_phone` | `ValidationError` / `ValidationError` / `ValidationException` |

### Cross-Language Notes

- **Python**: The `MFAClient` should be a separate client class, not mixed into `AuthClient`. Use `pyotp` for local TOTP validation in tests. The `LoginResult` union type should use a tagged union pattern with a `type` discriminator field.
- **TypeScript**: Use discriminated union for `LoginResult`: `type LoginResult = { type: 'authenticated'; tokenResponse: TokenResponse } | { type: 'mfa_required'; mfaRequired: MFARequired }`. Consider a fluent API: `await mfa.enroll('totp').verify(code)`.
- **Java**: `LoginResult` should use a sealed interface (Java 17+) with `AuthenticatedResult` and `MFARequiredResult` as permitted subtypes. Factor types should use an enum with type-safe builders. `MFAClient` is a separate class following the Builder pattern.

---

## 4. Passwordless Auth Module

### Overview

Passwordless authentication allows users to sign in without a password using magic links (email), email OTP, or SMS OTP. This reduces friction, eliminates password-related security risks, and provides a modern authentication experience. Passwordless is increasingly expected by users and is a competitive necessity.

### Competitive Analysis

| Feature | Auth0 | Clerk | WorkOS | Firebase | Supabase |
|---------|-------|-------|--------|----------|----------|
| Magic Links (Email) | Yes | Yes | Yes (Magic Auth) | Yes (Email Link) | Yes |
| Email OTP | Yes | Yes | No | No | Yes |
| SMS OTP | Yes | Yes | No | Yes | Yes |
| WhatsApp OTP | No | No | No | No | Yes |
| Custom SMS Provider | Yes (Twilio, custom) | No | No | No | Yes |
| OTP Expiration Config | Yes (3 min default) | Yes | No | No | Yes |
| OTP Length Config | No | No | No | No | No |
| Rate Limiting | Yes | Yes | Yes | Yes | Yes |
| Max Attempts | Yes (3 default) | Yes | No | No | Yes |
| Custom Email Templates | Yes | Yes | No | Yes | Yes |
| Custom SMS Templates | Yes | No | Yes | No | Yes |

**Key observations**:
- Auth0 provides the most mature passwordless offering with magic links, email OTP, and SMS OTP
- Clerk wraps passwordless into its standard sign-up/sign-in flow
- WorkOS focuses on magic links as "Magic Auth" but does not offer OTP separately
- Supabase uniquely supports WhatsApp as an OTP channel
- All competitors rate-limit OTP requests and limit verification attempts

**Our approach**: Offer all three methods (magic links, email OTP, SMS OTP) with configurable templates, expiration, and attempt limits. Keep the API composable -- send, then verify.

### Requirements

#### Core Features (Must Have)

1. **Magic Link Authentication**
   - Send a magic link to the user's email
   - Magic link contains a single-use, time-limited token
   - Clicking the link completes authentication and returns tokens
   - Configurable link expiration (default: 15 minutes)
   - Configurable redirect URL after link click
   - API methods:
     - `sendMagicLink(email, options)` -- send magic link email
     - `verifyMagicLink(token)` -- verify magic link token and get auth tokens
   - Models: `MagicLinkRequest`, `MagicLinkOptions`, `MagicLinkResult`

2. **Email OTP Authentication**
   - Send a one-time password code to the user's email
   - Configurable OTP length (default: 6 digits)
   - Configurable expiration (default: 5 minutes)
   - Maximum verification attempts (default: 3)
   - API methods:
     - `sendEmailOTP(email, options)` -- send OTP to email
     - `verifyEmailOTP(email, code)` -- verify the OTP code
   - Models: `EmailOTPRequest`, `EmailOTPOptions`

3. **SMS OTP Authentication**
   - Send a one-time password code via SMS
   - Phone number in E.164 format
   - Configurable OTP length (default: 6 digits)
   - Configurable expiration (default: 5 minutes)
   - Maximum verification attempts (default: 3)
   - API methods:
     - `sendSMSOTP(phoneNumber, options)` -- send OTP via SMS
     - `verifySMSOTP(phoneNumber, code)` -- verify the OTP code
   - Models: `SMSOTPRequest`, `SMSOTPOptions`

4. **Passwordless Login Result**
   - On successful verification, return full `TokenResponse` (access token, refresh token, ID token)
   - If MFA is enabled for the user, return `MFARequired` instead (chain with MFA module)
   - API methods:
     - All verify methods return `LoginResult` (union of `TokenResponse` and `MFARequired`)

#### Enhanced Features (Should Have)

5. **Custom Email Templates**
   - Configure magic link email template (subject, body, branding)
   - Configure OTP email template
   - Template variables: `{{code}}`, `{{link}}`, `{{expiration}}`, `{{app_name}}`
   - API methods:
     - `setPasswordlessEmailTemplate(type, template)` -- set template for magic_link or email_otp
     - `getPasswordlessEmailTemplate(type)` -- get current template
   - Models: `EmailTemplate`, `PasswordlessEmailType` (enum)

6. **Custom SMS Templates**
   - Configure SMS message template
   - Template variable: `{{code}}`, `{{expiration}}`, `{{app_name}}`
   - API methods:
     - `setSMSTemplate(template)` -- set SMS template
     - `getSMSTemplate()` -- get current template
   - Models: `SMSTemplate`

7. **Passwordless Configuration (Admin)**
   - Enable/disable passwordless methods at the tenant level
   - Configure OTP length, expiration, and max attempts
   - Configure allowed domains for magic links
   - API methods:
     - `setPasswordlessConfig(adminToken, config)` -- set passwordless configuration
     - `getPasswordlessConfig(adminToken)` -- get current configuration
   - Models: `PasswordlessConfig`

8. **Resend Logic**
   - Allow resending OTP/magic link with rate limiting
   - Configurable resend cooldown (default: 60 seconds)
   - API methods:
     - `resendMagicLink(email)` -- resend magic link
     - `resendEmailOTP(email)` -- resend email OTP
     - `resendSMSOTP(phoneNumber)` -- resend SMS OTP

#### Future Features (Nice to Have)

9. **WhatsApp OTP**
   - Send OTP via WhatsApp Business API
   - API methods: `sendWhatsAppOTP()`, `verifyWhatsAppOTP()`

10. **Passwordless + Social Account Linking**
    - If user authenticates passwordlessly and has an existing social account, offer to link
    - API methods: `linkSocialAccount(passwordlessToken, provider)`

### API Surface

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `sendMagicLink(email, options?)` | Send magic link email | `string, MagicLinkOptions?` | `MagicLinkResult` |
| `verifyMagicLink(token)` | Verify magic link token | `string` | `LoginResult` |
| `sendEmailOTP(email, options?)` | Send OTP to email | `string, EmailOTPOptions?` | `OTPSendResult` |
| `verifyEmailOTP(email, code)` | Verify email OTP | `string, string` | `LoginResult` |
| `sendSMSOTP(phoneNumber, options?)` | Send OTP via SMS | `string, SMSOTPOptions?` | `OTPSendResult` |
| `verifySMSOTP(phoneNumber, code)` | Verify SMS OTP | `string, string` | `LoginResult` |
| `resendMagicLink(email)` | Resend magic link | `string` | `MagicLinkResult` |
| `resendEmailOTP(email)` | Resend email OTP | `string` | `OTPSendResult` |
| `resendSMSOTP(phoneNumber)` | Resend SMS OTP | `string` | `OTPSendResult` |
| `setPasswordlessConfig(token, config)` | Set passwordless config | `string, PasswordlessConfig` | `PasswordlessConfig` |
| `getPasswordlessConfig(token)` | Get passwordless config | `string` | `PasswordlessConfig` |

### Models

```
MagicLinkOptions:
  redirectUri: string (where to redirect after clicking the link)
  expirationMinutes: int (default: 15)
  templateId: string (nullable, custom email template)

MagicLinkResult:
  sent: boolean
  email: string (masked, e.g., "u***@example.com")
  expiresAt: datetime

OTPSendResult:
  sent: boolean
  destination: string (masked email or phone)
  expiresAt: datetime
  attemptsRemaining: int

EmailOTPOptions:
  codeLength: int (default: 6, range: 4-8)
  expirationMinutes: int (default: 5)
  templateId: string (nullable)

SMSOTPOptions:
  codeLength: int (default: 6, range: 4-8)
  expirationMinutes: int (default: 5)
  templateId: string (nullable)

PasswordlessConfig:
  magicLinkEnabled: boolean
  emailOTPEnabled: boolean
  smsOTPEnabled: boolean
  otpLength: int (default: 6)
  otpExpirationMinutes: int (default: 5)
  magicLinkExpirationMinutes: int (default: 15)
  maxVerificationAttempts: int (default: 3)
  resendCooldownSeconds: int (default: 60)
  allowedEmailDomains: string[] (nullable, for magic link domain restriction)

EmailTemplate:
  subject: string
  htmlBody: string
  textBody: string
  fromName: string
  fromEmail: string

SMSTemplate:
  body: string (must contain {{code}})
```

### Events (for webhooks)

- `passwordless.magic_link.sent`: Magic link email was sent
- `passwordless.magic_link.clicked`: Magic link was clicked (regardless of verification outcome)
- `passwordless.magic_link.verified`: Magic link was successfully verified
- `passwordless.magic_link.expired`: Magic link expired without being used
- `passwordless.otp.sent`: OTP was sent (email or SMS)
- `passwordless.otp.verified`: OTP was successfully verified
- `passwordless.otp.failed`: OTP verification failed (wrong code)
- `passwordless.otp.expired`: OTP expired without being verified
- `passwordless.otp.max_attempts`: Maximum verification attempts reached

### Error Scenarios

| Scenario | HTTP Status | Error Code | SDK Exception (Python / TS / Java) |
|----------|-------------|------------|-------------------------------------|
| Invalid email format | 400 | `invalid_email` | `ValidationError` / `ValidationError` / `ValidationException` |
| Invalid phone number format | 400 | `invalid_phone` | `ValidationError` / `ValidationError` / `ValidationException` |
| Magic link expired | 400 | `link_expired` | `TokenExpiredError` / `TokenExpiredError` / `TokenExpiredException` |
| Magic link already used | 400 | `link_already_used` | `ValidationError` / `ValidationError` / `ValidationException` |
| Invalid OTP code | 400 | `invalid_code` | `InvalidOTPError` / `InvalidOTPError` / `InvalidOTPException` |
| OTP expired | 400 | `code_expired` | `TokenExpiredError` / `TokenExpiredError` / `TokenExpiredException` |
| Max attempts exceeded | 429 | `max_attempts_exceeded` | `RateLimitedError` / `RateLimitError` / `RateLimitException` |
| Resend cooldown not elapsed | 429 | `resend_cooldown` | `RateLimitedError` / `RateLimitError` / `RateLimitException` |
| Email delivery failure | 502 | `email_delivery_failed` | `ServerError` / `ServerError` / `ServerException` |
| SMS delivery failure | 502 | `sms_delivery_failed` | `ServerError` / `ServerError` / `ServerException` |
| Passwordless method disabled | 400 | `method_disabled` | `ValidationError` / `ValidationError` / `ValidationException` |
| Domain not allowed (magic link) | 403 | `domain_not_allowed` | `ForbiddenError` / `ForbiddenError` / `ForbiddenException` |

### Cross-Language Notes

- **Python**: `PasswordlessClient` as a separate client class. Consider providing both sync and async interfaces. Phone number validation using a lightweight regex; do not add a `phonenumbers` dependency but document E.164 format requirement.
- **TypeScript**: `PasswordlessClient` class with fully typed options objects. Use template literal types for phone validation hint: `type E164Phone = \`+${number}\``. All methods are `async`.
- **Java**: `PasswordlessClient` following Builder pattern. Use `PhoneNumber` value object wrapping E.164 string with validation. `LoginResult` uses the same sealed interface from the MFA module.

---

## 5. Passkeys/WebAuthn Module

### Overview

Passkeys (based on FIDO2/WebAuthn) provide phishing-resistant, passwordless authentication using platform authenticators (biometrics) or roaming authenticators (security keys). Passkeys are the industry's direction for replacing passwords and are being adopted rapidly by all major platforms. NIST has formally recognized passkeys as meeting AAL2 requirements.

### Competitive Analysis

| Feature | Auth0 | Clerk | WorkOS | Firebase | Supabase |
|---------|-------|-------|--------|----------|----------|
| Passkey Registration | Yes | Yes (beta) | No | No (via integrations) | No (planned) |
| Passkey Authentication | Yes | Yes (beta) | No | No | No |
| Discoverable Credentials | Yes | Yes | No | No | No |
| Cross-Device Auth (Hybrid) | Yes | Yes | No | No | No |
| Platform Authenticators | Yes | Yes | No | No | No |
| Roaming Authenticators (USB keys) | Yes | Yes | No | No | No |
| Passkey Management (list/delete) | Yes | Yes (max 10 per user) | No | No | No |
| Conditional UI (Autofill) | Yes | Yes | No | No | No |
| WebAuthn as MFA | Yes | No | No | No | Planned |
| Custom RPID Configuration | Yes (single domain) | Yes | No | No | No |
| Attestation Support | Yes | Limited | No | No | No |

**Key observations**:
- Auth0 offers the most complete passkeys implementation including attestation and conditional UI
- Clerk launched passkeys in beta (April 2024), with a clean developer experience but limited to 10 per user and not usable as MFA
- WorkOS, Firebase, and Supabase do not offer native passkey support -- significant gap
- Auth0's WebAuthn RPID is limited to a single domain configuration
- The WebAuthn spec requires server-side handling (challenge generation, credential storage, assertion verification) -- our SDK serves as the server-side relying party library

**Our approach**: Provide a complete server-side WebAuthn relying party SDK that handles registration, authentication, credential management, and conditional UI. This positions us ahead of WorkOS, Firebase, and Supabase immediately.

### Requirements

#### Core Features (Must Have)

1. **Passkey Registration (Credential Creation)**
   - Generate registration options (challenge, RP info, user info, pubkey params)
   - Verify registration response from the browser/client
   - Store credential public key and metadata
   - Support for ES256 (preferred) and RS256 algorithms
   - API methods:
     - `generateRegistrationOptions(accessToken, options?)` -- generate WebAuthn registration options
     - `verifyRegistration(accessToken, registrationResponse)` -- verify and store the credential
   - Models: `RegistrationOptions`, `RegistrationResponse`, `PasskeyCredential`

2. **Passkey Authentication (Assertion)**
   - Generate authentication options (challenge, allowed credentials)
   - Verify authentication response from the browser/client
   - Return tokens on successful authentication
   - Support for discoverable credentials (usernameless login)
   - API methods:
     - `generateAuthenticationOptions(options?)` -- generate WebAuthn authentication options (no auth token needed for discoverable credentials)
     - `verifyAuthentication(authenticationResponse)` -- verify assertion and return tokens
   - Models: `AuthenticationOptions`, `AuthenticationResponse`

3. **Credential Management**
   - List all passkeys/credentials for a user
   - Delete a specific credential
   - Update credential friendly name
   - API methods:
     - `listPasskeys(accessToken)` -- list user's registered passkeys
     - `deletePasskey(accessToken, credentialId)` -- remove a passkey
     - `updatePasskey(accessToken, credentialId, updates)` -- update passkey metadata
   - Models: `Passkey`, `PasskeyUpdate`

4. **Relying Party Configuration**
   - Configure RP ID (domain) and RP name
   - Configure allowed origins
   - Configure authenticator selection criteria (platform vs. cross-platform, user verification)
   - Configure attestation preference (none, indirect, direct)
   - API methods:
     - `setWebAuthnConfig(adminToken, config)` -- set WebAuthn relying party configuration
     - `getWebAuthnConfig(adminToken)` -- get current configuration
   - Models: `WebAuthnConfig`

#### Enhanced Features (Should Have)

5. **Conditional UI / Autofill Support**
   - Generate options for conditional mediation (WebAuthn autofill in browser)
   - Allows passkeys to appear in browser autofill suggestions
   - API methods:
     - `generateConditionalAuthOptions(options?)` -- generate options for conditional UI
   - Note: This primarily requires client-side integration; the server-side options generation is the same as standard authentication but with specific flags

6. **Cross-Device Authentication (Hybrid Transport)**
   - Support for authenticating on one device using another device's passkey
   - QR code-based cross-device flow
   - The transport is handled by the browser/OS -- our SDK just needs to not restrict transports
   - Models: `AuthenticatorTransport` enum (usb, ble, nfc, hybrid, internal)

7. **Attestation Verification**
   - Verify authenticator attestation statements
   - Support packed, tpm, android-key, android-safetynet, fido-u2f, apple, none formats
   - Optional enforcement of specific authenticator models (FIDO Metadata Service)
   - API methods:
     - `verifyAttestation(attestationObject)` -- verify attestation (part of registration flow)

8. **Sign Count Verification**
   - Track and verify authenticator sign count to detect cloned authenticators
   - Alert on sign count regression
   - Integrated into `verifyAuthentication()` flow

#### Future Features (Nice to Have)

9. **FIDO Metadata Service (MDS) Integration**
   - Query FIDO Alliance Metadata Service for authenticator information
   - Enforce authenticator security requirements based on certification level
   - API methods: `getAuthenticatorMetadata(aaguid)`

10. **Passkey Syncing Status**
    - Detect whether a passkey is synced (multi-device) or device-bound
    - Useful for risk assessment
    - Models: `PasskeySyncStatus` enum (synced, device_bound, unknown)

### API Surface

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `generateRegistrationOptions(token, options?)` | Create WebAuthn registration challenge | `string, RegistrationOptionsRequest?` | `RegistrationOptions` |
| `verifyRegistration(token, response)` | Verify registration and store credential | `string, RegistrationResponse` | `PasskeyCredential` |
| `generateAuthenticationOptions(options?)` | Create WebAuthn authentication challenge | `AuthenticationOptionsRequest?` | `AuthenticationOptions` |
| `verifyAuthentication(response)` | Verify assertion and return tokens | `AuthenticationResponse` | `LoginResult` |
| `listPasskeys(token)` | List user's passkeys | `string` | `Passkey[]` |
| `deletePasskey(token, credentialId)` | Remove a passkey | `string, string` | `void` |
| `updatePasskey(token, credentialId, updates)` | Update passkey metadata | `string, string, PasskeyUpdate` | `Passkey` |
| `setWebAuthnConfig(token, config)` | Configure relying party settings | `string, WebAuthnConfig` | `WebAuthnConfig` |
| `getWebAuthnConfig(token)` | Get relying party settings | `string` | `WebAuthnConfig` |

### Models

```
RegistrationOptionsRequest:
  userVerification: string (required | preferred | discouraged, default: preferred)
  authenticatorAttachment: string (platform | cross-platform, nullable for no preference)
  attestation: string (none | indirect | direct | enterprise, default: none)
  residentKey: string (required | preferred | discouraged, default: preferred)
  friendlyName: string (nullable, user-assigned label for the passkey)

RegistrationOptions:
  // This is the PublicKeyCredentialCreationOptions object to pass to navigator.credentials.create()
  challenge: string (base64url-encoded)
  rp: { id: string, name: string }
  user: { id: string (base64url), name: string, displayName: string }
  pubKeyCredParams: [{ type: "public-key", alg: int }] (ES256=-7, RS256=-257)
  timeout: int (milliseconds)
  excludeCredentials: [{ id: string, type: "public-key", transports: string[] }]
  authenticatorSelection: { authenticatorAttachment?: string, residentKey: string, userVerification: string }
  attestation: string

RegistrationResponse:
  // This is the serialized response from navigator.credentials.create()
  id: string (credential ID, base64url)
  rawId: string (base64url)
  type: string ("public-key")
  response: {
    clientDataJSON: string (base64url)
    attestationObject: string (base64url)
    transports: string[] (nullable)
  }

AuthenticationOptionsRequest:
  userVerification: string (required | preferred | discouraged, default: preferred)
  userId: string (nullable, for non-discoverable credential flows)

AuthenticationOptions:
  // This is the PublicKeyCredentialRequestOptions object to pass to navigator.credentials.get()
  challenge: string (base64url-encoded)
  rpId: string
  timeout: int (milliseconds)
  allowCredentials: [{ id: string, type: "public-key", transports: string[] }] (empty for discoverable)
  userVerification: string

AuthenticationResponse:
  // This is the serialized response from navigator.credentials.get()
  id: string (credential ID, base64url)
  rawId: string (base64url)
  type: string ("public-key")
  response: {
    clientDataJSON: string (base64url)
    authenticatorData: string (base64url)
    signature: string (base64url)
    userHandle: string (base64url, nullable)
  }

PasskeyCredential:
  id: string (credential ID)
  publicKey: string (base64url-encoded public key)
  algorithm: int (COSE algorithm identifier)
  signCount: int
  transports: string[]
  createdAt: datetime
  friendlyName: string (nullable)

Passkey:
  id: string (credential ID)
  friendlyName: string (nullable)
  createdAt: datetime
  lastUsedAt: datetime (nullable)
  signCount: int
  transports: string[]
  authenticatorAttachment: string (platform | cross-platform)
  backedUp: boolean (whether the passkey is synced/backed up)
  deviceInfo: string (nullable, e.g., "Chrome on macOS")

PasskeyUpdate:
  friendlyName: string

WebAuthnConfig:
  rpId: string (domain, e.g., "example.com")
  rpName: string (display name, e.g., "Example App")
  origins: string[] (allowed origins for WebAuthn operations)
  attestation: string (none | indirect | direct | enterprise)
  userVerification: string (required | preferred | discouraged)
  timeout: int (milliseconds, default: 60000)
  maxPasskeysPerUser: int (default: 10)
```

### Events (for webhooks)

- `passkey.registered`: A new passkey was registered
- `passkey.authenticated`: User authenticated with a passkey
- `passkey.deleted`: A passkey was removed
- `passkey.updated`: Passkey metadata was updated
- `passkey.sign_count_regression`: Sign count decreased (potential cloned authenticator)
- `passkey.config.updated`: WebAuthn configuration was changed

### Error Scenarios

| Scenario | HTTP Status | Error Code | SDK Exception (Python / TS / Java) |
|----------|-------------|------------|-------------------------------------|
| Invalid registration response | 400 | `invalid_registration` | `WebAuthnError` / `WebAuthnError` / `WebAuthnException` |
| Invalid authentication response | 400 | `invalid_assertion` | `WebAuthnError` / `WebAuthnError` / `WebAuthnException` |
| Challenge expired or not found | 400 | `challenge_expired` | `ChallengeExpiredError` / `ChallengeExpiredError` / `ChallengeExpiredException` |
| Credential not found | 404 | `credential_not_found` | `NotFoundError` / `NotFoundError` / `NotFoundException` |
| Origin not allowed | 400 | `origin_not_allowed` | `WebAuthnError` / `WebAuthnError` / `WebAuthnException` |
| User verification failed | 400 | `user_verification_failed` | `WebAuthnError` / `WebAuthnError` / `WebAuthnException` |
| Max passkeys per user exceeded | 400 | `max_passkeys_exceeded` | `ValidationError` / `ValidationError` / `ValidationException` |
| Duplicate credential | 409 | `credential_exists` | `ConflictError` / `ConflictError` / `ConflictException` |
| Sign count regression | 400 | `sign_count_regression` | `WebAuthnError` / `WebAuthnError` / `WebAuthnException` |
| Unsupported algorithm | 400 | `unsupported_algorithm` | `ValidationError` / `ValidationError` / `ValidationException` |
| Attestation verification failed | 400 | `attestation_failed` | `WebAuthnError` / `WebAuthnError` / `WebAuthnException` |

### Cross-Language Notes

- **Python**: Use the `py_webauthn` library (or `fido2`) for server-side WebAuthn verification. The `WebAuthnClient` handles server-side RP logic only -- browser interaction is the caller's responsibility. Base64url encoding/decoding should use `base64.urlsafe_b64encode/decode`.
- **TypeScript**: Use `@simplewebauthn/server` for server-side verification. Models should use `Uint8Array` for binary fields but serialize to base64url strings for API transport. Export client-side helper types that match `@simplewebauthn/browser` expectations.
- **Java**: Use `com.yubico:webauthn-server-core` for server-side verification. Binary fields should use `ByteArray` from the Yubico library. Builder pattern for all configuration and option objects. Challenge storage should be pluggable (in-memory default, Redis/DB for production).

---

## 6. Session Management Module

### Overview

Session Management provides visibility into and control over active user sessions across devices. It enables users to view active sessions, terminate sessions on other devices, and allows administrators to enforce session policies. This module enhances the basic session listing/termination already in the auth module by adding device intelligence, session policies, and administrative controls.

### Competitive Analysis

| Feature | Auth0 | Clerk | WorkOS | Firebase | Supabase |
|---------|-------|-------|--------|----------|----------|
| List Active Sessions | Yes | Yes | Yes (via middleware) | Limited | Limited |
| Revoke Session by ID | Yes | Yes | No (automatic) | Yes | Yes |
| Revoke All Sessions | Yes | Yes | No | Yes | Yes |
| Device Information | Yes (IP, User Agent, ASN) | Yes (browser, version, device type) | Yes (encrypted session data) | Limited | No |
| Geo-location Data | Yes | No | No | No | No |
| Session Expiration Config | Yes | Yes | Yes | Yes | Yes |
| Idle Timeout | Yes | Yes | Yes | No | Yes |
| Concurrent Session Limits | Yes | No | No | No | No |
| Session Binding (IP/Device) | Yes | Yes (Client Trust) | Yes (sealed sessions) | No | No |
| Session Activity Log | Yes (actions, events) | Yes (SessionWithActivities) | No | No | No |
| Force Password Reset on All Sessions | Yes | Yes | No | Yes | No |
| Admin Session Management | Yes (Management API) | Yes (Backend API) | No | Yes (Admin SDK) | Yes (admin API) |

**Key observations**:
- Auth0 has the most comprehensive session management with device info, geo-location, concurrent session limits, and the Session Management API
- Clerk's `SessionWithActivities` object provides rich device and activity data
- WorkOS takes an automatic approach where sessions are managed through AuthKit middleware with encrypted cookies
- Our existing auth module has basic `listSessions()` and `terminateSession()` but lacks device intelligence, policies, and admin controls

**Our approach**: Build on the existing session primitives to add rich device information, session policies (concurrent limits, idle timeout, binding), activity tracking, and full admin session management API.

### Requirements

#### Core Features (Must Have)

1. **Enhanced Session Listing**
   - List all active sessions with rich device and location information
   - Include session activity metadata (last action, pages viewed)
   - Pagination support for users with many sessions
   - Filter by status (active, expired, revoked)
   - API methods:
     - `listSessions(accessToken, options?)` -- enhanced version of existing method
   - Models: `SessionDetail` (extends existing `Session`), `SessionListOptions`

2. **Session Revocation**
   - Revoke a specific session by ID
   - Revoke all sessions except the current one
   - Revoke all sessions (including current -- forced logout everywhere)
   - Optional reason for revocation (for audit trail)
   - API methods:
     - `revokeSession(accessToken, sessionId, reason?)` -- revoke specific session
     - `revokeOtherSessions(accessToken, reason?)` -- revoke all except current
     - `revokeAllSessions(accessToken, reason?)` -- revoke all including current
   - Models: `SessionRevocationOptions`

3. **Device Information**
   - Parse and structure user agent into device, browser, and OS information
   - IP address with optional geo-location (city, country, coordinates)
   - Device fingerprint for device recognition
   - API methods:
     - Included in `SessionDetail` model -- no separate methods needed
   - Models: `DeviceInfo`, `GeoLocation`

4. **Session Detail Retrieval**
   - Get full details of a specific session including activity history
   - API methods:
     - `getSession(accessToken, sessionId)` -- get session details
   - Models: `SessionDetail`

#### Enhanced Features (Should Have)

5. **Session Policies (Admin)**
   - Configure session lifetime (absolute timeout, default: 24 hours)
   - Configure idle timeout (default: 30 minutes)
   - Configure concurrent session limit (default: unlimited)
   - Configure session behavior on concurrent limit reached (terminate oldest, deny new)
   - Configure session binding (bind to IP, bind to device)
   - API methods:
     - `setSessionPolicy(adminToken, tenantId, policy)` -- set session policy
     - `getSessionPolicy(adminToken, tenantId)` -- get session policy
   - Models: `SessionPolicy`

6. **Admin Session Management**
   - Admin can list all sessions for any user
   - Admin can revoke any user's sessions
   - Admin can view session analytics (active sessions count, sessions by device type, etc.)
   - API methods:
     - `adminListUserSessions(adminToken, userId, options?)` -- list sessions for a user
     - `adminRevokeUserSession(adminToken, userId, sessionId, reason?)` -- revoke specific session
     - `adminRevokeAllUserSessions(adminToken, userId, reason?)` -- revoke all user sessions
     - `adminGetSessionStats(adminToken, tenantId?)` -- get session statistics
   - Models: `AdminSessionListOptions`, `SessionStats`

7. **Session Activity Log**
   - Track significant actions within a session (login, MFA, password change, etc.)
   - Store timestamps, IP addresses, and action types
   - API methods:
     - `getSessionActivity(accessToken, sessionId)` -- get activity log for a session
   - Models: `SessionActivity`, `ActivityType` (enum)

8. **Session Extension / Keep-Alive**
   - Explicitly extend a session's lifetime (prevent idle timeout)
   - Useful for long-running operations
   - API methods:
     - `extendSession(accessToken, sessionId?)` -- extend current or specific session
   - Models: None (returns updated `SessionDetail`)

#### Future Features (Nice to Have)

9. **Real-Time Session Notifications**
   - WebSocket or SSE notifications when a new session is created
   - Notification when a session is revoked
   - Useful for security-conscious applications

10. **Session Risk Scoring**
    - Assign risk scores to sessions based on device, location, behavior
    - Flag suspicious sessions for admin review
    - API methods: `getSessionRisk(sessionId)`

11. **IP Allowlisting/Blocklisting**
    - Restrict sessions to specific IP ranges
    - Block sessions from known malicious IPs
    - API methods: `setIPPolicy(adminToken, policy)`

### API Surface

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `listSessions(token, options?)` | List user's active sessions | `string, SessionListOptions?` | `PaginatedList<SessionDetail>` |
| `getSession(token, sessionId)` | Get session details | `string, string` | `SessionDetail` |
| `revokeSession(token, sessionId, reason?)` | Revoke a session | `string, string, string?` | `void` |
| `revokeOtherSessions(token, reason?)` | Revoke all other sessions | `string, string?` | `{ revokedCount: int }` |
| `revokeAllSessions(token, reason?)` | Revoke all sessions | `string, string?` | `{ revokedCount: int }` |
| `extendSession(token, sessionId?)` | Extend session lifetime | `string, string?` | `SessionDetail` |
| `getSessionActivity(token, sessionId)` | Get session activity log | `string, string` | `SessionActivity[]` |
| `setSessionPolicy(token, tenantId, policy)` | Set session policy | `string, string, SessionPolicy` | `SessionPolicy` |
| `getSessionPolicy(token, tenantId)` | Get session policy | `string, string` | `SessionPolicy` |
| `adminListUserSessions(token, userId, options?)` | Admin: list user sessions | `string, string, SessionListOptions?` | `PaginatedList<SessionDetail>` |
| `adminRevokeUserSession(token, userId, sessionId, reason?)` | Admin: revoke user session | `string, string, string, string?` | `void` |
| `adminRevokeAllUserSessions(token, userId, reason?)` | Admin: revoke all user sessions | `string, string, string?` | `{ revokedCount: int }` |
| `adminGetSessionStats(token, tenantId?)` | Admin: get session stats | `string, string?` | `SessionStats` |

### Models

```
SessionDetail:
  id: string (UUID)
  userId: string (UUID)
  status: string (active | expired | revoked)
  createdAt: datetime
  lastActiveAt: datetime
  expiresAt: datetime
  idleExpiresAt: datetime (nullable)
  isCurrent: boolean
  ipAddress: string
  device: DeviceInfo
  geoLocation: GeoLocation (nullable)
  authenticationMethod: string (password | magic_link | passkey | social | sso)
  mfaVerified: boolean
  assuranceLevel: string (aal1 | aal2 | aal3)
  revocationReason: string (nullable)

DeviceInfo:
  userAgent: string (raw user agent string)
  browserName: string (e.g., "Chrome")
  browserVersion: string (e.g., "120.0.6099")
  osName: string (e.g., "macOS")
  osVersion: string (e.g., "14.2")
  deviceType: string (desktop | mobile | tablet | unknown)
  deviceName: string (nullable, e.g., "iPhone 15")
  isMobile: boolean
  isBot: boolean

GeoLocation:
  city: string (nullable)
  region: string (nullable, state/province)
  country: string (ISO 3166-1 alpha-2)
  countryName: string
  latitude: float (nullable)
  longitude: float (nullable)
  timezone: string (nullable, IANA timezone)
  asn: int (nullable, autonomous system number)
  organization: string (nullable, ISP/org name)

SessionListOptions:
  page: int (default: 1)
  pageSize: int (default: 20, max: 100)
  status: string (active | expired | revoked, nullable for all)
  sortBy: string (created_at | last_active_at, default: last_active_at)
  sortOrder: string (asc | desc, default: desc)

SessionPolicy:
  maxSessionLifetimeMinutes: int (default: 1440, i.e. 24 hours)
  idleTimeoutMinutes: int (default: 30, 0 = disabled)
  maxConcurrentSessions: int (default: 0, i.e. unlimited)
  onConcurrentLimitReached: string (terminate_oldest | deny_new, default: terminate_oldest)
  bindToIP: boolean (default: false)
  bindToDevice: boolean (default: false)
  requireMFAForNewSession: boolean (default: false)

SessionActivity:
  id: string (UUID)
  sessionId: string (UUID)
  action: string (ActivityType)
  timestamp: datetime
  ipAddress: string
  details: map (nullable, action-specific details)

ActivityType (enum):
  session_created
  login_succeeded
  login_failed
  mfa_verified
  password_changed
  token_refreshed
  session_extended
  permissions_changed
  sensitive_action_performed

SessionStats:
  totalActiveSessions: int
  uniqueUsers: int
  sessionsByDeviceType: map (desktop: int, mobile: int, tablet: int)
  sessionsByAuthMethod: map (password: int, passkey: int, social: int, etc.)
  sessionsByCountry: map (US: int, UK: int, etc.)
  averageSessionDurationMinutes: float
  peakConcurrentSessions: int
  peakConcurrentTimestamp: datetime

AdminSessionListOptions:
  // Extends SessionListOptions with:
  userId: string (nullable, filter by user)
  tenantId: string (nullable, filter by tenant)
  deviceType: string (nullable, filter by device type)
  country: string (nullable, filter by country)
```

### Events (for webhooks)

- `session.created`: New session was created
- `session.refreshed`: Session was extended/refreshed
- `session.revoked`: Session was explicitly revoked (includes reason)
- `session.expired`: Session expired due to timeout
- `session.idle_expired`: Session expired due to idle timeout
- `session.concurrent_limit_reached`: Concurrent session limit was hit
- `session.new_device_detected`: Login from a previously unseen device
- `session.new_location_detected`: Login from a new geographic location
- `session.policy.updated`: Session policy was updated

### Error Scenarios

| Scenario | HTTP Status | Error Code | SDK Exception (Python / TS / Java) |
|----------|-------------|------------|-------------------------------------|
| Session not found | 404 | `session_not_found` | `NotFoundError` / `NotFoundError` / `NotFoundException` |
| Cannot revoke current session via revokeSession | 400 | `cannot_revoke_current` | `ValidationError` / `ValidationError` / `ValidationException` |
| Session already revoked | 400 | `session_already_revoked` | `ValidationError` / `ValidationError` / `ValidationException` |
| Concurrent session limit reached (deny mode) | 403 | `concurrent_limit_reached` | `ForbiddenError` / `ForbiddenError` / `ForbiddenException` |
| Session bound to different IP | 403 | `ip_mismatch` | `ForbiddenError` / `ForbiddenError` / `ForbiddenException` |
| Session bound to different device | 403 | `device_mismatch` | `ForbiddenError` / `ForbiddenError` / `ForbiddenException` |
| Admin access required | 403 | `admin_required` | `ForbiddenError` / `ForbiddenError` / `ForbiddenException` |
| Invalid session policy values | 400 | `invalid_policy` | `ValidationError` / `ValidationError` / `ValidationException` |

### Cross-Language Notes

- **Python**: `SessionClient` as a separate class. Use `user-agents` library for user agent parsing or implement lightweight parsing. The `PaginatedList` should be iterable and support `async for` in the async variant. Consider providing a `SessionMiddleware` for common frameworks (FastAPI, Django, Flask).
- **TypeScript**: `SessionClient` class. Use `ua-parser-js` for user agent parsing. `PaginatedList<T>` should be a generic interface with `data: T[]`, `total: number`, `page: number`, `pageSize: number`, `hasMore: boolean`. Consider Express/Koa middleware for session validation.
- **Java**: `SessionClient` with Builder pattern. Use `nl.basjes.parse.useragent:yauaa` for user agent parsing. `PaginatedList<T>` should implement `Iterable<T>`. Consider Spring Security integration via `SessionManagementFilter`.

---

## 7. Breached Password Check Module

### Overview

The Breached Password Check module verifies whether user passwords appear in known data breaches, using the HaveIBeenPwned (HIBP) Pwned Passwords API with k-Anonymity. This prevents users from setting passwords that are already compromised, a critical defense against credential stuffing attacks. The module should be usable both at registration/password-change time and as a standalone utility.

### Competitive Analysis

| Feature | Auth0 | Clerk | WorkOS | Firebase | Supabase |
|---------|-------|-------|--------|----------|----------|
| Breached Password Detection | Yes (built-in) | Yes (auto, HIBP) | No | No | No |
| Credential Guard (dark web) | Yes (enterprise) | No | No | No | No |
| Block Breached at Registration | Yes | Yes | No | No | No |
| Block Breached at Login | Yes | Yes | No | No | No |
| Block Breached at Password Change | Yes | Yes | No | No | No |
| Notify User of Breach | Yes (email) | Yes (prompt reset) | No | No | No |
| Force Password Reset | Yes | Yes (manual) | No | No | No |
| Customizable Action | Yes (log, notify, block) | Yes (block) | No | No | No |
| Offline Check (no API call) | No | No | No | No | No |
| Breach Count Exposed | No | No | No | No | No |

**Key observations**:
- Auth0 leads with Breached Password Detection and the premium Credential Guard (dark web monitoring)
- Clerk automatically checks all passwords against HIBP's 613+ million compromised credentials
- WorkOS, Firebase, and Supabase do not offer any breached password detection -- significant security gap
- The HIBP Pwned Passwords API is free, requires no authentication, and uses k-Anonymity to protect privacy
- HIBP API v3 supports response padding to prevent response-size-based information leakage

**Our approach**: Provide a composable breached password check client that developers can integrate into registration, login, and password change flows. Support both online (HIBP API) and configurable thresholds. The module should be lightweight and independently usable.

### Requirements

#### Core Features (Must Have)

1. **Password Breach Check (HIBP k-Anonymity)**
   - Hash the password using SHA-1
   - Send only the first 5 characters of the hash to the HIBP API
   - Compare remaining suffix against returned results
   - Return whether the password is breached and the breach count
   - Use HTTPS with padding (Add-Padding header) for privacy
   - No API key required (Pwned Passwords API is free)
   - API methods:
     - `isPasswordBreached(password)` -- check if password appears in breaches
     - `getBreachCount(password)` -- get the number of times password appeared in breaches
   - Models: `BreachCheckResult`

2. **Password Breach Check with Threshold**
   - Allow configuring a minimum breach count threshold
   - Passwords with breach count below threshold are considered acceptable
   - Useful for avoiding false positives on very common short passwords
   - API methods:
     - `isPasswordBreached(password, threshold?)` -- threshold parameter (default: 1)

3. **Batch Password Check**
   - Check multiple passwords in a single operation
   - Deduplicate hash prefixes to minimize API calls
   - Useful for migration scenarios or admin tools
   - API methods:
     - `checkPasswords(passwords)` -- batch check multiple passwords
   - Models: `BatchBreachResult`

4. **SHA-1 Hash-Based Check (Pre-Hashed)**
   - Accept a pre-hashed (SHA-1) password for environments where plaintext passwords are not available
   - API methods:
     - `isHashBreached(sha1Hash)` -- check by SHA-1 hash
     - `getBreachCountByHash(sha1Hash)` -- get breach count by hash

#### Enhanced Features (Should Have)

5. **Registration/Login Middleware Integration**
   - Provide middleware or hooks to automatically check passwords during:
     - User registration
     - Password change
     - Login (with configurable action: log, warn, block)
   - Configurable behavior on detection:
     - `block`: Reject the password with an error
     - `warn`: Allow but include warning in response
     - `log`: Allow silently but emit an event
   - API methods:
     - `setBreachPolicy(adminToken, policy)` -- configure breach detection behavior
     - `getBreachPolicy(adminToken)` -- get current policy
   - Models: `BreachPolicy`

6. **NTLM Hash Support**
   - HIBP also supports NTLM hash checking
   - Useful for environments migrating from Windows/Active Directory
   - API methods:
     - `isNTLMHashBreached(ntlmHash)` -- check by NTLM hash

7. **Caching Layer**
   - Cache HIBP API responses (hash prefix to suffix list mapping)
   - Configurable TTL (default: 24 hours -- breach data changes infrequently)
   - Reduce external API calls and latency
   - Configuration:
     - `setCacheConfig(config)` -- configure caching behavior
   - Models: `CacheConfig`

8. **Password Strength Augmentation**
   - Combine breach check with basic password strength assessment
   - Return a combined "password health" score
   - API methods:
     - `assessPasswordHealth(password)` -- comprehensive password assessment
   - Models: `PasswordHealthResult`

#### Future Features (Nice to Have)

9. **Offline Breach Database**
   - Download and index the HIBP database locally for offline checking
   - Eliminates external API dependency
   - Requires significant storage (approximately 35GB compressed)
   - API methods: `downloadBreachDatabase()`, `isPasswordBreachedOffline(password)`

10. **Email Breach Check**
    - Check if an email address has appeared in known data breaches
    - Requires HIBP API key (paid, $3.50/month)
    - API methods: `isEmailBreached(email)`, `getEmailBreaches(email)`

11. **Dark Web Monitoring**
    - Proactive monitoring for new breaches affecting users
    - Requires enterprise-grade data feeds
    - API methods: `enableBreachMonitoring()`, `getBreachAlerts()`

### API Surface

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `isPasswordBreached(password, threshold?)` | Check if password is breached | `string, int?` | `boolean` |
| `getBreachCount(password)` | Get breach occurrence count | `string` | `int` |
| `checkPasswords(passwords)` | Batch check passwords | `string[]` | `BatchBreachResult` |
| `isHashBreached(sha1Hash, threshold?)` | Check by SHA-1 hash | `string, int?` | `boolean` |
| `getBreachCountByHash(sha1Hash)` | Get count by SHA-1 hash | `string` | `int` |
| `assessPasswordHealth(password)` | Full password assessment | `string` | `PasswordHealthResult` |
| `setBreachPolicy(token, policy)` | Set breach detection policy | `string, BreachPolicy` | `BreachPolicy` |
| `getBreachPolicy(token)` | Get breach detection policy | `string` | `BreachPolicy` |

### Models

```
BreachCheckResult:
  breached: boolean
  count: int (number of times found in breaches, 0 if not breached)
  checkedAt: datetime

BatchBreachResult:
  results: map (password_index: int -> BreachCheckResult)
  totalChecked: int
  totalBreached: int
  apiCallsMade: int

BreachPolicy:
  checkOnRegistration: boolean (default: true)
  checkOnPasswordChange: boolean (default: true)
  checkOnLogin: boolean (default: false)
  action: string (block | warn | log, default: block)
  minimumBreachThreshold: int (default: 1)
  customMessage: string (nullable, custom error message)

PasswordHealthResult:
  breached: boolean
  breachCount: int
  strengthScore: int (0-4, zxcvbn-style)
  strengthLabel: string (very_weak | weak | fair | strong | very_strong)
  estimatedCrackTime: string (human-readable, e.g., "3 hours")
  suggestions: string[] (improvement suggestions)
  warning: string (nullable)

CacheConfig:
  enabled: boolean (default: true)
  ttlSeconds: int (default: 86400, i.e., 24 hours)
  maxEntries: int (default: 10000)
```

### Events (for webhooks)

- `password.breach_detected`: A breached password was detected
- `password.breach_blocked`: A breached password was blocked (during registration or change)
- `password.breach_warning`: A breached password triggered a warning (warn mode)
- `password.health_check`: Password health assessment was performed

### Error Scenarios

| Scenario | HTTP Status | Error Code | SDK Exception (Python / TS / Java) |
|----------|-------------|------------|-------------------------------------|
| Password found in breach (block mode) | 400 | `password_breached` | `BreachedPasswordError` / `BreachedPasswordError` / `BreachedPasswordException` |
| HIBP API unavailable | 503 | `breach_service_unavailable` | `ServerError` / `ServerError` / `ServerException` |
| HIBP API rate limited | 429 | `breach_rate_limited` | `RateLimitedError` / `RateLimitError` / `RateLimitException` |
| Invalid SHA-1 hash format | 400 | `invalid_hash` | `ValidationError` / `ValidationError` / `ValidationException` |
| Batch size exceeds limit | 400 | `batch_too_large` | `ValidationError` / `ValidationError` / `ValidationException` |

### Cross-Language Notes

- **Python**: `BreachCheckClient` as a standalone class with zero external dependencies beyond `httpx` and `hashlib` (both in stdlib or already required). SHA-1 hashing via `hashlib.sha1()`. Consider providing both sync and async interfaces. The client should be safe to use as a standalone utility without the full SDK.
- **TypeScript**: `BreachCheckClient` class. SHA-1 hashing via `crypto.subtle.digest('SHA-1', ...)` in browser-compatible code or `crypto.createHash('sha1')` in Node.js. Support both environments. The module should be tree-shakeable and independently importable.
- **Java**: `BreachCheckClient` with Builder pattern. SHA-1 via `java.security.MessageDigest.getInstance("SHA-1")`. Consider using `CompletableFuture` for async checks. The client should work standalone without the full SDK dependency.

### Implementation Notes

The HIBP k-Anonymity protocol works as follows:
1. Hash the password with SHA-1: `sha1("password") = "5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8"`
2. Send the first 5 characters to `GET https://api.pwnedpasswords.com/range/5BAA6`
3. Response contains all hash suffixes matching that prefix, with counts
4. Search the response for the remaining suffix `1E4C9B93F3F0682250B6CF8331B7EE68FD8`
5. If found, the password is breached; the count indicates how many times

Important: Always send the `Add-Padding: true` header to prevent response-size-based information leakage.

---

## 8. Cross-Cutting Concerns

### Module Integration

The auth and security modules must integrate cleanly with each other:

```
Authentication                MFA/2FA              Passwordless
     |                          |                      |
     v                          v                      v
login() ──────> MFA Required? ──> createChallenge()
                                  verifyChallenge()
     |                          |                      |
     v                          v                      v
                   LoginResult (unified type)
                          |
                          v
                  Session Management
                  (session created)
                          |
                          v
                  Breached Password Check
                  (on login if enabled)
```

### Shared Models

The following models are shared across modules and should be defined in a common package:

- `LoginResult` -- used by Auth, MFA, Passwordless, and Passkeys modules
- `AssuranceLevel` (AAL1, AAL2, AAL3) -- used by Auth, MFA, Session, and Passkeys
- `TokenResponse` -- used by all authentication-related modules
- `UserContext` (enhanced with MFA fields) -- used by Auth and Session

### Error Hierarchy

All new error types should inherit from the existing base exceptions:

```
Python:
  AuthError (base)
  ├── TokenExpiredError
  ├── InvalidTokenError
  ├── UnauthorizedError
  ├── ForbiddenError
  ├── RateLimitedError
  ├── MFARequiredError (new)
  ├── InvalidOTPError (new)
  ├── ChallengeExpiredError (new)
  ├── WebAuthnError (new)
  ├── StepUpRequiredError (new)
  └── BreachedPasswordError (new)

TypeScript:
  AuthError (base)
  ├── TokenExpiredError
  ├── InvalidTokenError
  ├── UnauthorizedError
  ├── ForbiddenError
  ├── RateLimitError
  ├── MFARequiredError (new)
  ├── InvalidOTPError (new)
  ├── ChallengeExpiredError (new)
  ├── WebAuthnError (new)
  ├── StepUpRequiredError (new)
  └── BreachedPasswordError (new)

Java:
  AuthException (base)
  ├── TokenExpiredException
  ├── InvalidTokenException
  ├── UnauthorizedException
  ├── ForbiddenException
  ├── RateLimitException
  ├── MFARequiredException (new)
  ├── InvalidOTPException (new)
  ├── ChallengeExpiredException (new)
  ├── WebAuthnException (new)
  ├── StepUpRequiredException (new)
  └── BreachedPasswordException (new)
```

### Client Architecture

Each module should be a separate client class following the existing pattern:

```python
# Python example
from shared_platform import PlatformClient

client = PlatformClient(issuer_url="https://auth.example.com", client_id="...")

# Access individual modules
client.auth.login(username, password)
client.mfa.enrollTOTP(access_token)
client.passwordless.sendMagicLink(email)
client.passkeys.generateRegistrationOptions(access_token)
client.sessions.listSessions(access_token)
client.breach_check.isPasswordBreached(password)
```

```typescript
// TypeScript example
import { PlatformClient } from '@shared-platform/sdk';

const client = new PlatformClient({ issuerUrl: 'https://auth.example.com', clientId: '...' });

await client.auth.login(username, password);
await client.mfa.enrollTOTP(accessToken);
await client.passwordless.sendMagicLink(email);
await client.passkeys.generateRegistrationOptions(accessToken);
await client.sessions.listSessions(accessToken);
await client.breachCheck.isPasswordBreached(password);
```

```java
// Java example
PlatformClient client = new PlatformClient.Builder()
    .issuerUrl("https://auth.example.com")
    .clientId("...")
    .build();

client.auth().login(email, password);
client.mfa().enrollTOTP(accessToken);
client.passwordless().sendMagicLink(email);
client.passkeys().generateRegistrationOptions(accessToken);
client.sessions().listSessions(accessToken);
client.breachCheck().isPasswordBreached(password);
```

### Webhook Event Naming Convention

All webhook events follow the pattern `{module}.{resource}.{action}`:

| Module | Event Prefix | Example |
|--------|-------------|---------|
| Auth | `auth.` | `auth.login.succeeded` |
| MFA | `mfa.` | `mfa.factor.enrolled` |
| Passwordless | `passwordless.` | `passwordless.magic_link.sent` |
| Passkeys | `passkey.` | `passkey.registered` |
| Sessions | `session.` | `session.created` |
| Breach Check | `password.` | `password.breach_detected` |

### Testing Requirements

Each module must include:
1. Unit tests for all client methods with mocked HTTP responses
2. Unit tests for all model serialization/deserialization
3. Unit tests for all error scenarios
4. Integration tests against a test server (where applicable)
5. Tests for cross-module flows (e.g., login -> MFA -> session creation)

Minimum test coverage: 90% line coverage per module.

### Documentation Requirements

Each module must include:
1. API reference documentation (auto-generated from code comments/docstrings)
2. Getting started guide with common use cases
3. Code examples for each supported language
4. Error handling guide
5. Migration guide (for existing auth module users)

---

## 9. Appendix: Competitive Feature Matrix

### Overall Feature Comparison

| Feature | Auth0 | Clerk | WorkOS | Firebase | Supabase | Our SDK (Current) | Our SDK (Planned) |
|---------|-------|-------|--------|----------|----------|-------------------|-------------------|
| **Authentication** | | | | | | | |
| OAuth2/OIDC | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| PKCE | Yes | Yes | Yes | Yes | Yes | Partial | Yes |
| Client Credentials | Yes | Yes | Yes | Yes | Yes | No | Yes |
| Social Login | 50+ providers | 20+ | 4 | 15+ | 20+ | No | 8 providers |
| JWKS Auto-rotation | Yes | Yes | Yes | Yes | Yes | No | Yes |
| Step-up Auth | Yes | No | No | No | No | No | Yes |
| Adaptive Auth | Yes | Partial | No | No | No | No | Future |
| **MFA** | | | | | | | |
| TOTP | Yes | Yes | Yes | Yes | Yes | No | Yes |
| SMS | Yes | Yes | Yes | Yes | Yes | No | Yes |
| Email | Yes | No | No | No | Yes | No | Yes |
| Push | Yes | No | No | No | No | No | Future |
| Recovery Codes | Yes | Yes | No | No | No | No | Yes |
| MFA Policy | Yes | Yes | No | Yes | No | No | Yes |
| Remember Device | Yes | No | No | No | No | No | Yes |
| **Passwordless** | | | | | | | |
| Magic Links | Yes | Yes | Yes | Yes | Yes | No | Yes |
| Email OTP | Yes | Yes | No | No | Yes | No | Yes |
| SMS OTP | Yes | Yes | No | Yes | Yes | No | Yes |
| Custom Templates | Yes | Yes | Yes | Yes | Yes | No | Yes |
| **Passkeys** | | | | | | | |
| Registration | Yes | Yes (beta) | No | No | No | No | Yes |
| Authentication | Yes | Yes (beta) | No | No | No | No | Yes |
| Discoverable | Yes | Yes | No | No | No | No | Yes |
| Conditional UI | Yes | Yes | No | No | No | No | Yes |
| Management | Yes | Yes | No | No | No | No | Yes |
| **Sessions** | | | | | | | |
| List Sessions | Yes | Yes | Yes | Limited | Limited | Basic | Enhanced |
| Revoke Sessions | Yes | Yes | No | Yes | Yes | Basic | Enhanced |
| Device Info | Yes | Yes | Yes | No | No | Basic | Enhanced |
| Geo-location | Yes | No | No | No | No | No | Yes |
| Session Policies | Yes | Yes | Yes | No | Yes | No | Yes |
| Activity Log | Yes | Yes | No | No | No | No | Yes |
| Admin Management | Yes | Yes | No | Yes | Yes | No | Yes |
| **Breach Detection** | | | | | | | |
| HIBP Integration | Yes | Yes | No | No | No | No | Yes |
| Block at Registration | Yes | Yes | No | No | No | No | Yes |
| Block at Login | Yes | Yes | No | No | No | No | Yes |
| Dark Web Monitoring | Yes (premium) | No | No | No | No | No | Future |

### Competitive Positioning Summary

After implementing all planned modules, our SDK will:
- **Match Auth0** on core features (MFA, passwordless, passkeys, sessions, breach detection)
- **Exceed WorkOS** which lacks passkeys, breach detection, and has limited MFA
- **Exceed Firebase** which lacks passkeys, breach detection, and has limited session management
- **Exceed Supabase** which lacks passkeys and breach detection
- **Match Clerk** on most features with advantages in email MFA, step-up auth, and session policies
- **Trail Auth0** on push MFA, adaptive MFA, and dark web monitoring (future roadmap items)

### References

- [Auth0 MFA API Documentation](https://auth0.com/docs/secure/multi-factor-authentication/manage-mfa-auth0-apis/manage-authenticator-factors-mfa-api)
- [Auth0 Passwordless Authentication](https://auth0.com/docs/authenticate/passwordless)
- [Auth0 Session Management API](https://auth0.com/blog/introducing-session-management-api/)
- [Auth0 Breached Password Detection](https://auth0.com/docs/secure/attack-protection/breached-password-detection)
- [Auth0 Credential Guard](https://auth0.com/blog/detect-breached-passwords-faster-with-auth0-credential-guard/)
- [Auth0 Adaptive MFA](https://auth0.com/docs/secure/multi-factor-authentication/adaptive-mfa)
- [Auth0 WebAuthn/Passkeys](https://auth0.com/docs/secure/multi-factor-authentication/fido-authentication-with-webauthn)
- [Clerk MFA Documentation](https://clerk.com/docs/guides/development/custom-flows/account-updates/manage-totp-based-mfa)
- [Clerk Passkeys](https://clerk.com/docs/guides/development/custom-flows/authentication/passkeys)
- [Clerk Session Management](https://clerk.com/docs/reference/backend/sessions/revoke-session)
- [Clerk Password Protection](https://clerk.com/docs/guides/secure/password-protection-and-rules)
- [WorkOS MFA Documentation](https://workos.com/docs/mfa)
- [WorkOS MFA API Getting Started](https://workos.com/blog/getting-started-with-the-workos-multi-factor-authentication-api)
- [Firebase Auth TOTP MFA](https://firebase.google.com/docs/auth/web/totp-mfa)
- [Firebase Auth SMS MFA](https://firebase.google.com/docs/auth/web/multi-factor)
- [Supabase Auth MFA](https://supabase.com/docs/guides/auth/auth-mfa/totp)
- [Supabase Passwordless](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Supabase Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous)
- [HaveIBeenPwned API v3 Documentation](https://haveibeenpwned.com/api/v3)
- [HIBP k-Anonymity Implementation](https://github.com/HaveIBeenPwned/PwnedPasswordsAzureFunction)
- [Cloudflare k-Anonymity Blog](https://blog.cloudflare.com/validating-leaked-passwords-with-k-anonymity/)
- [FIDO Alliance Passkeys](https://fidoalliance.org/passkeys/)
