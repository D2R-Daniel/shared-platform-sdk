# Competitor Research: Razorpay
**Category**: Indian SaaS Ecosystem
**Research Date**: 2026-02-07
**Researcher**: Claude (automated)

---

## 1. Company Profile

| Attribute | Details |
|-----------|---------|
| **Website** | https://razorpay.com |
| **Founded** | 2014 |
| **Headquarters** | Bangalore, India |
| **Funding** | $742M total across 11 rounds from 37 investors |
| **Revenue** | ~INR 2,500 Cr ($300M+) FY2025; 65% YoY growth |
| **Valuation** | $9.2B (as of June 2025) |
| **Employees** | ~3,000+ |
| **Public Status** | Private (IPO expected in near future) |
| **Target Market** | India-first, expanding globally; SMB to enterprise |
| **Key Customers** | 10M+ businesses; Flipkart, Swiggy, Cred, Zerodha, BookMyShow |
| **Growth** | FY25 revenue up 65% YoY; gross profit exceeds INR 1,200 Cr |

### Key Milestones
- 2014: Founded by Harshil Mathur and Shashank Kumar (IIT Roorkee alumni)
- 2015: Launched payment gateway
- 2018: Launched RazorpayX (business banking)
- 2020: Acquired Payroll platform (Opfin)
- 2021: Raised $375M Series F at $7.5B valuation
- 2023: Turned profitable
- 2025: Valuation reaches $9.2B; preparing for IPO

### Unique Market Position
Razorpay is India's most popular payments infrastructure company, processing payments for millions of businesses. Unlike Stripe (its closest global analog), Razorpay is deeply integrated with India-specific payment methods (UPI, Netbanking, Wallets) and RBI regulations.

---

## 2. Module Coverage Matrix

| # | Module Area | Razorpay Coverage | Notes |
|---|------------|-------------------|-------|
| 1 | Auth (OAuth2/OIDC, JWT) | 🟡 Partial | API Key + Secret auth; dashboard-based OAuth for partners |
| 2 | Users (CRUD, profiles) | 🟡 Partial | Merchant/business user management via dashboard |
| 3 | Roles & Permissions (RBAC) | 🟡 Partial | Dashboard role management for team members |
| 4 | Multi-Tenancy | ✅ Full | Core architecture -- multi-merchant routing is their business |
| 5 | SSO (SAML, OIDC) | ❌ Not Available | Not a primary use case |
| 6 | Teams | 🟡 Partial | Team member management in dashboard |
| 7 | Invitations | 🟡 Partial | Team member invitation via dashboard |
| 8 | Webhooks | ✅ Full | Comprehensive webhook system for payment events |
| 9 | API Keys | ✅ Full | API key/secret pairs with test/live modes |
| 10 | Email | 🟡 Partial | Payment receipts, invoice emails |
| 11 | Settings | ✅ Full | Merchant configuration, payment preferences |
| 12 | Notifications | ✅ Full | SMS/email notifications for payments, refunds |
| 13 | Feature Flags | ❌ Not Available | No public feature flag system |
| 14 | Audit Logging | ✅ Full | Transaction logs, compliance audit trails |
| 15 | Sessions | 🟡 Partial | Dashboard session management |
| 16 | Billing | ✅ Full | Core business -- subscription billing via Razorpay Subscriptions |
| 17 | Analytics | ✅ Full | Razorpay Dashboard analytics, transaction reporting |
| 18 | File Storage | ❌ Not Available | Not applicable to payments domain |

**Coverage Score**: 7/18 Full, 7/18 Partial, 4/18 Not Available = **58% coverage**

### Platform Insight
Razorpay's coverage is narrowly focused on payments infrastructure. However, their patterns for Webhooks, Multi-Tenancy, API Keys, and Billing are best-in-class for India's regulatory environment.

---

## 3. SDK/API Design Patterns

### API Architecture
- **Style**: RESTful APIs
- **Data Format**: JSON request/response
- **Versioning**: URL-based (`/v1/`) -- notably stable, minimal version changes
- **Base URL**: `https://api.razorpay.com/v1/`

### Authentication
- **Primary**: HTTP Basic Auth with API Key ID and Secret
- **Test/Live Modes**: Separate key pairs for test and live environments
- **Signature Verification**: HMAC-SHA256 for payment verification and webhook validation
- **No OAuth**: Unlike many platforms, Razorpay uses simple key/secret, not OAuth

