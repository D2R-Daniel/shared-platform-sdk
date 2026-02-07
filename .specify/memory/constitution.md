<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 2.0.0 (MAJOR)
Last Amended: 2026-02-07

Principles modified:
- I. Specification-Driven Development: Generalized (removed YAML/OpenAPI/SDK references)
- II. Test-First Development: Strengthened with superpowers iron law
- VII. Security-First Design: Generalized (removed SDK-specific examples)
- VIII. Simplicity & Maintainability: Unchanged
- IX. Semantic Versioning: Generalized (removed cross-package version sync)

Principles removed:
- III. Cross-Language Consistency (SDK-specific)
- V. API Client Best Practices (SDK-specific)

Principles added:
- III. Evidence-Based Verification (from superpowers:verification-before-completion)
- IV. Systematic Debugging (from superpowers:systematic-debugging)
- V. Discovery-First Design (from superpowers:brainstorming)
- VI. Plan-Driven Development (from superpowers:writing-plans)

Sections modified:
- "SDK Development Standards" → "Development Standards" (generalized)
- "Module Lifecycle" → "Development Lifecycle" (generalized)
- "Language-Specific Standards" → removed (follow language-idiomatic conventions)
- "Quality Gates" → updated for general-purpose

Templates requiring updates:
- .specify/templates/plan-template.md: ⚠ pending (add UX/infrastructure sections, delegation directive)
- .specify/templates/spec-template.md: ✅ compatible
- .specify/templates/tasks-template.md: ⚠ pending (add execution directive, mandatory TDD)

Follow-up TODOs: None
-->

# Project Constitution

## Core Principles

### I. Specification-Driven Development

All features MUST begin with specifications before implementation.

**Non-negotiable rules:**
- A written specification (spec.md) MUST exist before implementation begins for any non-trivial feature
- Specifications serve as the single source of truth for acceptance criteria and scope
- Implementation MUST NOT deviate from specification without explicit spec amendment
- Specifications MUST be technology-agnostic, focused on WHAT and WHY, not HOW
- Specifications MUST include measurable success criteria and prioritized user stories

**Rationale:** Specifications prevent scope creep, misaligned implementations, and serve as
the basis for acceptance testing. They enable parallel design and implementation work.

### II. Test-First Development (TDD)

**Iron Law: NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.**

If production code is written before the test, delete it and start over.

**Non-negotiable rules:**
- Follow Red-Green-Refactor cycle: write failing test → verify it fails → write minimal code → verify it passes → refactor
- All public methods MUST have corresponding unit tests
- Tests MUST use real code; mocks only when unavoidable (external services, databases)
- Each test focuses on single behavior with descriptive names
- Tests MUST follow Arrange-Act-Assert pattern
- "Pragmatic" shortcuts to TDD are themselves impractical — test-first IS the pragmatic approach

**Test coverage requirements:**
- Happy path scenarios covered
- Error cases and exception throwing verified
- Edge cases (null, empty, boundary values) tested
- All error conditions mapped to appropriate exceptions verified

**Common rationalizations to reject:**
- "I'll add tests later" — No. Tests first, always.
- "This is too simple to test" — If it's simple, the test is simple too. Write it.
- "I need to see the implementation first" — The test IS the specification. Write it.
- "Testing slows me down" — Debugging untested code slows you down more.

**Rationale:** TDD catches design issues early, ensures testability, and provides
living documentation of expected behavior. It produces better designs by forcing
you to think about the interface before the implementation.

### III. Evidence-Based Verification

**Iron Law: NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE.**

**Non-negotiable rules:**
- Before claiming any work is complete, identify the verification command that proves the claim
- Run the FULL verification command fresh (not relying on previous runs)
- Read full output, check exit code, count failures
- Only claim status that the output confirms
- Words like "should", "probably", "seems to" are PROHIBITED in completion claims
- Partial verification proves nothing — all relevant test suites, linters, and builds must pass
- Agent reports MUST be independently verified — "trust but verify" is insufficient; verify independently

**Verification protocol:**
1. Identify what needs to pass (tests, types, lint, build, security)
2. Run each verification command fresh
3. Read the complete output — do not skim or assume
4. Report actual numbers: "47 tests passed, 0 failed" not "tests pass"
5. If anything fails, fix it before claiming completion

**Rationale:** Premature completion claims lead to broken shipments, trust erosion, and
rework. Evidence-based verification is the only reliable quality gate. From documented
failure patterns: most "it works" claims that fail in review were never actually verified.

