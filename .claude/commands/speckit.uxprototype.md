---
description: Generate UI prototypes from UX prompts using Chrome MCP and AI design tools
allowed_permissions:
  # Prerequisites
  - Bash: run prerequisite check script
  - Bash: list directory contents
  - Bash: create directories

  # File Operations
  - Read: read UX prompt files, spec, and design-mapping files
  - Write: create and update prototype files and design artifacts
handoffs:
  - label: Generate More Prompts
    agent: speckit.uxprompt
    prompt: Generate additional UX prompts
  - label: Sync to Specs
    agent: speckit.uxprototype
    prompt: --sync-only (sync design details to spec artifacts without regenerating)
  - label: Start Implementation
    agent: speckit.tasks
    prompt: Generate tasks from spec and designs
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Overview

Automate interaction with UX Pilot website using Chrome MCP tools to generate designs from prompts created by `/speckit.uxprompt`, then download and organize the results.

**Key Feature: Smart Screen Deduplication**

This command analyzes all screen prompts and identifies truly unique screens to generate, avoiding duplicate designs for similar UI patterns:

- **Lists**: Entity List A, Entity List B, Entity List C -> Generate 1 template
- **Forms**: Entity Form A, Entity Form B, Entity Form C -> Generate 1 template
- **Details**: Entity Detail A, Entity Detail B -> Generate 1 template
- **Modals**: Action Modal A, Action Modal B -> Generate 1 template

This typically reduces generation by 40-60%, saving UX Pilot credits and time while ensuring design consistency.

---

## CRITICAL: Upfront Permissions Request

**IMPORTANT**: Before starting ANY work, you MUST request all permissions upfront to enable uninterrupted execution. Present this permission request to the user FIRST:

```
+===============================================================================+
|                    UX PROTOTYPE GENERATION - PERMISSIONS                       |
+===============================================================================+
|                                                                               |
|  This command will perform the following actions automatically:               |
|                                                                               |
|  FILE OPERATIONS:                                                             |
|     - Read flow-prompt.md and screen prompts from ux-prompts/                 |
|     - Write screenshots to ux-prompts/{epic}/generated/screenshots/           |
|     - Write approval-log.md to ux-prompts/{epic}/generated/                   |
|     - Update metadata.json in ux-prompts/{epic}/                              |
|     - Create/update design-mapping.md in specs/{epic}/                        |
|     - Update spec.md with design references                                   |
|                                                                               |
|  BROWSER AUTOMATION (Chrome MCP with --isolated):                             |
|     - Open new Chrome browser instance (isolated profile)                     |
|     - Navigate to https://uxpilot.ai                                          |
|     - Fill forms, click buttons, take screenshots                             |
|     - Wait for page loads and generation completion                           |
|     - Export HTML files via bulk export                                        |
|                                                                               |
|  BUILD OPERATIONS (Phase 2, --build):                                         |
|     - Extract downloaded HTML zip to ux-prompts/{epic}/generated/html/        |
|     - Create pages in [detected-pages-path]                                   |
|     - Create shared components in [detected-components-path]                  |
|     - Run type checking and linting                                           |
|     - Run build verification                                                  |
|                                                                               |
|  DIRECTORY OPERATIONS:                                                        |
|     - Create directories: generated/, screenshots/, code/, html/              |
|     - Create prototype routes in [detected-pages-path]                        |
|     - List and glob files in specs/ and ux-prompts/                           |
|                                                                               |
|  Do you approve ALL these permissions to run without further prompts?         |
|                                                                               |
|  [Y] Yes, proceed with all permissions                                        |
|  [N] No, I want to review each action                                         |
|                                                                               |
+===============================================================================+
```

**If user approves**: Proceed with full automation, no further permission prompts.
**If user declines**: Fall back to interactive mode with individual confirmations.

---

## Chrome MCP Isolation Mode

**CRITICAL**: ALWAYS use `--isolated` mode when launching Chrome MCP to avoid conflicts with existing browser instances.

When the Chrome MCP connection fails with "browser already running" error:
1. Do NOT try to kill existing Chrome processes
2. The MCP server should be configured to use `--isolated` flag
3. If connection still fails, inform user to restart MCP server with: `npx @anthropic/mcp-chrome-devtools --isolated`

**Note**: The `--isolated` flag creates a separate Chrome profile, preventing conflicts with user's regular browsing sessions.

---

## Build Path Detection

Before creating any build artifacts, detect the project's framework and directory structure:

```
Build Path Detection:
1. Read plan.md for project structure and tech stack
2. Determine framework:
   - Next.js -> src/app/(prototype)/ for pages, src/components/ for components
   - React (CRA/Vite) -> src/pages/ for pages, src/components/ for components
   - Vue -> src/views/ for pages, src/components/ for components
   - Other -> ask user for preferred directory structure
3. Use detected paths for all file creation
```

Store detected paths as variables for use throughout execution:
- `PAGES_PATH`: Directory for page/route files
- `COMPONENTS_PATH`: Directory for shared components
- `FRAMEWORK`: Detected framework name and version
- `BUILD_CMD`: Framework build command (e.g., `npm run build`, `npx tsc`)
- `LINT_CMD`: Framework lint command (e.g., `npm run lint`)
- `TYPECHECK_CMD`: Type checking command (e.g., `npx tsc --noEmit`)

---

## Arguments

| Flag | Description | Default |
|------|-------------|---------|
| `--epic <path>` | Epic to prototype | Auto-detect from branch |
| `--mode <type>` | `flow` (full flow) or `screens` (individual) | `flow` |
| `--screens <list>` | Specific screens to generate | All unique |
| `--interactive` | Pause for approval at each step (approve/reject/regenerate) | `false` |
| `--auto` | Run fully automated without pauses (opposite of --interactive) | `true` |
| `--no-download` | Generate only, don't download | `false` |
| `--no-sync` | Skip syncing design details to spec artifacts | `false` |
| `--sync-only` | Only sync design details (skip generation, requires existing screenshots) | `false` |
| `--dry-run` | Show what would be done without executing | `false` |
| `--isolated` | Use isolated Chrome profile (always enabled by default) | `true` |
| `--analyze-only` | Only analyze and show unique screens without generating | `false` |
| `--skip-analysis` | Skip deduplication, generate all screens from prompts | `false` |
| `--batch` | Process all pending epics sequentially | `false` |
| `--all` | Alias for --batch | `false` |
| `--from <epic>` | Start batch processing from specific epic | First pending |
| `--limit <n>` | Maximum number of epics to process in batch | All pending |
| `--auto-approve` | Auto-approve generated screens without review | `true` |
| `--resume` | Resume batch processing from last saved state | `false` |
| `--test` | Test all generated prototypes (post-generation only) | `false` |
| `--test-epic <name>` | Test specific epic's prototype | - |
| `--download` | Download/export code from UX Pilot | `true` |
| `--build` | Build prototype from downloaded code | `true` |
| `--output <path>` | Prototype output directory | `[detected-pages-path]` |
| `--skip-download` | Skip download, organize existing files only | `false` |
| `--skip-generation` | Skip UX Pilot generation, only download/build | `false` |
| `--verify-build` | Run type check/lint/build verification | `true` |
| `--no-build` | Skip prototype building (download only) | `false` |

**Examples**:
```bash
# Default: auto mode with smart deduplication (no pauses)
/speckit.uxprototype

# Analyze unique screens without generating (preview what will be created)
/speckit.uxprototype --analyze-only

# Interactive mode: pause at each step for approval
/speckit.uxprototype --interactive

# Specific epic with interactive approval
/speckit.uxprototype --epic specs/001-user-management --interactive

# Regenerate specific screens interactively
/speckit.uxprototype --screens us1-01,us1-02 --interactive

# Skip deduplication, generate all screens from prompts
/speckit.uxprototype --skip-analysis

# Preview without executing
/speckit.uxprototype --dry-run

# Sync design details to spec artifacts (after generation)
/speckit.uxprototype --sync-only

# Generate without syncing to specs
/speckit.uxprototype --no-sync

# BATCH MODE: Process all pending epics sequentially
/speckit.uxprototype --batch

# Process all pending epics (alias)
/speckit.uxprototype --all

# Start batch from a specific epic
/speckit.uxprototype --batch --from user-management

# Process only 3 epics
/speckit.uxprototype --batch --limit 3

# Resume interrupted batch processing
/speckit.uxprototype --batch --resume

# TEST MODE: Test all prototypes after batch generation is complete
/speckit.uxprototype --test

# Test specific epic's prototype
/speckit.uxprototype --test-epic user-management

# DOWNLOAD & BUILD: Full workflow (generate + download + build + sync)
/speckit.uxprototype --batch

# Generate only (no download/build)
/speckit.uxprototype --batch --no-download --no-build

# Download and build existing (skip generation)
/speckit.uxprototype --skip-generation --download --build

# Organize existing files only (manual download)
/speckit.uxprototype --skip-download --build

# Download without building (get code exports)
/speckit.uxprototype --download --no-build

# Custom output directory
/speckit.uxprototype --output src/app/(dashboard)/
```

## Interactive vs Auto Mode

### Auto Mode (Default)
- Generates all screens automatically
- Downloads all screenshots without asking
- Best for: Quick regeneration, CI/CD pipelines

### Interactive Mode (`--interactive`)
- Pauses after generation to show results
- Asks for approval: **A**pprove, **R**eject, **G**enerate with feedback
- Shows preview of each screen before downloading
- Best for: First-time generation, quality review

```
+-------------------------------------------------------------+
|  SCREEN REVIEW: Dashboard (1/12)                            |
+-------------------------------------------------------------+
|                                                             |
|  Screenshot saved: generated/screenshots/dashboard.png      |
|                                                             |
|  Options:                                                   |
|  [A] Approve - Download and continue                       |
|  [R] Reject - Skip this screen                             |
|  [G] Regenerate - Provide feedback and regenerate          |
|  [V] View - Open screenshot                                |
|  [S] Skip all - Download remaining without asking          |
|  [C] Cancel - Stop and save progress                       |
|                                                             |
|  Choice: _                                                  |
+-------------------------------------------------------------+
```