### SDK Languages
| Language | Status | Repository |
|----------|--------|------------|
| Node.js | ✅ Official | github.com/razorpay/razorpay-node |
| Python | ✅ Official | github.com/razorpay/razorpay-python |
| Java | ✅ Official | github.com/razorpay/razorpay-java |
| PHP | ✅ Official | github.com/razorpay/razorpay-php |
| Go | ✅ Official | github.com/razorpay/razorpay-go |
| Ruby | ✅ Official | github.com/razorpay/razorpay-ruby |
| .NET | ✅ Official | github.com/razorpay/razorpay-dotnet |
| iOS | ✅ Official | Checkout SDK |
| Android | ✅ Official | Checkout SDK |
| Flutter | ✅ Official | Checkout SDK |
| React Native | ✅ Official | Checkout SDK |

### Error Handling
- **HTTP Status Codes**: Standard (400, 401, 403, 404, 429, 500, 502)
- **Error Response Format**:
```json
{
  "error": {
    "code": "BAD_REQUEST_ERROR",
    "description": "The amount must be at least INR 1.00",
    "source": "business",
    "step": "payment_initiation",
    "reason": "input_validation_failed",
    "metadata": {}
  }
}
```
- **Error Codes**: Machine-readable, categorized (BAD_REQUEST_ERROR, GATEWAY_ERROR, SERVER_ERROR)
- **Rich Metadata**: Includes `source`, `step`, and `reason` for debugging

### Pagination
- **Method**: Cursor-based with `count` and `skip` parameters
- **Default Count**: 10 items per page
- **Max Count**: 100 items per page

### Rate Limiting
- **Approach**: Request rate limiter per API per time window
- **HTTP 429**: Returned when limit exceeded
- **Retry Strategy**: Exponential backoff or stepped backoff recommended
- **No Public Limits**: Exact limits not published; vary by endpoint and plan

### Webhook Patterns
- **Event Types**: 50+ event types (payment.authorized, payment.captured, refund.created, etc.)
- **Delivery Semantics**: At-least-once delivery
- **Retry Policy**: Automatic retries with increasing delays
- **Signature Verification**: HMAC-SHA256 using webhook secret
- **Modes**: Separate webhook configurations for test and live modes
- **Setup**: Dashboard UI + API-based configuration

### Documentation Quality: **4.5/5**
- Extremely clear, developer-focused documentation
- Step-by-step integration guides with code samples
- Interactive API reference
- Comprehensive webhook event documentation
- Excellent error code reference

---

## 4. Platform Architecture Insights

### How Razorpay Handles Multi-Tenant Payment Routing

**Core Architecture**:
1. **Merchant Isolation**: Each merchant gets isolated API credentials, separate webhook configurations, and independent settlement accounts
2. **Payment Orchestration**: Single API abstracts UPI, cards, wallets, Netbanking, EMI under one interface
3. **Route (Split Payments)**: Multi-party payment routing for marketplaces -- split a single payment across multiple merchant accounts
4. **Test/Live Separation**: Complete environment isolation with separate keys, webhooks, and data
5. **Idempotency**: Receipt-based idempotency for payment creation prevents duplicate charges

**Payment Flow Architecture**:
```
Customer -> Razorpay Checkout -> Payment Gateway -> Acquiring Bank
                                      |
                                      v
                              Payment Method Router
                              (UPI / Card / Net Banking / Wallet)
                                      |
                                      v
                              Settlement Engine -> Merchant Bank Account
```

**Key Design Patterns**:
- **Orders API**: Create order first, then capture payment -- two-step process prevents race conditions
- **Signature Verification**: Three-way verification (order_id + payment_id + razorpay_signature)
- **Webhooks as Source of Truth**: Recommend webhooks over polling for payment status
- **Automatic Retry on Gateway Failure**: Routes to backup gateways transparently

### Lessons for Our SDK
- **Idempotency patterns**: Razorpay's receipt-based idempotency is elegant. Our SDK should support idempotency keys for all mutation operations.
- **Test/Live mode separation**: Complete environment isolation is critical for developer experience
- **Two-step state transitions**: Create first, then confirm/capture -- prevents partial state issues
- **Signature verification utilities**: Providing SDK methods for webhook signature verification is essential

---

## 5. Developer Experience

### API Documentation
- **Quality**: 4.5/5 -- among the best in Indian SaaS
- **URL**: https://razorpay.com/docs/api/
- **Interactive**: cURL examples with copy-paste
- **Code Samples**: Available in all SDK languages
- **Guides**: Step-by-step integration guides for each payment method

### Developer Portal
- **Dashboard**: Full-featured dashboard with API explorer
- **Test Mode**: Sandbox environment with test credentials
- **Logs**: API request/response logs visible in dashboard
- **Webhooks**: Webhook delivery logs and retry status

