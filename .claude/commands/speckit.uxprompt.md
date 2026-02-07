---
description: Generate UX design prompts from specifications for AI-powered design generation
allowed_permissions:
  # Prerequisites
  - Bash: run prerequisite check script
  - Bash: list directory contents
  - Bash: create directories

  # File Operations
  - Read: read spec, plan, design-mapping, and template files
  - Write: create UX prompt files
handoffs:
  - label: Generate Prototype
    agent: speckit.uxprototype
    prompt: Create prototype from generated prompts
    send: true
  - label: View Specification
    agent: general-purpose
    prompt: Show the specification for review
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
║                    UX PROMPT GENERATION - PERMISSIONS                          ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  This command will perform the following actions automatically:               ║
║                                                                               ║
║  FILE OPERATIONS:                                                             ║
║     - Read specs/{epic}/spec.md (user stories, requirements)                  ║
║     - Read specs/{epic}/metadata.json (epic/story relationships)              ║
║     - Read specs/{epic}/plan.md (if exists - tech stack context)              ║
║     - Write ux-prompts/{epic}/metadata.json                                   ║
║     - Write ux-prompts/{epic}/flow-prompt.md                                  ║
║     - Write ux-prompts/{epic}/screens/*.md (multiple screen files)            ║
║     - Write ux-prompts/README.md (if needed)                                  ║
║     - Write ux-prompts/style-guide.md (if needed)                             ║
║                                                                               ║
║  DIRECTORY OPERATIONS:                                                        ║
║     - List specs/ to discover epics                                           ║
║     - Create ux-prompts/{epic}/ directory                                     ║
║     - Create ux-prompts/{epic}/screens/ directory                             ║
║     - Create ux-prompts/{epic}/generated/ directory                           ║
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

Generate comprehensive UX design prompts from feature specifications. This command reads epics from `specs/`, extracts user stories and requirements, and creates structured prompts optimized for AI-powered UX design generation tools (e.g., UX Pilot's "Create Flow" feature).

## Arguments

| Flag | Description | Default |
|------|-------------|---------|
| `--epic <path>` | Generate prompts for specific epic only | All epics |
| `--stories <list>` | Filter to specific user stories (1,2,3) | All stories |
| `--format <type>` | Output format: `flow`, `screens`, `both` | `both` |
| `--interactive` | Prompt for confirmation before each major step | `false` |
| `--dry-run` | Preview what would be generated without writing files | `false` |

**Examples**:
```bash
/speckit.uxprompt
/speckit.uxprompt --epic specs/001-user-management
/speckit.uxprompt --stories 1,2 --format flow
/speckit.uxprompt --interactive
/speckit.uxprompt --dry-run
```

## Interactive Mode

When `--interactive` flag is provided, the command will pause and ask for confirmation at these points:

1. **Epic Selection**: Confirm which epics to process
2. **Screen Inventory**: Review and approve the list of screens to generate
3. **Prompt Preview**: Preview each prompt before writing to file
4. **Style Guide**: Confirm design system settings

### Interactive Flow

```
┌─────────────────────────────────────────────────────────────┐
│  EPIC SELECTION                                             │
├─────────────────────────────────────────────────────────────┤
│  Found {N} epic(s) in specs/:                               │
│                                                             │
│  [1] {epic-name}                                            │
│      {N} user stories, {priority} priority                  │
│                                                             │
│  Generate prompts for:                                      │
│  [A] All epics                                              │
│  [1-N] Specific epic number                                 │
│  [C] Cancel                                                 │
│                                                             │
│  Choice: _                                                  │
└─────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────┐
│  SCREEN INVENTORY                                           │
├─────────────────────────────────────────────────────────────┤
│  Epic: {epic-name}                                          │
│                                                             │
│  Screens to generate ({N} total):                           │
│                                                             │
│  Navigation ({N}):                                          │
│    [x] NAV-01 {Screen Name}                                 │
│    [x] NAV-02 {Screen Name}                                 │
│    ...                                                      │
│                                                             │
│  US1: {Story Title} ({N}):                                  │
│    [x] US1-01 {Screen Name}                                 │
│    [x] US1-02 {Screen Name}                                 │
│    ...                                                      │
│                                                             │
│  [A] Accept all screens                                     │
│  [E] Edit selection                                         │
│  [C] Cancel                                                 │
│                                                             │
│  Choice: _                                                  │
└─────────────────────────────────────────────────────────────┘
```

## Execution Flow

### Step 1: Discover and Load Epics

1. **Scan specs directory** for epic folders:
   ```bash
   ls -d specs/*/
   ```

2. **For each epic directory, load**:
   - `spec.md` - User stories, requirements, acceptance criteria
   - `metadata.json` - Epic/story relationships, priorities
   - `plan.md` (if exists) - Tech stack context

3. **Validate prerequisites**:
   - spec.md MUST exist
   - At least one user story MUST be present
   - If missing, log warning and skip epic

### Step 2: Parse Specifications

For each epic, extract:

| Element | Source | Usage |
|---------|--------|-------|
| Feature Name | spec.md header | Product context |
| User Stories | spec.md User Scenarios | Screen flows |
| Acceptance Criteria | Each story | Interaction requirements |
| Key Entities | spec.md Key Entities | Data model for forms |
| Edge Cases | spec.md Edge Cases | Error states, empty states |
| UI/UX Considerations | spec.md (if present) | Design constraints |

### Step 3: Map Stories to Screens

Use pattern recognition to infer screens:

| Story Pattern | Screen Types |
|--------------|--------------|
| "create/add/new" | Form (wizard or single-page) |
| "list/view all/search" | List view with filters |
| "view details/edit" | Detail view with edit mode |
| "share/download/export" | Preview with actions |
| "manage/CRUD" | List + Form + Detail trio |
| "dashboard/summary" | Dashboard with cards/charts |
| "settings/configure" | Settings form with tabs |
| "setup/onboarding" | Wizard with steps |

### Step 4: Generate Prompts

#### 4.1 Create Flow Prompt

Generate `ux-prompts/{epic}/flow-prompt.md` with:

1. **Domain Context Block** (see Domain Context Template below)
2. **Design System Specification** (see Design System Detection below)
3. **Product Overview** from spec.md
4. **User Journey Screens** organized by user story
5. **Design Requirements** (responsive, accessibility)
6. **Complete Screen Inventory** with all required screens

#### 4.2 Create Individual Screen Prompts

For each screen identified, generate `ux-prompts/{epic}/screens/{screen-id}.md` with:

1. **Context** (epic, story, priority)
2. **Screen Purpose** from acceptance criteria
3. **Required Elements** (header, content, actions)
4. **Form Fields** (if applicable) with validation
5. **States** (default, empty, loading, error)
6. **Mobile Behavior**

### Step 5: Create Output Structure

Create the following directory structure:

```
ux-prompts/
├── README.md
├── style-guide.md
├── {epic-name}/
│   ├── metadata.json
│   ├── flow-prompt.md
│   ├── screens/
│   │   ├── nav-01-app-shell.md
│   │   ├── us1-01-{screen-name}.md
│   │   └── ...
│   └── generated/
│       └── .gitkeep
```

### Step 6: Report Summary

Output a summary showing:
- Epic name and screen count
- List of generated files
- Design system included
- Next steps (review prompts, run /speckit.uxprototype)

---

## Domain Context Template

Generate this dynamically for each project:

1. **Read from spec.md**: Target market, primary users, cultural considerations
2. **Read from plan.md**: Tech stack, frameworks, component libraries
3. **If neither available**: Ask user for:
   - Target market and primary users
   - Cultural/localization considerations
   - Technical framework preferences

Template structure:

```markdown
## Domain Context: [Project Domain]

