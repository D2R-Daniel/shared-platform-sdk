# Compliance, Social Connections & OAuth2 Server Modules -- Detailed Requirements Specification

**Document**: Compliance & Data Privacy, Social Connections Manager, OAuth2 Authorization Server
**Version**: 1.0
**Date**: 2026-02-07
**Status**: Draft
**Branch**: `006-platform-component-expansion`
**Scope**: 3 new modules filling remaining competitive gaps for GA readiness

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Compliance & Data Privacy Module (P1 -- New)](#2-compliance--data-privacy-module)
3. [Social Connections Manager Module (P2 -- New)](#3-social-connections-manager-module)
4. [OAuth2 Authorization Server Module (P2 -- New)](#4-oauth2-authorization-server-module)
5. [Cross-Cutting Concerns](#5-cross-cutting-concerns)
6. [Appendix: Competitive Feature Matrix](#6-appendix-competitive-feature-matrix)

---

## 1. Executive Summary

This specification defines requirements for three new modules that close the remaining competitive gaps between our Shared Platform SDK and market leaders (Auth0, Clerk, WorkOS, Firebase Auth, Supabase Auth). These modules address:

1. **Compliance & Data Privacy** (P1): Regulatory compliance (GDPR, CCPA, SOC2) is table-stakes for any enterprise identity platform. Auth0 provides basic GDPR tooling (export, delete, consent tracking). Dedicated privacy platforms (OneTrust, TrustArc, Osano) handle consent management but do not integrate with identity. Our module bridges the gap by embedding compliance directly into the identity layer.

2. **Social Connections Manager** (P2): Auth0 supports 50+ social providers. Clerk supports 25+. WorkOS supports 7. Firebase and Supabase each support 15-20. Our SDK currently has no social login orchestration. This module provides self-service social provider management with a competitive initial set of 15+ providers and a custom-provider escape hatch.

3. **OAuth2 Authorization Server** (P2): Auth0, Okta, and Keycloak offer full OAuth2/OIDC server capabilities. Clerk recently added OIDC provider support (February 2025). Supabase launched OAuth 2.1 server capabilities. Ory Hydra is the open-source gold standard. Our SDK must enable customers to act as an OAuth2/OIDC provider themselves -- powering "Sign in with [YourApp]" experiences, developer platforms, and MCP agent authentication.

### Scope

| Module | Priority | Status | Target | Dependencies |
|--------|----------|--------|--------|-------------|
| Compliance & Data Privacy | P1 | New | GA | Users, Settings, Audit Logs |
| Social Connections Manager | P2 | New | GA | Auth, Users, Tenants |
| OAuth2 Authorization Server | P2 | New | GA | Auth, Users, Session Management |

### Drivers

- **Competitive parity**: Auth0 and Okta ship GDPR tooling, 50+ social providers, and full OAuth2 server capabilities as standard. Our SDK has none of these.
- **Customer requests**: Enterprise customers require GDPR/CCPA compliance tooling for procurement. Developer platform customers need OAuth2 server capabilities. Consumer app customers need social login.
- **Platform maturity**: These three modules complete the feature surface expected of a GA-quality CIAM platform competing in the Auth0/Clerk/WorkOS tier.

### Existing Module Capabilities (Relevant Baselines)

The following existing modules provide foundations that these new modules build upon:

| Module | Relevant Capabilities |
|--------|----------------------|
| **Auth** | OAuth2 password grant, token management, OIDC UserInfo, JWT validation |
| **Users** | User CRUD, profile management, metadata storage |
| **Settings** | Tenant configuration, feature flags |
| **Audit Logs** | Event recording, compliance-grade logging |
| **Webhooks** | Event delivery infrastructure (used for breach notifications, consent changes) |
| **Tenants** | Multi-tenant isolation, tenant configuration |
| **Session Management** | Session lifecycle, device tracking |

---

## 2. Compliance & Data Privacy Module

### Overview

The Compliance & Data Privacy module provides programmatic tools for organizations to meet regulatory requirements under GDPR (EU), CCPA/CPRA (California), LGPD (Brazil), PIPEDA (Canada), and SOC2. It embeds compliance directly into the identity layer, eliminating the gap between "identity platform" and "privacy tooling" that currently forces customers to integrate separate systems (OneTrust, TrustArc, Osano) alongside their auth provider.

**Value Proposition**: No competitor in the CIAM space offers a unified compliance SDK. Auth0 provides basic GDPR helpers (export, delete, consent checkbox). OneTrust/TrustArc are enterprise privacy platforms with no identity integration. Our module combines the best of both: identity-aware compliance automation with developer-friendly APIs.

### Competitive Analysis

| Feature | Auth0 | Clerk | WorkOS | OneTrust | TrustArc | Osano | Our SDK (Target) |
|---------|-------|-------|--------|----------|----------|-------|-----------------|
| User Data Export (GDPR Art. 20) | Yes (Management API + JSON) | Manual (API) | Manual (support request) | N/A (not identity) | N/A | N/A | Yes (automated) |
| Right to Erasure (GDPR Art. 17) | Yes (API + Dashboard) | Yes (API) | Manual (support) | DSR automation | DSR automation | DSR automation | Yes (cascading) |
| Data Retention Policies | No (manual) | No | No | Yes | Yes | No | Yes (configurable) |
| Consent Management | Yes (Lock widget + metadata) | No | No | Yes (full CMP) | Yes (full CMP) | Yes (full CMP) | Yes (identity-integrated) |
| DPA Management | DPA document only | DPA document only | DPA document only | Yes (full lifecycle) | Yes | No | Yes (API-managed) |
| Privacy Policy Versioning | No | No | No | Yes | Yes | No | Yes |
| Data Residency Controls | Yes (region selection) | No (US/EU) | No | Yes | No | No | Yes (per-tenant) |
| PII Detection & Masking | No | No | No | Yes | Yes | No | Yes |
| Cookie Consent | No | No | No | Yes (full CMP) | Yes | Yes | Yes (SDK integration) |
| Compliance Audit Reports | No (logs only) | No | Audit Logs only | Yes | Yes | Yes | Yes (automated generation) |
| Data Breach Notification | No | No | No | Yes (workflows) | Yes | No | Yes (workflow + webhook) |
| Lawful Basis Tracking | No (consent only) | No | No | Yes | Yes | No | Yes |
| Consent Preference Center | No | No | No | Yes (embeddable) | Yes | Yes | Yes (embeddable) |
| Cross-Regulation Support | GDPR only | None | None | 60+ regulations | 50+ regulations | 95+ regulations | GDPR, CCPA, LGPD, PIPEDA |

**Key competitive insights**:
- Auth0 provides basic GDPR compliance (export, delete, consent flag on user metadata) but no comprehensive privacy tooling. Consent is tracked as user metadata, not a first-class system.
- OneTrust is the market leader in consent management (Forrester Wave leader Q4 2025) with API access, consent distribution via webhooks, 60+ language support, and geolocation-based dynamic banners. However, it has no identity integration.
- TrustArc offers consent preference management with API enhancements in 2025 including migration APIs and metadata enrichment for consent records.
- Osano provides a Unified Consent & Preference Hub with IAB GPP CMP API specifications, privacy-by-default design, and hashed identifiers.
- No competitor offers compliance tooling tightly integrated with an identity SDK -- this is our differentiation opportunity.

### Requirements

#### Core Features (Must Have)

1. **User Data Export (GDPR Article 20 -- Data Portability)**
   - Export all personal data associated with a user in machine-readable format (JSON, CSV)
   - Include data from all modules: profile, auth history, session logs, consent records, team memberships, role assignments, audit trail
   - Support asynchronous export for large datasets (job-based with status polling)
   - Provide download URL with expiring signed link
   - API methods:
     - `exportUserData(userId, options)` -- initiate export job
     - `getExportStatus(exportId)` -- poll job status
     - `downloadExport(exportId)` -- get download URL
     - `listExports(userId?, page?, pageSize?)` -- list export history
   - Models: `DataExportRequest`, `DataExport`, `DataExportStatus`, `ExportFormat`, `ExportListResponse`

2. **User Data Deletion / Right to Be Forgotten (GDPR Article 17)**
   - Cascade deletion across all modules: user profile, auth tokens, sessions, team memberships, audit log entries (anonymize), consent records
   - Support soft-delete with configurable retention window before hard-delete (for fraud prevention)
   - Support selective deletion (delete specific data categories, not entire account)
   - Generate deletion certificate with cryptographic proof
   - API methods:
     - `deleteUserData(userId, options)` -- initiate deletion
     - `getDeletionStatus(deletionId)` -- poll status
     - `listDeletions(userId?, page?, pageSize?)` -- list deletion history
     - `getDeletionCertificate(deletionId)` -- get proof of deletion
   - Models: `DataDeletionRequest`, `DataDeletion`, `DeletionStatus`, `DeletionScope`, `DeletionCertificate`

3. **Data Retention Policies**
   - Configure retention periods per data type (e.g., session logs: 90 days, audit logs: 7 years, user profiles: indefinite until deletion request)
   - Automatic purge when retention period expires
   - Tenant-level and global-level policy configuration
   - Support for legal hold (suspend purge for specific users/data during litigation)
   - API methods:
     - `getRetentionPolicy(tenantId?)` -- get current policies
     - `updateRetentionPolicy(tenantId?, policy)` -- update policies
     - `setLegalHold(userId, reason)` -- place legal hold
     - `removeLegalHold(userId)` -- remove legal hold
     - `listLegalHolds(page?, pageSize?)` -- list active holds
   - Models: `RetentionPolicy`, `RetentionRule`, `DataCategory`, `LegalHold`, `LegalHoldListResponse`

4. **Consent Management**
   - Track user consent for specific processing purposes (e.g., marketing, analytics, essential services)
   - Record consent grants and revocations with full audit trail (who, when, what version of policy, IP address, user agent)
   - Support multiple lawful bases per processing purpose (consent, contract, legitimate interest, legal obligation, vital interest, public task)
   - Consent versioning -- when consent terms change, track which version each user consented to
   - Bulk consent status queries (e.g., "list all users who consented to marketing")
   - API methods:
     - `grantConsent(userId, request)` -- record consent grant
     - `revokeConsent(userId, purposeId)` -- revoke consent
     - `getConsent(userId, purposeId?)` -- get consent status
     - `listConsents(userId)` -- list all consents for a user
     - `listConsentsByPurpose(purposeId, status?, page?, pageSize?)` -- list users by consent status
     - `getConsentHistory(userId, purposeId?)` -- full audit trail
   - Models: `ConsentGrant`, `ConsentRecord`, `ConsentPurpose`, `ConsentStatus`, `LawfulBasis`, `ConsentHistoryEntry`, `ConsentListResponse`

5. **Lawful Basis Tracking**
   - Track the legal basis for each type of data processing per user
   - Support all six GDPR Article 6 bases: consent, contract, legal obligation, vital interests, public task, legitimate interests
   - Record assessments and justifications for non-consent bases
   - API methods:
     - `setLawfulBasis(userId, processingActivity, basis, justification?)` -- set basis
     - `getLawfulBasis(userId, processingActivity?)` -- get basis
     - `listLawfulBases(userId)` -- list all bases for a user
   - Models: `LawfulBasisRecord`, `ProcessingActivity`, `LawfulBasisType`, `LawfulBasisListResponse`

6. **Privacy Policy Versioning and Acceptance Tracking**
   - Store multiple versions of privacy policies with effective dates
   - Track which version each user has accepted and when
   - Trigger re-acceptance flow when a new policy version is published
   - API methods:
     - `createPolicyVersion(request)` -- publish new version
     - `getPolicyVersion(versionId)` -- get specific version
     - `getCurrentPolicy(policyType?)` -- get active version
     - `listPolicyVersions(policyType?, page?, pageSize?)` -- list all versions
     - `recordAcceptance(userId, versionId)` -- record user acceptance
     - `getAcceptanceStatus(userId, policyType?)` -- check if user is current
     - `listPendingAcceptances(versionId, page?, pageSize?)` -- users who need to accept
   - Models: `PrivacyPolicy`, `PolicyVersion`, `PolicyType`, `PolicyAcceptance`, `AcceptanceStatus`, `PolicyListResponse`

7. **Compliance Audit Reports**
   - Generate compliance reports for specific regulations (GDPR, CCPA, SOC2)
   - Include: consent statistics, deletion request metrics, data export requests, retention policy adherence, breach notification history
   - Support scheduled report generation (weekly, monthly, quarterly)
   - Export in PDF, CSV, and JSON formats
   - API methods:
     - `generateReport(request)` -- initiate report generation
     - `getReportStatus(reportId)` -- poll status
     - `downloadReport(reportId)` -- get download URL
     - `listReports(page?, pageSize?)` -- list generated reports
     - `scheduleReport(request)` -- create recurring schedule
     - `listSchedules()` -- list active schedules
     - `deleteSchedule(scheduleId)` -- remove schedule
   - Models: `ComplianceReport`, `ReportRequest`, `ReportType`, `ReportFormat`, `ReportSchedule`, `ReportListResponse`

#### Enhanced Features (Should Have)

8. **Data Residency Controls**
   - Specify data storage region per tenant (US, EU, AP, custom)
   - Enforce region constraints at the API layer (reject writes to wrong region)
   - Region migration tooling (move tenant data between regions)
   - API methods:
     - `getDataResidency(tenantId)` -- get current region config
     - `setDataResidency(tenantId, region)` -- configure region
     - `initiateRegionMigration(tenantId, targetRegion)` -- start migration
     - `getMigrationStatus(migrationId)` -- poll status
   - Models: `DataResidency`, `DataRegion`, `RegionMigration`, `MigrationStatus`

9. **PII Detection and Masking**
   - Scan user metadata and custom fields for PII (emails, phone numbers, SSNs, credit cards)
   - Configurable masking rules (e.g., mask last 4 digits of SSN, hash email in logs)
   - Automatic PII detection on write operations with policy enforcement (warn or block)
   - API methods:
     - `scanForPII(data)` -- detect PII in arbitrary data
     - `getMaskingRules()` -- get current rules
     - `updateMaskingRules(rules)` -- update rules
     - `maskData(data, rules?)` -- apply masking to data
   - Models: `PIIScanResult`, `PIIField`, `PIIType`, `MaskingRule`, `MaskingRuleSet`

10. **Data Processing Agreements (DPA) Management**
    - Store and manage DPAs with sub-processors
    - Track DPA status (draft, active, expired, terminated)
    - Notification when DPAs approach expiry
    - API methods:
      - `createDPA(request)` -- create DPA record
      - `getDPA(dpaId)` -- get DPA details
      - `updateDPA(dpaId, request)` -- update DPA
      - `listDPAs(status?, page?, pageSize?)` -- list DPAs
      - `listSubProcessors()` -- list sub-processors
    - Models: `DataProcessingAgreement`, `DPAStatus`, `SubProcessor`, `DPAListResponse`

11. **Cookie Consent Management**
    - JavaScript SDK/snippet for cookie consent banner
    - Configurable consent categories (essential, functional, analytics, marketing)
    - Geolocation-based dynamic consent requirements (opt-in for EU, opt-out for US)
    - Integration with IAB TCF 2.2 and GPP frameworks
    - Sync consent state with server-side consent records
    - API methods:
      - `getCookieConsentConfig(tenantId)` -- get banner configuration
      - `updateCookieConsentConfig(tenantId, config)` -- update configuration
      - `recordCookieConsent(userId?, sessionId, preferences)` -- record preferences
      - `getCookieConsent(userId?, sessionId?)` -- get current preferences
    - Models: `CookieConsentConfig`, `CookieCategory`, `CookieConsentPreferences`, `GeoConsentRule`

12. **Data Breach Notification Workflows**
    - Create and manage breach incident records
    - Automated notification workflows (72-hour GDPR deadline tracking)
    - Notify affected users via email (integrate with Email module)
    - Notify supervisory authorities (template-based)
    - Webhook events for breach lifecycle
    - API methods:
      - `createBreachIncident(request)` -- create incident
      - `getBreachIncident(incidentId)` -- get incident details
      - `updateBreachIncident(incidentId, request)` -- update incident
      - `listBreachIncidents(status?, page?, pageSize?)` -- list incidents
      - `notifyAffectedUsers(incidentId, request)` -- send notifications
      - `getNotificationStatus(incidentId)` -- check notification progress
    - Models: `BreachIncident`, `BreachSeverity`, `BreachStatus`, `BreachNotification`, `AffectedUsersCriteria`, `BreachListResponse`

#### Future Features (Nice to Have)

13. **Consent Preference Center (Embeddable Component)**
    - Pre-built, customizable UI component for users to manage their consent preferences
    - Embeddable via iframe or Web Component
    - Multi-language support (20+ languages)
    - Themed to match tenant branding

14. **Cross-Border Data Transfer Compliance**
    - Standard Contractual Clauses (SCC) management
    - Transfer Impact Assessment (TIA) tooling
    - Adequacy decision tracking per country

15. **Privacy Impact Assessment (PIA/DPIA) Tooling**
    - Guided DPIA workflow for new processing activities
    - Risk scoring and mitigation tracking
    - Integration with compliance audit reports

16. **Automated Compliance Scanning**
    - Continuous scanning of tenant configuration for compliance gaps
    - Recommendations engine (e.g., "You have users in EU but no GDPR retention policy")
    - Compliance score dashboard

### API Surface

| Method | Description | Parameters | Returns |
|--------|------------|------------|---------|
| **Data Export** | | | |
| `exportUserData(userId, options)` | Initiate user data export | `userId: string`, `ExportOptions` | `DataExport` |
| `getExportStatus(exportId)` | Get export job status | `exportId: string` | `DataExport` |
| `downloadExport(exportId)` | Get signed download URL | `exportId: string` | `ExportDownload` |
| `listExports(userId?, page?, pageSize?)` | List export history | Pagination + filters | `ExportListResponse` |
| **Data Deletion** | | | |
| `deleteUserData(userId, options)` | Initiate cascading deletion | `userId: string`, `DeletionOptions` | `DataDeletion` |
| `getDeletionStatus(deletionId)` | Get deletion job status | `deletionId: string` | `DataDeletion` |
| `listDeletions(userId?, page?, pageSize?)` | List deletion history | Pagination + filters | `DeletionListResponse` |
| `getDeletionCertificate(deletionId)` | Get cryptographic proof | `deletionId: string` | `DeletionCertificate` |
| **Retention Policies** | | | |
| `getRetentionPolicy(tenantId?)` | Get retention policies | `tenantId?: string` | `RetentionPolicy` |
| `updateRetentionPolicy(tenantId?, policy)` | Update retention policies | `tenantId?`, `RetentionPolicy` | `RetentionPolicy` |
| `setLegalHold(userId, reason)` | Place legal hold on user data | `userId: string`, `reason: string` | `LegalHold` |
| `removeLegalHold(userId)` | Remove legal hold | `userId: string` | `void` |
| `listLegalHolds(page?, pageSize?)` | List active legal holds | Pagination | `LegalHoldListResponse` |
| **Consent Management** | | | |
| `grantConsent(userId, request)` | Record consent grant | `userId: string`, `ConsentGrantRequest` | `ConsentRecord` |
| `revokeConsent(userId, purposeId)` | Revoke consent | `userId: string`, `purposeId: string` | `ConsentRecord` |
| `getConsent(userId, purposeId?)` | Get consent status | `userId`, optional `purposeId` | `ConsentRecord` or `ConsentRecord[]` |
| `listConsents(userId)` | List all consents for user | `userId: string` | `ConsentRecord[]` |
| `listConsentsByPurpose(purposeId, ...)` | List users by consent status | `purposeId`, filters, pagination | `ConsentListResponse` |
| `getConsentHistory(userId, purposeId?)` | Full consent audit trail | `userId`, optional `purposeId` | `ConsentHistoryEntry[]` |
| **Lawful Basis** | | | |
| `setLawfulBasis(userId, activity, basis, justification?)` | Set lawful basis | `userId`, `activity`, `basis`, `justification?` | `LawfulBasisRecord` |
| `getLawfulBasis(userId, activity?)` | Get lawful basis | `userId`, optional `activity` | `LawfulBasisRecord` or `LawfulBasisRecord[]` |
| `listLawfulBases(userId)` | List all bases | `userId: string` | `LawfulBasisRecord[]` |
| **Privacy Policy** | | | |
| `createPolicyVersion(request)` | Publish new policy version | `CreatePolicyVersionRequest` | `PolicyVersion` |
| `getPolicyVersion(versionId)` | Get specific version | `versionId: string` | `PolicyVersion` |
| `getCurrentPolicy(policyType?)` | Get active policy | `policyType?: PolicyType` | `PolicyVersion` |
| `listPolicyVersions(policyType?, ...)` | List all versions | Filters, pagination | `PolicyListResponse` |
| `recordAcceptance(userId, versionId)` | Record acceptance | `userId`, `versionId` | `PolicyAcceptance` |
| `getAcceptanceStatus(userId, policyType?)` | Check acceptance status | `userId`, optional `policyType` | `AcceptanceStatus` |
| `listPendingAcceptances(versionId, ...)` | List users needing acceptance | `versionId`, pagination | `PendingAcceptanceListResponse` |
| **Compliance Reports** | | | |
| `generateReport(request)` | Generate compliance report | `ReportRequest` | `ComplianceReport` |
| `getReportStatus(reportId)` | Get report status | `reportId: string` | `ComplianceReport` |
| `downloadReport(reportId)` | Get download URL | `reportId: string` | `ReportDownload` |
| `listReports(page?, pageSize?)` | List reports | Pagination | `ReportListResponse` |
| `scheduleReport(request)` | Create recurring schedule | `ReportScheduleRequest` | `ReportSchedule` |
| `listSchedules()` | List active schedules | None | `ReportSchedule[]` |
| `deleteSchedule(scheduleId)` | Delete schedule | `scheduleId: string` | `void` |
| **Data Residency** | | | |
| `getDataResidency(tenantId)` | Get region config | `tenantId: string` | `DataResidency` |
| `setDataResidency(tenantId, region)` | Set region | `tenantId`, `DataRegion` | `DataResidency` |
| `initiateRegionMigration(tenantId, targetRegion)` | Start migration | `tenantId`, `targetRegion` | `RegionMigration` |
| `getMigrationStatus(migrationId)` | Poll migration status | `migrationId: string` | `RegionMigration` |
| **PII** | | | |
| `scanForPII(data)` | Detect PII in data | `data: object` | `PIIScanResult` |
| `getMaskingRules()` | Get masking rules | None | `MaskingRuleSet` |
| `updateMaskingRules(rules)` | Update masking rules | `MaskingRuleSet` | `MaskingRuleSet` |
| `maskData(data, rules?)` | Apply masking | `data: object`, optional `rules` | `object` |
| **DPA Management** | | | |
| `createDPA(request)` | Create DPA | `CreateDPARequest` | `DataProcessingAgreement` |
| `getDPA(dpaId)` | Get DPA | `dpaId: string` | `DataProcessingAgreement` |
| `updateDPA(dpaId, request)` | Update DPA | `dpaId`, `UpdateDPARequest` | `DataProcessingAgreement` |
| `listDPAs(status?, ...)` | List DPAs | Filters, pagination | `DPAListResponse` |
| `listSubProcessors()` | List sub-processors | None | `SubProcessor[]` |
| **Cookie Consent** | | | |
| `getCookieConsentConfig(tenantId)` | Get banner config | `tenantId: string` | `CookieConsentConfig` |
| `updateCookieConsentConfig(tenantId, config)` | Update config | `tenantId`, `CookieConsentConfig` | `CookieConsentConfig` |
| `recordCookieConsent(request)` | Record cookie preferences | `CookieConsentRequest` | `CookieConsentPreferences` |
| `getCookieConsent(userId?, sessionId?)` | Get preferences | `userId?` or `sessionId?` | `CookieConsentPreferences` |
| **Breach Notification** | | | |
| `createBreachIncident(request)` | Create incident | `CreateBreachIncidentRequest` | `BreachIncident` |
| `getBreachIncident(incidentId)` | Get incident | `incidentId: string` | `BreachIncident` |
| `updateBreachIncident(incidentId, request)` | Update incident | `incidentId`, `UpdateBreachIncidentRequest` | `BreachIncident` |
| `listBreachIncidents(status?, ...)` | List incidents | Filters, pagination | `BreachListResponse` |
| `notifyAffectedUsers(incidentId, request)` | Send notifications | `incidentId`, `NotificationRequest` | `BreachNotification` |
| `getNotificationStatus(incidentId)` | Check progress | `incidentId: string` | `BreachNotification` |

### Models

#### Core Models

```
DataExport:
  id: string (uuid)
  user_id: string (uuid)
  tenant_id: string (uuid)
  format: ExportFormat ("json" | "csv")
  status: DataExportStatus ("pending" | "processing" | "completed" | "failed" | "expired")
  include_categories: DataCategory[]
  file_url: string? (signed URL, expires after download_expiry_hours)
  file_size_bytes: int?
  download_expiry_hours: int (default: 24)
  error_message: string?
  requested_by: string (uuid -- admin user who initiated)
  created_at: datetime
  completed_at: datetime?
  expires_at: datetime?

DataDeletion:
  id: string (uuid)
  user_id: string (uuid)
  tenant_id: string (uuid)
  scope: DeletionScope ("full" | "selective")
  categories: DataCategory[]? (when selective)
  status: DeletionStatus ("pending" | "processing" | "completed" | "failed" | "cancelled")
  soft_delete: boolean (default: true)
  hard_delete_after_days: int? (default: 30)
  anonymize_audit_logs: boolean (default: true)
  cascade_results: CascadeDeletionResult[]
  requested_by: string (uuid)
  reason: string?
  created_at: datetime
  completed_at: datetime?

DeletionCertificate:
  id: string (uuid)
  deletion_id: string (uuid)
  user_id: string (uuid)
  tenant_id: string (uuid)
  categories_deleted: DataCategory[]
  deletion_timestamp: datetime
  certificate_hash: string (SHA-256)
  signature: string (signed by platform key)
  issued_at: datetime

CascadeDeletionResult:
  module: string
  records_deleted: int
  records_anonymized: int
  status: "completed" | "failed" | "skipped"
  error_message: string?

DataCategory (enum):
  - "profile"           # User profile data
  - "auth_history"      # Login history, token records
  - "sessions"          # Session data
  - "consent_records"   # Consent grants/revocations
  - "audit_logs"        # Audit trail entries
  - "team_memberships"  # Team membership records
  - "role_assignments"  # Role assignment records
  - "api_keys"          # API keys owned by user
  - "webhook_deliveries"# Webhook delivery logs
  - "email_history"     # Email send records
  - "mfa_devices"       # MFA device registrations
  - "passkeys"          # Passkey/WebAuthn credentials
  - "social_connections"# Linked social accounts
  - "metadata"          # Custom user metadata

RetentionPolicy:
  id: string (uuid)
  tenant_id: string? (uuid, null for global default)
  rules: RetentionRule[]
  created_at: datetime
  updated_at: datetime

RetentionRule:
  data_category: DataCategory
  retention_days: int (0 = indefinite)
  action_on_expiry: "delete" | "anonymize" | "archive"
  is_active: boolean

LegalHold:
  id: string (uuid)
  user_id: string (uuid)
  tenant_id: string (uuid)
  reason: string
  placed_by: string (uuid)
  is_active: boolean
  placed_at: datetime
  removed_at: datetime?
  removed_by: string? (uuid)

ConsentRecord:
  id: string (uuid)
  user_id: string (uuid)
  tenant_id: string (uuid)
  purpose_id: string (uuid)
  purpose_name: string
  status: ConsentStatus ("granted" | "revoked" | "expired")
  lawful_basis: LawfulBasisType
  policy_version_id: string? (uuid)
  granted_at: datetime?
  revoked_at: datetime?
  expires_at: datetime?
  ip_address: string?
  user_agent: string?
  metadata: object?

ConsentPurpose:
  id: string (uuid)
  tenant_id: string (uuid)
  name: string
  description: string
  category: string ("essential" | "functional" | "analytics" | "marketing" | "custom")
  is_required: boolean (essential purposes cannot be revoked)
  default_lawful_basis: LawfulBasisType
  is_active: boolean
  created_at: datetime
  updated_at: datetime

ConsentHistoryEntry:
  id: string (uuid)
  consent_id: string (uuid)
  action: "granted" | "revoked" | "expired" | "renewed"
  lawful_basis: LawfulBasisType
  policy_version_id: string?
  ip_address: string?
  user_agent: string?
  timestamp: datetime

LawfulBasisType (enum):
  - "consent"
  - "contract"
  - "legal_obligation"
  - "vital_interests"
  - "public_task"
  - "legitimate_interests"

LawfulBasisRecord:
  id: string (uuid)
  user_id: string (uuid)
  tenant_id: string (uuid)
  processing_activity: string
  basis: LawfulBasisType
  justification: string?
  assessment_date: datetime?
  review_date: datetime?
  created_at: datetime
  updated_at: datetime

PolicyVersion:
  id: string (uuid)
  tenant_id: string (uuid)
  policy_type: PolicyType ("privacy_policy" | "terms_of_service" | "cookie_policy" | "data_processing" | "custom")
  version: string (semver)
  title: string
  content: string (markdown/HTML)
  content_url: string? (external URL)
  effective_date: datetime
  supersedes_version_id: string? (uuid)
  is_active: boolean
  requires_re_acceptance: boolean
  created_at: datetime

PolicyAcceptance:
  id: string (uuid)
  user_id: string (uuid)
  policy_version_id: string (uuid)
  accepted_at: datetime
  ip_address: string?
  user_agent: string?

AcceptanceStatus:
  user_id: string
  policy_type: PolicyType
  current_version_id: string
  accepted_version_id: string?
  is_current: boolean
  needs_re_acceptance: boolean
  accepted_at: datetime?

ComplianceReport:
  id: string (uuid)
  tenant_id: string (uuid)
  report_type: ReportType ("gdpr" | "ccpa" | "soc2" | "general" | "custom")
  format: ReportFormat ("pdf" | "csv" | "json")
  status: "pending" | "generating" | "completed" | "failed"
  period_start: datetime
  period_end: datetime
  file_url: string?
  file_size_bytes: int?
  summary: ReportSummary?
  generated_by: string (uuid)
  created_at: datetime
  completed_at: datetime?

ReportSummary:
  total_users: int
  active_consents: int
  revoked_consents: int
  data_export_requests: int
  data_deletion_requests: int
  breach_incidents: int
  retention_violations: int
  compliance_score: float? (0-100)

DataResidency:
  tenant_id: string (uuid)
  primary_region: DataRegion
  allowed_regions: DataRegion[]
  migration_in_progress: boolean
  configured_at: datetime
  configured_by: string (uuid)

DataRegion (enum):
  - "us-east"
  - "us-west"
  - "eu-west"
  - "eu-central"
  - "ap-southeast"
  - "ap-northeast"
  - "custom"

BreachIncident:
  id: string (uuid)
  tenant_id: string (uuid)
  title: string
  description: string
  severity: BreachSeverity ("low" | "medium" | "high" | "critical")
  status: BreachStatus ("detected" | "investigating" | "contained" | "resolved" | "closed")
  data_types_affected: DataCategory[]
  estimated_affected_users: int?
  actual_affected_users: int?
  detected_at: datetime
  contained_at: datetime?
  resolved_at: datetime?
  notification_deadline: datetime (72 hours from detection for GDPR)
  authority_notified: boolean
  authority_notified_at: datetime?
  users_notified: boolean
  users_notified_at: datetime?
  created_by: string (uuid)
  created_at: datetime
  updated_at: datetime

PIIScanResult:
  fields_scanned: int
  pii_detected: PIIField[]
  scan_timestamp: datetime

PIIField:
  field_path: string (e.g., "metadata.social_security")
  pii_type: PIIType
  confidence: float (0-1)
  masked_value: string?

PIIType (enum):
  - "email"
  - "phone_number"
  - "ssn"
  - "credit_card"
  - "ip_address"
  - "date_of_birth"
  - "passport_number"
  - "drivers_license"
  - "address"
  - "name"
  - "custom"

MaskingRule:
  pii_type: PIIType
  strategy: "redact" | "hash" | "partial_mask" | "tokenize"
  mask_character: string (default: "*")
  preserve_length: boolean
  preserve_prefix: int? (characters to keep visible at start)
  preserve_suffix: int? (characters to keep visible at end)

CookieConsentConfig:
  tenant_id: string (uuid)
  enabled: boolean
  position: "bottom" | "top" | "bottom-left" | "bottom-right"
  theme: "light" | "dark" | "auto"
  categories: CookieCategory[]
  geo_rules: GeoConsentRule[]
  iab_tcf_enabled: boolean
  gpp_enabled: boolean
  custom_css: string?
  branding: object?

CookieCategory:
  id: string
  name: string
  description: string
  is_essential: boolean (cannot be disabled)
  default_enabled: boolean
  cookies: string[] (cookie name patterns)

GeoConsentRule:
  region: string (ISO 3166-1 alpha-2 or region code like "EU", "EEA")
  consent_model: "opt_in" | "opt_out" | "notice_only"
  show_banner: boolean
```

### Events (for Webhooks)

```
compliance.export_requested     -- when a data export is initiated
compliance.export_completed     -- when export finishes (success or failure)
compliance.deletion_requested   -- when a data deletion is initiated
compliance.deletion_completed   -- when deletion finishes
compliance.consent_granted      -- when a user grants consent
compliance.consent_revoked      -- when a user revokes consent
compliance.policy_published     -- when a new policy version is published
compliance.policy_accepted      -- when a user accepts a policy
compliance.legal_hold_placed    -- when a legal hold is placed
compliance.legal_hold_removed   -- when a legal hold is removed
compliance.breach_detected      -- when a breach incident is created
compliance.breach_updated       -- when a breach status changes
compliance.breach_users_notified-- when affected users are notified
compliance.retention_purge      -- when retention policy triggers data purge
compliance.report_generated     -- when a compliance report is ready
compliance.residency_changed    -- when data residency configuration changes
compliance.residency_migration_completed -- when region migration finishes
```

### Error Scenarios

| Scenario | HTTP Status | Python | TypeScript | Java |
|----------|------------|--------|------------|------|
| User not found for compliance operation | 404 | `UserNotFoundError` | `UserNotFoundError` | `UserNotFoundException` |
| Export already in progress for user | 409 | `ExportInProgressError` | `ExportInProgressError` | `ExportInProgressException` |
| Deletion blocked by legal hold | 409 | `LegalHoldActiveError` | `LegalHoldActiveError` | `LegalHoldActiveException` |
| Invalid data category | 400 | `ValidationError` | `ValidationError` | `ValidationException` |
| Consent purpose not found | 404 | `ConsentPurposeNotFoundError` | `ConsentPurposeNotFoundError` | `ConsentPurposeNotFoundException` |
| Policy version not found | 404 | `PolicyVersionNotFoundError` | `PolicyVersionNotFoundError` | `PolicyVersionNotFoundException` |
| Consent already granted (idempotent) | 200 | Returns existing record | Returns existing record | Returns existing record |
| Retention policy conflict | 409 | `RetentionPolicyConflictError` | `RetentionPolicyConflictError` | `RetentionPolicyConflictException` |
| Data residency region not available | 400 | `RegionNotAvailableError` | `RegionNotAvailableError` | `RegionNotAvailableException` |
| Breach notification deadline exceeded | 422 | `NotificationDeadlineExceededError` | `NotificationDeadlineExceededError` | `NotificationDeadlineExceededException` |
| Report generation failed | 500 | `ReportGenerationError` | `ReportGenerationError` | `ReportGenerationException` |
| Insufficient permissions for compliance ops | 403 | `AuthorizationError` | `AuthorizationError` | `AuthorizationException` |

### Cross-Language Notes

- **Python**: Use `datetime` objects for all timestamps. Enum classes for `DataCategory`, `LawfulBasisType`, `PIIType`, etc. Pydantic models for all request/response objects. Use `from __future__ import annotations` for forward references.
- **TypeScript**: Use union string literal types for enums (e.g., `type DataCategory = 'profile' | 'auth_history' | ...`). Use `Date` objects or ISO 8601 strings for timestamps. Interfaces for all models.
- **Java**: Use `enum` types for all enumerations. Use `java.time.Instant` for timestamps. Builder pattern for request objects (`DataExportRequest.builder().userId("...").format(ExportFormat.JSON).build()`). Use `Optional<T>` for nullable return types.
- **All languages**: Consent operations must be idempotent (granting same consent twice returns existing record). Deletion operations must be safe (deleting already-deleted data is a no-op). Export and deletion are async -- all three SDKs must provide both polling and callback (webhook) patterns.

---

## 3. Social Connections Manager Module

### Overview

The Social Connections Manager provides self-service management of social login providers (Google, GitHub, Microsoft, Apple, etc.) per tenant. It handles OAuth2 credential storage, scope configuration, attribute mapping, account linking, and connection health monitoring. This is one of the most visible competitive gaps -- every CIAM competitor offers turnkey social login, and our SDK currently has none.

**Value Proposition**: Enable customers to offer social login in minutes, not days. Self-service configuration eliminates the need for developer involvement in enabling new social providers. Custom provider support means any OAuth2-compatible identity provider can be added.

### Competitive Analysis

| Feature | Auth0 | Clerk | WorkOS | Firebase Auth | Supabase Auth | Our SDK (Target) |
|---------|-------|-------|--------|---------------|---------------|-----------------|
| Pre-built Providers | 50+ (marketplace) | 25+ (Apple, Google, GitHub, Microsoft, Discord, LinkedIn, Slack, Twitch, Spotify, etc.) | 7 (Google, Microsoft, GitHub, Apple, GitLab, LinkedIn, Slack) | 9 (Google, Apple, Facebook, Twitter, GitHub, Microsoft, Yahoo, Play Games, Game Center) | 15+ (Google, GitHub, Apple, Discord, Facebook, Twitter, Azure, GitLab, etc.) | 15 (initial set) |
| Custom OAuth2 Provider | Yes (Custom Connections extension) | Yes (custom OIDC) | Yes (custom OIDC via SSO) | Yes (generic OIDC) | No (provider list only) | Yes |
| Per-Tenant Configuration | Yes | Yes (per instance) | Yes | Yes (per project) | Yes (per project) | Yes |
| Custom Scopes | Yes | Yes (pre-configured essentials + custom) | Yes (Google, Microsoft, GitHub, GitLab, Xero) | Limited | Limited | Yes |
| Attribute Mapping | Yes (rules/actions) | Automatic | Automatic | Automatic | Automatic | Yes (configurable) |
| Account Linking | Yes (automatic + manual) | Yes (automatic by email) | Yes (automatic) | Yes (manual linking API) | Yes (automatic) | Yes (configurable) |
| Connection Health Check | No (manual) | No | No | No | No | Yes (automated) |
| Login Button Customization | Yes (Lock widget) | Yes (prebuilt components) | Yes (AuthKit) | Yes (FirebaseUI) | Yes (UI components) | Yes |
| Analytics per Provider | Yes (dashboard) | Yes (dashboard) | No | Yes (dashboard) | No | Yes (API) |
| Shared Dev Credentials | No | Yes (for development) | No | No | No | Yes |
| Provider-specific Token Access | Yes (downstream access tokens) | Yes | No | Yes | Yes | Yes |

**Key competitive insights**:
- Auth0 leads with 50+ providers via their marketplace model, where community and partners contribute social connection integrations. Their "Custom Social Connections" extension allows any OAuth2 provider.
- Clerk offers 25+ providers with a standout DX: shared OAuth credentials in development mode mean zero configuration to get started. Production requires custom credentials.
- WorkOS supports fewer providers (7) but focuses on enterprise-grade implementation with custom scope support for select providers.
- Firebase and Supabase support 9-20 providers with straightforward configuration via their dashboards.
- Account linking (when a user signs in with Google and later with GitHub using the same email) is handled automatically by Auth0, Clerk, WorkOS, and Supabase. Firebase requires manual API calls.
- No competitor offers connection health monitoring (test that provider credentials still work). This is our differentiation opportunity.

### Requirements

#### Core Features (Must Have)

1. **Pre-built Social Provider Integrations**
   - Ship with 15 pre-built providers covering all major consumer and developer platforms:
     - **Consumer**: Google, Apple, Facebook, Microsoft, Twitter/X
     - **Developer**: GitHub, GitLab, Bitbucket
     - **Professional**: LinkedIn
     - **Communication**: Slack, Discord
     - **Entertainment**: Twitch, Spotify
     - **Additional**: Notion, Atlassian
   - Each provider includes: authorization URL, token URL, userinfo URL, default scopes, attribute mapping, icon/branding assets
   - Provider definitions are versioned and updateable without SDK version bumps
   - API methods:
     - `listProviders()` -- list all available provider definitions
     - `getProvider(providerId)` -- get provider definition and metadata
   - Models: `SocialProvider`, `ProviderMetadata`, `ProviderEndpoints`, `ProviderBranding`

2. **Connection CRUD (Enable/Disable/Configure per Tenant)**
   - Tenants can enable, configure, and disable social providers independently
   - Each connection stores: provider reference, client_id, client_secret (encrypted), scopes, attribute mapping overrides, ordering, enabled state
   - Support for multiple connections of the same provider type (e.g., two different Google configurations for different domains)
   - API methods:
     - `listConnections(tenantId, page?, pageSize?, enabled?)` -- list configured connections
     - `getConnection(connectionId)` -- get connection details
     - `createConnection(tenantId, request)` -- create new connection
     - `updateConnection(connectionId, request)` -- update connection
     - `deleteConnection(connectionId)` -- delete connection
     - `enableConnection(connectionId)` -- enable disabled connection
     - `disableConnection(connectionId)` -- disable connection
   - Models: `SocialConnection`, `CreateConnectionRequest`, `UpdateConnectionRequest`, `ConnectionListResponse`

3. **OAuth2 Credential Management**
   - Secure storage of client_id and client_secret per connection (encrypted at rest)
   - Credential rotation support (update credentials without downtime)
   - Shared development credentials for select providers (Google, GitHub, Microsoft) to enable zero-config development mode
   - API methods:
     - `updateCredentials(connectionId, credentials)` -- update OAuth credentials
     - `rotateCredentials(connectionId, credentials)` -- rotate with grace period
     - `testCredentials(connectionId)` -- verify credentials work
   - Models: `OAuthCredentials`, `CredentialRotation`

4. **Scope Configuration per Provider**
   - Configure requested OAuth scopes per connection
   - Pre-configured essential scopes per provider (profile, email) that cannot be removed
   - Custom additional scopes (e.g., `repo` for GitHub, `calendar.read` for Google)
   - Scope validation against provider's supported scope list
   - API methods: Scope configuration is part of `CreateConnectionRequest` and `UpdateConnectionRequest`
   - Models: `ScopeConfig`, `ProviderScope`

5. **Custom Social Connection (Bring-Your-Own OAuth2 Provider)**
   - Define a custom OAuth2/OIDC provider with: authorization URL, token URL, userinfo URL, scopes, attribute mapping
   - Support both OAuth2 authorization code flow and OIDC
   - Support for PKCE on custom providers
   - API methods:
     - `createCustomProvider(request)` -- define custom provider
     - `updateCustomProvider(providerId, request)` -- update definition
     - `deleteCustomProvider(providerId)` -- delete custom provider
   - Models: `CustomProviderDefinition`, `CreateCustomProviderRequest`, `UpdateCustomProviderRequest`

6. **Provider-Specific Attribute Mapping**
   - Map provider-specific profile fields to platform user profile fields
   - Default mappings per provider (e.g., Google's `given_name` to `first_name`)
   - Override/extend mappings per connection
   - Support for extracting attributes from ID token claims and userinfo endpoint
   - API methods: Attribute mapping is part of connection configuration
   - Models: `AttributeMapping`, `MappingRule`, `MappingSource` ("id_token" | "userinfo" | "access_token")

7. **Account Linking**
   - Automatic linking: when a user signs in with a new social provider using an email that matches an existing account, link the social identity to the existing account
   - Configurable linking policy per tenant: `automatic` (link by verified email), `prompt` (ask user to confirm), `disabled` (create separate accounts)
   - Manual linking/unlinking via API
   - Support for listing all linked social identities on a user account
   - API methods:
     - `listLinkedIdentities(userId)` -- list all linked social identities
     - `linkIdentity(userId, request)` -- manually link a social identity
     - `unlinkIdentity(userId, identityId)` -- unlink a social identity
     - `setLinkingPolicy(tenantId, policy)` -- set account linking policy
     - `getLinkingPolicy(tenantId)` -- get current policy
   - Models: `LinkedIdentity`, `LinkingPolicy`, `LinkIdentityRequest`, `LinkedIdentityListResponse`

8. **Social Authentication Flow**
   - Initiate social login flow (generate authorization URL with state, nonce, PKCE)
   - Handle OAuth2 callback (exchange code for tokens, fetch user profile, create or link account)
   - Return platform tokens (access + refresh) after successful social authentication
   - API methods:
     - `buildAuthorizationUrl(connectionId, options)` -- generate redirect URL
     - `handleCallback(connectionId, code, state, codeVerifier?)` -- process OAuth callback
   - Models: `SocialAuthOptions`, `SocialAuthResult`, `SocialProfile`

#### Enhanced Features (Should Have)

9. **Connection Health Monitoring**
   - Periodically test provider connectivity (verify OAuth endpoints respond, credentials are valid)
   - Track provider uptime and response times
   - Alert on connection failures (webhook event)
   - API methods:
     - `testConnection(connectionId)` -- test connectivity now
     - `getConnectionHealth(connectionId)` -- get health status
     - `listConnectionHealth(tenantId)` -- health overview for all connections
   - Models: `ConnectionHealth`, `HealthStatus`, `HealthCheck`

10. **Login Button Customization**
    - Configure button appearance per connection: icon, label text, background color, text color, display order
    - Support for light and dark theme variants
    - API methods:
      - `getButtonConfig(connectionId)` -- get button appearance
      - `updateButtonConfig(connectionId, config)` -- update appearance
      - `getLoginPageConfig(tenantId)` -- get all buttons in display order
    - Models: `ButtonConfig`, `LoginPageConfig`

11. **Social Connection Analytics**
    - Track login counts per provider over time
    - Success/failure rates per provider
    - New user registrations via each provider
    - API methods:
      - `getConnectionAnalytics(connectionId, period)` -- analytics for one connection
      - `getAnalyticsSummary(tenantId, period)` -- summary across all connections
    - Models: `ConnectionAnalytics`, `AnalyticsSummary`, `AnalyticsPeriod`

12. **Downstream Access Token Access**
    - Store and provide access to the social provider's access token (for API calls to the provider)
    - Automatic token refresh when provider supports refresh tokens
    - API methods:
      - `getProviderToken(userId, connectionId)` -- get user's provider access token
      - `refreshProviderToken(userId, connectionId)` -- force refresh
    - Models: `ProviderToken`

#### Future Features (Nice to Have)

13. **Provider Marketplace**: Allow third-party developers to contribute social provider definitions, similar to Auth0's marketplace model.

14. **Social Profile Enrichment**: Fetch additional profile data from social providers beyond basic OAuth scopes (e.g., GitHub repositories, LinkedIn connections count) for progressive profiling.

15. **Social Login Analytics Dashboard**: Visual dashboard showing login trends, provider popularity, conversion rates, and geographic distribution.

16. **Silent Re-authentication**: Use social provider sessions for silent re-authentication without full OAuth redirect when possible (e.g., Google One Tap).

17. **Multi-Provider Login Page Builder**: Drag-and-drop builder for constructing social login pages with customizable layout, branding, and provider ordering.

### API Surface

| Method | Description | Parameters | Returns |
|--------|------------|------------|---------|
| **Provider Definitions** | | | |
| `listProviders()` | List all available social providers | None | `SocialProvider[]` |
| `getProvider(providerId)` | Get provider definition | `providerId: string` | `SocialProvider` |
| **Custom Providers** | | | |
| `createCustomProvider(request)` | Define custom OAuth2 provider | `CreateCustomProviderRequest` | `SocialProvider` |
| `updateCustomProvider(providerId, request)` | Update custom provider | `providerId`, `UpdateCustomProviderRequest` | `SocialProvider` |
| `deleteCustomProvider(providerId)` | Delete custom provider | `providerId: string` | `void` |
| **Connection Management** | | | |
| `listConnections(tenantId, ...)` | List configured connections | `tenantId`, pagination, filters | `ConnectionListResponse` |
| `getConnection(connectionId)` | Get connection details | `connectionId: string` | `SocialConnection` |
| `createConnection(tenantId, request)` | Enable a social provider | `tenantId`, `CreateConnectionRequest` | `SocialConnection` |
| `updateConnection(connectionId, request)` | Update connection config | `connectionId`, `UpdateConnectionRequest` | `SocialConnection` |
| `deleteConnection(connectionId)` | Remove connection | `connectionId: string` | `void` |
| `enableConnection(connectionId)` | Enable connection | `connectionId: string` | `SocialConnection` |
| `disableConnection(connectionId)` | Disable connection | `connectionId: string` | `SocialConnection` |
| **Credentials** | | | |
| `updateCredentials(connectionId, creds)` | Update OAuth credentials | `connectionId`, `OAuthCredentials` | `SocialConnection` |
| `rotateCredentials(connectionId, creds)` | Rotate with grace period | `connectionId`, `CredentialRotation` | `SocialConnection` |
| `testCredentials(connectionId)` | Verify credentials work | `connectionId: string` | `CredentialTestResult` |
| **Authentication Flow** | | | |
| `buildAuthorizationUrl(connectionId, opts)` | Generate OAuth redirect URL | `connectionId`, `SocialAuthOptions` | `AuthorizationUrlResult` |
| `handleCallback(connectionId, params)` | Process OAuth callback | `connectionId`, `CallbackParams` | `SocialAuthResult` |
| **Account Linking** | | | |
| `listLinkedIdentities(userId)` | List linked social identities | `userId: string` | `LinkedIdentity[]` |
| `linkIdentity(userId, request)` | Manually link identity | `userId`, `LinkIdentityRequest` | `LinkedIdentity` |
| `unlinkIdentity(userId, identityId)` | Unlink identity | `userId`, `identityId` | `void` |
| `setLinkingPolicy(tenantId, policy)` | Set linking policy | `tenantId`, `LinkingPolicy` | `LinkingPolicy` |
| `getLinkingPolicy(tenantId)` | Get linking policy | `tenantId: string` | `LinkingPolicy` |
| **Health Monitoring** | | | |
| `testConnection(connectionId)` | Test provider connectivity | `connectionId: string` | `HealthCheck` |
| `getConnectionHealth(connectionId)` | Get health status | `connectionId: string` | `ConnectionHealth` |
| `listConnectionHealth(tenantId)` | Health overview for tenant | `tenantId: string` | `ConnectionHealth[]` |
| **Button Customization** | | | |
| `getButtonConfig(connectionId)` | Get button appearance | `connectionId: string` | `ButtonConfig` |
| `updateButtonConfig(connectionId, cfg)` | Update appearance | `connectionId`, `ButtonConfig` | `ButtonConfig` |
| `getLoginPageConfig(tenantId)` | Get all buttons in order | `tenantId: string` | `LoginPageConfig` |
| **Analytics** | | | |
| `getConnectionAnalytics(connectionId, period)` | Per-connection analytics | `connectionId`, `AnalyticsPeriod` | `ConnectionAnalytics` |
| `getAnalyticsSummary(tenantId, period)` | Tenant-wide summary | `tenantId`, `AnalyticsPeriod` | `AnalyticsSummary` |
| **Provider Tokens** | | | |
| `getProviderToken(userId, connectionId)` | Get provider access token | `userId`, `connectionId` | `ProviderToken` |
| `refreshProviderToken(userId, connectionId)` | Force refresh | `userId`, `connectionId` | `ProviderToken` |

### Models

```
SocialProvider:
  id: string (e.g., "google", "github", "custom_xyz")
  name: string (e.g., "Google", "GitHub")
  type: ProviderType ("built_in" | "custom")
  protocol: "oauth2" | "oidc"
  endpoints: ProviderEndpoints
  default_scopes: string[]
  available_scopes: ProviderScope[]
  default_attribute_mapping: AttributeMapping
  branding: ProviderBranding
  documentation_url: string?
  is_available: boolean
  created_at: datetime
  updated_at: datetime

ProviderEndpoints:
  authorization_url: string
  token_url: string
  userinfo_url: string?
  revocation_url: string?
  jwks_url: string? (for OIDC providers)
  discovery_url: string? (for OIDC .well-known)

ProviderScope:
  name: string (e.g., "email", "profile", "repo")
  description: string
  is_required: boolean (essential scopes cannot be removed)

ProviderBranding:
  icon_url: string
  icon_svg: string?
  background_color: string (hex)
  text_color: string (hex)
  display_name: string
  button_label: string (e.g., "Continue with Google")

SocialConnection:
  id: string (uuid)
  tenant_id: string (uuid)
  provider_id: string
  provider_name: string
  display_name: string? (override provider name)
  client_id: string
  client_secret_set: boolean (never expose actual secret)
  scopes: string[]
  attribute_mapping: AttributeMapping
  button_config: ButtonConfig?
  is_enabled: boolean
  is_development_mode: boolean (using shared dev credentials)
  pkce_enabled: boolean (default: true for public clients)
  display_order: int
  created_at: datetime
  updated_at: datetime

CreateConnectionRequest:
  provider_id: string
  client_id: string
  client_secret: string
  display_name: string?
  scopes: string[]? (uses provider defaults if omitted)
  attribute_mapping: AttributeMapping? (uses provider defaults if omitted)
  pkce_enabled: boolean? (default: true)
  display_order: int? (default: append to end)

UpdateConnectionRequest:
  display_name: string?
  scopes: string[]?
  attribute_mapping: AttributeMapping?
  pkce_enabled: boolean?
  display_order: int?
  is_enabled: boolean?

OAuthCredentials:
  client_id: string
  client_secret: string

CredentialRotation:
  new_client_id: string
  new_client_secret: string
  grace_period_seconds: int (default: 300 -- both old and new accepted)

CredentialTestResult:
  success: boolean
  provider_id: string
  response_time_ms: int?
  error: string?
  tested_at: datetime

AttributeMapping:
  rules: MappingRule[]

MappingRule:
  source: MappingSource ("id_token" | "userinfo" | "access_token_claims")
  source_field: string (e.g., "given_name", "login", "avatar_url")
  target_field: string (e.g., "first_name", "username", "profile_image_url")
  transform: string? ("lowercase" | "uppercase" | "trim" | "default:{value}")
  required: boolean

LinkedIdentity:
  id: string (uuid)
  user_id: string (uuid)
  provider_id: string
  provider_name: string
  provider_user_id: string (the user's ID at the provider)
  email: string?
  display_name: string?
  profile_image_url: string?
  raw_profile: object? (full provider profile data)
  linked_at: datetime
  last_login_at: datetime?

LinkingPolicy:
  tenant_id: string (uuid)
  strategy: "automatic" | "prompt" | "disabled"
  match_by: "email" | "phone" | "email_or_phone"
  require_verified_email: boolean (default: true)
  allow_manual_linking: boolean (default: true)
  allow_manual_unlinking: boolean (default: true)

LinkIdentityRequest:
  provider_id: string
  provider_access_token: string (used to verify ownership of social account)

SocialAuthOptions:
  redirect_uri: string
  scopes: string[]? (override connection defaults)
  state: string? (auto-generated if omitted)
  nonce: string? (auto-generated for OIDC)
  login_hint: string? (pre-fill email/username)
  prompt: string? ("login" | "consent" | "select_account")
  code_challenge: string? (PKCE, auto-generated if pkce_enabled)
  code_challenge_method: string? ("S256")

AuthorizationUrlResult:
  url: string
  state: string
  nonce: string?
  code_verifier: string? (for PKCE, must be stored client-side)

CallbackParams:
  code: string
  state: string
  code_verifier: string? (for PKCE)
  redirect_uri: string

SocialAuthResult:
  access_token: string (platform token)
  refresh_token: string?
  token_type: string
  expires_in: int
  user: UserProfile
  is_new_user: boolean
  linked_identity: LinkedIdentity
  provider_tokens: ProviderToken? (if requested)

ProviderToken:
  access_token: string
  refresh_token: string?
  token_type: string
  expires_in: int?
  expires_at: datetime?
  scopes: string[]

ConnectionHealth:
  connection_id: string (uuid)
  provider_id: string
  status: HealthStatus ("healthy" | "degraded" | "unhealthy" | "unknown")
  last_check_at: datetime?
  last_success_at: datetime?
  last_failure_at: datetime?
  response_time_ms: int?
  consecutive_failures: int
  error_message: string?

HealthCheck:
  connection_id: string (uuid)
  success: boolean
  response_time_ms: int?
  endpoints_checked: EndpointCheck[]
  checked_at: datetime

EndpointCheck:
  endpoint: string ("authorization" | "token" | "userinfo")
  reachable: boolean
  response_time_ms: int?
  status_code: int?
  error: string?

ButtonConfig:
  connection_id: string (uuid)
  icon_url: string?
  label: string? (e.g., "Sign in with Google")
  background_color: string? (hex override)
  text_color: string? (hex override)
  border_radius: int? (px)
  theme_variant: "light" | "dark" | "auto"

LoginPageConfig:
  tenant_id: string (uuid)
  buttons: ButtonConfig[] (ordered by display_order)
  separator_text: string (default: "or")
  layout: "vertical" | "horizontal" | "grid"

ConnectionAnalytics:
  connection_id: string (uuid)
  provider_id: string
  period: AnalyticsPeriod
  total_logins: int
  successful_logins: int
  failed_logins: int
  new_user_registrations: int
  account_links: int
  avg_response_time_ms: float
  daily_breakdown: DailyAnalytics[]

DailyAnalytics:
  date: string (ISO date)
  logins: int
  successes: int
  failures: int
  new_users: int

AnalyticsSummary:
  tenant_id: string (uuid)
  period: AnalyticsPeriod
  total_logins: int
  provider_breakdown: ProviderAnalyticsEntry[]

ProviderAnalyticsEntry:
  provider_id: string
  provider_name: string
  logins: int
  percentage: float

AnalyticsPeriod:
  start: datetime
  end: datetime
  granularity: "hourly" | "daily" | "weekly" | "monthly"

CustomProviderDefinition:
  name: string
  protocol: "oauth2" | "oidc"
  authorization_url: string
  token_url: string
  userinfo_url: string?
  jwks_url: string?
  discovery_url: string?
  default_scopes: string[]
  attribute_mapping: AttributeMapping
  branding: ProviderBranding
  pkce_support: boolean
  token_endpoint_auth_method: "client_secret_post" | "client_secret_basic" | "private_key_jwt"
```

### Events (for Webhooks)

```
social.connection_created       -- when a social connection is configured
social.connection_updated       -- when connection config changes
social.connection_deleted       -- when a connection is removed
social.connection_enabled       -- when a connection is enabled
social.connection_disabled      -- when a connection is disabled
social.credentials_rotated      -- when OAuth credentials are rotated
social.login_success            -- when a user logs in via social provider
social.login_failure            -- when a social login attempt fails
social.account_linked           -- when a social identity is linked to account
social.account_unlinked         -- when a social identity is unlinked
social.health_check_failed      -- when a connection health check fails
social.new_user_registered      -- when a new user registers via social login
social.provider_token_refreshed -- when a provider access token is refreshed
```

### Error Scenarios

| Scenario | HTTP Status | Python | TypeScript | Java |
|----------|------------|--------|------------|------|
| Provider not found | 404 | `ProviderNotFoundError` | `ProviderNotFoundError` | `ProviderNotFoundException` |
| Connection not found | 404 | `ConnectionNotFoundError` | `ConnectionNotFoundError` | `ConnectionNotFoundException` |
| Invalid OAuth credentials | 400 | `InvalidCredentialsError` | `InvalidCredentialsError` | `InvalidCredentialsException` |
| Provider connection already exists | 409 | `ConnectionAlreadyExistsError` | `ConnectionAlreadyExistsError` | `ConnectionAlreadyExistsException` |
| OAuth callback error (denied, expired) | 400 | `OAuthCallbackError` | `OAuthCallbackError` | `OAuthCallbackException` |
| State mismatch (CSRF) | 400 | `StateMismatchError` | `StateMismatchError` | `StateMismatchException` |
| Provider temporarily unavailable | 502 | `ProviderUnavailableError` | `ProviderUnavailableError` | `ProviderUnavailableException` |
| Account linking conflict | 409 | `AccountLinkingConflictError` | `AccountLinkingConflictError` | `AccountLinkingConflictException` |
| Scope not supported by provider | 400 | `UnsupportedScopeError` | `UnsupportedScopeError` | `UnsupportedScopeException` |
| Identity already linked to different user | 409 | `IdentityAlreadyLinkedError` | `IdentityAlreadyLinkedError` | `IdentityAlreadyLinkedException` |
| Custom provider validation failed | 400 | `ValidationError` | `ValidationError` | `ValidationException` |
| Rate limit on provider API | 429 | `RateLimitError` | `RateLimitError` | `RateLimitException` |

### Cross-Language Notes

- **Python**: OAuth2 flow methods should be synchronous by default with async variants available (`async_build_authorization_url`, `async_handle_callback`). Client secrets must never appear in string representations (`__repr__` masks secrets). Use `httpx` for OAuth token exchange.
- **TypeScript**: All OAuth flow methods are `async`. Use branded types for `ConnectionId`, `ProviderId` to prevent accidental string misuse. Provider token access returns typed `ProviderToken` with expiry checking. Client secrets are never included in `toJSON()` output.
- **Java**: Builder pattern for `CreateConnectionRequest` and `CustomProviderDefinition`. OAuth credentials stored in a `SecureString` wrapper that prevents accidental logging. Use `CompletableFuture` for async OAuth flow methods. `LinkedIdentity` uses immutable record pattern.
- **All languages**: Client secrets must NEVER be returned in API responses -- only a `client_secret_set: boolean` flag. The `SocialConnection` model intentionally omits `client_secret`. OAuth state parameter and PKCE code verifier must be cryptographically random. All providers must support PKCE (S256) by default.

---

## 4. OAuth2 Authorization Server Module

### Overview

The OAuth2 Authorization Server module enables the platform to act as a full OAuth2/OIDC provider. This means customers can power "Sign in with [YourApp]" flows, build developer platforms with third-party app integrations, authenticate AI agents via MCP (Model Context Protocol), and implement standards-compliant enterprise SSO -- all using their existing user base on our platform.

**Value Proposition**: Transform every customer from an OAuth2 consumer into an OAuth2 provider. Auth0 and Okta charge premium pricing for custom authorization server capabilities. Keycloak and Ory Hydra are powerful but require self-hosting expertise. Supabase recently launched OAuth 2.1 server support. Our module provides Auth0-grade OAuth2 server capabilities with the simplicity of Supabase's developer experience.

### Competitive Analysis

| Feature | Auth0 | Okta | Keycloak | Ory Hydra | Clerk | Supabase | Our SDK (Target) |
|---------|-------|------|----------|-----------|-------|----------|-----------------|
| Authorization Endpoint | Yes | Yes | Yes | Yes | Yes (recent) | Yes (recent) | Yes |
| Token Endpoint | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| OIDC Discovery | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| JWKS Endpoint | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| UserInfo Endpoint | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Client Registration (API) | Yes | Yes | Yes | Yes (Dynamic) | Yes (Dashboard) | Yes | Yes |
| authorization_code Grant | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| client_credentials Grant | Yes | Yes | Yes | Yes | No | No | Yes |
| refresh_token Grant | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| device_code Grant | Yes | Yes | Yes | No | No | No | Yes |
| Custom Scopes | Yes | Yes (custom auth server) | Yes | Yes | Limited | Standard only | Yes |
| Custom Claims | Yes (Actions/Rules) | Yes (claims policies) | Yes (protocol mappers) | Yes (consent) | Limited | No | Yes |
| Consent Screen | Yes | Yes | Yes | Yes (custom UI) | No | Yes | Yes |
| PKCE (mandatory for public) | Yes | Yes | Yes | Yes | Yes | Yes (mandatory) | Yes |
| Dynamic Client Registration (RFC 7591) | No | No | Yes | Yes | No | Yes (for MCP) | Yes |
| Pushed Authorization Requests (RFC 9126) | No | No | Partial | No | No | No | Yes |
| Token Exchange (RFC 8693) | Partial (federated) | Yes | Partial | No | No | No | Yes |
| mTLS Client Auth | No | Yes | Yes | Yes | No | No | Yes |
| Resource Indicators (RFC 8707) | No | No | Partial | No | No | No | Yes |
| Token Revocation (RFC 7009) | Yes | Yes | Yes | Yes | No | No | Yes |
| Token Introspection (RFC 7662) | No | Yes | Yes | Yes | No | No | Yes |
| JWT Access Tokens | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Opaque Access Tokens | No | Yes | Yes | Yes | Yes (configurable) | No | Yes |
| OpenID Certified | Yes | Yes | Yes | Yes | No | No | Target |

**Key competitive insights**:
- Auth0 and Okta are the market leaders for OAuth2 server capabilities but do not support advanced RFCs (PAR, dynamic registration, token exchange). Auth0 lacks token introspection entirely.
- Keycloak is the open-source gold standard with the broadest RFC support, including dynamic client registration, PKCE enforcement, and partial resource indicator support. However, it requires self-hosting.
- Ory Hydra is OpenID Certified with excellent OAuth2 flow support, dynamic client registration, and a headless architecture. Trusted by OpenAI for scale. Does not support device_code flow.
- Clerk recently added OIDC provider support (February 2025) but with limited capabilities -- no client_credentials, no custom scopes beyond basic OIDC, no token introspection.
- Supabase launched OAuth 2.1 server in 2025 with mandatory PKCE, OIDC discovery, and dynamic client registration (for MCP). Limited to authorization_code flow only.
- Our competitive advantage: ship the broadest RFC support (PAR, token exchange, resource indicators, mTLS) in a managed platform. No competitor offers all of these together without self-hosting.

### Requirements

#### Core Features (Must Have)

1. **Client/Application Registration and Management**
   - Register OAuth2 clients (applications) that can authenticate users through our platform
   - Support two client types: `confidential` (server-side apps with client_secret) and `public` (SPAs, mobile apps, CLIs)
   - Each client has: client_id, client_secret (confidential only), redirect_uris, allowed grant types, allowed scopes, token policies
   - API methods:
     - `createClient(request)` -- register new OAuth2 client
     - `getClient(clientId)` -- get client details
     - `updateClient(clientId, request)` -- update client
     - `deleteClient(clientId)` -- delete client
     - `listClients(page?, pageSize?)` -- list registered clients
     - `rotateClientSecret(clientId)` -- rotate secret
     - `regenerateClientSecret(clientId)` -- generate new secret
   - Models: `OAuthClient`, `CreateClientRequest`, `UpdateClientRequest`, `ClientType`, `ClientListResponse`

2. **Authorization Endpoint (`/authorize`)**
   - Standard OAuth2 authorization endpoint supporting `response_type=code`
   - PKCE enforcement for public clients (S256 only)
   - State parameter validation (CSRF protection)
   - Nonce parameter for OIDC (replay protection)
   - Redirect URI validation (exact match or pattern matching for development)
   - Support for `prompt` parameter: `login`, `consent`, `select_account`, `none`
   - Support for `login_hint` parameter
   - API methods:
     - `buildAuthorizationUrl(request)` -- server-side URL construction (helper)
     - `validateAuthorizationRequest(params)` -- validate incoming authorization request
     - `approveAuthorizationRequest(requestId, userId, scopes)` -- approve after user consent
     - `denyAuthorizationRequest(requestId, reason)` -- deny authorization
   - Models: `AuthorizationRequest`, `AuthorizationResponse`, `AuthorizationError`

3. **Token Endpoint (`/token`)**
   - Support grant types: `authorization_code`, `client_credentials`, `refresh_token`, `urn:ietf:params:oauth:grant-type:device_code`
   - Client authentication methods: `client_secret_post`, `client_secret_basic`, `private_key_jwt`, `none` (public clients with PKCE)
   - Issue JWT access tokens with configurable claims
   - Issue refresh tokens with rotation policy
   - API methods:
     - `exchangeAuthorizationCode(request)` -- exchange code for tokens
     - `clientCredentialsGrant(request)` -- machine-to-machine token
     - `refreshToken(request)` -- refresh access token
     - `deviceCodeGrant(request)` -- exchange device code for tokens
   - Models: `TokenRequest`, `TokenResponse`, `TokenError`

4. **OIDC Discovery (`/.well-known/openid-configuration`)**
   - Auto-generated OpenID Connect discovery document
   - Configurable issuer URL per tenant
   - Lists all supported endpoints, grant types, response types, scopes, claims, signing algorithms
   - API methods:
     - `getDiscoveryDocument(tenantId?)` -- get discovery document
     - `updateDiscoveryConfig(tenantId, config)` -- customize discovery metadata
   - Models: `DiscoveryDocument`, `DiscoveryConfig`

5. **JWKS Endpoint (`/.well-known/jwks.json`)**
   - Publish public keys for token verification by resource servers
   - Support RSA (RS256) and ECDSA (ES256) signing algorithms
   - Key rotation with overlap period (old and new keys both valid)
   - API methods:
     - `getJWKS(tenantId?)` -- get current key set
     - `rotateSigningKey(tenantId, algorithm?)` -- rotate signing key
     - `listSigningKeys(tenantId?)` -- list all keys with status
   - Models: `JWKS`, `JWK`, `SigningKey`, `KeyAlgorithm`, `KeyStatus`

6. **UserInfo Endpoint (`/userinfo`)**
   - Return user claims based on granted scopes
   - Standard OIDC claims: `sub`, `name`, `email`, `email_verified`, `picture`, `profile`, etc.
   - Custom claims from user metadata
   - Support both JSON and JWT response formats
   - API methods:
     - `getUserInfo(accessToken)` -- get claims for token holder
   - Models: `UserInfoResponse`

7. **Scope Management**
   - Define custom scopes beyond standard OIDC (`openid`, `profile`, `email`, `phone`, `address`)
   - Associate scopes with specific claims and resource permissions
   - Per-client scope restrictions (whitelist allowed scopes per client)
   - API methods:
     - `createScope(request)` -- define custom scope
     - `getScope(scopeId)` -- get scope details
     - `updateScope(scopeId, request)` -- update scope
     - `deleteScope(scopeId)` -- delete scope
     - `listScopes(page?, pageSize?)` -- list all scopes
   - Models: `OAuthScope`, `CreateScopeRequest`, `UpdateScopeRequest`, `ScopeListResponse`

8. **Consent Screen Management**
   - Customizable consent screen shown to users during authorization
   - Display requested scopes with human-readable descriptions
   - Remember consent decisions (skip consent on repeat authorization)
   - Configurable consent expiry (re-prompt after N days)
   - Per-client consent requirements (some clients may skip consent)
   - API methods:
     - `getConsentConfig(tenantId)` -- get consent screen config
     - `updateConsentConfig(tenantId, config)` -- update config
     - `listUserConsents(userId)` -- list active consents
     - `revokeUserConsent(userId, clientId)` -- revoke consent for client
   - Models: `ConsentConfig`, `UserOAuthConsent`, `ConsentDecision`

9. **Token Customization (Custom Claims)**
   - Add custom claims to access tokens and ID tokens
   - Claims sourced from: user profile, user metadata, tenant metadata, custom logic
   - Namespace custom claims to avoid collisions (e.g., `https://yourapp.com/claims/role`)
   - Per-client claim configuration
   - API methods:
     - `createClaimMapping(request)` -- define claim mapping
     - `getClaimMapping(mappingId)` -- get mapping
     - `updateClaimMapping(mappingId, request)` -- update mapping
     - `deleteClaimMapping(mappingId)` -- delete mapping
     - `listClaimMappings(clientId?)` -- list mappings
   - Models: `ClaimMapping`, `ClaimSource`, `CreateClaimMappingRequest`, `UpdateClaimMappingRequest`

10. **Token Policies**
    - Configure token lifetimes per client: access token TTL, refresh token TTL, ID token TTL
    - Refresh token rotation policy: rotate on use, absolute lifetime, sliding window
    - Token revocation (RFC 7009): revoke access tokens and refresh tokens
    - API methods:
      - `getTokenPolicy(clientId)` -- get token policy for client
      - `updateTokenPolicy(clientId, policy)` -- update policy
      - `revokeToken(token, tokenTypeHint?)` -- revoke a token
      - `revokeAllTokens(clientId, userId?)` -- revoke all tokens for client/user
    - Models: `TokenPolicy`, `RefreshTokenPolicy`, `TokenRevocationRequest`

11. **Token Introspection (RFC 7662)**
    - Allow resource servers to verify token validity
    - Return token metadata: active status, scopes, client_id, expiry, subject
    - Support both JWT and opaque token introspection
    - API methods:
      - `introspectToken(token, tokenTypeHint?)` -- introspect token
    - Models: `IntrospectionRequest`, `IntrospectionResponse`

12. **Device Authorization Flow (RFC 8628)**
    - Support for input-constrained devices (TVs, IoT, CLI tools)
    - Device authorization endpoint generates user_code and verification_uri
    - Polling token endpoint for device code exchange
    - Configurable code length, expiry, and polling interval
    - API methods:
      - `initiateDeviceAuthorization(request)` -- start device flow
      - `verifyDeviceCode(userCode)` -- verify user code (user-facing)
      - `approveDeviceAuthorization(userCode, userId)` -- approve device
      - `getDeviceAuthorizationStatus(deviceCode)` -- poll status
    - Models: `DeviceAuthorizationRequest`, `DeviceAuthorizationResponse`, `DeviceCodeStatus`

#### Enhanced Features (Should Have)

13. **Dynamic Client Registration (RFC 7591)**
    - Allow clients to register programmatically without manual configuration
    - Support for registration access tokens (for client self-management)
    - Configurable registration policies (open, authenticated, approval-required)
    - Essential for MCP (Model Context Protocol) agent authentication
    - API methods:
      - `enableDynamicRegistration(tenantId, policy)` -- enable/configure
      - `getDynamicRegistrationPolicy(tenantId)` -- get policy
    - Models: `DynamicRegistrationPolicy`, `RegistrationRequest`, `RegistrationResponse`
    - Note: The actual `/register` endpoint follows RFC 7591 exactly

14. **Pushed Authorization Requests (RFC 9126)**
    - Client pushes authorization request parameters directly to the server
    - Server returns a `request_uri` that the client uses in the authorization redirect
    - Prevents authorization request parameter tampering
    - Reduces URL length for complex authorization requests
    - API methods:
      - `pushAuthorizationRequest(request)` -- push parameters, get request_uri
    - Models: `PushedAuthorizationRequest`, `PushedAuthorizationResponse`

15. **Token Exchange (RFC 8693)**
    - Exchange one token type for another (e.g., access token for a more scoped token)
    - Support subject_token and actor_token
    - Use cases: impersonation, delegation, token downscoping
    - API methods:
      - `exchangeToken(request)` -- perform token exchange
    - Models: `TokenExchangeRequest`, `TokenExchangeResponse`

16. **Resource Server Registration**
    - Register resource servers (APIs) that accept tokens issued by this authorization server
    - Each resource server has: identifier (audience), associated scopes, signing configuration
    - API methods:
      - `createResourceServer(request)` -- register resource server
      - `getResourceServer(resourceServerId)` -- get details
      - `updateResourceServer(resourceServerId, request)` -- update
      - `deleteResourceServer(resourceServerId)` -- delete
      - `listResourceServers(page?, pageSize?)` -- list all
    - Models: `ResourceServer`, `CreateResourceServerRequest`, `UpdateResourceServerRequest`, `ResourceServerListResponse`

17. **mTLS Client Authentication (RFC 8705)**
    - Certificate-bound access tokens
    - Client authentication via TLS client certificates
    - Certificate thumbprint confirmation (`cnf` claim in tokens)
    - API methods:
      - `configureMTLS(clientId, config)` -- set up mTLS for client
      - `getMTLSConfig(clientId)` -- get mTLS configuration
      - `uploadClientCertificate(clientId, certificate)` -- upload client cert
    - Models: `MTLSConfig`, `ClientCertificate`

#### Future Features (Nice to Have)

18. **Resource Indicators (RFC 8707)**: Support `resource` parameter in authorization and token requests to specify the target resource server. Enables multi-API architectures where a single authorization server issues tokens for different APIs.

19. **JWT-Secured Authorization Requests (RFC 9101 / JAR)**: Authorization request parameters wrapped in a signed JWT for integrity and authenticity.

20. **Demonstrating Proof of Possession (DPoP) (RFC 9449)**: Proof-of-possession mechanism for access tokens, preventing token theft.

21. **Grant Management API**: Allow clients to query and manage their granted permissions programmatically.

22. **Authorization Server Metadata (RFC 8414)**: Full compliance with OAuth 2.0 Authorization Server Metadata beyond OIDC Discovery.

23. **OpenID Connect Certification**: Achieve OpenID Foundation certification for the OIDC provider implementation.

### API Surface

| Method | Description | Parameters | Returns |
|--------|------------|------------|---------|
| **Client Management** | | | |
| `createClient(request)` | Register OAuth2 client | `CreateClientRequest` | `OAuthClient` |
| `getClient(clientId)` | Get client details | `clientId: string` | `OAuthClient` |
| `updateClient(clientId, request)` | Update client | `clientId`, `UpdateClientRequest` | `OAuthClient` |
| `deleteClient(clientId)` | Delete client | `clientId: string` | `void` |
| `listClients(page?, pageSize?)` | List clients | Pagination | `ClientListResponse` |
| `rotateClientSecret(clientId)` | Rotate secret | `clientId: string` | `ClientSecretRotation` |
| `regenerateClientSecret(clientId)` | New secret | `clientId: string` | `ClientSecretResult` |
| **Authorization** | | | |
| `buildAuthorizationUrl(request)` | Construct auth URL | `AuthorizationUrlRequest` | `string` |
| `validateAuthorizationRequest(params)` | Validate auth request | `AuthorizationParams` | `AuthorizationRequest` |
| `approveAuthorizationRequest(requestId, userId, scopes)` | Approve authorization | IDs + scopes | `AuthorizationResponse` |
| `denyAuthorizationRequest(requestId, reason)` | Deny authorization | `requestId`, `reason` | `AuthorizationResponse` |
| **Token Operations** | | | |
| `exchangeAuthorizationCode(request)` | Code for tokens | `CodeExchangeRequest` | `TokenResponse` |
| `clientCredentialsGrant(request)` | M2M token | `ClientCredentialsRequest` | `TokenResponse` |
| `refreshToken(request)` | Refresh token | `RefreshTokenRequest` | `TokenResponse` |
| `revokeToken(token, hint?)` | Revoke token | `token`, `tokenTypeHint?` | `void` |
| `revokeAllTokens(clientId, userId?)` | Revoke all | `clientId`, `userId?` | `RevokeAllResult` |
| `introspectToken(token, hint?)` | Introspect token | `token`, `tokenTypeHint?` | `IntrospectionResponse` |
| **OIDC/Discovery** | | | |
| `getDiscoveryDocument(tenantId?)` | Get OIDC discovery | `tenantId?: string` | `DiscoveryDocument` |
| `updateDiscoveryConfig(tenantId, config)` | Customize metadata | `tenantId`, config | `DiscoveryConfig` |
| `getJWKS(tenantId?)` | Get public keys | `tenantId?: string` | `JWKS` |
| `rotateSigningKey(tenantId, algo?)` | Rotate signing key | `tenantId`, `algorithm?` | `SigningKey` |
| `listSigningKeys(tenantId?)` | List keys | `tenantId?: string` | `SigningKey[]` |
| `getUserInfo(accessToken)` | Get user claims | `accessToken: string` | `UserInfoResponse` |
| **Scopes** | | | |
| `createScope(request)` | Define scope | `CreateScopeRequest` | `OAuthScope` |
| `getScope(scopeId)` | Get scope | `scopeId: string` | `OAuthScope` |
| `updateScope(scopeId, request)` | Update scope | `scopeId`, `UpdateScopeRequest` | `OAuthScope` |
| `deleteScope(scopeId)` | Delete scope | `scopeId: string` | `void` |
| `listScopes(page?, pageSize?)` | List scopes | Pagination | `ScopeListResponse` |
| **Consent** | | | |
| `getConsentConfig(tenantId)` | Get consent config | `tenantId: string` | `ConsentConfig` |
| `updateConsentConfig(tenantId, config)` | Update consent config | `tenantId`, config | `ConsentConfig` |
| `listUserConsents(userId)` | List user's consents | `userId: string` | `UserOAuthConsent[]` |
| `revokeUserConsent(userId, clientId)` | Revoke consent | `userId`, `clientId` | `void` |
| **Claims** | | | |
| `createClaimMapping(request)` | Define claim mapping | `CreateClaimMappingRequest` | `ClaimMapping` |
| `getClaimMapping(mappingId)` | Get mapping | `mappingId: string` | `ClaimMapping` |
| `updateClaimMapping(mappingId, request)` | Update mapping | `mappingId`, request | `ClaimMapping` |
| `deleteClaimMapping(mappingId)` | Delete mapping | `mappingId: string` | `void` |
| `listClaimMappings(clientId?)` | List mappings | `clientId?: string` | `ClaimMapping[]` |
| **Token Policies** | | | |
| `getTokenPolicy(clientId)` | Get token policy | `clientId: string` | `TokenPolicy` |
| `updateTokenPolicy(clientId, policy)` | Update policy | `clientId`, `TokenPolicy` | `TokenPolicy` |
| **Device Flow** | | | |
| `initiateDeviceAuthorization(request)` | Start device flow | `DeviceAuthorizationRequest` | `DeviceAuthorizationResponse` |
| `verifyDeviceCode(userCode)` | Verify user code | `userCode: string` | `DeviceCodeVerification` |
| `approveDeviceAuthorization(userCode, userId)` | Approve device | `userCode`, `userId` | `void` |
| `getDeviceAuthorizationStatus(deviceCode)` | Poll status | `deviceCode: string` | `DeviceCodeStatus` |
| **Resource Servers** | | | |
| `createResourceServer(request)` | Register resource server | `CreateResourceServerRequest` | `ResourceServer` |
| `getResourceServer(id)` | Get resource server | `id: string` | `ResourceServer` |
| `updateResourceServer(id, request)` | Update resource server | `id`, request | `ResourceServer` |
| `deleteResourceServer(id)` | Delete resource server | `id: string` | `void` |
| `listResourceServers(page?, pageSize?)` | List resource servers | Pagination | `ResourceServerListResponse` |
| **Dynamic Registration** | | | |
| `enableDynamicRegistration(tenantId, policy)` | Enable/configure DCR | `tenantId`, policy | `DynamicRegistrationPolicy` |
| `getDynamicRegistrationPolicy(tenantId)` | Get DCR policy | `tenantId: string` | `DynamicRegistrationPolicy` |
| **PAR** | | | |
| `pushAuthorizationRequest(request)` | Push auth request (RFC 9126) | `PushedAuthorizationRequest` | `PushedAuthorizationResponse` |
| **Token Exchange** | | | |
| `exchangeToken(request)` | Token exchange (RFC 8693) | `TokenExchangeRequest` | `TokenExchangeResponse` |
| **mTLS** | | | |
| `configureMTLS(clientId, config)` | Configure mTLS | `clientId`, `MTLSConfig` | `MTLSConfig` |
| `getMTLSConfig(clientId)` | Get mTLS config | `clientId: string` | `MTLSConfig` |
| `uploadClientCertificate(clientId, cert)` | Upload client cert | `clientId`, cert data | `ClientCertificate` |

### Models

```
OAuthClient:
  id: string (uuid)
  tenant_id: string (uuid)
  client_id: string (unique, auto-generated or custom)
  client_name: string
  client_description: string?
  client_type: ClientType ("confidential" | "public")
  client_secret_set: boolean (never expose secret in responses)
  redirect_uris: string[]
  post_logout_redirect_uris: string[]
  allowed_grant_types: GrantType[]
  allowed_scopes: string[]
  allowed_response_types: string[] (default: ["code"])
  token_endpoint_auth_method: AuthMethod
  logo_uri: string?
  client_uri: string?
  policy_uri: string?
  tos_uri: string?
  contacts: string[]?
  is_active: boolean
  is_first_party: boolean (skip consent for first-party clients)
  require_pkce: boolean (default: true for public, false for confidential)
  require_consent: boolean (default: true for third-party)
  token_policy: TokenPolicy?
  created_at: datetime
  updated_at: datetime

ClientType (enum):
  - "confidential"    # Server-side apps, can store secrets
  - "public"          # SPAs, mobile apps, CLIs

GrantType (enum):
  - "authorization_code"
  - "client_credentials"
  - "refresh_token"
  - "urn:ietf:params:oauth:grant-type:device_code"
  - "urn:ietf:params:oauth:grant-type:token-exchange"

AuthMethod (enum):
  - "client_secret_post"
  - "client_secret_basic"
  - "private_key_jwt"
  - "none"             # For public clients with PKCE
  - "tls_client_auth"  # mTLS

CreateClientRequest:
  client_name: string
  client_description: string?
  client_type: ClientType
  redirect_uris: string[]
  post_logout_redirect_uris: string[]?
  allowed_grant_types: GrantType[]
  allowed_scopes: string[]?
  token_endpoint_auth_method: AuthMethod?
  logo_uri: string?
  client_uri: string?
  policy_uri: string?
  tos_uri: string?
  contacts: string[]?
  is_first_party: boolean? (default: false)
  require_pkce: boolean?
  require_consent: boolean?
  token_policy: TokenPolicy?

UpdateClientRequest:
  client_name: string?
  client_description: string?
  redirect_uris: string[]?
  post_logout_redirect_uris: string[]?
  allowed_grant_types: GrantType[]?
  allowed_scopes: string[]?
  token_endpoint_auth_method: AuthMethod?
  logo_uri: string?
  client_uri: string?
  policy_uri: string?
  tos_uri: string?
  contacts: string[]?
  is_first_party: boolean?
  is_active: boolean?
  require_pkce: boolean?
  require_consent: boolean?
  token_policy: TokenPolicy?

ClientSecretRotation:
  client_id: string
  new_secret: string (only returned once)
  old_secret_valid_until: datetime (grace period)

ClientSecretResult:
  client_id: string
  client_secret: string (only returned once -- store securely)

TokenPolicy:
  access_token_ttl_seconds: int (default: 3600 -- 1 hour)
  refresh_token_ttl_seconds: int (default: 2592000 -- 30 days)
  id_token_ttl_seconds: int (default: 3600)
  refresh_token_rotation: RefreshTokenRotation
  refresh_token_absolute_lifetime_seconds: int? (max lifetime regardless of use)
  access_token_format: "jwt" | "opaque" (default: "jwt")

RefreshTokenRotation (enum):
  - "none"           # Same refresh token reused
  - "rotate_on_use"  # New refresh token on each use, old invalidated
  - "sliding_window" # Refresh token reissued but old valid for grace period

TokenResponse:
  access_token: string
  token_type: string ("Bearer")
  expires_in: int (seconds)
  refresh_token: string?
  id_token: string? (when openid scope requested)
  scope: string (space-separated)

IntrospectionResponse:
  active: boolean
  scope: string?
  client_id: string?
  username: string?
  token_type: string?
  exp: int? (unix timestamp)
  iat: int? (unix timestamp)
  nbf: int? (unix timestamp)
  sub: string?
  aud: string?
  iss: string?
  jti: string?

OAuthScope:
  id: string (uuid)
  tenant_id: string (uuid)
  name: string (e.g., "read:users", "write:orders")
  display_name: string (human-readable for consent screen)
  description: string
  is_default: boolean (included when no scopes requested)
  is_system: boolean (standard OIDC scope, cannot delete)
  claims: string[] (claims included when scope is granted)
  resource_server_id: string? (uuid)
  created_at: datetime
  updated_at: datetime

ConsentConfig:
  tenant_id: string (uuid)
  consent_screen_title: string
  consent_screen_description: string?
  logo_url: string?
  theme: "light" | "dark" | "auto"
  remember_consent: boolean (default: true)
  consent_expiry_days: int? (null = forever)
  custom_css: string?
  branding: object?

UserOAuthConsent:
  id: string (uuid)
  user_id: string (uuid)
  client_id: string
  client_name: string
  scopes: string[]
  granted_at: datetime
  expires_at: datetime?
  is_active: boolean

ConsentDecision:
  request_id: string (uuid)
  user_id: string (uuid)
  client_id: string
  granted_scopes: string[]
  denied_scopes: string[]
  remember: boolean

ClaimMapping:
  id: string (uuid)
  tenant_id: string (uuid)
  client_id: string? (null = applies to all clients)
  claim_name: string (e.g., "https://myapp.com/claims/role")
  source: ClaimSource
  source_path: string (e.g., "metadata.role", "profile.department")
  token_types: ("access_token" | "id_token")[]
  condition: string? (expression evaluated at token creation)
  created_at: datetime
  updated_at: datetime

ClaimSource (enum):
  - "user_profile"    # Standard user profile fields
  - "user_metadata"   # Custom user metadata
  - "tenant_metadata" # Tenant-level metadata
  - "static"          # Static value
  - "expression"      # Computed expression

DiscoveryDocument:
  issuer: string
  authorization_endpoint: string
  token_endpoint: string
  userinfo_endpoint: string
  jwks_uri: string
  registration_endpoint: string? (if dynamic registration enabled)
  scopes_supported: string[]
  response_types_supported: string[]
  response_modes_supported: string[]
  grant_types_supported: string[]
  subject_types_supported: string[]
  id_token_signing_alg_values_supported: string[]
  token_endpoint_auth_methods_supported: string[]
  claims_supported: string[]
  code_challenge_methods_supported: string[]
  revocation_endpoint: string?
  introspection_endpoint: string?
  device_authorization_endpoint: string?
  pushed_authorization_request_endpoint: string?

JWKS:
  keys: JWK[]

JWK:
  kty: string ("RSA" | "EC")
  use: string ("sig")
  kid: string (key ID)
  alg: string ("RS256" | "ES256")
  n: string? (RSA modulus)
  e: string? (RSA exponent)
  crv: string? (EC curve, e.g., "P-256")
  x: string? (EC x coordinate)
  y: string? (EC y coordinate)

SigningKey:
  id: string (uuid)
  kid: string (key ID used in JWT header)
  algorithm: KeyAlgorithm ("RS256" | "ES256" | "RS384" | "ES384")
  status: KeyStatus ("active" | "rotated" | "revoked")
  created_at: datetime
  rotated_at: datetime?
  expires_at: datetime?

DeviceAuthorizationRequest:
  client_id: string
  scope: string? (space-separated)

DeviceAuthorizationResponse:
  device_code: string
  user_code: string (short, human-readable, e.g., "ABCD-1234")
  verification_uri: string
  verification_uri_complete: string? (includes user_code)
  expires_in: int (seconds)
  interval: int (polling interval in seconds)

DeviceCodeStatus:
  status: "pending" | "approved" | "denied" | "expired"
  token_response: TokenResponse? (only when approved)

ResourceServer:
  id: string (uuid)
  tenant_id: string (uuid)
  name: string
  identifier: string (URI, used as audience in tokens)
  scopes: OAuthScope[]
  signing_algorithm: string
  allow_offline_access: boolean (allow refresh tokens)
  token_ttl_seconds: int
  is_active: boolean
  created_at: datetime
  updated_at: datetime

DynamicRegistrationPolicy:
  tenant_id: string (uuid)
  enabled: boolean
  mode: "open" | "authenticated" | "approval_required"
  allowed_grant_types: GrantType[] (restrict what DCR clients can request)
  allowed_scopes: string[] (restrict scopes for DCR clients)
  default_token_policy: TokenPolicy?
  max_clients_per_registration_token: int?
  registration_access_token_ttl_seconds: int?

PushedAuthorizationRequest:
  client_id: string
  client_secret: string? (for confidential clients)
  response_type: string
  redirect_uri: string
  scope: string?
  state: string?
  code_challenge: string?
  code_challenge_method: string?
  # ... any standard authorization request parameters

PushedAuthorizationResponse:
  request_uri: string
  expires_in: int (seconds)

TokenExchangeRequest:
  grant_type: "urn:ietf:params:oauth:grant-type:token-exchange"
  subject_token: string
  subject_token_type: string (e.g., "urn:ietf:params:oauth:token-type:access_token")
  actor_token: string?
  actor_token_type: string?
  resource: string? (target resource)
  audience: string? (target audience)
  scope: string? (requested scopes)
  requested_token_type: string?

TokenExchangeResponse:
  access_token: string
  issued_token_type: string
  token_type: string
  expires_in: int
  scope: string?
  refresh_token: string?

MTLSConfig:
  client_id: string
  enabled: boolean
  tls_client_auth_subject_dn: string? (expected subject DN)
  tls_client_auth_san_dns: string? (expected SAN DNS)
  tls_client_auth_san_uri: string? (expected SAN URI)
  tls_client_auth_san_ip: string? (expected SAN IP)
  tls_client_certificate_bound_access_tokens: boolean

ClientCertificate:
  id: string (uuid)
  client_id: string
  subject_dn: string
  issuer_dn: string
  serial_number: string
  thumbprint_sha256: string
  not_before: datetime
  not_after: datetime
  uploaded_at: datetime
```

### Events (for Webhooks)

```
oauth.client_created              -- when a new OAuth2 client is registered
oauth.client_updated              -- when a client configuration changes
oauth.client_deleted              -- when a client is deleted
oauth.client_secret_rotated       -- when client secret is rotated
oauth.authorization_requested     -- when an authorization request is received
oauth.authorization_approved      -- when a user approves authorization
oauth.authorization_denied        -- when a user denies authorization
oauth.token_issued                -- when a token is issued
oauth.token_refreshed             -- when a token is refreshed
oauth.token_revoked               -- when a token is revoked
oauth.token_introspected          -- when a token is introspected
oauth.scope_created               -- when a custom scope is defined
oauth.scope_updated               -- when a scope is updated
oauth.scope_deleted               -- when a scope is deleted
oauth.consent_granted             -- when a user grants OAuth consent
oauth.consent_revoked             -- when a user revokes OAuth consent
oauth.signing_key_rotated         -- when a signing key is rotated
oauth.device_authorization_requested  -- when device flow is initiated
oauth.device_authorization_approved   -- when device authorization is approved
oauth.dynamic_client_registered   -- when a client registers via DCR
oauth.resource_server_created     -- when a resource server is registered
oauth.resource_server_updated     -- when a resource server is updated
```

### Error Scenarios

| Scenario | HTTP Status | Python | TypeScript | Java |
|----------|------------|--------|------------|------|
| Client not found | 404 | `ClientNotFoundError` | `ClientNotFoundError` | `ClientNotFoundException` |
| Invalid redirect URI | 400 | `InvalidRedirectUriError` | `InvalidRedirectUriError` | `InvalidRedirectUriException` |
| Invalid grant type for client | 400 | `UnsupportedGrantTypeError` | `UnsupportedGrantTypeError` | `UnsupportedGrantTypeException` |
| Invalid authorization code | 400 | `InvalidGrantError` | `InvalidGrantError` | `InvalidGrantException` |
| Authorization code expired | 400 | `InvalidGrantError` | `InvalidGrantError` | `InvalidGrantException` |
| Invalid client credentials | 401 | `InvalidClientError` | `InvalidClientError` | `InvalidClientException` |
| PKCE required but missing | 400 | `PKCERequiredError` | `PKCERequiredError` | `PKCERequiredException` |
| PKCE code verifier mismatch | 400 | `InvalidGrantError` | `InvalidGrantError` | `InvalidGrantException` |
| Scope not allowed for client | 400 | `InvalidScopeError` | `InvalidScopeError` | `InvalidScopeException` |
| Refresh token expired/revoked | 400 | `InvalidGrantError` | `InvalidGrantError` | `InvalidGrantException` |
| Device code expired | 400 | `ExpiredTokenError` | `ExpiredTokenError` | `ExpiredTokenException` |
| Device code pending (polling) | 400 | `AuthorizationPendingError` | `AuthorizationPendingError` | `AuthorizationPendingException` |
| Device code denied | 403 | `AccessDeniedError` | `AccessDeniedError` | `AccessDeniedException` |
| Token introspection unauthorized | 401 | `AuthenticationError` | `AuthenticationError` | `AuthenticationException` |
| Consent already revoked | 400 | `ValidationError` | `ValidationError` | `ValidationException` |
| Dynamic registration disabled | 403 | `RegistrationDisabledError` | `RegistrationDisabledError` | `RegistrationDisabledException` |
| mTLS certificate mismatch | 401 | `CertificateMismatchError` | `CertificateMismatchError` | `CertificateMismatchException` |
| Scope not found | 404 | `ScopeNotFoundError` | `ScopeNotFoundError` | `ScopeNotFoundException` |
| Resource server not found | 404 | `ResourceServerNotFoundError` | `ResourceServerNotFoundError` | `ResourceServerNotFoundException` |

### Cross-Language Notes

- **Python**: Use `PyJWT` for JWT creation and validation. Use `cryptography` library for key generation (RSA, ECDSA). Discovery document should be cacheable with TTL. PKCE helpers (`generate_code_verifier()`, `generate_code_challenge()`) should be static utility methods. Token endpoint methods return typed `TokenResponse` with helper properties (`.is_expired`, `.scopes_list`).
- **TypeScript**: Use `jose` library for JWT operations. Use Web Crypto API for key generation where possible (Node.js `crypto` as fallback). All token endpoint methods are `async`. Discovery document auto-fetches and caches. Client secret is a write-only field (accepted in create/update, never returned). Export all OAuth2 error types from a dedicated `errors.ts`.
- **Java**: Use Nimbus JOSE+JWT for JWT and JWKS operations. Builder pattern for all request objects (`CreateClientRequest.builder()...build()`). Token endpoint methods return `CompletableFuture<TokenResponse>` for async usage. Use `java.security.KeyPair` for signing key management. OAuth2 error types extend a base `OAuth2Exception` class with `error` and `error_description` fields per RFC 6749.
- **All languages**:
  - Authorization codes MUST be single-use and expire within 10 minutes (per RFC 6749).
  - PKCE code verifiers must be 43-128 characters, using unreserved characters (RFC 7636).
  - Token responses MUST include `Cache-Control: no-store` and `Pragma: no-cache` headers.
  - Client secrets MUST be generated with at least 256 bits of entropy.
  - All token endpoint interactions MUST use TLS.
  - Error responses MUST follow RFC 6749 Section 5.2 format (`{"error": "...", "error_description": "..."}`).
  - Refresh token rotation MUST invalidate the old token immediately upon issuance of a new one (to prevent replay).

---

## 5. Cross-Cutting Concerns

### Authentication and Authorization

All three modules require proper authentication and role-based access control:

| Operation Category | Required Permission |
|-------------------|-------------------|
| Compliance data export/deletion | `compliance:admin` or `compliance:operator` |
| Consent management (on behalf of user) | `compliance:operator` or user self-service |
| Retention policy management | `compliance:admin` |
| Social connection management | `connections:admin` |
| Social login (end-user flow) | Public (no auth required for auth flow initiation) |
| OAuth2 client management | `oauth:admin` |
| Token operations (end-user) | Valid OAuth2 client credentials |
| Scope/claim management | `oauth:admin` |

### Pagination

All list endpoints follow the existing SDK convention:

```
ListResponse:
  data: T[]
  total: int
  page: int
  page_size: int
```

Default page size: 20. Maximum page size: 100.

### Rate Limiting

| Endpoint Category | Rate Limit |
|------------------|------------|
| Data export requests | 10 per user per hour |
| Data deletion requests | 5 per user per hour |
| Compliance report generation | 10 per tenant per hour |
| Social login flows | 100 per IP per minute |
| OAuth2 token endpoint | 1000 per client per minute |
| OAuth2 authorize endpoint | 100 per client per minute |
| Device authorization | 50 per client per minute |
| Token introspection | 5000 per resource server per minute |

### Audit Trail Integration

All operations across these three modules MUST generate audit log entries via the existing Audit Logs module:

```
# Compliance module audit events
compliance.export.initiated
compliance.export.completed
compliance.deletion.initiated
compliance.deletion.completed
compliance.consent.granted
compliance.consent.revoked
compliance.policy.published
compliance.breach.created

# Social connections audit events
social.connection.created
social.connection.deleted
social.credentials.rotated
social.login.succeeded
social.login.failed
social.account.linked
social.account.unlinked

# OAuth2 server audit events
oauth.client.created
oauth.client.deleted
oauth.authorization.approved
oauth.authorization.denied
oauth.token.issued
oauth.token.revoked
oauth.scope.created
oauth.key.rotated
```

### Webhook Integration

All webhook events defined in each module's Events section MUST be deliverable through the existing Webhooks module infrastructure. New event types must be added to the `WebhookEvent` enum/type in all three SDKs.

### Error Handling

All modules follow the existing SDK error hierarchy:

```
PlatformError (base)
  ValidationError (400)
  AuthenticationError (401)
  AuthorizationError (403)
  NotFoundError (404)
  ConflictError (409)
  RateLimitError (429)
  ServerError (5xx)
```

Module-specific errors extend these base types. For example:
- `LegalHoldActiveError` extends `ConflictError`
- `ProviderUnavailableError` extends `ServerError` (502)
- `InvalidGrantError` extends `ValidationError`

### SDK Client Structure

Each module follows the existing client pattern:

```
# Python
class ComplianceClient:
    def __init__(self, base_url, access_token?, timeout?)
    def set_access_token(token)
    def close()

class SocialConnectionsClient:
    def __init__(self, base_url, access_token?, timeout?)

class OAuth2ServerClient:
    def __init__(self, base_url, access_token?, timeout?)
```

```
// TypeScript
class ComplianceClient {
    constructor(config: ClientConfig)
}

class SocialConnectionsClient {
    constructor(config: ClientConfig)
}

class OAuth2ServerClient {
    constructor(config: ClientConfig)
}
```

```
// Java
public class ComplianceClient {
    public ComplianceClient(String baseUrl, String accessToken, Duration timeout)
}

public class SocialConnectionsClient { ... }
public class OAuth2ServerClient { ... }
```

### Testing Requirements

Each module must have comprehensive test coverage:

| Test Type | Coverage Target | Notes |
|-----------|---------------|-------|
| Unit tests | 90%+ line coverage | All SDK methods, model serialization, error handling |
| Integration tests | All API endpoints | Against mock server |
| Cross-language parity | 100% | Same test scenarios in Python, TypeScript, Java |
| Security tests | All auth flows | PKCE validation, token security, secret handling |
| RFC compliance tests | All implemented RFCs | Validate against RFC test vectors where available |

### Migration and Adoption Path

1. **Phase 1 (Weeks 1-4)**: Implement Compliance module (P1) -- Core features only (export, deletion, retention, consent, lawful basis, policy versioning, reports)
2. **Phase 2 (Weeks 5-8)**: Implement Social Connections module (P2) -- Core features (15 providers, connection CRUD, auth flow, account linking)
3. **Phase 3 (Weeks 9-14)**: Implement OAuth2 Server module (P2) -- Core features (client management, authorization, token, OIDC discovery, JWKS, userinfo, scopes, consent, claims, token policies, introspection, device flow)
4. **Phase 4 (Weeks 15-18)**: Enhanced features for all modules (data residency, PII detection, connection health, dynamic registration, PAR, token exchange, resource servers, mTLS)
5. **Phase 5 (Weeks 19-22)**: Polish, OpenID certification preparation, documentation, and GA readiness

---

## 6. Appendix: Competitive Feature Matrix

### Overall Competitive Position After These 3 Modules

| Capability Area | Auth0 | Clerk | WorkOS | Firebase | Supabase | Our SDK (Post-GA) |
|----------------|-------|-------|--------|----------|----------|-------------------|
| Basic Auth (password, tokens) | Full | Full | Full | Full | Full | Full |
| MFA/2FA | Full | Full | Partial | Partial | Partial | Full |
| Passwordless | Full | Full | Magic Auth | Phone only | Magic Link | Full |
| Passkeys/WebAuthn | Full | Full | No | No | No | Full |
| Session Management | Full | Full | Full | Basic | Basic | Full |
| Social Login | 50+ providers | 25+ providers | 7 providers | 9+ providers | 15+ providers | **15+ providers** |
| SSO (SAML/OIDC) | Full | Enterprise | Full | SAML (IdP) | Via WorkOS | Full |
| Multi-Tenancy | Organizations | Organizations | Organizations | Projects | Projects | Full |
| RBAC | Full | Full | Partial | Custom Rules | RLS | Full |
| User Management | Full | Full | Full (Directory Sync) | Full | Full | Full |
| Webhooks | Full | Full (Svix) | Full | Cloud Functions | Auth Hooks | Full |
| Audit Logs | Full | Partial | Full | Cloud Logging | Postgres | Full |
| SCIM | Full | Partial | Full | No | No | Full |
| **Compliance/GDPR** | **Basic** | **Minimal** | **Basic** | **Minimal** | **Minimal** | **Full** |
| **OAuth2 Server** | **Full** | **Partial (new)** | **Partial** | **No** | **Partial (new)** | **Full** |
| Admin Portal | Dashboard | Prebuilt Components | Admin Portal | Console | Dashboard | Components |
| User Impersonation | Yes | Yes (Act as) | No | No | No | Yes |
| Breached Password | Yes | No | No | No | No | Yes |

### Module-Specific RFC Compliance Matrix

| RFC | Auth0 | Okta | Keycloak | Ory Hydra | Our SDK |
|-----|-------|------|----------|-----------|---------|
| RFC 6749 (OAuth 2.0) | Yes | Yes | Yes | Yes | Yes |
| RFC 6750 (Bearer Token) | Yes | Yes | Yes | Yes | Yes |
| RFC 7009 (Token Revocation) | Yes | Yes | Yes | Yes | Yes |
| RFC 7517 (JWK) | Yes | Yes | Yes | Yes | Yes |
| RFC 7519 (JWT) | Yes | Yes | Yes | Yes | Yes |
| RFC 7591 (Dynamic Client Reg) | No | No | Yes | Yes | Yes |
| RFC 7636 (PKCE) | Yes | Yes | Yes | Yes | Yes |
| RFC 7662 (Token Introspection) | No | Yes | Yes | Yes | Yes |
| RFC 8628 (Device Authorization) | Yes | Yes | Yes | No | Yes |
| RFC 8693 (Token Exchange) | Partial | Yes | Partial | No | Yes |
| RFC 8705 (mTLS) | No | Yes | Yes | Yes | Yes |
| RFC 9126 (PAR) | No | No | Partial | No | Yes |
| OpenID Connect Core 1.0 | Yes | Yes | Yes | Yes | Yes |
| OpenID Connect Discovery | Yes | Yes | Yes | Yes | Yes |

---

*End of specification. This document should be reviewed by the Security Team, Product Team, and Legal/Compliance Team before implementation begins.*