### Integration Marketplace
- **Integrations Page**: Pre-built integrations for Shopify, WooCommerce, Magento, etc.
- **Plugins**: WordPress, Magento, OpenCart, PrestaShop
- **Platform SDKs**: Android, iOS, Flutter, React Native checkout SDKs

### Community and Ecosystem
- **GitHub**: Active open-source SDKs with good issue response time
- **Documentation**: Comprehensive, regularly updated
- **Support**: Developer support via email, chat for enterprise
- **Blog**: Technical blog with integration guides

---

## 6. Indian Market Specific Insights

### Pricing Strategy
- **No setup fee**: Zero upfront cost
- **Transaction-based**: 2% per transaction (Standard Plan)
- **Enterprise**: Custom pricing for high-volume businesses
- **UPI Tiered Pricing**: Fees decrease as UPI volume increases (>INR 25L or >INR 5Cr thresholds)
- **Competitive**: Among the most affordable payment gateways in India

### Compliance
- **RBI Compliance**: Full compliance with Reserve Bank of India regulations
- **PCI DSS**: Level 1 Service Provider certification
- **Tokenization**: Card tokenization per RBI mandate
- **e-Mandate**: RBI e-mandate support for recurring payments
- **UPI 2FA**: Mandatory two-factor authentication via UPI PIN
- **DPDP Act**: Data protection compliance for Indian regulations
- **PA-PG License**: RBI Payment Aggregator license holder

### Payment Methods (India-Specific)
- **UPI**: Deep UPI integration (UPI Collect, QR, Autopay, Mandate)
- **Netbanking**: 50+ banks
- **Cards**: Visa, Mastercard, Rupay, Amex
- **Wallets**: Paytm, PhonePe, Amazon Pay, etc.
- **EMI**: No-cost EMI, Cardless EMI
- **Pay Later**: Simpl, LazyPay, etc.
- **International**: 100+ currencies for global acceptance

### Multi-Language Support
- **Dashboard**: English (primarily)
- **Checkout**: Multi-language checkout page
- **Documentation**: English only

---

## 7. Enterprise Features

| Feature | Status | Notes |
|---------|--------|-------|
| PCI DSS Level 1 | ✅ | Highest level of payment security certification |
| ISO 27001 | ✅ | Information security management |
| SOC 2 | ✅ | Security and availability trust criteria |
| GDPR | 🟡 | Applicable for EU transactions |
| Multi-tenancy | ✅ | Core architecture for merchant isolation |
| Audit Logging | ✅ | Complete transaction and API call logs |
| SSO | ❌ | Not available for dashboard access |
| Route (Split Payments) | ✅ | Multi-party settlement for marketplaces |
| Subscription Billing | ✅ | Recurring payment management |
| Smart Routing | ✅ | Automatic payment method routing |
| 24x7 Enterprise Support | ✅ | For Enterprise plan customers |

---

## 8. Pricing Model

### Payment Gateway
| Plan | Pricing | Features |
|------|---------|----------|
| Standard | 2% per transaction | Zero setup, zero AMC, all payment methods |
| Enterprise | Custom | Lower rates, dedicated account manager, 24x7 support, custom integrations |

### UPI Tiered Pricing
| Volume Tier | Fee |
|-------------|-----|
| Up to INR 25L | Standard 2% |
| INR 25L - INR 5Cr | Reduced rate |
| Above INR 5Cr | Further reduced rate |

### Additional Products
- **RazorpayX** (Business Banking): Custom pricing
- **Razorpay Payroll**: Per-employee pricing
- **Payment Links**: Included in standard plan
- **Payment Pages**: Included in standard plan

### Free Tier
- No free tier per se, but no fixed costs -- you only pay on transactions
- Test mode is completely free

---

## 9. Unique Differentiators

1. **India-native payment orchestration**: Single API for UPI, Cards, Netbanking, Wallets, EMI -- no other platform matches this breadth for India
2. **Developer-first approach**: Clean APIs, comprehensive SDKs in 7+ languages, excellent documentation
3. **Route (Split Payments)**: Marketplace payment routing that's critical for India's platform economy
4. **RazorpayX**: Full-stack financial infrastructure (payments + banking + payroll)
5. **Test/Live mode**: Complete environment isolation for safe development
6. **Idempotency built-in**: Receipt-based deduplication prevents double charges
7. **Smart routing**: Automatic failover between payment gateways for higher success rates
8. **India regulatory compliance**: PA-PG license, tokenization, e-mandate -- all RBI requirements covered

---