---

## Batch Processing Mode

### Overview

Batch mode (`--batch` or `--all`) processes multiple epics sequentially, creating a separate UX Pilot file for each epic. This enables efficient prototype generation across the entire project.

**Key Features:**
- Discovers all pending epics automatically
- Creates separate UX Pilot project per epic (e.g., "{Project Name} {Epic Name}")
- Parallel workflow: While generating Epic N, finalizes Epic N-1
- Auto-approves screens by default (use `--interactive` to review)
- Resumable: saves progress for recovery from interruptions

### Epic Queue States

Each epic in the batch queue has one of these states:

| State | Symbol | Description |
|-------|--------|-------------|
| `complete` | [done] | Already approved, skip |
| `awaiting-approval` | [review] | Generated but not approved, will auto-approve |
| `generating` | [active] | Currently being generated in UX Pilot |
| `pending` | [wait] | Waiting for generation |
| `failed` | [error] | Generation failed, needs attention |

### Epic Discovery Logic

The batch processor scans all epics and builds a queue:

```
1. Glob: ux-prompts/*/metadata.json
2. For each epic:
   - Read status fields: prompts_ready, prototype_generated, approved
   - Determine queue_status:
     - If approved = true -> 'complete'
     - If prototype_generated = true AND approved = false -> 'awaiting-approval'
     - If prompts_ready = true AND prototype_generated = false -> 'pending'
3. Sort by epic_number
4. Apply filters (--from, --limit)
5. Build execution queue
```

### Queue Display

Before starting, display the batch queue:

```
+==============================================================================+
|                        BATCH PROTOTYPE GENERATION                            |
+==============================================================================+
|                                                                              |
|  QUEUE STATUS:                                                               |
|                                                                              |
|  | # | Epic                    | Status              | Screens | Action    | |
|  |---|-------------------------|----------------------|---------|-----------|  |
|  | 1 | {epic-1-name}           | [done] Complete      | 12/28   | Skip      | |
|  | 2 | {epic-2-name}           | [review] Awaiting    | 16/16   | Approve   | |
|  | 3 | {epic-3-name}           | [wait] Pending       | 0/18    | Generate  | |
|  | 4 | {epic-4-name}           | [wait] Pending       | 0/20    | Generate  | |
|  | ...                                                                       |
|                                                                              |
|  SUMMARY:                                                                    |
|  - Complete: {n}                                                             |
|  - Awaiting Approval: {n} (will auto-approve)                                |
|  - To Generate: {n} epics, ~{total} screens                                 |
|                                                                              |
|  PARALLEL WORKFLOW:                                                          |
|  - While generating Epic N, will approve and sync Epic N-1                   |
|  - While generating Epic N+1, will approve and sync Epic N                   |
|  - ... and so on                                                             |
|                                                                              |
+==============================================================================+
```

### Parallel Workflow

For optimal efficiency, batch mode runs two tasks in parallel:

```
FOR each epic N in queue (N = 2, 3, 4, ...):

  PARALLEL {
    // Task 1: Generate current epic (uses Chrome MCP)
    IF epic N needs generation:
      1. Create new UX Pilot file: "{Project Name} {Epic Name}"
      2. For each screen in unique_screens:
         - Enter screen prompt
         - Generate screen (Single Screen mode)
         - Take screenshot
         - Save to generated/screenshots/
      3. Update metadata.json: prototype_generated = true

    // Task 2: Finalize previous epic (file operations only)
    IF epic N-1 exists AND awaiting-approval:
      1. Set metadata.json: approved = true
      2. Create design-mapping.md
      3. Sync design details to spec.md
      4. Set design_synced = true
      5. Mark epic N-1 as complete in queue
  }

  WAIT for both threads to complete
  Move to next epic
```

**Note**: Task 2 only performs file operations and doesn't require Chrome MCP, allowing true parallel execution.

### Progress Tracking

During batch execution, display real-time progress:

```
+-----------------------------------------------------------------------------+
|  BATCH PROGRESS: Epic {n}/{total} - {epic-name}                             |
+-----------------------------------------------------------------------------+
|                                                                             |
|  +- PARALLEL TASKS -------------------------------------------------------+|
|  |                                                                         ||
|  |  [GENERATING] {epic-name} (Epic N)                                      ||
|  |  |-- Screen {x}/{y}: {screen-id}                                       ||
|  |  |-- UX Pilot File: {Project Name} {Epic Name}                         ||
|  |  +-- Progress: ########............ {x}/{y} ({pct}%)                   ||
|  |                                                                         ||
|  |  [FINALIZING] {prev-epic-name} (Epic N-1) - Running in parallel         ||
|  |  |-- [done] Marked as approved                                          ||
|  |  |-- [done] Updated metadata.json                                       ||
|  |  |-- [done] Created design-mapping.md                                   ||
|  |  +-- [done] Synced to spec.md                                           ||
|  |                                                                         ||
|  +-------------------------------------------------------------------------+|
|                                                                             |
|  QUEUE STATUS:                                                              |
|  [done] {epic-1} (skipped - already complete)                               |
|  [done] {epic-2} (approved)                                                 |
|  [active] {epic-3} (generating - {x}/{y})                                   |
|  [wait] {epic-4} (next)                                                     |
|  ...                                                                        |
|                                                                             |
|  Overall: {completed}/{total} epics complete                                |
+-----------------------------------------------------------------------------+
```

### Batch Progress File

Progress is saved to `ux-prompts/batch-progress.json` for resume capability:

```json
{
  "batch_id": "batch-{date}-{time}",
  "started_at": "{timestamp}",
  "status": "in_progress",
  "current_epic": "{epic-name}",
  "current_screen": "{screen-id}",
  "queue": [
    { "epic": "{epic-1}", "status": "skipped", "reason": "already_complete" },
    { "epic": "{epic-2}", "status": "completed", "completed_at": "..." },
    { "epic": "{epic-3}", "status": "generating", "screens_done": 5, "screens_total": 18 },
    { "epic": "{epic-4}", "status": "pending" }
  ],
  "progress": {
    "completed": 2,
    "generating": 1,
    "pending": 5,
    "failed": 0
  }
}
```

---

## Prerequisites

Before running this command, ensure:

1. **Chrome MCP is connected**: Chrome DevTools MCP server must be running
2. **Prompts exist**: Run `/speckit.uxprompt` first to generate prompts
3. **UX Pilot account**: User must have a UX Pilot account (authentication handled manually)

---

## Execution Flow

### Step 0: Request Upfront Permissions

**BEFORE doing anything else**, present the permissions dialog from the "CRITICAL: Upfront Permissions Request" section above. This ensures the entire workflow can run without interruption.

Use `AskUserQuestion` tool with a single question asking for permission approval.

### Step 0.5: Detect Build Paths

1. **Read plan.md** to determine project framework and structure:
   ```
   Read: plan.md
   Extract: tech stack, framework, directory structure
   ```

2. **Set path variables** based on detected framework:

   | Framework | PAGES_PATH | COMPONENTS_PATH |
   |-----------|------------|-----------------|
   | Next.js (App Router) | `src/app/(prototype)/` | `src/components/features/prototype/` |
   | Next.js (Pages Router) | `src/pages/prototype/` | `src/components/features/prototype/` |
   | React (Vite/CRA) | `src/pages/` | `src/components/` |
   | Vue | `src/views/` | `src/components/` |
   | Angular | `src/app/` | `src/app/shared/` |
   | Other | Ask user | Ask user |

3. **Set build commands** based on detected framework:

   | Framework | BUILD_CMD | LINT_CMD | TYPECHECK_CMD |
   |-----------|-----------|----------|---------------|
   | Next.js | `npm run build` | `npm run lint` | `npx tsc --noEmit` |
   | React (Vite) | `npm run build` | `npm run lint` | `npx tsc --noEmit` |
   | Vue | `npm run build` | `npm run lint` | `npx vue-tsc --noEmit` |
   | Other | Ask user | Ask user | Ask user |

### Step 1: Verify Prerequisites

1. **Check Chrome MCP connection** (with --isolated mode):
   ```
   Use mcp__chrome-devtools__list_pages to verify MCP is accessible
   ```

   If MCP returns "browser already running" error:
   ```
   +===============================================================+
   |  CHROME MCP CONFLICT DETECTED                                  |
   +===============================================================+
   |  Another Chrome instance is using the same profile.            |
   |                                                                |
   |  Please restart the MCP server with --isolated flag:           |
   |                                                                |
   |  1. Stop current MCP server (Ctrl+C)                           |
   |  2. Run: npx @anthropic/mcp-chrome-devtools --isolated         |
   |  3. Return here and try again                                  |
   |                                                                |
   |  The --isolated flag creates a separate Chrome profile,        |
   |  preventing conflicts with your regular browser.               |
   +===============================================================+
   ```

   **DO NOT** attempt to kill Chrome processes or remove lock files.

   If MCP not connected at all:
   ```
   +===============================================================+
   |  CHROME MCP NOT CONNECTED                                      |
   +===============================================================+
   |  Please ensure:                                                |
   |  1. Chrome MCP server is running with --isolated flag          |
   |  2. MCP connection is configured in Claude Code               |
   |                                                                |
   |  Run: npx @anthropic/mcp-chrome-devtools --isolated            |
   +===============================================================+
   ```

2. **Check prompt files exist**:
   - Load `ux-prompts/{epic}/metadata.json`
   - Verify `flow-prompt.md` exists
   - If missing: "Run /speckit.uxprompt first to generate prompts"

3. **Determine epic**:
   - If `--epic` provided: Use specified epic
   - Else: Detect from current git branch
   - Else: List available epics and ask user to select

