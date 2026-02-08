# Combined Output Formats Template

This template provides standardized output formats for feature specifications, combining multiple views of the same data for different stakeholders.

---

## Format 1: Feature Matrix

A comprehensive grid showing all features with their status and prioritization.

```markdown
# Feature Matrix: [Domain/Area]

**Generated**: [DATE]
**Source**: [Spec File]

## Status Legend
- ✅ Implemented (production-ready)
- 🟡 Partial (in progress or limited)
- ❌ Not Implemented
- 🔮 Planned (on roadmap)
- ⏸️ Deferred (explicitly postponed)

## Feature Overview

| # | Feature | Status | Priority | RICE | MoSCoW | Category | Effort | Target |
|---|---------|--------|----------|------|--------|----------|--------|--------|
| 1 | [Feature Name] | [Status] | P1 | [Score] | Must | [Cat] | [S/M/L] | [Release] |
| 2 | [Feature Name] | [Status] | P2 | [Score] | Should | [Cat] | [S/M/L] | [Release] |
| 3 | [Feature Name] | [Status] | P3 | [Score] | Could | [Cat] | [S/M/L] | [Release] |

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Features | [#] |
| Implemented | [#] |
| In Progress | [#] |
| Planned | [#] |
| Deferred | [#] |

## Priority Distribution

| Priority | Must Have | Should Have | Could Have | Won't Have |
|----------|-----------|-------------|------------|------------|
| P1 | [#] | - | - | - |
| P2 | - | [#] | - | - |
| P3 | - | - | [#] | - |
| P4+ | - | - | - | [#] |
```

---

## Format 2: User Story Collection

Organized user stories grouped by capability category with full acceptance criteria.

```markdown
# User Stories: [Feature Area]

**Total Stories**: [#]
**Sprint Capacity**: [#] story points

---

## Category: Authentication & Security

### US-001: [Story Title] (P1, [X] points)

**As a** [persona],
**I want** [goal],
**So that** [benefit].

**Acceptance Criteria**:
1. **Given** [context], **When** [action], **Then** [outcome]
2. **Given** [context], **When** [action], **Then** [outcome]

**Notes**: [Any additional context]

---

### US-002: [Story Title] (P1, [X] points)

[Story details...]

---

## Category: User Management

### US-003: [Story Title] (P2, [X] points)

[Story details...]

---

## Story Summary by Category

| Category | Stories | Total Points | Priority Breakdown |
|----------|---------|--------------|-------------------|
| Auth & Security | [#] | [#] | P1:[#], P2:[#] |
| User Management | [#] | [#] | P1:[#], P2:[#] |
| Organization | [#] | [#] | P2:[#], P3:[#] |
```

---

## Format 3: Capability Categories

Hierarchical view organizing features by domain capability.

```markdown
# Capability Map: [Product/SDK Name]

**Version**: [X.Y.Z]
**Last Updated**: [DATE]

---

## 1. Authentication & Security

### 1.1 Login Methods
| Capability | Status | Priority |
|------------|--------|----------|
| Password Authentication | ✅ Implemented | - |
| OAuth2/OIDC | ✅ Implemented | - |
| Magic Links | 🔮 Planned | P2 |
| Passkeys/WebAuthn | 🔮 Planned | P2 |
| Passwordless OTP | 🔮 Planned | P2 |

### 1.2 Multi-Factor Authentication
| Capability | Status | Priority |
|------------|--------|----------|
| TOTP (Authenticator Apps) | 🔮 Planned | P1 |
| SMS OTP | 🔮 Planned | P1 |
| Backup Codes | 🔮 Planned | P1 |
| Hardware Keys | ⏸️ Deferred | P4 |

### 1.3 Session Security
| Capability | Status | Priority |
|------------|--------|----------|
| Session Tracking | 🔮 Planned | P2 |
| Session Termination | 🔮 Planned | P2 |
| Concurrent Session Limits | 🔮 Planned | P3 |

---

## 2. Authorization & Access Control

### 2.1 Role-Based Access
| Capability | Status | Priority |
|------------|--------|----------|
| Role Management | ✅ Implemented | - |
| Permission Assignment | ✅ Implemented | - |
| Role Hierarchy | ✅ Implemented | - |
| Dynamic Permissions | ⏸️ Deferred | P4 |

### 2.2 Advanced Access Control
| Capability | Status | Priority |
|------------|--------|----------|
| User Impersonation | 🔮 Planned | P3 |
| Temporary Permissions | ⏸️ Deferred | P4 |

---

## 3. User Management

### 3.1 User Lifecycle
| Capability | Status | Priority |
|------------|--------|----------|
| User CRUD | ✅ Implemented | - |
| Profile Management | ✅ Implemented | - |
| Status Management | ✅ Implemented | - |
| Bulk Operations | ✅ Implemented | - |

### 3.2 Self-Service
| Capability | Status | Priority |
|------------|--------|----------|
| Password Reset | ✅ Implemented | - |
| Profile Updates | ✅ Implemented | - |
| MFA Enrollment | 🔮 Planned | P1 |
| Passkey Management | 🔮 Planned | P2 |

---

## 4. Organization & Multi-Tenancy

### 4.1 Tenant Management
| Capability | Status | Priority |
|------------|--------|----------|
| Tenant CRUD | ✅ Implemented | - |
| Custom Domains | ✅ Implemented | - |
| Branding | ✅ Implemented | - |
| Feature Flags | ✅ Implemented | - |

### 4.2 Team Hierarchy
| Capability | Status | Priority |
|------------|--------|----------|
| Team Management | ✅ Implemented | - |
| Hierarchical Teams | ✅ Implemented | - |
| Organization Switching | 🔮 Planned | P3 |

---

## 5. Enterprise & Compliance

### 5.1 SSO & Provisioning
| Capability | Status | Priority |
|------------|--------|----------|
| SAML SSO | ✅ Implemented | - |
| OIDC SSO | ✅ Implemented | - |
| SCIM Provisioning | 🟡 Partial | P4 |
| Directory Sync | 🔮 Planned | P4 |

### 5.2 Audit & Compliance
| Capability | Status | Priority |
|------------|--------|----------|
| Audit Logging | 🔮 Planned | P1 |
| Log Export | 🔮 Planned | P1 |
| Retention Policies | 🔮 Planned | P2 |

---

## Capability Summary

| Domain | Implemented | Partial | Planned | Deferred | Total |
|--------|-------------|---------|---------|----------|-------|
| Authentication | [#] | [#] | [#] | [#] | [#] |
| Authorization | [#] | [#] | [#] | [#] | [#] |
| User Management | [#] | [#] | [#] | [#] | [#] |
| Organization | [#] | [#] | [#] | [#] | [#] |
| Enterprise | [#] | [#] | [#] | [#] | [#] |
| **Total** | [#] | [#] | [#] | [#] | [#] |
```