## 10. SWOT vs Our SDK

### Strengths (of Razorpay vs Our SDK)
- Best-in-class webhook reliability and delivery patterns
- Proven multi-tenant payment routing at massive scale (10M+ merchants)
- Excellent developer experience with comprehensive SDKs
- Deep India regulatory compliance expertise
- Idempotency and signature verification patterns are production-proven

### Weaknesses (of Razorpay relative to our opportunity)
- Focused purely on payments -- no auth, users, teams, roles modules
- No OAuth 2.0 support for API auth (only basic auth)
- Limited SSO and RBAC capabilities
- No feature flags, file storage, or general-purpose platform capabilities
- India-centric -- limited global payment method coverage

### Opportunities (for Our SDK learning from Razorpay)
- **Webhook patterns**: Adopt Razorpay's at-least-once delivery, HMAC signature verification, and retry with backoff
- **Idempotency**: Implement idempotency keys across all SDK mutation endpoints
- **Test/Live mode separation**: Provide complete environment isolation in our SDK
- **Error response richness**: Razorpay's error format (code + description + source + step + reason) is excellent
- **Two-step operations**: Order->Payment pattern translates to Create->Confirm for our modules
- **Multi-SDK coverage**: Razorpay covers 7+ languages -- we should match or exceed this

### Threats
- Razorpay expanding into general platform services (banking, payroll, etc.)
- Their developer mindshare in India is enormous
- If they open their platform APIs, they become a direct competitor for billing/subscription modules

---

## 11. Key Insights for Our SDK

### Webhook Reliability Patterns
1. **At-Least-Once Delivery**: Razorpay guarantees at least one delivery attempt. Our Webhooks module should implement the same guarantee with idempotency keys for consumers.

2. **HMAC-SHA256 Signature Verification**: Razorpay signs every webhook with HMAC-SHA256. Our SDK should provide:
   - Server-side signature generation
   - Client-side signature verification utilities
   - Webhook secret rotation support

3. **Retry with Exponential Backoff**: Razorpay retries failed webhooks with increasing delays. Our SDK should implement configurable retry policies.

4. **Event Payload Structure**: Razorpay's webhook payloads include the full resource object plus event metadata. Our SDK should follow this pattern.

### Idempotency Handling
1. **Receipt-based Deduplication**: Razorpay uses a merchant-provided `receipt` as idempotency key for orders. Our SDK should accept client-provided idempotency keys on all POST/PUT endpoints.

2. **Idempotency Response**: When a duplicate request is detected, return the original response (not an error). Our SDK should implement this pattern.

### Multi-Tenant Payment Routing (Informs Billing Module)
1. **Route/Transfer API**: Razorpay's marketplace split payment pattern is directly applicable to our Billing module's multi-tenant scenarios.
2. **Settlement Timing**: Razorpay manages T+2 settlements. Our Billing module should support configurable settlement schedules.

### API Versioning Strategy
- Razorpay has maintained `/v1/` for years, making backward-compatible additions rather than breaking changes. This stability-first approach is worth emulating.

### Error Response Design
- The `source` + `step` + `reason` triple in error responses is invaluable for debugging. Our SDK should adopt a similar structured error format.

---

## 12. Research Sources

| Source | URL | Confidence |
|--------|-----|------------|
| Razorpay API Documentation | https://razorpay.com/docs/api/ | High |
| Razorpay Webhook Documentation | https://razorpay.com/docs/ | High |
| Razorpay GitHub Organization | https://github.com/razorpay | High |
| Razorpay Integrations Page | https://razorpay.com/integrations/ | High |
| Razorpay Python SDK | https://github.com/razorpay/razorpay-python | High |
| Razorpay Java SDK | https://github.com/razorpay/razorpay-java | High |
| Razorpay Security & Compliance | https://razorpay.com/docs/security/shared-responsibility-model/ | High |
| Razorpay PCI DSS Certificate | https://razorpay.com/docs/build/browser/assets/images/pci-dss-us.pdf | High |
| Tracxn Razorpay Profile | https://tracxn.com/d/companies/razorpay/__ARWa67NVJPe3TC11rYSBnp-0zVHbDAze4xZvzRsZzAI | Medium |
| PitchBook Razorpay Profile | https://pitchbook.com/profiles/company/110393-29 | Medium |
| Razorpay Pricing Page | https://razorpay.com/us/pricing/ | High |
| Razorpay RBI e-Mandate Docs | https://razorpay.com/blog/business-banking/rbi-policy-upi-bbps/ | High |
| API Tracker Razorpay Profile | https://apitracker.io/a/razorpay | Medium |