### Step 1.5: Analyze Unique Screens (CRITICAL)

> **This step runs automatically** unless `--skip-analysis` is specified. Use `--analyze-only` to preview without generating.

Before generating any screens in UX Pilot, analyze all screen prompts to identify truly unique screens. This prevents generating duplicate or highly similar screens and optimizes UX Pilot credits.

#### 1.5.1: Load All Screen Prompts

1. **Read metadata.json** to get the full screen list:
   ```
   Read: ux-prompts/{epic}/metadata.json
   Extract: prompts.screens[] array
   ```

2. **Read each screen prompt file**:
   ```
   For each screen in prompts.screens:
     Read: ux-prompts/{epic}/{screen.file}
     Parse: screen type, components, layout, purpose
   ```

#### 1.5.2: Categorize Screens by Type

Group screens into UI pattern categories:

| Category | Description | Examples |
|----------|-------------|----------|
| `list` | Data tables, card grids, search results | Entity List, Search Results, Directory |
| `form` | Create/edit forms with inputs | Create Entity, Edit Profile, Settings Form |
| `detail` | Single record view with actions | Entity Details, Profile View |
| `dashboard` | Metrics, charts, summary cards | Main Dashboard, Status Overview |
| `modal` | Overlay dialogs, confirmations | Action Modal, Delete Confirm, Share Dialog |
| `wizard` | Multi-step flows | Onboarding, Setup Wizard |
| `settings` | Configuration panels | Settings, Preferences |
| `preview` | Read-only display, print layouts | Document Preview, PDF Preview |
| `layout` | Structural components | App Shell, Sidebar, Header |
| `component` | Reusable UI pieces | Custom Input, Lookup Widget |

#### 1.5.3: Identify Duplicate Patterns

For each category, identify screens that share >80% structural similarity:

**Similarity Criteria**:
| Criterion | Weight | Description |
|-----------|--------|-------------|
| Same screen type | 30% | list, form, detail, etc. |
| Same primary entity | 25% | User, Order, Product, etc. |
| Same layout structure | 20% | Sidebar+content, full-width, split |
| Same component set | 15% | Table, Form, Cards, etc. |
| Same action patterns | 10% | CRUD, Search, Filter, Export |

**Example Deduplication**:
```
BEFORE (e.g., 28 screens in prompts):
|-- us1-01-entity-a-list       (list)
|-- us3-01-entity-b-list       (list)      <- Similar to entity-a-list
|-- us4-01-entity-c-list       (list)      <- Similar to entity-a-list
|-- us1-02-create-entity-a     (form)
|-- us3-02-entity-b-form       (form)      <- Similar to create-entity-a
|-- us4-02-entity-c-form       (form)      <- Similar to create-entity-a
|-- us1-05-entity-a-preview    (preview)
|-- us2-01-document-preview    (preview)   <- Similar to entity-a-preview
+-- ... more screens

AFTER (e.g., 12 unique screens to generate):
|-- 01-auth-screen             (auth)       <- Unique: Login flow
|-- 02-onboarding-step-1       (wizard)     <- Unique: Onboarding step
|-- 03-onboarding-step-2       (wizard)     <- Unique: Different fields
|-- 04-dashboard               (dashboard)  <- Unique: Metrics layout
|-- 05-data-list               (list)       <- TEMPLATE: Represents all lists
|-- 06-entity-form             (form)       <- TEMPLATE: Represents all forms
|-- 07-entity-detail           (detail)     <- TEMPLATE: Represents all details
|-- 08-modal-dialog            (modal)      <- TEMPLATE: Represents all modals
|-- 09-preview-layout          (preview)    <- TEMPLATE: Print/preview
|-- 10-settings                (settings)   <- Unique: Settings tabs
|-- 11-app-shell               (layout)     <- Unique: Navigation structure
+-- 12-custom-components       (component)  <- Unique: Domain-specific inputs
```

#### 1.5.4: Build Unique Screen Map

Create a mapping from template screens to all screens they represent:

```json
{
  "unique_screens": [
    {
      "id": "05-data-list",
      "template_name": "Data List View",
      "generate_prompt": "screens/us1-01-entity-a-list.md",
      "represents": [
        { "id": "us1-01-entity-a-list", "entity": "Entity A", "variations": ["status badges", "amount column"] },
        { "id": "us3-01-entity-b-list", "entity": "Entity B", "variations": ["type column", "status badge"] },
        { "id": "us4-01-entity-c-list", "entity": "Entity C", "variations": ["category column", "type toggle"] }
      ],
      "common_components": ["DataTable", "SearchInput", "FilterDropdown", "Pagination", "ActionMenu"],
      "entity_variations": {
        "Entity A": { "columns": ["#", "Name", "Date", "Amount", "Status"], "actions": ["View", "Edit", "Delete"] },
        "Entity B": { "columns": ["Name", "Type", "State", "Outstanding"], "actions": ["View", "Edit"] },
        "Entity C": { "columns": ["Name", "Category", "Rate", "Status"], "actions": ["View", "Edit"] }
      }
    },
    {
      "id": "06-entity-form",
      "template_name": "Entity Form",
      "generate_prompt": "screens/us1-02-create-entity-a-form.md",
      "represents": [
        { "id": "us1-02-create-entity-a", "entity": "Entity A", "variations": ["line items editor", "calculator"] },
        { "id": "us3-02-entity-b-form", "entity": "Entity B", "variations": ["lookup input", "address fields"] },
        { "id": "us4-02-entity-c-form", "entity": "Entity C", "variations": ["category selector", "rate input"] }
      ],
      "common_components": ["Form", "Input", "Select", "Button", "ValidationMessage"]
    }
  ],
  "analysis_summary": {
    "total_prompts": 28,
    "unique_screens": 12,
    "deduplicated": 16,
    "savings_percent": 57
  }
}
```

#### 1.5.5: Present Analysis to User

Display the deduplication analysis:

```
+==============================================================================+
|                        SCREEN ANALYSIS COMPLETE                              |
+==============================================================================+
|                                                                              |
|  Epic: {epic-name}                                                           |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  ANALYSIS SUMMARY                                                      |  |
|  +------------------------------------------------------------------------+  |
|  |  Total screen prompts:       {total}                                   |  |
|  |  Unique screens to generate: {unique}                                  |  |
|  |  Deduplicated (similar):     {deduped}                                 |  |
|  |  Savings:                    {pct}% fewer generations                  |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  UNIQUE SCREENS TO GENERATE:                                                 |
|                                                                              |
|  | #  | Screen Name              | Type      | Represents        |          |
|  |----|--------------------------|-----------|-------------------|          |
|  | 1  | Auth Screen              | auth      | 1 screen          |          |
|  | 2  | Onboarding Step 1        | wizard    | 1 screen          |          |
|  | 3  | Onboarding Step 2        | wizard    | 1 screen          |          |
|  | 4  | Dashboard                | dashboard | {n} screens       |          |
|  | 5  | Data List Template       | list      | {n} screens       |          |
|  | 6  | Entity Form Template     | form      | {n} screens       |          |
|  | 7  | Entity Detail Template   | detail    | {n} screens       |          |
|  | 8  | Modal Dialog Template    | modal     | {n} screens       |          |
|  | 9  | Preview Layout           | preview   | {n} screens       |          |
|  | 10 | Settings                 | settings  | 1 screen          |          |
|  | 11 | App Shell (Layout)       | layout    | All pages         |          |
|  | 12 | Custom Components        | component | {n} components    |          |
|                                                                              |
|  DEDUPLICATED SCREENS (will use templates):                                  |
|                                                                              |
|  - {screen-a} -> uses #5 Data List Template                                 |
|  - {screen-b} -> uses #5 Data List Template                                 |
|  - {screen-c} -> uses #6 Entity Form Template                               |
|  - ... {n} more screens                                                      |
|                                                                              |
+==============================================================================+

[C] Continue with {unique} unique screens
[A] Generate all {total} screens (skip deduplication)
[E] Edit selection
[V] View detailed mapping
```

#### 1.5.6: Save Analysis Results

Write analysis to `ux-prompts/{epic}/screen-analysis.json`:

```json
{
  "analyzed_at": "{timestamp}",
  "epic": "{epic-name}",
  "summary": {
    "total_prompts": 28,
    "unique_to_generate": 12,
    "deduplicated": 16,
    "savings_percent": 57
  },
  "unique_screens": [
    {
      "id": "01-auth-screen",
      "name": "Auth Screen",
      "type": "auth",
      "prompt_file": "screens/{screen-file}.md",
      "represents": ["{screen-id}"],
      "priority": "P0"
    }
  ],
  "template_mappings": {
    "05-data-list": {
      "template_prompt": "screens/{list-screen-prompt}.md",
      "applies_to": ["{list-screen-1}", "{list-screen-2}", "{list-screen-3}"],
      "variation_notes": "Change entity name, columns, and actions per entity type"
    }
  },
  "generation_order": [
    "01-auth-screen",
    "02-onboarding-step-1",
    "11-app-shell",
    "04-dashboard",
    "05-data-list",
    "06-entity-form",
    "07-entity-detail",
    "08-modal-dialog",
    "09-preview-layout",
    "10-settings"
  ]
}
```

#### 1.5.7: Handle --analyze-only Flag

If `--analyze-only` is set:
1. Complete analysis
2. Display results
3. Save `screen-analysis.json`
4. Exit without generating

```
+==============================================================================+
|  ANALYSIS COMPLETE (--analyze-only mode)                                     |
+==============================================================================+
|                                                                              |
|  Results saved to: ux-prompts/{epic}/screen-analysis.json                    |
|                                                                              |
|  To generate screens, run:                                                   |
|  /speckit.uxprototype                                                        |
|                                                                              |
|  To generate all screens (skip deduplication):                               |
|  /speckit.uxprototype --skip-analysis                                        |
|                                                                              |
+==============================================================================+
```

