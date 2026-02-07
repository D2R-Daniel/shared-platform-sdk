---
description: Execute the implementation planning workflow using the plan template to generate design artifacts.
handoffs: 
  - label: Create Tasks
    agent: speckit.tasks
    prompt: Break the plan into tasks
    send: true
  - label: Create Checklist
    agent: speckit.checklist
    prompt: Create a checklist for the following domain...
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Setup**: Run `.specify/scripts/bash/setup-plan.sh --json` from repo root and parse JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load context**: Read FEATURE_SPEC and `.specify/memory/constitution.md`. Load IMPL_PLAN template (already copied).

3. **Execute plan workflow**: Follow the structure in IMPL_PLAN template to:
   - Fill Technical Context (mark unknowns as "NEEDS CLARIFICATION")
   - Fill Constitution Check section from constitution
   - Evaluate gates (ERROR if violations unjustified)
   - Phase 0: Generate research.md (resolve all NEEDS CLARIFICATION)
   - Phase 1: Generate data-model.md, contracts/, quickstart.md
   - Phase 1: Update agent context by running the agent script
   - Re-evaluate Constitution Check post-design

4. **Stop and report**: Command ends after Phase 2 planning. Report branch, IMPL_PLAN path, and generated artifacts.

## Phases

### Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```text
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

### Phase 1: Design & Contracts

**Prerequisites:** `research.md` complete

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Agent context update**:
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
   - These scripts detect which AI agent is in use
   - Update the appropriate agent-specific context file
   - Add only new technology from current plan
   - Preserve manual additions between markers

**Output**: data-model.md, /contracts/*, quickstart.md, agent-specific file

### Phase 1 Additional Outputs (Optional)

Generate these artifacts IF applicable based on the project type detected from spec.md and research.md:

1. **If project involves UI/frontend**: Generate `ux-design.md` with:
   - Wireframe descriptions and component hierarchy
   - Interaction flows and state transitions
   - Responsive breakpoints and accessibility considerations
   - Reference to `/speckit.uxprompt` and `/speckit.uxprototype` for detailed design generation

2. **If project involves deployment/infrastructure**: Generate `infrastructure.md` with:
   - Deployment targets and environment configuration
   - CI/CD pipeline requirements
   - Scaling considerations and resource estimates

3. **If project involves database**: Ensure `data-model.md` includes:
   - Migration strategy and versioning approach
   - Indexing recommendations for query patterns
   - Seed data requirements for development/testing

### Phase 2: Plan Generation (DELEGATION)

**Prerequisites**: All Phase 0 and Phase 1 artifacts complete.

After generating design artifacts, **delegate the implementation plan writing to `superpowers:writing-plans`**:

1. **Provide writing-plans with all generated artifacts as context**:
   - `spec.md` (feature requirements and user stories)
   - `research.md` (technology decisions and rationale)
   - `data-model.md` (entities, relationships, migrations)
   - `contracts/` (API endpoints and schemas)
   - `ux-design.md` (if generated — UI components and flows)
   - `infrastructure.md` (if generated — deployment and scaling)
   - `.specify/memory/constitution.md` (principles and quality gates)

2. **writing-plans generates the implementation plan with**:
   - Bite-sized tasks (2-5 min each) with exact file paths
   - Exact code to write and exact commands to run
   - Expected output for each command
   - TDD steps per task (failing test → verify fail → implement → verify pass → commit)
   - Assumes implementer has zero codebase context

3. **Save the writing-plans output to IMPL_PLAN** (plan.md in feature dir)

> **Design rationale**: This delegation means when `superpowers:writing-plans` improves (better task granularity, new patterns), `/speckit.plan` automatically benefits. speckit.plan owns the WHAT (design artifacts, constitution gates); writing-plans owns the HOW (plan structure, task granularity, TDD enforcement).

## Key rules

- Use absolute paths
- ERROR on gate failures or unresolved clarifications