### IV. Systematic Debugging

**Iron Law: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.**

**Non-negotiable rules:**
- ALWAYS complete root cause investigation before proposing fixes
- Follow the four phases: Root Cause Investigation → Pattern Analysis → Hypothesis Testing → Implementation
- Read error messages carefully and completely — do not skip past them
- Reproduce the issue consistently before attempting fixes
- Make the SMALLEST possible change to test a hypothesis — one variable at a time
- If 3+ fix attempts fail, STOP and question the architecture
- Create a failing test case BEFORE implementing the fix (ties back to Principle II)
- "While I'm here" improvements during bug fixes are PROHIBITED — fix only the bug

**Debugging phases:**
1. **Root Cause Investigation**: Read errors fully, trace the execution path, identify the exact point of failure
2. **Pattern Analysis**: Is this a known pattern? Has this happened before? What category of bug is this?
3. **Hypothesis Testing**: Form a hypothesis, make ONE small change, verify if it addresses the root cause
4. **Implementation**: Write failing test, implement the fix, verify the test passes, verify no regressions

**Rationale:** Random fixes waste time and create new bugs. Systematic debugging achieves
significantly higher first-time fix rates versus guess-and-check approaches. Every
random change that doesn't work makes the problem harder to understand.

### V. Discovery-First Design

**Iron Law: MUST explore requirements and alternatives before implementation.**

**Non-negotiable rules:**
- Propose 2-3 different approaches with trade-offs before settling on one
- Lead with the recommended approach and explain the reasoning
- Present designs incrementally in small sections, validating each before proceeding
- Apply YAGNI ruthlessly — remove unnecessary features from ALL designs
- One question at a time during discovery — do not overwhelm with multiple questions
- Document validated designs before proceeding to implementation planning
- Research competitors and existing solutions before designing something new

**Discovery flow:**
1. Understand the problem — what are users actually trying to accomplish?
2. Research existing solutions — what works? What doesn't?
3. Propose approaches with trade-offs — which is simplest? Most extensible? Most performant?
4. Validate incrementally — present in small sections, get feedback on each
5. Document the chosen approach — save the validated design as a persistent document

**Rationale:** Rushing to implementation without adequate discovery leads to misaligned
features, scope creep, and costly rework. Exploring alternatives ensures the best
approach is chosen. The cost of a few hours of discovery is trivial compared to the
cost of rebuilding a feature.

### VI. Plan-Driven Development

**Iron Law: Multi-step tasks MUST have a written implementation plan before coding begins.**

**Non-negotiable rules:**
- Plans MUST contain bite-sized tasks (2-5 minutes each) with exact file paths
- Each task step must specify: files to create/modify, exact code to write, exact commands to run, expected output
- Plans MUST follow TDD, DRY, YAGNI, and frequent-commits principles
- Plans assume the implementer has zero context about the codebase
- Plans MUST be saved as persistent documents (not just mental models)
- Plans MUST enable frequent commits — each task is a commit-worthy unit

**Plan structure:**
- Goal: single-sentence feature description
- Architecture: 2-3 sentence approach explanation
- Tasks: sequential bite-sized steps, each with files, code, commands, expected output
- Execution: specify execution mode (subagent-driven, batch, or sequential)

**Rationale:** Detailed plans with exact file paths eliminate ambiguity, enable autonomous
agent execution, and provide auditability. They reduce cognitive load during implementation
and enable parallelization. Plans that are too vague produce implementations that are too
different from what was intended.

### VII. Security-First Design

Security MUST be considered at every stage of development.

**Non-negotiable rules:**
- Credentials, tokens, and secrets MUST NOT be logged, exposed in error messages, or stored in code
- HTTPS/TLS MUST be enforced for all network communication
- Sensitive data MUST NOT appear in URLs — use headers or request bodies
- All user inputs MUST be validated and sanitized before use
- Cryptographic operations MUST use secure random generation and established algorithms
- Secrets MUST be masked in any output (show only partial values)
- Authentication tokens MUST have bounded lifetimes and support revocation
- Principle of least privilege MUST be applied to all access controls

**Dependency security:**
- No known vulnerable dependencies permitted
- Dependencies MUST be regularly audited (language-appropriate audit tools)
- Minimal dependency footprint preferred
- Only trusted sources for dependencies

