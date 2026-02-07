---
description: Deep competitive/product research — analyzes competitors, identifies gaps, and prioritizes features for any domain
allowed_permissions:
  # Prerequisites
  - Bash: run prerequisite check script
  - Bash: list directory contents
  - Bash: create directories

  # Git Operations
  - Bash: git status
  - Bash: git branch operations

  # File Operations
  - Read: read spec, metadata, and existing research files
  - Write: create research files and summaries
handoffs:
  - label: Brainstorm Approaches
    agent: general-purpose
    prompt: Use superpowers:brainstorming to explore approaches based on research findings
  - label: Create Specification
    agent: speckit.specify
    prompt: Create specification based on the research findings
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

---

## CRITICAL: Upfront Permissions Request

**IMPORTANT**: Before starting ANY work, you MUST request all permissions upfront to enable uninterrupted execution. Present this permission request to the user FIRST:

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    COMPETITIVE RESEARCH - PERMISSIONS                          ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  This command will perform the following actions automatically:               ║
║                                                                               ║
║  🔧 BASH/GIT COMMANDS:                                                        ║
║     • Run git fetch --all --prune                                             ║
║     • Run git ls-remote, git branch to find existing branches                 ║
║     • Run create-new-feature.sh to create branch (unless --skip-branch)       ║
║     • Run git checkout to switch to new feature branch                        ║
║                                                                               ║
║  🌐 WEB RESEARCH (extensive):                                                 ║
║     • WebSearch for competitor documentation (3-6 competitors)                ║
║     • WebSearch for feature comparisons and pricing                           ║
║     • WebFetch for official documentation pages                               ║
║     • Multiple searches per competitor (4-8 queries each)                     ║
║                                                                               ║
║  📁 FILE OPERATIONS:                                                          ║
║     • Read .specify/templates/competitor-research-template.md (if exists)     ║
║     • Write specs/{feature}/research/competitor-*.md (per competitor)         ║
║     • Write specs/{feature}/research/ui-patterns.md                           ║
║     • Write specs/{feature}/research/research-summary.md                      ║
║                                                                               ║
║  📂 DIRECTORY OPERATIONS:                                                     ║
║     • Create specs/{feature}/ directory                                       ║
║     • Create specs/{feature}/research/ directory                              ║
║     • List specs/ to find existing features                                   ║
║                                                                               ║
║  Do you approve ALL these permissions to run without further prompts?         ║
║                                                                               ║
║  [Y] Yes, proceed with all permissions                                        ║
║  [N] No, I want to review each action                                         ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

**If user approves**: Proceed with full automation, no further permission prompts.
**If user declines**: Fall back to interactive mode with individual confirmations.

---

## Overview

The `/speckit.research` command performs deep competitive analysis and market research for any product domain BEFORE creating a specification. This ensures features are designed with full awareness of:

- How competitors implement similar capabilities
- Market gaps and opportunities
- Industry best practices
- UI/UX patterns across the landscape
- Prioritization based on business value

**Workflow Position**:

```
/speckit.research → brainstorm → /speckit.specify → /speckit.clarify → /speckit.plan → ...
       ↓                ↓              ↓                  ↓                  ↓
   research/        approaches      spec.md           clarified           plan.md
```

---

## Arguments

The text after `/speckit.research` is the **feature or capability description**.

**Optional flags**:

- `--competitors <list>` - Specific competitors to analyze (comma-separated)
- `--focus <area>` - Focus area relevant to the domain (derived from the feature description)
- `--skip-branch` - Don't create a new branch (use existing)
- `--quick` - Quick research (top 3 competitors only, abbreviated analysis)

**Examples**:

```bash
/speckit.research User authentication and SSO integration
/speckit.research "Real-time collaboration editor" --competitors notion,google-docs,coda
/speckit.research Payment processing --focus checkout --quick
/speckit.research Inventory management system --skip-branch
```

---

## Execution Flow

### Step 1: Parse Input & Setup

1. **Parse feature description**:
   - Extract the capability/feature being researched
   - Identify focus area if not specified
   - If empty: ERROR "No feature description provided"

2. **Generate short name** (2-4 words):
   - Use action-noun format: `ai-recommendations`, `quiz-builder`, `scorm-import`
   - Preserve technical terms: SCORM, xAPI, LTI, AI, ML

3. **Create feature branch** (unless `--skip-branch`):

   ```bash
   git fetch --all --prune
   ```

   - Find highest feature number for this short-name
   - Create branch: `<N+1>-<short-name>`
   - Run: `.specify/scripts/bash/create-new-feature.sh --json "$ARGUMENTS" --number <N+1> --short-name "<short-name>"`

4. **Create research directory**:
   ```
   specs/<feature>/research/
   ```

### Step 2: Identify Competitors

**Competitor Discovery**:

