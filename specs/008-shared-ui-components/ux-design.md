# UX Design: @dream/ui

**Feature**: 008-shared-ui-components | **Date**: 2026-02-07 | **Spec**: [spec.md](spec.md)

## Overview

This document defines the UX patterns, component hierarchy, layout structures, and interaction flows for the `@dream/ui` component library. All 40+ components follow consistent patterns: skeleton loading → data display → error states → empty states.

## 1. Component Hierarchy

```
DreamUIProvider (branding, apiAdapter, onError)
├── Auth Surface (unauthenticated)
│   └── AuthLayout (centered card, logo, title)
│       ├── LoginForm (fields + social buttons + slots)
│       ├── SignupForm (fields + slots)
│       ├── ForgotPasswordForm (email field)
│       ├── ResetPasswordForm (token + new password)
│       ├── MfaSetup (QR code + verification)
│       └── MfaChallenge (6-digit code entry)
│
├── Layout Components (authenticated, always visible)
│   ├── UserButton (avatar dropdown → profile, security, sign-out)
│   └── OrgSwitcher (current org → dropdown list → search)
│
├── User Profile Surface (authenticated, self-service)
│   ├── UserProfileForm (name, phone, avatar upload)
│   ├── ChangePasswordForm (current + new + confirm)
│   ├── SecuritySettings (MFA status + sessions summary)
│   ├── ActiveSessions (session list + revoke)
│   ├── NotificationPreferences (category toggle matrix)
│   └── ConnectedAccounts (provider list + connect/disconnect)
│
├── Org Management Surface (authenticated, permission-gated)
│   ├── OrgSettingsForm (name, logo, config)
│   ├── MemberList (DataTable + invite button)
│   │   ├── InviteMemberDialog (email + role select)
│   │   └── RoleAssignmentDialog (role select)
│   ├── RoleEditor (role list + permission matrix)
│   └── OrgCreateDialog (name + slug)
│
└── Admin Surface (authenticated, admin-only)
    ├── AuditLogViewer (DataTable + filters + expandable rows)
    │   └── AuditLogFilters (date range, actor, action, resource)
    ├── ApiKeyManager (key list + create/revoke)
    │   └── ApiKeyCreateDialog (name, scopes, expiry)
    ├── WebhookManager (webhook list + create/edit/delete/test)
    │   ├── WebhookCreateDialog (URL + event selection)
    │   └── WebhookTestDialog (event type + result display)
    └── SessionManager (DataTable of all org sessions + revoke)
```

## 2. Layout Patterns

### Auth Layout (unauthenticated pages)

```
┌─────────────────────────────────────────┐
│              (background)               │
│                                         │
│         ┌───────────────────┐           │
│         │    [Logo]         │           │
│         │    Product Name   │           │
│         │                   │           │
│         │  ┌─────────────┐  │           │
│         │  │  Form Area   │  │           │
│         │  │  (slots:     │  │           │
│         │  │   before,    │  │           │
│         │  │   after)     │  │           │
│         │  └─────────────┘  │           │
│         │                   │           │
│         │  [Submit Button]  │           │
│         │                   │           │
│         │  ── or ──         │  ← divider slot
│         │                   │           │
│         │  [Social Buttons] │           │
│         │                   │           │
│         │  (slots: footer)  │           │
│         └───────────────────┘           │
│                                         │
│         Terms · Privacy · Support       │
└─────────────────────────────────────────┘
```

- **Responsive**: Card is `max-w-md` centered. On mobile (<640px), card becomes full-width with padding.
- **Dark mode**: Background shifts to `--dream-color-background`, card to `--dream-color-card`.

### Authenticated Layout (product provides shell)

Products own the layout shell (sidebar, header). `@dream/ui` provides header-embedded components:

```
┌──────────────────────────────────────────────────┐
│  [OrgSwitcher ▼]              [UserButton ●]     │  ← Header
├──────────────────────────────────────────────────┤
│                                                  │
│   ┌──────────────────────────────────────────┐   │
│   │  Page Content                            │   │
│   │  (e.g., MemberList, AuditLogViewer)      │   │
│   └──────────────────────────────────────────┘   │
│                                                  │
└──────────────────────────────────────────────────┘
```

## 3. Interaction Flows

### 3.1 Login Flow

