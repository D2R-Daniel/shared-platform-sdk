# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`
**Created**: [DATE]
**Status**: Draft
**Input**: User description: "$ARGUMENTS"

---

## Executive Summary

[2-3 sentence summary of the feature, its business value, and strategic importance]

---

## Part 1: Existing Functionality Baseline

> **Source**: `docs/existing-features.md`

### Current Capabilities

| Module | Status | Relevance to Feature |
| ------ | ------ | -------------------- |
| [Module] | [Implemented/Partial/None] | [How it relates] |

### Reusable Components

List existing components that can be leveraged:

- **[Component]**: [How it can be reused]
- **[Component]**: [How it can be reused]

### Gaps in Current Implementation

| Gap | Impact on Feature | Resolution Approach |
| --- | ----------------- | ------------------- |
| [Gap] | [Impact] | [Approach] |

---

## Part 2: Competitive Analysis

> **Template**: `.specify/templates/competitor-research-template.md`

### Competitor Overview

| Competitor | Strengths | Weaknesses | Relevant Features |
| ---------- | --------- | ---------- | ----------------- |
| [Name] | [Strengths] | [Weaknesses] | [Features] |
| [Name] | [Strengths] | [Weaknesses] | [Features] |
| [Name] | [Strengths] | [Weaknesses] | [Features] |

### Feature Comparison Matrix

| Feature | Our SDK | Competitor 1 | Competitor 2 | Competitor 3 |
| ------- | ------- | ------------ | ------------ | ------------ |
| [Feature 1] | [Status] | [Status] | [Status] | [Status] |
| [Feature 2] | [Status] | [Status] | [Status] | [Status] |
| [Feature 3] | [Status] | [Status] | [Status] | [Status] |

**Legend**: ✅ Full | 🟡 Partial | ❌ None | 🔮 Roadmap

### Competitive Insights

- **Must Match**: [Features we must have to compete]
- **Differentiation Opportunities**: [Where we can stand out]
- **Market Trends**: [Direction the market is heading]

---

## Part 3: Prioritized Features

> **Skill**: Product Owner (RICE + MoSCoW)

### RICE Scoring

| Feature | Reach | Impact | Confidence | Effort | RICE Score |
| ------- | ----- | ------ | ---------- | ------ | ---------- |
| [Feature] | [#] | [0.25-3] | [50-100%] | [PM] | [Score] |

**Scoring Guide**:
- Reach: Users impacted per quarter
- Impact: 3=Massive, 2=High, 1=Medium, 0.5=Low, 0.25=Minimal
- Confidence: 100%=High, 80%=Medium, 50%=Low
- Effort: Person-months

### MoSCoW Categorization

#### Must Have (Non-negotiable for release)
- [ ] [Feature] - [Justification]

#### Should Have (Important, not critical)
- [ ] [Feature] - [Justification]

#### Could Have (Desirable enhancements)
- [ ] [Feature] - [Justification]

#### Won't Have (This release)
- [ ] [Feature] - [Reason for exclusion]

### Priority Summary

| Priority | Feature | MoSCoW | RICE | Target Release |
| -------- | ------- | ------ | ---- | -------------- |
| P1 | [Feature] | Must | [Score] | [Release] |
| P2 | [Feature] | Should | [Score] | [Release] |
| P3 | [Feature] | Could | [Score] | [Release] |

---

## Part 4: User Scenarios & Testing *(mandatory)*

### Capability Categories

Organize user stories by capability area:

#### Category: [CATEGORY_NAME]

Features in this category:
- [Feature 1]
- [Feature 2]

---

### User Story 1 - [Brief Title] (Priority: P[X])

**Category**: [Capability Category]

As a [user type], I want [goal], so that [benefit].

**Why this priority**: [Business justification and RICE/MoSCoW reasoning]

**Independent Test**: [How this can be tested in isolation]

**Acceptance Scenarios**:

1. **Given** [context], **When** [action], **Then** [outcome]
2. **Given** [context], **When** [action], **Then** [outcome]

---

### User Story 2 - [Brief Title] (Priority: P[X])

**Category**: [Capability Category]

As a [user type], I want [goal], so that [benefit].

**Why this priority**: [Business justification]

**Independent Test**: [How this can be tested in isolation]

**Acceptance Scenarios**:

1. **Given** [context], **When** [action], **Then** [outcome]

---

[Continue for all user stories...]

---

### Edge Cases

- [Edge case 1]
- [Edge case 2]
- [Edge case 3]

---

## Part 5: Requirements *(mandatory)*

### Functional Requirements by Category

#### [Category 1]: [Category Name]

- **FR-001**: System MUST [requirement]
- **FR-002**: System MUST [requirement]

#### [Category 2]: [Category Name]

- **FR-003**: System MUST [requirement]
- **FR-004**: System MUST [requirement]

### Key Entities

| Entity | Description | Key Attributes |
| ------ | ----------- | -------------- |
| [Entity] | [Description] | [Attributes] |

---

## Part 6: Success Criteria *(mandatory)*

### Measurable Outcomes

| ID | Metric | Target | Measurement Method |
| -- | ------ | ------ | ------------------ |
| SC-001 | [Metric] | [Target] | [How to measure] |
| SC-002 | [Metric] | [Target] | [How to measure] |

### Feature Adoption Targets

| Feature | Adoption Target | Timeline |
| ------- | --------------- | -------- |
| [Feature] | [%] of users | [Timeframe] |

---

## Part 7: Combined Outputs

### Output 1: Feature Matrix

```
## [Area] Feature Matrix

| Feature | Status | Priority | Category | RICE | MoSCoW | Effort |
| ------- | ------ | -------- | -------- | ---- | ------ | ------ |
```

### Output 2: Capability Map

```
## Capability Categories

### [Category 1]
- ✅ [Implemented Feature]
- 🔮 [Planned Feature] (P1)
- 🔮 [Planned Feature] (P2)

### [Category 2]
- ✅ [Implemented Feature]
- 🔮 [Planned Feature] (P1)
```

### Output 3: Roadmap View

```
## Implementation Roadmap

### Phase 1: [Theme] (Sprint X-Y)
| Feature | Priority | Effort | Dependencies |
| ------- | -------- | ------ | ------------ |

### Phase 2: [Theme] (Sprint Y-Z)
| Feature | Priority | Effort | Dependencies |
| ------- | -------- | ------ | ------------ |
```

---

## Assumptions

- [Assumption 1]
- [Assumption 2]

## Dependencies

- [Dependency 1]
- [Dependency 2]

## Research Sources

- [Source 1](URL)
- [Source 2](URL)

---

## Appendix A: Competitor Research Details

[Detailed competitor analysis following competitor-research-template.md]

## Appendix B: Existing Features Reference

[Summary from docs/existing-features.md relevant to this feature]