**Rationale:** Security vulnerabilities propagate to all consuming applications and users.
The cost of building security in from the start is a fraction of the cost of retrofitting
it later or recovering from a breach.

### VIII. Simplicity & Maintainability

Prefer simple, focused implementations over clever or over-engineered solutions.

**Non-negotiable rules:**
- Each class/module has single responsibility — clients, models, exceptions are separate
- No "god" classes or modules with mixed concerns
- Avoid premature abstraction — three similar lines beat an unnecessary helper
- Start with minimal viable implementation; extend when requirements demand
- Comments explain "why", not "what" — self-documenting code preferred
- No backwards-compatibility hacks (dead code, renamed `_vars`, re-exports)

**YAGNI enforcement:**
- Do NOT add features beyond current requirements
- Do NOT add configuration for hypothetical future needs
- Do NOT add error handling for scenarios that cannot occur
- Delete unused code completely — do not comment out
- Start with the simplest implementation that satisfies the test
- "While I'm here" improvements are prohibited unless explicitly requested

**Rationale:** Software maintenance spans years and multiple contributors. Simplicity
reduces cognitive load and enables sustainable development. Every unnecessary abstraction
is a maintenance burden.

### IX. Semantic Versioning & Breaking Changes

All releases MUST follow semantic versioning strictly.

**Non-negotiable rules:**
- Version format: `MAJOR.MINOR.PATCH`
- MAJOR: Breaking changes to public APIs or user-facing behavior
- MINOR: New features that are backward compatible
- PATCH: Bug fixes and documentation improvements
- Breaking changes MUST be documented in changelog
- Deprecation warnings MUST precede removal by at least one minor version

**Migration requirements:**
- Breaking changes require migration guide
- Deprecated APIs MUST include documentation pointing to replacement
- Test suite MUST verify deprecated APIs still function until removal

**Rationale:** Consumers depend on stable interfaces. Unexpected breaking changes
cause production incidents and erode trust.

## Development Standards

### Development Lifecycle

Every non-trivial feature MUST follow this sequence:

1. **Discovery Phase**
   - Research competitors and existing solutions
   - Brainstorm approaches with trade-offs
   - Validate chosen approach with stakeholders

2. **Specification Phase**
   - Create formal specification with user stories and acceptance criteria
   - Clarify ambiguities through systematic gap analysis
   - Validate specification completeness

3. **Planning Phase**
   - Generate design artifacts (data model, API contracts, UX design)
   - Create bite-sized implementation plan with exact file paths
   - Run constitution compliance check

4. **Implementation Phase**
   - Follow TDD: write failing test → implement → verify → commit
   - Execute plan task-by-task with per-task or per-phase review
   - Track progress against plan

5. **Verification Phase**
   - Run all tests, linters, and builds fresh
   - Capture and present evidence of all gates passing
   - Verify implementation matches specification acceptance criteria

### Language & Framework Standards

Follow language-idiomatic conventions for your chosen stack:
- Use the language's standard naming conventions
- Use the language's standard documentation format
- Use type systems where available
- Prefer the framework's recommended patterns over custom abstractions

## Quality Gates

Before any merge, the following MUST pass:

| Gate | Requirement |
|------|-------------|
| Tests | All tests pass |
| Types | Type checking passes (language-appropriate) |
| Verification | Fresh evidence of all gates passing (Principle III) |
| Security | No known vulnerable dependencies |
| Spec Compliance | Implementation matches specification acceptance criteria |
| Documentation | Public APIs documented |

## Governance

### Amendment Process

1. Propose amendment with rationale
2. Document impact on existing code and templates
3. Obtain approval from project maintainers
4. Update constitution version according to semantic rules:
   - MAJOR: Principle removal or fundamental redefinition
   - MINOR: New principle or material guidance expansion
   - PATCH: Clarification, wording, or typo fixes
5. Update dependent templates and documentation
6. Migrate existing code if required

### Constitution Supremacy

This constitution supersedes all other development practices. When conflicts arise:
- Constitution principles take precedence
- Document exceptions with explicit justification
- Recurring exceptions warrant constitution amendment

### Compliance Review

- All code reviews MUST verify constitution compliance
- Violations require explicit justification or refactoring
- Skills and review tools provide detailed review checklists
- Development workflows implement constitution principles

**Version**: 2.0.0 | **Ratified**: 2025-12-29 | **Last Amended**: 2026-02-07