```
[LoginForm loads]
  → Show email + password fields
  → If providers configured: show social buttons below divider
  │
  ├── User types invalid email → Inline validation error (client-side, no network)
  ├── User submits valid credentials
  │   → Button shows spinner + "Signing in..."
  │   ├── Success → onSuccess callback (product redirects)
  │   └── Error (401) → Show error alert above form: "Invalid email or password"
  │   └── Error (429) → Show error alert: "Too many attempts. Try again in X minutes"
  └── User clicks social provider
      → Redirect to provider OAuth flow (handled by @dream/auth)
```

### 3.2 Signup Flow

```
[SignupForm loads]
  → Show name, email, password, confirm password fields
  → slots.beforeFields renders (e.g., invitation context)
  → slots.afterFields renders (e.g., TOS checkbox)
  │
  ├── User enters weak password → Inline strength indicator + requirements list
  ├── Passwords don't match → Inline error on confirm field
  ├── User submits valid form
  │   → Button shows spinner
  │   ├── Success → onSuccess callback
  │   └── Error (409 email exists) → "An account with this email already exists"
  └── invitationToken provided → Pre-fill email (read-only), skip email verification
```

### 3.3 MFA Setup Flow

```
[MfaSetup loads]
  → Call adapter.initiateMfaSetup()
  → Display QR code + manual secret key
  │
  ├── User scans QR and enters 6-digit code
  │   → Call adapter.verifyMfaSetup(code)
  │   ├── Valid → Show backup codes (copy all button) → onComplete(backupCodes)
  │   └── Invalid → "Invalid code. Please try again." (inline error)
  └── User clicks "Skip" (if onSkip provided)
      → onSkip callback (product decides what happens)
```

### 3.4 Member Management Flow

```
[MemberList loads]
  → Show skeleton rows (3-5 placeholder rows)
  → Call adapter.listMembers({ page: 1, pageSize })
  → Render DataTable: Name | Email | Role (badge) | Actions
  │
  ├── [Permission: invitations:create] → Show "Invite Member" button
  │   → Opens InviteMemberDialog
  │   → Email input + Role dropdown (from adapter.listRoles())
  │   → Submit → adapter.createInvitation() → Toast: "Invitation sent to {email}"
  │
  ├── [Permission: users:write] → Show role change button per row
  │   → Opens RoleAssignmentDialog
  │   → Role dropdown (filtered by hierarchy) → Submit → Toast: "Role updated"
  │
  ├── [Permission: users:delete] → Show remove button per row
  │   → Confirmation dialog: "Remove {name} from {org}?"
  │   → Confirm → adapter.removeMember() → Toast: "Member removed"
  │
  └── Pagination → Next/Prev buttons → adapter.listMembers({ page: N })
```

### 3.5 Audit Log Flow

```
[AuditLogViewer loads]
  → Show skeleton table
  → Call adapter.listAuditEvents(defaultFilters)
  → Render DataTable: Timestamp | Actor | Action | Resource | IP
  │
  ├── Filter bar (AuditLogFilters):
  │   → Date range picker (from/to)
  │   → Actor search (text input)
  │   → Action type dropdown
  │   → Resource type dropdown
  │   → Apply → re-fetch with new params
  │
  ├── Click row → Expand to show:
  │   → Metadata key-value pairs
  │   → Before/After diff (if changes present)
  │   → Formatted as side-by-side comparison
  │
  └── Pagination → Offset-based (page 1, 2, 3...)
```

### 3.6 UserButton Interaction

```
[UserButton renders]
  → Show avatar (or initials fallback) + chevron
  │
  └── Click → Dropdown opens:
      ┌──────────────────┐
      │ Jane Smith       │
      │ jane@example.com │
      ├──────────────────┤
      │ Profile          │  → Navigate to profile page
      │ Security         │  → Navigate to security page
      │ {slots.menuItems}│  → Product custom items
      ├──────────────────┤
      │ Sign out         │  → useAuth().signOut() → afterSignOut()
      └──────────────────┘
```

### 3.7 OrgSwitcher Interaction

```
[OrgSwitcher renders]
  → Show current org name + logo + chevron
  │
  └── Click → Popover opens:
      ┌──────────────────┐
      │ 🔍 Search...     │  ← Shown when > 10 orgs
      ├──────────────────┤
      │ ✓ Acme Corp      │  ← Current (highlighted)
      │   Beta Inc        │
      │   Gamma LLC       │
      ├──────────────────┤
      │ + Create org      │  → Opens OrgCreateDialog
      └──────────────────┘

      Click org → useTenant().switchOrganization(orgId) → afterSwitch(org)
      → All data components re-fetch for new tenant scope
```

## 4. State Patterns (all data components)

Every data-fetching component follows this state machine:

```
[Mount] → Loading → Success | Error | Empty

Loading:  Skeleton shimmer matching final layout dimensions
Success:  Render data (table, form, list)
Error:    Alert banner with retry button + onError callback
Empty:    Illustration + message + CTA button
          e.g., "No members yet" + "Invite your first member"
```

### Loading Skeletons

- **Table components** (MemberList, AuditLogViewer, SessionManager): 5 skeleton rows with shimmer animation
- **Form components** (OrgSettingsForm, UserProfileForm): Skeleton inputs matching field layout
- **Card components** (ApiKeyManager, WebhookManager): 3 skeleton cards

### Error States

```
┌──────────────────────────────────────┐
│ ⚠ Something went wrong              │
│                                      │
│ Unable to load members.              │
│ [Try again]                          │
└──────────────────────────────────────┘
```

- Error alert uses `--dream-color-destructive`
- "Try again" re-invokes the adapter method
- `onError` callback fires with `{ component, errorType, action, error }`

### Empty States

```
┌──────────────────────────────────────┐
│                                      │
│         [illustration/icon]          │
│                                      │
│       No members yet                 │
│                                      │
│  Invite team members to get started  │
│                                      │
│       [Invite Member]                │
│                                      │
└──────────────────────────────────────┘
```

## 5. Responsive Breakpoints

| Breakpoint | Width | Applies To |
|------------|-------|------------|
| Mobile | 320px–639px | Auth forms, UserProfileForm, ChangePasswordForm |
| Tablet | 640px–767px | Auth forms, profile pages (2-column where appropriate) |
| Desktop | 768px+ | All components including admin tables |

### Auth Forms (responsive)

- **Mobile (320-639px)**: Single column, full-width inputs, stacked social buttons
- **Tablet (640-767px)**: Single column with wider max-width (480px)
- **Desktop (768px+)**: Centered card (max-w-md = 448px)

### Admin Tables (desktop-only)

- **Below 768px**: Show message "This view is optimized for desktop. Please use a wider screen."
- **768px-1023px**: Compact table (hide optional columns like IP address)
- **1024px+**: Full table with all columns

## 6. Toast Notifications

Using `sonner` for all transient feedback:

| Action | Toast Type | Message Pattern |
|--------|-----------|-----------------|
| Create | success | "{Entity} created successfully" |
| Update | success | "{Entity} updated" |
| Delete | success | "{Entity} removed" |
| Invite | success | "Invitation sent to {email}" |
| Revoke | success | "{Entity} revoked" |
| Copy | success | "Copied to clipboard" |
| Error | error | "Failed to {action}. Please try again." |

Position: bottom-right. Duration: 4 seconds (success), 6 seconds (error).

## 7. Form Validation Patterns

All forms use `react-hook-form` + Zod schemas from `@dream/types`:

1. **Client-side validation**: Runs on blur and on submit. Shows inline errors below each field.
2. **Server-side errors**: Mapped from API adapter errors to field-level or form-level errors.
3. **Submit button**: Disabled while submitting (shows spinner). Disabled if form is pristine and unmodified.

### Validation Error Display

```
┌──────────────────────────────────────┐
│ Email                                │
│ ┌──────────────────────────────────┐ │
│ │ not-an-email                     │ │
│ └──────────────────────────────────┘ │
│ ⚠ Please enter a valid email address │  ← --dream-color-destructive
│                                      │
│ Password                             │
│ ┌──────────────────────────────────┐ │
│ │ ••••                             │ │
│ └──────────────────────────────────┘ │
│ ⚠ Password must be at least 8 chars  │
└──────────────────────────────────────┘
```

## 8. Permission Gating UX

Components that require specific permissions use `@dream/rbac` hooks internally:

- **Has permission**: Render normally
- **Lacks permission (read context)**: Hide action buttons, show data read-only
- **Lacks permission (entire component)**: Render nothing or show "You don't have access" fallback
- **Outside required provider**: Development-time console error + fallback UI

Permission checks are performed **before** any API calls to avoid unnecessary network requests.

## 9. Accessibility Requirements

- **Focus management**: When dialogs open, focus moves to first focusable element. When closed, focus returns to trigger.
- **Keyboard navigation**: All interactive elements reachable via Tab. Enter/Space to activate. Escape to close dialogs/dropdowns.
- **Screen readers**: All form inputs have associated labels. Status changes announced via `aria-live` regions. Loading states announced.
- **Color contrast**: All text meets WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text) in both light and dark modes.
- **Motion**: Skeleton animations and transitions respect `prefers-reduced-motion`.