1. If `--competitors` specified: Use only those
2. If `--quick` specified: Research top 3 competitors in the domain
3. Otherwise: Use WebSearch to discover 4-6 top competitors for the given domain
   - Query: "[domain/product category] top competitors 2025 2026"
   - Query: "[domain/product category] market leaders comparison"
   - Select based on market relevance, size, and feature overlap

For each discovered competitor, note:
- Name and market position (Leader / Challenger / Niche)
- Target market and primary focus
- Relevance to the feature being researched

### Step 3: Web Research

For each competitor, use WebSearch to find:

1. **Official documentation** for the feature
   - Query: `[competitor] [feature] documentation`
   - Query: `[competitor] [feature] help center`

2. **Product pages and announcements**
   - Query: `[competitor] [feature] product page`
   - Query: `[competitor] announces [feature] 2024 2025`

3. **Technical blog posts**
   - Query: `[competitor] how [feature] works`
   - Query: `[competitor] [feature] best practices`

4. **Pricing and availability**
   - Query: `[competitor] [feature] pricing tier`

**Research Quality Standards**:

- Minimum 3 sources per competitor
- Note confidence level: High (official docs), Medium (blog/reviews), Low (speculation)
- Document all source URLs

### Step 4: Analyze Each Competitor

If `.specify/templates/competitor-research-template.md` exists, use it as the analysis template. Otherwise, use the inline structure defined below.

For each competitor, document:

#### Company Profile

- Market position, target market, pricing model
- Core strengths and weaknesses

#### Feature Analysis

- **Maturity**: Generally Available / Beta / Preview / Announced
- **Implementation approach**: How they solve the problem
- **Performance claims**: Speed, scale, compliance
- **Unique differentiators**: What makes theirs special

#### User Stories (Inferred)

- Extract 2-3 user stories from their documentation
- Format: As a [user], I want [capability], so that [benefit]

#### Competitive Assessment

Rate 1-5 on: Functionality, Ease of Use, Documentation, Integration, Scalability

#### UI/UX Analysis

**Screen Structure**:

- Key screens for this feature
- Navigation hierarchy (where in the app)
- Layout patterns (sidebar, tabs, wizard, modal, single-page)

**Form Fields & Data Types**:
| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| [Field 1] | text/date/enum/file | required/optional | [How displayed] |

**User Input/Output Patterns**:
| Screen | User Inputs | System Outputs |
|--------|-------------|----------------|
| [Screen 1] | [What user provides] | [What user sees/gets] |

**Navigation Flow**:

```
[Entry Point] → [Screen 1] → [Screen 2] → [Exit/Confirmation]
                     ↓
              [Alternative Path]
```

### Step 5: Generate Feature Matrix

Create cross-platform comparison:

| Capability      | [Competitor 1] | [Competitor 2] | [Competitor 3] | [Your Product] | Gap          |
| --------------- | -------------- | -------------- | -------------- | -------------- | ------------ |
| [Sub-feature 1] | F/P/B/A/-      | F/P/B/A/-      | F/P/B/A/-      | F/P/B/A/-      | C/H/M/L/None |
| [Sub-feature 2] | F/P/B/A/-      | F/P/B/A/-      | F/P/B/A/-      | F/P/B/A/-      | C/H/M/L/None |

**Legend**:

- **Status**: Full (F), Partial (P), Beta (B), Announced (A), None (-)
- **Gap**: Critical (C), High (H), Medium (M), Low (L), None

### UI Pattern Matrix

Create cross-platform UI/UX comparison:

| UI Element          | [Competitor 1]               | [Competitor 2] | [Competitor 3] | Best Practice          |
| ------------------- | ---------------------------- | -------------- | -------------- | ---------------------- |
| Layout type         | [Wizard/Sidebar/Tabs/Modal]  |                |                | [Recommendation]       |
| Key screens         | [Screen list]                |                |                | [Recommended screens]  |
| Required fields     | [Field list]                 |                |                | [Minimum fields]       |
| Optional fields     | [Field list]                 |                |                | [Nice-to-have fields]  |
| Validation style    | [Inline/On-submit/Real-time] |                |                | [Recommended approach] |
| File upload support | [Yes/No + types]             |                |                | [Recommended types]    |
| Mobile approach     | [Responsive/Native/PWA]      |                |                | [Recommended strategy] |
| Accessibility       | [WCAG level]                 |                |                | [Target level]         |

### Step 6: Prioritize Features

Apply prioritization frameworks:

#### RICE Score

```
RICE = (Reach × Impact × Confidence) / Effort
```

| Factor         | How to Estimate                                    |
| -------------- | -------------------------------------------------- |
| **Reach**      | Users affected per month (0-100%)                  |
| **Impact**     | 0.25=Minimal, 0.5=Low, 1=Medium, 2=High, 3=Massive |
| **Confidence** | 100%=High certainty, 80%=Medium, 50%=Low           |
| **Effort**     | Person-months required                             |