**Target Market**: [From spec.md or user input]
**Primary Users**: [From spec.md or user input]
**Cultural Considerations**:
- [Localization needs from spec.md or user input]
- [Date/time format preferences]
- [Currency format preferences]
- [Mobile-first or desktop-first approach]
- [Primary communication channels]

**Technical Compliance**:
- [Industry-specific regulations from spec.md]
- [Data validation requirements]
- [Integration requirements]

**Design Framework**:
- [From plan.md tech stack]
```

Include the resolved Domain Context in ALL generated prompts.

---

## Design System Detection

Detect and use the project's existing design system:

1. **Check for existing design tokens**:
   - `tailwind.config.*` - Extract color theme, spacing, typography
   - `design-tokens.json` or `tokens.json` - Parse design token values
   - `theme.*` or `styles/theme.*` - Extract theme configuration
   - `package.json` - Check for UI library (shadcn/ui, MUI, Chakra, Ant Design, etc.)

2. **If design system found**: Generate design system specification from project files, including:
   - Color tokens (primary, secondary, accent, success, warning, error, background, surface)
   - Typography scale (headings, body, small)
   - Spacing and grid system
   - Button styles (primary, secondary, outline)
   - Form elements (inputs, selects, error states)
   - Cards and navigation patterns
   - Badge and status indicators
   - Modal dialog patterns
   - Accessibility standards (contrast ratios, focus states, touch targets)

3. **If no design system found**: Ask user to provide:
   - Primary brand color
   - UI component library preference (or "none")
   - Mobile-first or desktop-first approach
   - Then generate a minimal, neutral design system as starting point

4. **Include in ALL prompts**: Whatever design system is resolved, embed it in every generated prompt for consistency

**CRITICAL**: The resolved design system MUST be included in ALL prompts to ensure consistent styling across every screen.

---

## Flow Prompt Template

```markdown
# UX Design Flow Prompt: {Epic Title}