### Step 2: Navigate to UX Pilot

1. **Check for existing UX Pilot tab**:
   ```
   mcp__chrome-devtools__list_pages
   Look for page with URL containing "uxpilot.ai"
   ```

2. **Open or select UX Pilot**:
   - If found: `mcp__chrome-devtools__select_page(pageId)`
   - If not: `mcp__chrome-devtools__new_page(url="https://uxpilot.ai")`

3. **Wait for page load**:
   ```
   mcp__chrome-devtools__wait_for(text="Create with AI")
   ```

### Step 3: Authentication Check

1. **Take snapshot to check state**:
   ```
   mcp__chrome-devtools__take_snapshot()
   ```

2. **If login required** (detected by "Sign in" or "Log in" text):
   ```
   +===============================================================+
   |  AUTHENTICATION REQUIRED                                       |
   +===============================================================+
   |  Please log in to UX Pilot in the browser window.             |
   |                                                                |
   |  Steps:                                                        |
   |  1. Switch to the Chrome window                                |
   |  2. Log in with your UX Pilot credentials                     |
   |  3. Return here and confirm                                    |
   |                                                                |
   |  Press ENTER when ready to continue...                         |
   +===============================================================+
   ```

   Wait for user confirmation, then re-check with snapshot.

### Step 4: Generate Screens One-by-One in UX Pilot

> **IMPORTANT**: Use "Single Screen" mode instead of "Create Flow" to avoid duplicate screen generation issues. Generate each screen individually for better control and quality.

> **Uses analysis from Step 1.5** to generate only unique screens, not duplicates.

#### 4.1: Prepare Screen Prompts

1. **Load screen analysis**:
   ```
   Read: ux-prompts/{epic}/screen-analysis.json
   Get: unique_screens[], generation_order[]
   ```

2. **Load individual screen prompts**:
   ```
   For each screen in generation_order:
     Read: ux-prompts/{epic}/{screen.prompt_file}
     Store as individual_prompts[screen.id]
   ```

3. **If --skip-analysis was used**:
   - Read all screens from metadata.json prompts.screens[]
   - Load each screen prompt file individually

#### 4.2: Create New UX Pilot File for Epic

1. **Click "New File" button** on UX Pilot dashboard:
   ```
   mcp__chrome-devtools__click(uid="new-file-button")
   ```

2. **Fill in file details**:
   - Page Name: "{Project Name} {Epic Name}" (read project name from plan.md)
   - Page Context: Include design system summary from speckit.uxprompt output:
     ```
     Project Design System (from speckit.uxprompt output).
     Include: color palette, typography, component library, icon set,
     framework/tech stack, accessibility requirements, and any
     domain-specific design tokens.
     ```

3. **Click "Create"** to enter the design studio

#### 4.3: Generate Each Screen Using Single Screen Mode

**CRITICAL**: Always use "Single Screen" tab, NOT "Create Flow" to avoid duplicates.

For each screen in generation_order:

1. **Ensure Single Screen mode is selected**:
   ```
   mcp__chrome-devtools__take_snapshot()
   Verify "Single Screen" button is active (not "Create Flow")
   If not: mcp__chrome-devtools__click(uid="single-screen-button")
   ```

2. **Read screen prompt**:
   ```
   Read: ux-prompts/{epic}/screens/{screen.file}
   Extract: screen description, components, layout requirements
   ```

3. **Enter screen prompt**:
   ```
   mcp__chrome-devtools__fill(uid="prompt-textarea", value=screen_prompt)
   ```

4. **Configure design options**:
   - Mode: Hifi (high-fidelity designs)
   - Screen: Desktop (default) or as specified in prompt
   - Deep Design: OFF (faster generation)

5. **Generate single screen**:
   ```
   mcp__chrome-devtools__click(uid="generate-button")
   ```

6. **Wait for generation** (typically 15-30 seconds per screen):
   ```
   mcp__chrome-devtools__wait_for(text="generated", timeout=60000)
   ```

7. **Take screenshot of generated screen**:
   ```
   mcp__chrome-devtools__take_screenshot(
     filePath="ux-prompts/{epic}/generated/screenshots/{screen.id}.png"
   )
   ```

8. **Log progress and move to next screen**

#### 4.4: Track Generation Progress

Display progress for each individual screen:

```
+====================================================================+
|  GENERATING SCREENS (Single Screen Mode)                           |
+====================================================================+
|                                                                    |
|  Epic: {epic-name}                                                 |
|  File: {Project Name} {Epic Name}                                  |
|  Total Screens: {total}                                            |
|                                                                    |
|  Progress: ########............ {done}/{total} ({pct}%)            |
|                                                                    |
|  [done] {screen-1-id}         (saved: {screen-1}.png)             |
|  [done] {screen-2-id}         (saved: {screen-2}.png)             |
|  [done] {screen-3-id}         (saved: {screen-3}.png)             |
|  [active] {screen-4-id}       (generating...)                      |
|  [wait] {screen-5-id}                                              |
|  [wait] ...                                                        |
|                                                                    |
|  Estimated time remaining: ~{minutes} minutes                      |
|                                                                    |
+====================================================================+
```

#### 4.5: Handle Generation Errors

If a screen fails to generate:

1. **Capture error state**:
   ```
   mcp__chrome-devtools__take_screenshot(filePath="debug-{screen.id}-error.png")
   ```

2. **Retry once** with simplified prompt:
   - Remove complex requirements
   - Keep core layout and components
   - Retry generation

3. **If retry fails**:
   - Log as failed screen
   - Continue to next screen
   - Add to "needs manual attention" list

### Step 5: Review Generated Screens

1. **Take snapshot of results**:
   ```
   mcp__chrome-devtools__take_snapshot()
   ```

2. **Parse generated screens**:
   - Identify each screen/page in the output
   - Extract screen names if available

3. **Present for approval** (if `--interactive`):
   ```
   ===================================================================
                     UX PILOT GENERATION COMPLETE
   ===================================================================

   Epic: {epic-name}
   Screens Generated: {total}

   +-------------------------------------------------------------+
   |  #  | Screen Name              | Status    | Action          |
   +-------------------------------------------------------------+
   |  1  | Dashboard                | Generated | [A]pprove [R]eject |
   |  2  | Entity List              | Generated | [A]pprove [R]eject |
   |  3  | Create Entity Form       | Generated | [A]pprove [R]eject |
   |  4  | Entity Preview           | Generated | [A]pprove [R]eject |
   |  ... | ...                     | ...       | ...                |
   +-------------------------------------------------------------+

   Options:
     [A] Approve all screens
     [R] Review each screen individually
     [E] Edit prompt and regenerate
     [S] Skip and continue with partial
     [C] Cancel

   Enter choice:
   ```

4. **Individual review** (if selected):
   For each screen:
   - Take screenshot of the screen
   - Display in terminal or save for review
   - Ask: Approve (A), Reject (R), Regenerate with feedback (G)

### Step 6: Download Approved Screens

For each approved screen:

1. **Take screenshot**:
   ```
   mcp__chrome-devtools__take_screenshot(
     filePath="ux-prompts/{epic}/generated/screenshots/{screen-name}.png"
   )
   ```

2. **Export code** (if available):
   - Look for "Export" or "Code" button
   - Click to open code export
   - Copy/download code
   - Save to `ux-prompts/{epic}/generated/code/{screen-name}.tsx`

3. **Handle Figma export** (if requested):
   - Note: Figma export opens external Figma
   - Provide instructions for manual export

### Step 7: Create Approval Log

Write `ux-prompts/{epic}/generated/approval-log.md`:

```markdown
# UX Prototype Approval Log

**Epic**: {epic-name}
**Generated**: {timestamp}
**UX Pilot Session**: [URL if available]

## Generation Summary

| Metric | Value |
|--------|-------|
| Screens Generated | {total} |
| Screens Approved | {approved} |
| Screens Rejected | {rejected} |
| Screenshots Saved | {saved} |
| Code Exports | {exports} |

## Screen Decisions

| # | Screen | Decision | Notes |
|---|--------|----------|-------|
| 1 | Dashboard | Approved | - |
| 2 | Entity List | Approved | Minor spacing issue, acceptable |
| 3 | Create Entity Form | Rejected | Missing required section |
| ... | ... | ... | ... |

## Rejected Screens (Need Regeneration)

### {Screen Name}
**Reason**: {rejection reason}
**Suggested fix**: {suggested improvement}

## Files Generated

### Screenshots
- screenshots/{screen-1}.png
- screenshots/{screen-2}.png
- ...

### Code Exports
- code/{screen-1}.tsx
- code/{screen-2}.tsx
- ...

## Next Steps

1. Regenerate rejected screens with updated prompts
2. Review code exports for component structure
3. Run `/speckit.tasks` to generate implementation tasks
```

### Step 8: Update Metadata

Update `ux-prompts/{epic}/metadata.json`:

```json
{
  "status": {
    "prompts_ready": true,
    "prototype_generated": true,
    "generated_at": "{timestamp}",
    "screens_generated": 12,
    "screens_approved": 10,
    "screens_rejected": 2,
    "approved": false
  },
  "generated_artifacts": {
    "screenshots": [
      "generated/screenshots/{screen-1}.png",
      "generated/screenshots/{screen-2}.png"
    ],
    "code_exports": [
      "generated/code/{screen-1}.tsx",
      "generated/code/{screen-2}.tsx"
    ],
    "approval_log": "generated/approval-log.md"
  }
}
```

### Step 9: Report Summary