#### Kano Classification

| Class           | Description                               |
| --------------- | ----------------------------------------- |
| **Basic**       | Expected - absence causes dissatisfaction |
| **Performance** | More is better - linear satisfaction      |
| **Delighter**   | Unexpected wow factor                     |

#### MoSCoW

| Class           | Criteria                        |
| --------------- | ------------------------------- |
| **Must Have**   | Critical for competitive parity |
| **Should Have** | Important but can delay         |
| **Could Have**  | Nice-to-have enhancement        |
| **Won't Have**  | Out of scope                    |

### Step 7: Generate User Stories

For gaps identified, create prioritized user stories:

```markdown
#### US-P0-001: [Feature Name]

**Source**: [Competitor gap / Customer request / Market trend]
**RICE Score**: [Calculated]
**Kano**: [Basic/Performance/Delighter]
**MoSCoW**: [Must/Should/Could/Won't]

**As a** [user type],
**I want** [capability],
**So that** [business value].

**Acceptance Scenarios**:

1. Given [context], When [action], Then [outcome].

**Competitive Reference**:

- [Competitor]: [How they implement this]

**Effort Estimate**: [X] person-months
```

### Step 8: Write Research Output

Create the following files:

```
specs/<feature>/
├── research/
│   ├── competitor-<name-1>.md      # Individual competitor analysis
│   ├── competitor-<name-2>.md
│   ├── competitor-<name-3>.md
│   ├── ui-patterns.md              # Consolidated UI/UX patterns
│   └── research-summary.md         # Combined analysis + recommendations
```

**research-summary.md structure**:

1. Executive Summary (key findings, recommended actions)
2. Feature Matrix (cross-platform comparison)
3. UI Pattern Matrix (UI/UX comparison)
4. Gap Analysis (critical, high, medium, low)
5. Prioritized User Stories (P0, P1, P2)
6. UI/UX Recommendations (link to ui-patterns.md)
7. Roadmap Recommendation (quarterly plan)
8. Next Steps (link to /speckit.specify)

### Step 9: Output Summary

```markdown
## Research Complete: [Feature Name]

### Branch Created

`<N>-<short-name>`

### Competitors Analyzed

- [Competitor 1] (Market Position)
- [Competitor 2] (Market Position)
- [Competitor 3] (Market Position)

### Key Gaps Identified

| Gap     | Severity | Competitor Lead | RICE Score |
| ------- | -------- | --------------- | ---------- |
| [Gap 1] | Critical | [Who]           | [Score]    |
| [Gap 2] | High     | [Who]           | [Score]    |
| [Gap 3] | Medium   | [Who]           | [Score]    |

### Top Recommendation

[Single most important finding with business justification]

### Files Created

- `specs/<feature>/research/competitor-*.md`
- `specs/<feature>/research/research-summary.md`

### Next Steps

Run `/speckit.specify` to create the feature specification based on this research.
The research findings will inform:

- Feature scope and boundaries
- Acceptance criteria
- Success metrics
- Implementation priorities
```

---

## Quality Standards

### Research Quality

- [ ] Minimum 3 competitors analyzed
- [ ] Each competitor has 3+ source URLs
- [ ] Confidence levels documented
- [ ] No speculation marked as fact

### Analysis Quality

- [ ] Feature matrix complete
- [ ] All gaps severity-rated
- [ ] RICE scores calculated for all P0/P1 items
- [ ] User stories follow format

### UI/UX Research Quality

- [ ] UI Pattern Matrix complete for all competitors
- [ ] Screen inventory documented
- [ ] Field specifications with data types documented
- [ ] Validation patterns (client/server) documented
- [ ] Navigation flows diagrammed
- [ ] ui-patterns.md file created with recommendations

### Output Quality

- [ ] All files use correct templates
- [ ] Markdown renders correctly
- [ ] Links are valid
- [ ] Executive summary is actionable

---

## Integration with Spec-Kit

After `/speckit.research` completes:

1. **Review research**: Check `specs/<feature>/research/research-summary.md`
2. **Brainstorm**: Use superpowers:brainstorming to explore approaches using research findings
3. **Run specify**: `/speckit.specify` uses research to inform spec
4. **Reference in spec**: Link to research findings in specification

The specification command will automatically:

- Read research findings from `specs/<feature>/research/`
- Incorporate competitive insights into requirements
- Use prioritization scores to focus scope
- Reference user stories in acceptance criteria

---

## Focus Areas

Focus areas are domain-dependent and should be derived from the user's feature description. When a `--focus` flag is provided, use it to narrow the research scope to the most relevant subset of the feature domain. If no focus is specified, infer the appropriate areas from the feature description and competitor landscape.
