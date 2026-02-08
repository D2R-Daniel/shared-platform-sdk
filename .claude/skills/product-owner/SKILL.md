# Product Owner Skill

## Purpose

Provide product ownership capabilities including feature prioritization using RICE and MoSCoW frameworks, backlog management, user story refinement, and stakeholder communication.

## When to Use

- When prioritizing features for a roadmap
- When conducting competitive analysis
- When writing or refining user stories
- When creating specifications with prioritized requirements
- When balancing business value against development effort
- During sprint planning and backlog grooming

---

## Prioritization Frameworks

### RICE Scoring

RICE is a quantitative prioritization framework that scores features based on four factors:

| Factor | Description | Scale |
| ------ | ----------- | ----- |
| **R**each | How many users will this impact per time period? | Number of users (e.g., 1000 users/quarter) |
| **I**mpact | How much will this impact each user? | 3=Massive, 2=High, 1=Medium, 0.5=Low, 0.25=Minimal |
| **C**onfidence | How confident are we in our estimates? | 100%=High, 80%=Medium, 50%=Low |
| **E**ffort | How many person-months will this take? | Person-months (e.g., 2 = 2 person-months) |

**Formula**: `RICE Score = (Reach × Impact × Confidence) / Effort`

#### RICE Scoring Template

```markdown
| Feature | Reach | Impact | Confidence | Effort | RICE Score | Rank |
| ------- | ----- | ------ | ---------- | ------ | ---------- | ---- |
| MFA/2FA | 5000 | 3 | 80% | 3 | 4000 | 1 |
| Audit Logs | 2000 | 3 | 90% | 4 | 1350 | 2 |
| Passwordless | 3000 | 2 | 70% | 2 | 2100 | 3 |
```

#### Interpreting RICE Scores

- **> 1000**: High priority - strong business case
- **500-1000**: Medium priority - good candidate for roadmap
- **100-500**: Lower priority - consider if resources available
- **< 100**: Low priority - may not be worth investment

---

### MoSCoW Prioritization

MoSCoW categorizes features by necessity, not just value:

| Category | Definition | Criteria |
| -------- | ---------- | -------- |
| **M**ust Have | Non-negotiable for release | Failure without it, legal/compliance, core functionality |
| **S**hould Have | Important but not critical | Significant value, workarounds exist |
| **C**ould Have | Desirable enhancements | Nice to have, improves experience |
| **W**on't Have (this time) | Explicitly excluded | Out of scope, future consideration |

#### MoSCoW Template

```markdown
### Must Have (M)
- [ ] MFA/2FA - Required for enterprise compliance
- [ ] Audit Logs - SOC2/GDPR requirement

### Should Have (S)
- [ ] Passwordless Auth - Strong user demand
- [ ] Session Management - Security best practice

### Could Have (C)
- [ ] Admin Portal Components - Reduces support burden
- [ ] Organization Switcher - Improves UX

### Won't Have (W) - This Release
- [ ] Device Fingerprinting - Future consideration
- [ ] Behavioral Biometrics - Requires ML infrastructure
```

---

### Combined RICE + MoSCoW Approach

For comprehensive prioritization, use RICE for scoring within MoSCoW categories:

```markdown
## Priority Matrix

### Must Have (Sorted by RICE)
| Feature | RICE Score | Sprint Target |
| ------- | ---------- | ------------- |
| MFA/2FA | 4000 | Sprint 1-2 |
| Audit Logs | 1350 | Sprint 2-3 |

### Should Have (Sorted by RICE)
| Feature | RICE Score | Sprint Target |
| ------- | ---------- | ------------- |
| Passwordless | 2100 | Sprint 3-4 |
| Sessions | 1800 | Sprint 4-5 |

### Could Have (Sorted by RICE)
| Feature | RICE Score | Sprint Target |
| ------- | ---------- | ------------- |
| Org Switcher | 900 | Sprint 5-6 |
| Impersonation | 750 | Sprint 6 |
```

---

## User Story Best Practices

### Story Format

```markdown
**As a** [user type/persona],
**I want** [goal/desire],
**So that** [benefit/value].
```

### Acceptance Criteria Format (Given-When-Then)

```markdown
**Given** [precondition/context],
**When** [action/trigger],
**Then** [expected outcome].
```

### Story Quality Checklist (INVEST)