```markdown
## UX Prototype Generation Complete

### Epic: {epic-name}

### Screen Analysis Summary
| Metric | Value |
|--------|-------|
| Total Screen Prompts | {total} |
| Unique Screens Generated | {unique} |
| Deduplicated (Similar) | {deduped} |
| Efficiency Savings | {pct}% |

### Generation Summary
| Metric | Value |
|--------|-------|
| Unique Screens Generated | {unique} |
| Screens Approved | {approved} |
| Screens Rejected | {rejected} |
| Screenshots Saved | {saved} |

### Template Mapping
| Template Screen | Represents |
|-----------------|------------|
| 05-data-list | {list-screen-1}, {list-screen-2}, {list-screen-3} |
| 06-entity-form | {form-screen-1}, {form-screen-2}, {form-screen-3} |
| 07-entity-detail | {detail-screen-1}, {detail-screen-2} |
| 08-modal-dialog | {modal-1}, {modal-2}, {modal-3} |

### Artifacts Location
```
ux-prompts/{epic}/
|-- screen-analysis.json       # Deduplication analysis
|-- generated/
|   |-- screenshots/ ({n} files)
|   |-- code/ ({n} files)
|   +-- approval-log.md
```

### Rejected Screens (Need Attention)
- None (or list rejected screens)

### Next Steps
1. Review screenshots in `generated/screenshots/`
2. Template screens can be adapted for similar entities during implementation
3. Run `/speckit.tasks` to generate implementation tasks

### Quick Commands
```bash
# View screen analysis
cat ux-prompts/{epic}/screen-analysis.json

# Regenerate specific screens
/speckit.uxprototype --screens us1-02,us4-02

# View approval log
cat ux-prompts/{epic}/generated/approval-log.md

# Proceed to tasks
/speckit.tasks
```
```

### Step 10: Sync Design Details to Spec Artifacts

> **Note**: This step runs automatically unless `--no-sync` is specified. Can also be run standalone with `--sync-only`.

This step extracts design details from the generated UX Pilot screens and updates the spec artifacts (spec.md, tasks.md) with concrete UI specifications.

#### 10.1: Parse Generated Screens

1. **Read UX Pilot snapshot data** from the last generation:
   - Extract screen names, components, and layout structure
   - Identify UI elements: buttons, forms, tables, cards, modals
   - Capture specific field names, labels, and placeholder text
   - Note navigation patterns and user flows

2. **Build screen inventory**:
   ```json
   {
     "screens": [
       {
         "id": "{screen-id}",
         "name": "{Screen Name}",
         "screenshot": "generated/screenshots/{screenshot-file}.png",
         "components": ["DataTable", "SearchInput", "FilterDropdown", "StatusBadge"],
         "fields": ["field_1", "field_2", "field_3", "field_4", "field_5"],
         "actions": ["View", "Edit", "Delete", "Export"],
         "navigation": "{Breadcrumb path}",
         "features_detected": ["pagination", "sorting", "filtering", "bulk_actions"]
       }
     ]
   }
   ```

#### 10.2: Update spec.md with Design References

For each User Story in `specs/{epic}/spec.md`:

1. **Add Design Reference section** after Acceptance Scenarios:

```markdown
### User Story 1 - {Story Title} (Priority: P1)

[... existing content ...]

**Design Reference**:
- **Primary Screen**: [{Screen Name}](../ux-prompts/{epic}/generated/screenshots/{screenshot}.png)
- **Related Screens**: {Related Screen 1}, {Related Screen 2}
- **UX Pilot Project**: [{Project Name} {Epic Name}](https://uxpilot.ai/a/ui-design?page=XXX)

**UI Specifications** (from UX Pilot):
| Element | Specification |
|---------|---------------|
| {Element 1} | {Spec description} |
| {Element 2} | {Spec description} |
| {Element 3} | {Spec description} |

**Component Mapping**:
| UI Component | Library Component | Notes |
|--------------|-------------------|-------|
| {UI element} | {Library component} | {Usage notes} |
| {UI element} | {Library component} | {Usage notes} |
```

2. **Add screen-to-story mapping** at the end of spec.md:

```markdown
---

## Design Artifacts

### Screen Mapping

| Screen | User Stories | Screenshot |
|--------|-------------|------------|
| {Screen 1} | {US refs} | [{screenshot-1}.png](../ux-prompts/{epic}/generated/screenshots/{screenshot-1}.png) |
| {Screen 2} | {US refs} | [{screenshot-2}.png](../ux-prompts/{epic}/generated/screenshots/{screenshot-2}.png) |
| ... | ... | ... |

### Design System Applied

| Token | Value | Usage in Screens |
|-------|-------|------------------|
| {Token 1} | {Value} | {Where used} |
| {Token 2} | {Value} | {Where used} |

### UX Pilot Session

- **Project**: {Project Name} {Epic Name}
- **URL**: https://uxpilot.ai/a/ui-design?page=XXX
- **Generated**: {date}
- **Screens**: {count}
```

#### 10.3: Update tasks.md with UI Implementation Details

For each UI-related task in `specs/{epic}/tasks.md`:

1. **Add screenshot reference** to relevant tasks:

```markdown
- [ ] T045 [P] [US1] Implement {Entity} List page
  - **Design**: [{screenshot}.png](../ux-prompts/{epic}/generated/screenshots/{screenshot}.png)
  - **Components**: DataTable, SearchInput, FilterDropdown, StatusBadge, Pagination
  - **Features**:
    - Search by name or identifier
    - Filter by status, date range
    - Summary cards: {relevant metrics}
    - Row actions: View, Edit, Delete, Export
  - **UI Library**: {Component references from detected framework}
  - **Verify**: Matches design screenshot
```

2. **Add new UI implementation tasks** if missing:

```markdown
### UI Component Tasks (from UX Pilot)

- [ ] T100 [P] Create {Component 1}
  - Variants: {variant descriptions}
  - **Design**: {Component} in [{screenshot}.png]
  - **Verify**: Styling matches design system

- [ ] T101 [P] Create {Component 2}
  - Format/behavior: {description}
  - States: Empty, Active, Valid, Invalid
  - **Design**: {Field} in [{screenshot}.png]
  - **Verify**: States match design
```

#### 10.4: Create design-mapping.md

Write `specs/{epic}/design-mapping.md`:

```markdown
# Design Mapping: {Epic Name}

**Generated**: {date}
**Source**: UX Pilot - {Project Name} {Epic Name}
**Screens**: {count}

## Screen-to-Story Matrix

| Screen ID | Screen Name | US1 | US2 | US3 | ... |
|-----------|-------------|-----|-----|-----|-----|
| 01 | {Screen 1}  |     |     |     |     |
| 02 | {Screen 2}  |     |     |     |     |
| ... | ...        |     |     |     |     |

## Component Inventory

### Reusable Components (Create Once)

| Component | Used In | Priority |
|-----------|---------|----------|
| `AppShell` (Sidebar + Header) | All screens | P0 |
| `StatusBadge` | {Screens using it} | P1 |
| `{Custom Component}` | {Screens using it} | P1 |
| ... | ... | ... |

### Page Components

| Page | Route | Components |
|------|-------|------------|
| {Page 1} | `/{route-1}` | {Components list} |
| {Page 2} | `/{route-2}` | {Components list} |
| ... | ... | ... |

## Domain-Specific Requirements

| Requirement | Implementation | Screens Affected |
|-------------|----------------|------------------|
| {Requirement 1} | {How to implement} | {Affected screens} |
| {Requirement 2} | {How to implement} | {Affected screens} |

## Design Tokens Applied

Reference the design tokens from the Project Design System (speckit.uxprompt output).
Document color palette, typography, spacing, and other tokens used in the generated screens.

## Files to Create

Based on design analysis, list the recommended file structure using
the detected framework paths ({PAGES_PATH} and {COMPONENTS_PATH}).
```

#### 10.5: Update metadata.json with Sync Status

```json
{
  "status": {
    "prompts_ready": true,
    "prototype_generated": true,
    "design_synced": true,
    "synced_at": "{timestamp}"
  },
  "sync_artifacts": {
    "spec_updated": true,
    "tasks_updated": true,
    "design_mapping": "specs/{epic}/design-mapping.md"
  }
}
```

#### 10.6: Report Sync Summary

```markdown
## Design Sync Complete

### Artifacts Updated

| File | Changes |
|------|---------|
| `specs/{epic}/spec.md` | Added Design Reference sections to {n} user stories |
| `specs/{epic}/tasks.md` | Added screenshot references to {n} tasks, created {n} new UI tasks |
| `specs/{epic}/design-mapping.md` | Created with screen-story matrix, component inventory |
| `ux-prompts/{epic}/metadata.json` | Updated sync status |

### Component Tasks Generated

| Component | Task ID | Priority |
|-----------|---------|----------|
| AppShell | T100 | P0 |
| StatusBadge | T101 | P1 |
| {Component} | T102 | P1 |
| ... | ... | ... |

### Next Steps

1. Review updated `spec.md` with design references
2. Review new tasks in `tasks.md`
3. Run `/speckit.tasks` to regenerate task breakdown with UI details
4. Start implementation with `/speckit.implement`
```

---

## Phase 2: Download & Build Prototype

> **Note**: This phase runs automatically after generation unless `--no-download` or `--no-build` is specified. Can also be run standalone with `--skip-generation`.

This phase exports code from UX Pilot, converts it to framework-appropriate components, and builds a complete runnable prototype.

### Step 11: Export from UX Pilot

> **Skip this step** if `--no-download` or `--skip-download` is specified.

#### 11.1: Bulk Export (Preferred Method)

1. **Navigate to canvas view** with all screens visible:
   ```
   mcp__chrome-devtools__take_snapshot()
   Look for canvas/gallery view showing multiple screens
   If in single screen view: mcp__chrome-devtools__click(uid="{canvas-view-button}")
   ```

2. **Select all pages**:
   ```
   mcp__chrome-devtools__press_key(key="Meta+A")  # Select all pages
   ```

   Or use Shift+click to select multiple:
   ```
   mcp__chrome-devtools__click(uid="{first-screen}")
   mcp__chrome-devtools__press_key(key="Shift")
   mcp__chrome-devtools__click(uid="{last-screen}")
   ```