{Domain Context Block}

{Design System Specification}

## Product Overview

{Overview text from spec.md}

## Complete Screen Inventory

{List all screens with IDs and descriptions}

## User Journey Screens

### Flow 1: {User Story Title} (Priority: {P1/P2/P3})

**User Goal**: {From user story description}
**Entry Point**: {Inferred from acceptance criteria}

**Screens in this flow**:
1. {Screen ID}: {Screen Name} - {Description}
2. {Screen ID}: {Screen Name} - {Description}

**Key Interactions**:
{Extracted from acceptance scenarios}

**Success State**: {From success criteria}
**Error States**: {From edge cases}

### Flow 2: {Next User Story}
...

## Design Requirements

- Mobile-first responsive design
- Top navigation: Logo (left), main nav (center), user menu (right)
- Sidebar navigation for desktop
- Progressive disclosure forms with sections
- Toast notifications for success/error feedback
- Skeleton loading states
- Empty states with call-to-action

## Accessibility Requirements

- WCAG 2.1 AA compliance
- Keyboard navigation for all interactive elements
- Focus visible states
- Screen reader announcements for status changes
- 4.5:1 contrast ratio minimum
```

---

## Screen Prompt Template

```markdown
# UX Design Screen Prompt: {Screen Name}

## Context
**Epic**: {Epic Title}
**User Story**: US{N} - {Story Title}
**Priority**: {P1/P2/P3}
**Screen ID**: {ID}

{Design System Specification - abbreviated}

## Screen Purpose

{What user accomplishes here - from acceptance criteria}

## Layout

### Header
- Logo: Company logo (left)
- Navigation: {Relevant nav items}
- User: Avatar with dropdown (right)

### Main Content

{Specific layout based on screen type}

#### For List View:
- Page title with count badge
- Action buttons: "Create New", filters toggle
- Search input with icon
- Filter controls (dropdowns, date pickers)
- Data table/card list:
  - Columns: {List columns with data types}
  - Row actions: Edit, Delete, {Other}
- Pagination controls

#### For Form View:
- Form title and description
- Form sections:
  - Section 1: {Field Group Name}
    - {Field}: {Input type} - {Validation rules}
- Action buttons: Save Draft, Submit, Cancel

#### For Detail View:
- Header with title and status badge
- Action buttons: Edit, Share, Delete
- Content sections with labels and values
- Related items section

## Form Fields (if applicable)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
{Field table}

## States

- **Default**: Populated with sample data
- **Empty**: No data message with CTA button
- **Loading**: Skeleton matching content layout
- **Error**: Error message with retry button

## Mobile Behavior

- Stack layout vertically below 768px
- Full-width inputs
- Bottom-sticky action buttons
- Collapsible sections for long forms
```

---

## Metadata Schema

Create `ux-prompts/{epic}/metadata.json`:

```json
{
  "epic_name": "{epic-name}",
  "epic_number": "{number}",
  "generated_at": "{ISO timestamp}",
  "source_spec": "specs/{epic}/spec.md",
  "style_guide": "[Project Design System]",
  "prompts": {
    "flow": {
      "file": "flow-prompt.md",
      "story_count": "{N}",
      "screen_count": "{N}"
    },
    "screens": [
      {
        "id": "{screen-id}",
        "story": "{story_number}",
        "file": "screens/{screen-id}.md",
        "type": "{list|form|detail|modal|dashboard}"
      }
    ]
  },
  "status": {
    "prompts_ready": true,
    "prototype_generated": false,
    "approved": false
  }
}
```

---

## Output Summary Format

After generating prompts, output:

```markdown
## UX Prompts Generated Successfully

### Epic: {epic-name}

**Prompts Created**:
| Type | File | Screens |
|------|------|---------|
| Flow | flow-prompt.md | {N} |
| Individual | screens/*.md | {N} files |

**Files Created**:
- ux-prompts/{epic}/metadata.json
- ux-prompts/{epic}/flow-prompt.md
- ux-prompts/{epic}/screens/ ({N} files)

### Design Configuration
- Style Guide: [Project Design System]
- Tech Stack: [From plan.md tech stack]
- Mobile-first: Yes
- Accessibility: WCAG 2.1 AA

### Next Steps
1. Review prompts in `ux-prompts/{epic}/`
2. Copy flow-prompt.md to your UX design tool's "Create Flow"
3. Or run `/speckit.uxprototype` for automated generation
```

---

## Error Handling

| Error | Resolution |
|-------|------------|
| No specs found | "No epics found in specs/. Run /speckit.specify first." |
| spec.md missing | Skip epic, warn: "Skipping {epic}: spec.md not found" |
| No user stories | Skip epic, warn: "Skipping {epic}: No user stories in spec.md" |
| Invalid --epic path | "Epic not found: {path}. Available: {list}" |