| Criteria | Description | Check |
| -------- | ----------- | ----- |
| **I**ndependent | Can be developed separately | [ ] |
| **N**egotiable | Details can be discussed | [ ] |
| **V**aluable | Delivers user/business value | [ ] |
| **E**stimable | Team can size it | [ ] |
| **S**mall | Fits in a sprint | [ ] |
| **T**estable | Clear acceptance criteria | [ ] |

---

## Capability Categories

When organizing features, use consistent categories:

### Authentication & Security
- Login methods (password, SSO, passwordless)
- Multi-factor authentication
- Session management
- Credential security

### Authorization & Access Control
- Role-based access (RBAC)
- Permission management
- Policy enforcement
- Impersonation

### User Management
- User lifecycle (CRUD)
- Profile management
- Self-service capabilities
- Bulk operations

### Organization & Multi-Tenancy
- Tenant management
- Team hierarchy
- Organization switching
- Branding & customization

### Integration & Developer Experience
- SDK quality
- API design
- Webhooks
- Documentation

### Compliance & Enterprise
- Audit logging
- SCIM provisioning
- Certifications
- Data residency

---

## Output Formats

### Feature Matrix Format

```markdown
## Feature Matrix: [Area]

| Feature | Status | Priority | RICE | MoSCoW | Target |
| ------- | ------ | -------- | ---- | ------ | ------ |
| Feature A | Implemented | - | - | - | - |
| Feature B | Missing | P1 | 4000 | Must | Q1 |
| Feature C | Partial | P2 | 2100 | Should | Q2 |
```

### Roadmap Format

```markdown
## Roadmap: [Year/Quarter]

### Phase 1: Foundation (Month 1-2)
**Theme**: Enterprise Security Baseline

| Feature | Priority | Effort | Dependencies |
| ------- | -------- | ------ | ------------ |
| MFA/2FA | P1-Must | L | None |
| Audit Logs | P1-Must | L | None |

### Phase 2: Modern Auth (Month 3-4)
**Theme**: Authentication Innovation

| Feature | Priority | Effort | Dependencies |
| ------- | -------- | ------ | ------------ |
| Passwordless | P2-Should | M | Email module |
| Passkeys | P2-Should | M | WebAuthn |
```

### Backlog Format

```markdown
## Product Backlog

### Ready for Development
| ID | Story | Points | Priority | Sprint |
| -- | ----- | ------ | -------- | ------ |
| US-001 | MFA Setup Flow | 8 | P1 | 1 |
| US-002 | MFA Verification | 5 | P1 | 1 |

### Needs Refinement
| ID | Story | Blocker |
| -- | ----- | ------- |
| US-010 | Admin Portal | Design needed |

### Icebox
| ID | Story | Reason |
| -- | ----- | ------ |
| US-050 | Biometrics | Future tech |
```

---

## Stakeholder Communication

### Executive Summary Template

```markdown
## Feature Priority Summary

**Recommendation**: [1-2 sentence recommendation]

### Top 3 Priorities
1. **[Feature]** - [One-line justification]
2. **[Feature]** - [One-line justification]
3. **[Feature]** - [One-line justification]

### Investment Required
- Total Effort: [X] person-months
- Timeline: [X] months
- Team Size: [X] engineers

### Expected Outcomes
- [Metric 1]: [Target]
- [Metric 2]: [Target]
```

### Trade-off Analysis Template

```markdown
## Trade-off: [Option A] vs [Option B]

| Dimension | Option A | Option B |
| --------- | -------- | -------- |
| User Value | [Score] | [Score] |
| Dev Effort | [Score] | [Score] |
| Risk | [Score] | [Score] |
| Time to Market | [Score] | [Score] |

**Recommendation**: [Option] because [reason]
```

---

## Integration with /speckit.specify

When running `/speckit.specify`, apply product owner thinking:

1. **Document existing features** first (baseline)
2. **Research competitors** using template
3. **Score features** using RICE
4. **Categorize** using MoSCoW
5. **Organize** by capability categories
6. **Output** in combined formats

### Priority Assignment Guidelines

| Priority | MoSCoW | RICE Score | Characteristics |
| -------- | ------ | ---------- | --------------- |
| P1 | Must Have | > 1000 | Blocking, compliance, core |
| P2 | Should Have | 500-1000 | High value, strong demand |
| P3 | Could Have | 100-500 | Nice to have, differentiator |
| P4 | Could Have | < 100 | Low priority, future |
| P5 | Won't Have | - | Out of scope |