3. **Open export menu**:
   ```
   mcp__chrome-devtools__take_snapshot()
   Find "..." or export menu button
   mcp__chrome-devtools__click(uid="{export-menu-button}")
   ```

   Or use keyboard shortcut:
   ```
   mcp__chrome-devtools__press_key(key="Alt+E")  # Export shortcut
   ```

4. **Select HTML export format**:
   ```
   mcp__chrome-devtools__take_snapshot()
   Find "HTML (zip)" or "Export as HTML" option
   mcp__chrome-devtools__click(uid="{html-export-option}")
   ```

5. **Wait for download**:
   ```
   Expected file: ~/Downloads/uxpilot-export-{timestamp}.zip
   Wait for file to appear (check with Bash tool)
   ```

6. **Extract zip**:
   ```bash
   # Find the latest export
   EXPORT_ZIP=$(ls -t ~/Downloads/uxpilot-export-*.zip | head -1)

   # Extract to epic's generated folder
   unzip -o "$EXPORT_ZIP" -d "ux-prompts/{epic}/generated/html/"
   ```

#### 11.2: Per-Page Export (Fallback)

If bulk export fails, export each page individually:

For each screen in the project:

1. **Select screen**:
   ```
   mcp__chrome-devtools__click(uid="{screen-thumbnail}")
   mcp__chrome-devtools__wait_for(text="Export", timeout=5000)
   ```

2. **Export single page**:
   ```
   mcp__chrome-devtools__click(uid="{export-button}")
   mcp__chrome-devtools__take_snapshot()
   mcp__chrome-devtools__click(uid="{html-option}")
   ```

3. **Save to correct location**:
   ```
   Move downloaded file to: ux-prompts/{epic}/generated/html/{screen-id}.html
   ```

#### 11.3: Export Progress Display

```
+===============================================================================+
|  EXPORTING CODE FROM UX PILOT                                                 |
+===============================================================================+
|                                                                               |
|  Epic: {epic-name}                                                            |
|  Method: Bulk HTML Export                                                      |
|                                                                               |
|  Progress: ############........ 80%                                           |
|                                                                               |
|  [done] Selected {n} screens                                                  |
|  [done] Opened export menu                                                    |
|  [done] Selected HTML format                                                  |
|  [active] Downloading zip file...                                             |
|  [wait] Extract to generated/html/                                            |
|                                                                               |
+===============================================================================+
```

### Step 12: Organize Prototype Structure

> **Skip this step** if `--no-build` is specified.

Create the directory structure for the prototype based on the detected framework.

#### 12.1: Create Directory Structure

Based on the epic's screens, create routes using the detected `PAGES_PATH`:

```bash
# Base prototype directory (from detected PAGES_PATH)
mkdir -p {PAGES_PATH}

# Per-epic routes (determined by screen analysis)
mkdir -p {PAGES_PATH}/{route-1}
mkdir -p {PAGES_PATH}/{route-1}/[id]
mkdir -p {PAGES_PATH}/{route-1}/new
mkdir -p {PAGES_PATH}/{route-2}
mkdir -p {PAGES_PATH}/{route-2}/[id]
# ... additional routes as needed

# Shared components (from detected COMPONENTS_PATH)
mkdir -p {COMPONENTS_PATH}
```

#### 12.2: Route Mapping by Epic

Map screens to routes based on epic content. Derive routes from the screen analysis rather than using hardcoded paths:

| Screen Type | Typical Route Pattern | Components |
|-------------|----------------------|------------|
| List | `/{entity}` | DataTable, Search, Filters |
| Create Form | `/{entity}/new` | Form, Inputs, Validation |
| Detail View | `/{entity}/[id]` | Detail layout, Actions |
| Edit Form | `/{entity}/[id]/edit` | Form, Pre-filled inputs |
| Settings | `/settings` | Tabs, Forms |
| Dashboard | `/` or `/dashboard` | Cards, Charts, Tables |

#### 12.3: Screen-to-Route Mapping File

Create `ux-prompts/{epic}/route-mapping.json`:

```json
{
  "epic": "{epic-name}",
  "framework": "{FRAMEWORK}",
  "base_route": "/{entity}",
  "routes": [
    {
      "route": "/{entity}",
      "file": "{PAGES_PATH}/{entity}/page.tsx",
      "screens": ["{screen-id-1}"],
      "type": "list"
    },
    {
      "route": "/{entity}/new",
      "file": "{PAGES_PATH}/{entity}/new/page.tsx",
      "screens": ["{screen-id-2}", "{screen-id-3}"],
      "type": "form"
    },
    {
      "route": "/{entity}/[id]",
      "file": "{PAGES_PATH}/{entity}/[id]/page.tsx",
      "screens": ["{screen-id-4}", "{screen-id-5}"],
      "type": "detail"
    }
  ]
}
```

### Step 13: Convert to Framework Components

Process each exported HTML file and convert to the detected framework's component format.

#### 13.1: HTML Processing Pipeline

For each HTML file in `generated/html/`:

1. **Parse HTML structure**:
   - Extract main content area
   - Identify Tailwind classes
   - Map to UI component library (from design system)

2. **Apply conversions**:

   | From (HTML) | To (React/TSX) |
   |-------------|----------------|
   | `class="..."` | `className="..."` |
   | `onclick="..."` | `onClick={...}` |
   | `<div onclick>` | `<Button onClick>` |
   | `<table>` | `<Table>` from UI library |
   | `<input type="text">` | `<Input>` from UI library |
   | `<select>` | `<Select>` from UI library |
   | FontAwesome icons | Framework-appropriate icons (e.g., Lucide React) |
   | Inline styles | Tailwind classes |

   For Vue projects, apply Vue-specific conversions:
   | From (HTML) | To (Vue SFC) |
   |-------------|--------------|
   | `class="..."` | `class="..."` (unchanged) |
   | `onclick="..."` | `@click="..."` |
   | Standard HTML | Vue component equivalents |

3. **Add framework patterns** (example for React/Next.js):
   ```typescript
   // Add 'use client' for interactive components (Next.js App Router)
   'use client'

   // Import UI library components
   import { Button } from '{ui-library}/button'
   import { Input } from '{ui-library}/input'
   import { Table, TableHeader, TableBody, TableRow, TableCell } from '{ui-library}/table'

   // Import icons
   import { Plus, Search, Filter, MoreHorizontal } from '{icon-library}'
   ```

4. **Fix imports and paths**:
   - Replace relative imports with alias paths (e.g., `@/`)
   - Update image paths for framework's image component
   - Fix any hardcoded URLs

#### 13.2: Component Conversion Template

```typescript
// BEFORE: UX Pilot HTML export
<div class="bg-white rounded-lg shadow p-6">
  <h2 class="text-xl font-semibold text-gray-900">Entities</h2>
  <table class="min-w-full">
    <thead>
      <tr>
        <th class="px-4 py-2 text-left">ID</th>
        <th class="px-4 py-2 text-left">Name</th>
      </tr>
    </thead>
  </table>
  <button class="bg-blue-600 text-white px-4 py-2 rounded" onclick="createEntity()">
    <i class="fa fa-plus mr-2"></i>New Entity
  </button>
</div>

// AFTER: Framework component (React/Next.js example)
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Plus } from 'lucide-react'

export default function EntitiesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Entities</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <Button onClick={() => router.push('/{entity}/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Entity
        </Button>
      </CardContent>
    </Card>
  )
}
```

#### 13.3: Icon Mapping Reference

| FontAwesome | Lucide React |
|-------------|--------------|
| `fa-plus` | `Plus` |
| `fa-search` | `Search` |
| `fa-edit` | `Pencil` |
| `fa-trash` | `Trash2` |
| `fa-download` | `Download` |
| `fa-upload` | `Upload` |
| `fa-check` | `Check` |
| `fa-times` | `X` |
| `fa-filter` | `Filter` |
| `fa-sort` | `ArrowUpDown` |
| `fa-ellipsis-v` | `MoreVertical` |
| `fa-ellipsis-h` | `MoreHorizontal` |
| `fa-user` | `User` |
| `fa-cog` | `Settings` |
| `fa-home` | `Home` |
| `fa-chart-bar` | `BarChart3` |
| `fa-file` | `FileText` |

### Step 14: Create Shared Layout & Components

#### 14.1: Prototype Layout

Create `{PAGES_PATH}/layout.tsx` (or equivalent for detected framework):