---

## Format 4: Roadmap View

Timeline-based view for planning and communication.

```markdown
# Feature Roadmap: [Product Name]

**Planning Horizon**: [Timeframe]
**Last Updated**: [DATE]

---

## Roadmap Overview

```
Q1 2025          Q2 2025          Q3 2025          Q4 2025
|----------------|----------------|----------------|
| MFA/2FA        | Passwordless   | Admin Portal   | Advanced Auth  |
| Audit Logs     | Sessions       | Org Switcher   | Biometrics     |
|                | Passkeys       | Impersonation  |                |
```

---

## Phase 1: Enterprise Security Foundation
**Timeline**: [Start] - [End]
**Theme**: Compliance & Security Baseline
**Investment**: [X] person-months

### Deliverables

| Feature | Priority | Effort | Owner | Status |
|---------|----------|--------|-------|--------|
| MFA/2FA | P1-Must | L | [Team] | Not Started |
| Audit Logs | P1-Must | L | [Team] | Not Started |

### Success Criteria
- [ ] All P1 features deployed to production
- [ ] [Metric]: [Target]

### Dependencies
- [Dependency 1]
- [Dependency 2]

---

## Phase 2: Modern Authentication
**Timeline**: [Start] - [End]
**Theme**: User Experience & Innovation
**Investment**: [X] person-months

### Deliverables

| Feature | Priority | Effort | Owner | Status |
|---------|----------|--------|-------|--------|
| Passwordless | P2-Should | M | [Team] | Not Started |
| Sessions | P2-Should | M | [Team] | Not Started |
| Passkeys | P2-Should | M | [Team] | Not Started |

### Success Criteria
- [ ] [Metric]: [Target]

---

## Phase 3: Self-Service & Administration
**Timeline**: [Start] - [End]
**Theme**: Customer Enablement
**Investment**: [X] person-months

### Deliverables

| Feature | Priority | Effort | Owner | Status |
|---------|----------|--------|-------|--------|
| Admin Portal | P3-Could | L | [Team] | Not Started |
| Org Switcher | P3-Could | M | [Team] | Not Started |
| Impersonation | P3-Could | S | [Team] | Not Started |

---

## Backlog (Future Consideration)

| Feature | Priority | Rationale for Deferral |
|---------|----------|------------------------|
| [Feature] | P4 | [Reason] |
| [Feature] | P5 | [Reason] |

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| [Risk] | [H/M/L] | [H/M/L] | [Strategy] |
```

---

## Format 5: Executive Summary

One-page summary for leadership communication.

```markdown
# Executive Summary: [Feature/Initiative]

**Date**: [DATE]
**Author**: [Name]
**Status**: [Draft/Final]

---

## Strategic Recommendation

[2-3 sentence summary of what we should do and why]

---

## Key Findings

### Competitive Position
- We have [#] of [#] features that competitors offer
- Critical gaps: [List top 3]
- Our advantages: [List top 2]

### Market Opportunity
- [Market trend or data point]
- [Customer demand signal]

---

## Proposed Investment

| Phase | Features | Effort | Timeline |
|-------|----------|--------|----------|
| Phase 1 | [#] P1 features | [X] PM | [Months] |
| Phase 2 | [#] P2 features | [X] PM | [Months] |
| Phase 3 | [#] P3 features | [X] PM | [Months] |
| **Total** | [#] features | [X] PM | [Months] |

---

## Expected Outcomes

| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| Feature Parity | [%] | [%] | [Description] |
| [Business Metric] | [Current] | [Target] | [Description] |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| [Risk 1] | [Approach] |
| [Risk 2] | [Approach] |

---

## Decision Required

- [ ] Approve Phase 1 investment of [X] person-months
- [ ] Confirm priority ordering
- [ ] Assign team resources
```

---

## Usage Instructions

### When to Use Each Format

| Format | Audience | Purpose |
|--------|----------|---------|
| Feature Matrix | Engineering, PM | Detailed planning, sprint planning |
| User Stories | Engineering | Development, testing |
| Capability Map | Product, Strategy | Gap analysis, portfolio view |
| Roadmap | All stakeholders | Timeline planning, communication |
| Executive Summary | Leadership | Decision making, funding |

### Generating Outputs

When running `/speckit.specify`, generate multiple outputs:

1. **Always generate**: Feature Matrix + User Stories
2. **For competitive analysis**: Add Capability Map
3. **For planning**: Add Roadmap View
4. **For stakeholder presentation**: Add Executive Summary