```typescript
// Example for Next.js App Router
import { PrototypeSidebar } from '{COMPONENTS_PATH}/sidebar'
import { PrototypeHeader } from '{COMPONENTS_PATH}/header'

export default function PrototypeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <PrototypeSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PrototypeHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

#### 14.2: Shared Components

Create these reusable components in `{COMPONENTS_PATH}/`:

| Component | File | Purpose |
|-----------|------|---------|
| Sidebar | `sidebar.tsx` | Navigation menu with all modules |
| Header | `header.tsx` | App name, user profile |
| PageHeader | `page-header.tsx` | Title, breadcrumb, actions |
| DataTable | `data-table.tsx` | Reusable table with sorting, filtering |
| StatsCard | `stats-card.tsx` | KPI display card |
| StatusBadge | `status-badge.tsx` | Status indicator badges |
| EmptyState | `empty-state.tsx` | No data placeholder |
| LoadingState | `loading-state.tsx` | Skeleton loaders |

Additional domain-specific components should be derived from the screen analysis and design system.

#### 14.3: Sidebar Navigation Structure

Build navigation from the epic/screen analysis. The navigation items should reflect the actual pages generated, not hardcoded routes:

```typescript
// {COMPONENTS_PATH}/sidebar.tsx
// Navigation derived from route-mapping.json
const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  // ... additional routes from route-mapping.json
]
```

### Step 15: Verify Build

> **Skip this step** if `--verify-build false` is specified.

#### 15.1: Type Check

```bash
{TYPECHECK_CMD}
```

Expected: No errors. If errors found:
- Fix type issues in generated components
- Add missing type definitions
- Ensure all imports resolve

#### 15.2: Lint Check

```bash
{LINT_CMD}
```

Expected: No errors. Common fixes:
- Add missing dependencies to useEffect
- Fix unused variables
- Apply consistent formatting

#### 15.3: Build Check

```bash
{BUILD_CMD}
```

Expected: Build succeeds. If fails:
- Check for missing dependencies
- Verify all routes have valid page components
- Ensure images and assets exist

#### 15.4: Build Verification Report

```
+===============================================================================+
|  BUILD VERIFICATION COMPLETE                                                  |
+===============================================================================+
|                                                                               |
|  Type Check:   [done] No errors                                              |
|  Lint:         [done] No errors                                              |
|  Build:        [done] Successful                                             |
|                                                                               |
|  Generated Files:                                                             |
|  |-- Pages: {n}                                                               |
|  |-- Components: {n}                                                          |
|  +-- Routes: {n}                                                              |
|                                                                               |
+===============================================================================+
```

### Step 16: Export Failure - Manual Fallback

If Chrome MCP export automation fails, display manual instructions:

```
+===============================================================================+
|  EXPORT AUTOMATION FAILED                                                     |
+===============================================================================+
|                                                                               |
|  Unable to automatically export from UX Pilot.                               |
|                                                                               |
|  To export manually:                                                          |
|                                                                               |
|  1. Open UX Pilot project in browser:                                        |
|     https://uxpilot.ai/a/ui-design?page=XXX                                 |
|                                                                               |
|  2. Select all pages on canvas (Cmd+A or Ctrl+A)                             |
|                                                                               |
|  3. Click "..." menu -> "Export design" (or press Alt+E)                     |
|                                                                               |
|  4. Choose "HTML (zip)" format                                               |
|                                                                               |
|  5. Save to: ~/Downloads/                                                    |
|                                                                               |
|  6. Then run:                                                                |
|     /speckit.uxprototype --skip-download --build                             |
|                                                                               |
|  Debug screenshot saved: debug-export-failure-{timestamp}.png                |
|                                                                               |
+===============================================================================+
```

---

## Prototype Output Structure

After running with `--build`, the following structure is created:

```
{PAGES_PATH}/
|-- layout.tsx                    # Shared sidebar navigation
|-- page.tsx                      # Dashboard/overview
|
|-- {entity-1}/                   # Routes from Epic screens
|   |-- page.tsx                  # Entity list
|   |-- [id]/
|   |   +-- page.tsx              # Entity detail
|   +-- new/page.tsx              # Create entity
|
|-- {entity-2}/                   # Additional entity routes
|   |-- page.tsx
|   +-- ...
|
+-- settings/                     # Shared settings
    |-- page.tsx
    +-- ...

{COMPONENTS_PATH}/
|-- sidebar.tsx                   # Main navigation
|-- header.tsx                    # Top header bar
|-- page-header.tsx               # Page title + actions
|-- data-table.tsx                # Reusable data table
|-- stats-card.tsx                # KPI cards
|-- status-badge.tsx              # Status indicators
|-- empty-state.tsx               # No data state
+-- loading-state.tsx             # Loading skeletons

ux-prompts/{epic}/
|-- generated/
|   |-- html/                     # Raw HTML exports
|   |   |-- screen-01.html
|   |   +-- ...
|   |-- screenshots/              # Screen images
|   +-- approval-log.md
|-- route-mapping.json            # Screen-to-route mapping
+-- metadata.json                 # Updated with build status
```

---

## Batch Execution Steps

> **Note**: These steps are executed when `--batch` or `--all` flag is provided.

### Step B1: Discover Pending Epics

1. **Scan all epic metadata files**:
   ```
   Glob: ux-prompts/*/metadata.json
   ```

2. **Build epic queue**:
   ```javascript
   const queue = [];
   for (const metadataFile of metadataFiles) {
     const metadata = readJSON(metadataFile);
     queue.push({
       epic_name: metadata.epic_name,
       epic_number: metadata.epic_number,
       path: metadataFile.replace('/metadata.json', ''),
       prompts_ready: metadata.status?.prompts_ready ?? false,
       prototype_generated: metadata.status?.prototype_generated ?? false,
       approved: metadata.status?.approved ?? false,
       screen_count: metadata.prompts?.screens?.length ?? 0,
       queue_status: determineStatus(metadata)
     });
   }
   queue.sort((a, b) => a.epic_number - b.epic_number);
   ```

3. **Apply filters**:
   - `--from <epic>`: Start from specified epic
   - `--limit <n>`: Take only n epics
   - Skip epics with `queue_status === 'complete'`

### Step B2: Present Batch Plan

Display queue and get user confirmation (uses `AskUserQuestion`):

```
+==============================================================================+
|                        BATCH PROTOTYPE GENERATION                            |
+==============================================================================+
|  Queue: {total} epics, {to_process} to process, ~{screens} screens          |
|                                                                              |
|  [C] Continue with batch                                                     |
|  [D] Dry run (preview only)                                                  |
|  [Q] Quit                                                                    |
+==============================================================================+
```

### Step B3: Process Epic Queue

For each epic in queue:

#### B3.1: Create New UX Pilot File

1. **Navigate to UX Pilot home**:
   ```
   mcp__chrome-devtools__navigate_page(url="https://uxpilot.ai")
   mcp__chrome-devtools__wait_for(text="New File", timeout=30000)
   ```

2. **Click "New File"**:
   ```
   mcp__chrome-devtools__take_snapshot()
   Find "New File" button in snapshot
   mcp__chrome-devtools__click(uid="{new-file-button-uid}")
   ```

3. **Fill file details**:
   ```
   Page Name: "{Project Name} {Epic Name}"
   Page Context: Project Design System (from speckit.uxprompt output).
                 Include color palette, typography, component library,
                 icon set, tech stack, accessibility requirements,
                 and any domain-specific design tokens.
   ```

4. **Create project**:
   ```
   mcp__chrome-devtools__click(uid="{create-button-uid}")
   mcp__chrome-devtools__wait_for(text="Single Screen", timeout=30000)
   ```

#### B3.2: Generate Screens for Epic

For each screen in epic's screen list:

1. **Load screen prompt**:
   ```
   Read: ux-prompts/{epic}/screens/{screen.file}
   ```

2. **Ensure Single Screen mode**:
   ```
   mcp__chrome-devtools__take_snapshot()
   Verify "Single Screen" is active
   If not: mcp__chrome-devtools__click(uid="{single-screen-tab}")
   ```

3. **Enter prompt**:
   ```
   mcp__chrome-devtools__click(uid="{prompt-textarea}")
   mcp__chrome-devtools__press_key(key="Meta+A")
   mcp__chrome-devtools__fill(uid="{prompt-textarea}", value=screen_prompt)
   ```

4. **Generate**:
   ```
   mcp__chrome-devtools__click(uid="{generate-button}")
   Wait for generation (check button state returns to "Generate")
   ```

5. **Screenshot**:
   ```
   mcp__chrome-devtools__take_screenshot(
     filePath="ux-prompts/{epic}/generated/screenshots/{screen.id}.png"
   )
   ```

6. **Update progress display**

#### B3.3: Finalize Previous Epic (Parallel)

While generating Epic N, finalize Epic N-1:

1. **Update metadata.json**:
   ```json
   {
     "status": {
       "approved": true,
       "approved_at": "{timestamp}"
     }
   }
   ```

2. **Create design-mapping.md** (if Step 10 sync enabled)

3. **Update batch-progress.json**

### Step B4: Update Epic Metadata

After each epic completes:

```json
{
  "status": {
    "prompts_ready": true,
    "prototype_generated": true,
    "approved": true,
    "design_synced": true
  },
  "prototype": {
    "ux_pilot_url": "https://uxpilot.ai/a/ui-design?page={page_id}",
    "file_name": "{Project Name} {Epic Name}",
    "generated_at": "{timestamp}",
    "screens_generated": "{count}",
    "screenshots_dir": "generated/screenshots/"
  },
  "batch_processing": {
    "batch_id": "batch-{date}-{time}",
    "queue_position": "{n}",
    "started_at": "{timestamp}",
    "completed_at": "{timestamp}"
  }
}
```

### Step B5: Batch Completion Summary

After all epics processed:

```markdown
## Batch Prototype Generation Complete

### Batch ID: batch-{date}-{time}

### Summary
| Metric | Value |
|--------|-------|
| Total Epics | {total} |
| Already Complete | {complete} |
| Generated This Batch | {generated} |
| Approved This Batch | {approved} |
| Failed | {failed} |

### Epic Results
| # | Epic | Screens | UX Pilot URL |
|---|------|---------|--------------|
| 1 | {epic-1} | {n} | [Link](...) |
| 2 | {epic-2} | {n} | [Link](...) |
| ... | ... | ... | ... |

### Next Steps
1. Run `/speckit.uxprototype --test` to verify all prototypes
2. Review screenshots in `ux-prompts/*/generated/screenshots/`
3. Run `/speckit.tasks` for each epic to generate implementation tasks
```

---

## Batch Error Handling

### Epic Generation Failure

If an epic fails during batch processing:

1. **Capture failure state**:
   ```
   mcp__chrome-devtools__take_screenshot(filePath="debug-{epic}-{screen}-error.png")
   ```

2. **Update batch-progress.json**:
   ```json
   {
     "epic": "{epic-name}",
     "status": "failed",
     "error": {
       "type": "generation_timeout",
       "message": "Screen {screen-id} timed out after 60s",
       "screen_id": "{screen-id}"
     }
   }
   ```

3. **Decision (if `--interactive`)**:
   ```
   +========================================================================+
   |  EPIC GENERATION FAILED                                                |
   +========================================================================+
   |  Epic: {epic-name} ({n}/{total})                                       |
   |  Error: Screen generation timeout                                      |
   |  Screen: {screen-id}                                                   |
   |                                                                        |
   |  [R] Retry failed screen                                               |
   |  [S] Skip screen, continue epic                                        |
   |  [E] Skip epic, continue batch                                         |
   |  [A] Abort batch (progress saved)                                      |
   +========================================================================+
   ```

4. **Auto mode behavior**: Skip failed screen, continue with next, log for later

### UX Pilot Rate Limiting

If rate limit detected:

1. **Detect**: Look for "limit reached", "Upgrade", or credit exhaustion text
2. **Pause batch** with progress saved
3. **Notify**:
   ```
   +========================================================================+
   |  UX PILOT LIMIT REACHED                                                |
   +========================================================================+
   |  Progress saved. Completed {n}/{total} epics before limit.             |
   |                                                                        |
   |  To resume: /speckit.uxprototype --batch --resume                      |
   +========================================================================+
   ```

### Resume From Failure

When `--resume` is specified:

1. **Read batch-progress.json**
2. **Find last successful state**
3. **Resume from next pending epic/screen**
4. **Continue batch processing**

---

## Post-Generation Testing Mode

> **IMPORTANT**: Chrome MCP is used exclusively for UX Pilot design generation during `--batch` mode. Testing happens ONLY after ALL epics are complete, using `--test` flag.

### When to Use `--test`

- After `--batch` completes all epic generations
- To verify all prototypes before proceeding to implementation
- To generate a comprehensive test report

### Test Execution Flow

#### T1: Verify All Epics Complete

```
FOR each epic in ux-prompts/*/metadata.json:
  IF NOT prototype_generated:
    ERROR: "Epic {name} not yet generated. Run --batch first."
    EXIT
```

#### T2: Test Each Epic's Prototype

For each epic:

1. **Navigate to UX Pilot URL** from metadata.json:
   ```
   mcp__chrome-devtools__navigate_page(url=metadata.prototype.ux_pilot_url)
   mcp__chrome-devtools__wait_for(text="{Project Name}", timeout=30000)
   ```

2. **Take snapshot of project**:
   ```
   mcp__chrome-devtools__take_snapshot()
   ```

3. **Verify screens exist**:
   - Check screen count matches metadata.screens_generated
   - Take screenshot of screen list

4. **For each screen, verify**:
   - Screen loads correctly
   - Design system colors are present
   - Domain-specific elements render correctly

5. **Log results** to `ux-prompts/{epic}/test-results.json`

#### T3: Generate Test Report

```markdown
## Prototype Test Results

### Test Run: {timestamp}

### Summary
| Metric | Value |
|--------|-------|
| Epics Tested | {total} |
| Screens Verified | {screens} |
| Passed | {passed} |
| Failed | {failed} |
| Pass Rate | {rate}% |

### Epic Results
| Epic | Screens | Passed | Failed | Issues |
|------|---------|--------|--------|--------|
| {epic-1} | {n} | {n} | {n} | {issues or -} |
| {epic-2} | {n} | {n} | {n} | {issues or -} |
| ... | ... | ... | ... | ... |

### Failed Screen Details
1. **{epic} / {screen-id}**
   - Issue: {description}
   - Screenshot: test-results/{screenshot}.png

### Design System Compliance
- Color Palette: {pass/fail} {details}
- Typography: {pass/fail} {details}
- Components: {pass/fail} {details}

### Domain-Specific Checks
- {Check 1}: {pass/fail}
- {Check 2}: {pass/fail}
```

---

## Error Handling

### Chrome MCP Errors

| Error | Detection | Resolution |
|-------|-----------|------------|
| MCP not connected | Tool call fails | Show connection instructions |
| Page not responding | Timeout | Refresh page, retry |
| Element not found | Snapshot shows different UI | Re-analyze UI, adjust selectors |

### UX Pilot Errors

| Error | Detection | Resolution |
|-------|-----------|------------|
| Auth required | "Sign in" text | Pause for manual login |
| Credit limit | "Upgrade" modal | Notify user, suggest manual |
| Generation failed | Error text in UI | Capture error, offer retry |
| Timeout | > 3 minutes | Prompt user to check UX Pilot |

### Graceful Degradation

If automation fails at any point:

1. **Capture current state**:
   ```
   mcp__chrome-devtools__take_screenshot(filePath="debug-{timestamp}.png")
   ```

2. **Provide manual instructions**:
   ```
   +===============================================================+
   |  AUTOMATION PAUSED                                             |
   +===============================================================+
   |  Unable to complete automated generation.                      |
   |                                                                |
   |  To continue manually:                                         |
   |  1. Open: ux-prompts/{epic}/flow-prompt.md                    |
   |  2. Copy the prompt content                                    |
   |  3. Paste into UX Pilot "Create Flow"                         |
   |  4. Click Generate                                             |
   |  5. Download/screenshot each screen                            |
   |  6. Save to: ux-prompts/{epic}/generated/                     |
   |                                                                |
   |  Screenshot of current state: debug-{timestamp}.png           |
   +===============================================================+
   ```

3. **Offer to resume**:
   - Save progress to temp file
   - Allow resuming from last successful step

---

## Chrome MCP Tools Reference

### Generation Tools

| Tool | Purpose |
|------|---------|
| `list_pages` | Find existing UX Pilot tabs |
| `new_page` | Open UX Pilot website |
| `select_page` | Switch to UX Pilot tab |
| `take_snapshot` | Analyze current UI state, find element UIDs |
| `wait_for` | Wait for text to appear (page load, generation complete) |
| `click` | Click buttons, navigate |
| `fill` | Enter text in textareas, inputs |
| `take_screenshot` | Capture screen images |
| `press_key` | Keyboard shortcuts (Tab, Enter, etc.) |

### Export Tools (Phase 2)

| Tool | Purpose |
|------|---------|
| `press_key(key="Meta+A")` | Select all pages on canvas |
| `press_key(key="Alt+E")` | Open export menu |
| `click` | Select export format, confirm download |
| `take_snapshot` | Find export menu items |

### Common Keyboard Shortcuts

| Shortcut | Mac | Windows | Purpose |
|----------|-----|---------|---------|
| Select All | `Meta+A` | `Control+A` | Select all pages on canvas |
| Export | `Alt+E` | `Alt+E` | Open export design menu |
| Undo | `Meta+Z` | `Control+Z` | Undo last action |
| Save | `Meta+S` | `Control+S` | Save project |

---

## Approval Workflow

### Interactive Mode (Default)

1. **Generate all screens**
2. **Present summary table**
3. **Options**:
   - **A (Approve all)**: Download all screens
   - **R (Review individually)**: Step through each screen
   - **E (Edit and regenerate)**: Modify prompt, regenerate
   - **S (Skip)**: Download approved only, note rejected
   - **C (Cancel)**: Exit without saving

### Individual Review

For each screen:
1. Take screenshot
2. Show in terminal (if supported) or save to temp
3. **Options**:
   - **A (Approve)**: Add to approved list
   - **R (Reject)**: Add to rejected list with reason
   - **G (Regenerate)**: Provide feedback, regenerate single screen
   - **S (Skip)**: Move to next without decision

### Non-Interactive Mode

With `--interactive false`:
1. Generate all screens
2. Approve all automatically
3. Download all
4. Report summary

---

## Output Files

After successful execution:

```
ux-prompts/{epic}/
|-- metadata.json              # Updated with generation, build & sync status
|-- flow-prompt.md             # Original flow prompt (all screens)
|-- screen-analysis.json       # Unique screen analysis & deduplication
|-- route-mapping.json         # Screen-to-route mapping (Phase 2)
|-- screens/                   # Individual screen prompts
+-- generated/
    |-- screenshots/           # Downloaded screen images (unique only)
    |   |-- {screen-1}.png
    |   |-- {screen-2}.png     # Template for all list screens
    |   +-- ...
    |-- html/                  # Raw HTML exports from UX Pilot (Phase 2)
    |   |-- screen-01.html
    |   +-- ...
    |-- code/                  # Exported code (if available)
    |   +-- ...
    +-- approval-log.md        # Screen decisions

specs/{epic}/
|-- spec.md                    # Updated with Design Reference sections
|-- tasks.md                   # Updated with screenshot refs & UI tasks
+-- design-mapping.md          # Screen-story matrix, component inventory

{PAGES_PATH}/                  # Built prototype (Phase 2, --build)
|-- layout.tsx                 # Shared sidebar navigation
|-- page.tsx                   # Dashboard
|-- {entity}/                  # Per-epic routes
|   |-- page.tsx
|   |-- [id]/page.tsx
|   +-- new/page.tsx
+-- settings/

{COMPONENTS_PATH}/             # Shared components (Phase 2)
|-- sidebar.tsx
|-- header.tsx
|-- data-table.tsx
|-- stats-card.tsx
+-- ...
```

### Screen Analysis Output

The `screen-analysis.json` file contains:

```json
{
  "analyzed_at": "{timestamp}",
  "summary": {
    "total_prompts": 28,
    "unique_to_generate": 12,
    "deduplicated": 16,
    "savings_percent": 57
  },
  "unique_screens": ["..."],
  "template_mappings": {
    "05-data-list": {
      "applies_to": ["{list-screen-1}", "{list-screen-2}", "{list-screen-3}"],
      "variation_notes": "Change entity name, columns, and actions per entity type"
    }
  },
  "generation_order": ["..."]
}
```

### Files Modified by Sync

| File | Modifications |
|------|---------------|
| `spec.md` | Design Reference section added to each user story |
| `tasks.md` | Screenshot references, UI component tasks added |
| `design-mapping.md` | Created with complete design-to-implementation mapping |
| `metadata.json` | Sync status updated |
