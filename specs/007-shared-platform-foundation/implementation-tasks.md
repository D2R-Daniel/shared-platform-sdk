# Implementation Tasks: Shared Platform Foundation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build 5 shared TypeScript packages (@dream/types, @dream/auth, @dream/rbac, @dream/multi-tenant, @dream/errors) providing unified foundation for 5 SaaS products.

**Architecture:** Monorepo with npm workspaces under `packages/dream/`. Each package independently tested, typechecked, and built. TDD throughout — every implementation step starts with a failing test.

**Tech Stack:** TypeScript 5+, Vitest, Zod, jose, React 18-19, NextAuth v5-beta

**Plan document:** [plan.md](plan.md) — Contains technical context, constitution check, and project structure.
**Specification:** [spec.md](spec.md) — Feature requirements, user stories, success criteria.

---



<!-- ═══ Tasks 1-8: Monorepo Setup + @dream/types ═══ -->



# Task 1: Initialize monorepo workspace

## What you're building

A monorepo with npm workspaces containing 5 packages: `@dream/types`, `@dream/auth`, `@dream/rbac`, `@dream/multi-tenant`, `@dream/errors`. All packages live under `packages/dream/`.

## Step 1: Add workspace config to root package.json

First, check if a root `package.json` exists:

```bash
cat package.json
```

If it exists, add the workspaces field. If not, create it.

**Edit `package.json`** (root) — add this field at the top level:

```json
{
  "workspaces": ["packages/dream/*"]
}
```

If no root `package.json` exists, create it:

```json
{
  "name": "shared-platform-sdk",
  "private": true,
  "workspaces": ["packages/dream/*"]
}
```

## Step 2: Create directory structure

```bash
mkdir -p packages/dream/types
mkdir -p packages/dream/auth
mkdir -p packages/dream/rbac
mkdir -p packages/dream/multi-tenant
mkdir -p packages/dream/errors
```

## Step 3: Create `packages/dream/types/package.json`

```json
{
  "name": "@dream/types",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./schemas": { "types": "./dist/schemas/index.d.ts", "import": "./dist/schemas/index.js" },
    "./drizzle": { "types": "./dist/drizzle/index.d.ts", "import": "./dist/drizzle/index.js" },
    "./prisma": { "types": "./dist/prisma/index.d.ts", "import": "./dist/prisma/index.js" },
    "./auth": { "types": "./dist/auth.d.ts", "import": "./dist/auth.js" }
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "peerDependencies": {
    "zod": "^3.0.0"
  },
  "peerDependenciesMeta": {
    "zod": { "optional": true }
  }
}
```

## Step 4: Create `packages/dream/auth/package.json`

```json
{
  "name": "@dream/auth",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" }
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "dependencies": {
    "@dream/types": "0.1.0"
  }
}
```

## Step 5: Create `packages/dream/rbac/package.json`

```json
{
  "name": "@dream/rbac",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" }
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "dependencies": {
    "@dream/types": "0.1.0"
  }
}
```

## Step 6: Create `packages/dream/multi-tenant/package.json`

```json
{
  "name": "@dream/multi-tenant",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" }
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "dependencies": {
    "@dream/types": "0.1.0"
  }
}
```

## Step 7: Create `packages/dream/errors/package.json`

```json
{
  "name": "@dream/errors",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" }
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "dependencies": {
    "@dream/types": "0.1.0"
  }
}
```

## Step 8: Create `packages/dream/types/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src"],
  "exclude": ["dist", "tests", "node_modules"]
}
```

## Step 9: Create `packages/dream/types/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
```

## Step 10: Install dependencies

```bash
npm install
```

**Expected output:** Workspace links created, `node_modules` populated, no errors. You should see output indicating the 5 workspace packages were linked.

## Step 11: Install zod as a dev dependency for testing schemas

```bash
cd packages/dream/types && npm install --save-dev zod@^3.0.0
```

**Expected output:** zod added to devDependencies.

## Step 12: Commit

```bash
git add package.json packages/dream/*/package.json packages/dream/types/tsconfig.json packages/dream/types/vitest.config.ts package-lock.json
git commit -m "feat(dream): initialize monorepo workspace for 5 @dream/* packages"
```

---

# Task 2: Create @dream/types -- Core entity types (User, Organization)

## What you're building

The `User` and `Organization` TypeScript interfaces -- the two most fundamental entity types in the platform.

## Step 1: Create `packages/dream/types/src/` directory

```bash
mkdir -p packages/dream/types/src
mkdir -p packages/dream/types/tests
```

## Step 2: Write failing test for User types

**Create `packages/dream/types/tests/users.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';
import type { User, UserStatus, UserCreateInput, UserUpdateInput } from '../src/users';

describe('User types', () => {
  it('User has required fields', () => {
    const user: User = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'alice@acme.com',
      name: 'Alice',
      status: 'active',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(user.id).toBeDefined();
    expect(user.email).toBe('alice@acme.com');
  });

  it('UserStatus is a union of valid statuses', () => {
    const statuses: UserStatus[] = ['active', 'suspended', 'deleted'];
    expect(statuses).toHaveLength(3);
  });

  it('User has optional fields', () => {
    const user: User = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'alice@acme.com',
      name: 'Alice',
      phone: '+14155551234',
      avatarUrl: 'https://example.com/avatar.jpg',
      status: 'active',
      emailVerified: true,
      metadata: { employeeId: 'EMP001' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(user.phone).toBe('+14155551234');
  });

  it('UserCreateInput omits auto-generated fields', () => {
    const input: UserCreateInput = {
      email: 'bob@acme.com',
      name: 'Bob',
    };
    expect(input.email).toBe('bob@acme.com');
  });
});
```

## Step 3: Run test -- verify it fails

```bash
cd packages/dream/types && npx vitest run tests/users.test.ts
```

**Expected output:** FAIL -- cannot find module `../src/users`.

## Step 4: Implement User types

**Create `packages/dream/types/src/users.ts`:**

```typescript
export type UserStatus = 'active' | 'suspended' | 'deleted';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  status: UserStatus;
  emailVerified: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateInput {
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface UserUpdateInput {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  status?: UserStatus;
  metadata?: Record<string, unknown>;
}
```

## Step 5: Run test -- verify it passes

```bash
cd packages/dream/types && npx vitest run tests/users.test.ts
```

**Expected output:**

```
 ✓ tests/users.test.ts (4)
   ✓ User types (4)
     ✓ User has required fields
     ✓ UserStatus is a union of valid statuses
     ✓ User has optional fields
     ✓ UserCreateInput omits auto-generated fields

 Test Files  1 passed (1)
 Tests  4 passed (4)
```

## Step 6: Write failing test for Organization types

**Create `packages/dream/types/tests/organizations.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';
import type { Organization, OrganizationStatus, OrgCreateInput, OrgUpdateInput } from '../src/organizations';

describe('Organization types', () => {
  it('Organization has required fields', () => {
    const org: Organization = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Acme Corp',
      slug: 'acme-corp',
      status: 'active',
      planTier: 'professional',
      currency: 'USD',
      region: 'us-east',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(org.slug).toBe('acme-corp');
  });

  it('OrganizationStatus has 3 valid values', () => {
    const statuses: OrganizationStatus[] = ['active', 'suspended', 'archived'];
    expect(statuses).toHaveLength(3);
  });

  it('Organization supports Indian market fields', () => {
    const org: Organization = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Tata Tech',
      slug: 'tata-tech',
      status: 'active',
      planTier: 'enterprise',
      currency: 'INR',
      region: 'in-mumbai',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(org.currency).toBe('INR');
    expect(org.region).toBe('in-mumbai');
  });

  it('OrgCreateInput requires name and slug', () => {
    const input: OrgCreateInput = {
      name: 'New Corp',
      slug: 'new-corp',
    };
    expect(input.name).toBe('New Corp');
  });
});
```

## Step 7: Run test -- verify it fails

```bash
cd packages/dream/types && npx vitest run tests/organizations.test.ts
```

**Expected output:** FAIL -- cannot find module `../src/organizations`.

## Step 8: Implement Organization types

**Create `packages/dream/types/src/organizations.ts`:**

```typescript
export type OrganizationStatus = 'active' | 'suspended' | 'archived';
export type Currency = 'USD' | 'INR' | 'EUR' | 'GBP';
export type Region = 'us-east' | 'eu-west' | 'in-mumbai' | 'ap-singapore';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  planTier: string;
  logoUrl?: string;
  primaryColor?: string;
  domain?: string;
  currency: Currency;
  region: Region;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrgCreateInput {
  name: string;
  slug: string;
  planTier?: string;
  logoUrl?: string;
  primaryColor?: string;
  domain?: string;
  currency?: Currency;
  region?: Region;
  metadata?: Record<string, unknown>;
}

export interface OrgUpdateInput {
  name?: string;
  logoUrl?: string;
  primaryColor?: string;
  domain?: string;
  planTier?: string;
  metadata?: Record<string, unknown>;
}
```

## Step 9: Run test -- verify it passes

```bash
cd packages/dream/types && npx vitest run tests/organizations.test.ts
```

**Expected output:**

```
 ✓ tests/organizations.test.ts (4)
   ✓ Organization types (4)
     ✓ Organization has required fields
     ✓ OrganizationStatus has 3 valid values
     ✓ Organization supports Indian market fields
     ✓ OrgCreateInput requires name and slug

 Test Files  1 passed (1)
 Tests  4 passed (4)
```

## Step 10: Commit

```bash
git add packages/dream/types/src/users.ts packages/dream/types/src/organizations.ts packages/dream/types/tests/users.test.ts packages/dream/types/tests/organizations.test.ts
git commit -m "feat(types): add User and Organization entity types"
```

---

# Task 3: Create @dream/types -- Role, Permission, and Membership types

## What you're building

The authorization model types: roles with hierarchy levels, granular permissions, and the join table between users and organizations (memberships).

## Step 1: Write failing test

**Create `packages/dream/types/tests/roles.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';
import type { Role, BuiltInRole, RoleSlug, CustomRole, RoleCreateInput } from '../src/roles';
import type { Permission, PermissionString } from '../src/permissions';
import type { OrganizationMembership } from '../src/memberships';

describe('Role types', () => {
  it('Role has hierarchy level', () => {
    const role: Role = {
      id: '1',
      name: 'Admin',
      slug: 'admin',
      hierarchyLevel: 10,
      isBuiltIn: true,
      isActive: true,
      organizationId: null,
      permissions: ['users:*', 'roles:*'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(role.hierarchyLevel).toBe(10);
  });

  it('BuiltInRole is a union of 5 roles', () => {
    const roles: BuiltInRole[] = ['super_admin', 'admin', 'manager', 'user', 'guest'];
    expect(roles).toHaveLength(5);
  });

  it('PermissionString matches resource:action format', () => {
    const perm: PermissionString = 'users:read';
    expect(perm).toBe('users:read');
  });

  it('OrganizationMembership links user to org', () => {
    const membership: OrganizationMembership = {
      id: '1',
      userId: 'user-1',
      organizationId: 'org-1',
      joinedAt: new Date(),
    };
    expect(membership.userId).toBe('user-1');
  });
});
```

## Step 2: Run test -- verify it fails

```bash
cd packages/dream/types && npx vitest run tests/roles.test.ts
```

**Expected output:** FAIL -- cannot find module `../src/roles`.

## Step 3: Implement Permission types

**Create `packages/dream/types/src/permissions.ts`:**

```typescript
export type PermissionString = string;

export interface Permission {
  resource: string;
  action: string;
}
```

## Step 4: Implement Role types

**Create `packages/dream/types/src/roles.ts`:**

```typescript
export type BuiltInRole = 'super_admin' | 'admin' | 'manager' | 'user' | 'guest';

export type RoleSlug = BuiltInRole | string;

export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
  hierarchyLevel: number;
  isBuiltIn: boolean;
  isActive: boolean;
  organizationId: string | null;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomRole {
  slug: string;
  name: string;
  hierarchyLevel: number;
  permissions: string[];
  organizationId?: string;
}

export interface RoleCreateInput {
  name: string;
  slug: string;
  description?: string;
  hierarchyLevel: number;
  permissions: string[];
  organizationId?: string;
}
```

## Step 5: Implement Membership types

**Create `packages/dream/types/src/memberships.ts`:**

```typescript
export interface OrganizationMembership {
  id: string;
  userId: string;
  organizationId: string;
  joinedAt: Date;
  invitedBy?: string;
}

export interface RoleAssignment {
  id: string;
  membershipId: string;
  roleId: string;
  isActive: boolean;
  assignedBy: string;
  assignedAt: Date;
}
```

## Step 6: Run test -- verify it passes

```bash
cd packages/dream/types && npx vitest run tests/roles.test.ts
```

**Expected output:**

```
 ✓ tests/roles.test.ts (4)
   ✓ Role types (4)
     ✓ Role has hierarchy level
     ✓ BuiltInRole is a union of 5 roles
     ✓ PermissionString matches resource:action format
     ✓ OrganizationMembership links user to org

 Test Files  1 passed (1)
 Tests  4 passed (4)
```

## Step 7: Commit

```bash
git add packages/dream/types/src/roles.ts packages/dream/types/src/permissions.ts packages/dream/types/src/memberships.ts packages/dream/types/tests/roles.test.ts
git commit -m "feat(types): add Role, Permission, and Membership types"
```

---

# Task 4: Create @dream/types -- Session, Audit, Invitation, SSO, Team, Department types

## What you're building

The remaining entity types that round out the platform foundation: session/JWT tokens, audit logging, invitations, SSO accounts, teams, and departments.

## Step 1: Write failing tests

**Create `packages/dream/types/tests/sessions.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';
import type { Session, SessionUser, JWTPayload } from '../src/sessions';

describe('Session types', () => {
  it('SessionUser has JWT-embedded fields', () => {
    const user: SessionUser = {
      id: 'usr-1',
      email: 'alice@acme.com',
      name: 'Alice',
      tenantId: 'org-1',
      roleSlugs: ['admin'],
      activeRole: 'admin',
      permissions: ['users:*'],
      tenantStatus: 'active',
    };
    expect(user.tenantId).toBe('org-1');
    expect(user.permissions).toContain('users:*');
  });

  it('JWTPayload includes auth provider', () => {
    const payload: JWTPayload = {
      sub: 'usr-1',
      email: 'alice@acme.com',
      name: 'Alice',
      tenantId: 'org-1',
      roles: ['admin'],
      activeRole: 'admin',
      permissions: ['users:*'],
      planTier: 'enterprise',
      tenantStatus: 'active',
      authProvider: 'azure-entra',
      iat: Date.now(),
      exp: Date.now() + 28800,
    };
    expect(payload.authProvider).toBe('azure-entra');
  });
});
```

**Create `packages/dream/types/tests/audit.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';
import type { AuditEvent, AuditEventType, AuditQueryParams } from '../src/audit';

describe('AuditEvent types', () => {
  it('AuditEvent has required fields', () => {
    const event: AuditEvent = {
      id: 'evt-1',
      tenantId: 'org-1',
      actorId: 'usr-1',
      actorEmail: 'alice@acme.com',
      action: 'user.created',
      resourceType: 'user',
      resourceId: 'usr-2',
      ipAddress: '192.168.1.1',
      requestId: 'req-1',
      timestamp: new Date(),
    };
    expect(event.action).toBe('user.created');
  });

  it('AuditEvent has optional before/after state', () => {
    const event: AuditEvent = {
      id: 'evt-1',
      tenantId: 'org-1',
      actorId: 'usr-1',
      actorEmail: 'alice@acme.com',
      action: 'user.updated',
      resourceType: 'user',
      resourceId: 'usr-2',
      beforeState: { name: 'Old Name' },
      afterState: { name: 'New Name' },
      ipAddress: '192.168.1.1',
      requestId: 'req-1',
      timestamp: new Date(),
    };
    expect(event.beforeState).toEqual({ name: 'Old Name' });
  });
});
```

## Step 2: Run tests -- verify they fail

```bash
cd packages/dream/types && npx vitest run tests/sessions.test.ts tests/audit.test.ts
```

**Expected output:** FAIL -- cannot find modules.

## Step 3: Implement Session types

**Create `packages/dream/types/src/sessions.ts`:**

```typescript
import type { OrganizationStatus } from './organizations';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  roleSlugs: string[];
  activeRole: string;
  permissions: string[];
  tenantStatus: OrganizationStatus;
}

export interface Session {
  userId: string;
  email: string;
  name: string;
  tenantId: string;
  roleSlugs: string[];
  activeRole: string;
  permissions: string[];
  tenantStatus: OrganizationStatus;
}

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  tenantId: string;
  roles: string[];
  activeRole: string;
  permissions: string[];
  planTier: string;
  tenantStatus: string;
  authProvider: string;
  iat: number;
  exp: number;
}
```

## Step 4: Implement Audit types

**Create `packages/dream/types/src/audit.ts`:**

```typescript
export type AuditEventType =
  | 'auth.login' | 'auth.logout' | 'auth.lockout' | 'auth.unlock'
  | 'user.created' | 'user.updated' | 'user.suspended' | 'user.deleted'
  | 'role.created' | 'role.updated' | 'role.assigned' | 'role.unassigned'
  | 'organization.created' | 'organization.updated' | 'organization.suspended'
  | 'team.created' | 'team.updated' | 'team.member_added' | 'team.member_removed'
  | 'invitation.created' | 'invitation.accepted' | 'invitation.revoked'
  | string; // Allow product-specific events

export interface AuditEvent {
  id: string;
  tenantId: string;
  actorId: string;
  actorEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  ipAddress: string;
  requestId: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface AuditQueryParams {
  tenantId: string;
  startDate?: Date;
  endDate?: Date;
  actorId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  page?: number;
  pageSize?: number;
}
```

## Step 5: Implement Invitation types

**Create `packages/dream/types/src/invitations.ts`:**

```typescript
export type InvitationType = 'organization' | 'team' | 'product';
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface Invitation {
  id: string;
  organizationId: string;
  inviterId: string;
  inviteeEmail: string;
  type: InvitationType;
  teamId?: string;
  roleId: string;
  status: InvitationStatus;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}
```

## Step 6: Implement SSO types

**Create `packages/dream/types/src/sso.ts`:**

```typescript
export type SSOProvider = 'azure-entra' | 'google' | 'generic-oidc';

export interface SSOAccount {
  id: string;
  userId: string;
  provider: SSOProvider;
  providerAccountId: string;
  providerData?: Record<string, unknown>;
  createdAt: Date;
}
```

## Step 7: Implement Team types

**Create `packages/dream/types/src/teams.ts`:**

```typescript
export interface Team {
  id: string;
  name: string;
  slug: string;
  organizationId: string;
  ownerId: string;
  parentTeamId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type TeamMemberRole = 'owner' | 'admin' | 'member';

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamMemberRole;
  joinedAt: Date;
  invitedBy?: string;
}

export interface TeamCreateInput {
  name: string;
  slug: string;
  organizationId: string;
  ownerId: string;
  parentTeamId?: string;
  metadata?: Record<string, unknown>;
}
```

## Step 8: Implement Department types

**Create `packages/dream/types/src/departments.ts`:**

```typescript
export interface Department {
  id: string;
  name: string;
  organizationId: string;
  headUserId?: string;
  parentDepartmentId?: string;
  path: string;
  level: number;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentCreateInput {
  name: string;
  organizationId: string;
  headUserId?: string;
  parentDepartmentId?: string;
}
```

## Step 9: Run all tests -- verify they pass

```bash
cd packages/dream/types && npx vitest run
```

**Expected output:**

```
 ✓ tests/users.test.ts (4)
 ✓ tests/organizations.test.ts (4)
 ✓ tests/roles.test.ts (4)
 ✓ tests/sessions.test.ts (2)
 ✓ tests/audit.test.ts (2)

 Test Files  5 passed (5)
 Tests  16 passed (16)
```

## Step 10: Commit

```bash
git add packages/dream/types/src/sessions.ts packages/dream/types/src/audit.ts packages/dream/types/src/invitations.ts packages/dream/types/src/sso.ts packages/dream/types/src/teams.ts packages/dream/types/src/departments.ts packages/dream/types/tests/sessions.test.ts packages/dream/types/tests/audit.test.ts
git commit -m "feat(types): add Session, AuditEvent, Invitation, SSO, Team, Department types"
```

---

# Task 5: Create @dream/types -- Response types and pagination

## What you're building

Generic response wrappers (`ApiResponse<T>`, `ApiErrorResponse`) and pagination types (offset-based and cursor-based) that every API endpoint will use.

## Step 1: Write failing test

**Create `packages/dream/types/tests/responses.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';
import type { ApiResponse, ApiErrorResponse, PaginatedResponse, CursorPaginatedResponse } from '../src/responses';

describe('Response types', () => {
  it('ApiResponse wraps data with success: true', () => {
    const response: ApiResponse<{ name: string }> = {
      success: true,
      data: { name: 'Alice' },
    };
    expect(response.success).toBe(true);
    expect(response.data.name).toBe('Alice');
  });

  it('ApiErrorResponse has structured error object', () => {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: 'users/not-found',
        message: 'User not found',
        userMessage: 'The user could not be found.',
        requestId: 'req-123',
      },
    };
    expect(response.success).toBe(false);
    expect(response.error.code).toBe('users/not-found');
  });

  it('PaginatedResponse includes pagination metadata', () => {
    const response: PaginatedResponse<string> = {
      success: true,
      data: ['a', 'b'],
      pagination: {
        page: 1,
        pageSize: 20,
        totalItems: 50,
        totalPages: 3,
        hasNext: true,
        hasPrevious: false,
      },
    };
    expect(response.pagination.totalPages).toBe(3);
  });

  it('CursorPaginatedResponse has cursor', () => {
    const response: CursorPaginatedResponse<string> = {
      success: true,
      data: ['a'],
      hasMore: true,
      nextCursor: 'cursor-abc',
    };
    expect(response.hasMore).toBe(true);
  });
});
```

## Step 2: Run test -- verify it fails

```bash
cd packages/dream/types && npx vitest run tests/responses.test.ts
```

**Expected output:** FAIL -- cannot find module `../src/responses`.

## Step 3: Implement Response types

**Create `packages/dream/types/src/responses.ts`:**

```typescript
export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    userMessage: string;
    requestId: string;
    param?: string;
  };
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface CursorPaginatedResponse<T> {
  success: true;
  data: T[];
  hasMore: boolean;
  nextCursor: string | null;
}
```

## Step 4: Implement Pagination types

**Create `packages/dream/types/src/pagination.ts`:**

```typescript
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}
```

## Step 5: Run test -- verify it passes

```bash
cd packages/dream/types && npx vitest run tests/responses.test.ts
```

**Expected output:**

```
 ✓ tests/responses.test.ts (4)
   ✓ Response types (4)
     ✓ ApiResponse wraps data with success: true
     ✓ ApiErrorResponse has structured error object
     ✓ PaginatedResponse includes pagination metadata
     ✓ CursorPaginatedResponse has cursor

 Test Files  1 passed (1)
 Tests  4 passed (4)
```

## Step 6: Commit

```bash
git add packages/dream/types/src/responses.ts packages/dream/types/src/pagination.ts packages/dream/types/tests/responses.test.ts
git commit -m "feat(types): add response types and pagination"
```

---

# Task 6: Create @dream/types -- Barrel export (index.ts)

## What you're building

A single `index.ts` that re-exports every type from every module file, so consumers can do `import type { User, Role, Session } from '@dream/types'`.

## Step 1: Write failing test

**Create `packages/dream/types/tests/index.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';

describe('@dream/types barrel export', () => {
  it('exports User type', async () => {
    const mod = await import('../src/index');
    // Type-only exports won't show up in runtime. We verify the module loads.
    expect(mod).toBeDefined();
  });
});
```

## Step 2: Run test -- verify it fails

```bash
cd packages/dream/types && npx vitest run tests/index.test.ts
```

**Expected output:** FAIL -- cannot find module `../src/index`.

## Step 3: Implement barrel export

**Create `packages/dream/types/src/index.ts`:**

```typescript
// Core entity types
export type { User, UserStatus, UserCreateInput, UserUpdateInput } from './users';
export type { Organization, OrganizationStatus, Currency, Region, OrgCreateInput, OrgUpdateInput } from './organizations';
export type { OrganizationMembership, RoleAssignment } from './memberships';
export type { Role, RoleSlug, BuiltInRole, CustomRole, RoleCreateInput } from './roles';
export type { Permission, PermissionString } from './permissions';
export type { Team, TeamMember, TeamMemberRole, TeamCreateInput } from './teams';
export type { Department, DepartmentCreateInput } from './departments';
export type { Session, SessionUser, JWTPayload } from './sessions';
export type { AuditEvent, AuditEventType, AuditQueryParams } from './audit';
export type { Invitation, InvitationType, InvitationStatus } from './invitations';
export type { SSOAccount, SSOProvider } from './sso';

// Response types
export type { ApiResponse, ApiErrorResponse, PaginatedResponse, CursorPaginatedResponse } from './responses';
export type { PaginationParams, CursorPaginationParams } from './pagination';
```

## Step 4: Run test -- verify it passes

```bash
cd packages/dream/types && npx vitest run tests/index.test.ts
```

**Expected output:**

```
 ✓ tests/index.test.ts (1)
   ✓ @dream/types barrel export (1)
     ✓ exports User type

 Test Files  1 passed (1)
 Tests  1 passed (1)
```

## Step 5: Run typecheck to verify all imports resolve

```bash
cd packages/dream/types && npx tsc --noEmit
```

**Expected output:** No errors (exit code 0, no output).

## Step 6: Commit

```bash
git add packages/dream/types/src/index.ts packages/dream/types/tests/index.test.ts
git commit -m "feat(types): add barrel export"
```

---

# Task 7: Create @dream/types -- Zod schemas

## What you're building

Runtime validation schemas using Zod for User, Organization, and Role. These live under `src/schemas/` and are exported via the `@dream/types/schemas` sub-path.

## Step 1: Create schemas directory

```bash
mkdir -p packages/dream/types/src/schemas
```

## Step 2: Write failing test

**Create `packages/dream/types/tests/schemas.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';
import { userSchema, userCreateSchema, organizationSchema, roleSchema } from '../src/schemas/index';

describe('Zod schemas', () => {
  describe('userSchema', () => {
    it('validates a correct user', () => {
      const result = userSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'alice@acme.com',
        name: 'Alice',
        status: 'active',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = userSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'not-an-email',
        name: 'Alice',
        status: 'active',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid status', () => {
      const result = userSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'alice@acme.com',
        name: 'Alice',
        status: 'invalid',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('userCreateSchema', () => {
    it('validates minimal create input', () => {
      const result = userCreateSchema.safeParse({
        email: 'bob@acme.com',
        name: 'Bob',
      });
      expect(result.success).toBe(true);
    });

    it('validates phone in E.164 format', () => {
      const result = userCreateSchema.safeParse({
        email: 'bob@acme.com',
        name: 'Bob',
        phone: '+14155551234',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid phone format', () => {
      const result = userCreateSchema.safeParse({
        email: 'bob@acme.com',
        name: 'Bob',
        phone: '555-1234',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('organizationSchema', () => {
    it('validates organization with required fields', () => {
      const result = organizationSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Acme Corp',
        slug: 'acme-corp',
        status: 'active',
        planTier: 'professional',
        currency: 'USD',
        region: 'us-east',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid slug format', () => {
      const result = organizationSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Acme Corp',
        slug: 'INVALID SLUG!',
        status: 'active',
        planTier: 'professional',
        currency: 'USD',
        region: 'us-east',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('roleSchema', () => {
    it('validates a role with permissions array', () => {
      const result = roleSchema.safeParse({
        id: '1',
        name: 'Admin',
        slug: 'admin',
        hierarchyLevel: 10,
        isBuiltIn: true,
        isActive: true,
        organizationId: null,
        permissions: ['users:*', 'roles:*'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(result.success).toBe(true);
    });

    it('rejects hierarchy level below 0', () => {
      const result = roleSchema.safeParse({
        id: '1',
        name: 'Admin',
        slug: 'admin',
        hierarchyLevel: -1,
        isBuiltIn: true,
        isActive: true,
        organizationId: null,
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(result.success).toBe(false);
    });

    it('rejects hierarchy level above 100', () => {
      const result = roleSchema.safeParse({
        id: '1',
        name: 'Admin',
        slug: 'admin',
        hierarchyLevel: 101,
        isBuiltIn: true,
        isActive: true,
        organizationId: null,
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(result.success).toBe(false);
    });
  });
});
```

## Step 3: Run test -- verify it fails

```bash
cd packages/dream/types && npx vitest run tests/schemas.test.ts
```

**Expected output:** FAIL -- cannot find module `../src/schemas/index`.

## Step 4: Implement User schema

**Create `packages/dream/types/src/schemas/user.schema.ts`:**

```typescript
import { z } from 'zod';

export const userStatusSchema = z.enum(['active', 'suspended', 'deleted']);

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().max(255),
  name: z.string().min(1).max(255),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  avatarUrl: z.string().url().optional(),
  status: userStatusSchema,
  emailVerified: z.boolean(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const userCreateSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(255),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  avatarUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  avatarUrl: z.string().url().optional(),
  status: userStatusSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});
```

## Step 5: Implement Organization schema

**Create `packages/dream/types/src/schemas/organization.schema.ts`:**

```typescript
import { z } from 'zod';

export const orgStatusSchema = z.enum(['active', 'suspended', 'archived']);
export const currencySchema = z.enum(['USD', 'INR', 'EUR', 'GBP']);
export const regionSchema = z.enum(['us-east', 'eu-west', 'in-mumbai', 'ap-singapore']);

export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(63).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  status: orgStatusSchema,
  planTier: z.string(),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  domain: z.string().optional(),
  currency: currencySchema,
  region: regionSchema,
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const orgCreateSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(63).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  planTier: z.string().optional(),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  domain: z.string().optional(),
  currency: currencySchema.optional(),
  region: regionSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});
```

## Step 6: Implement Role schema

**Create `packages/dream/types/src/schemas/role.schema.ts`:**

```typescript
import { z } from 'zod';

export const permissionStringSchema = z.string().regex(/^(\*|[a-z_]+:[a-z_*]+(:[a-z_]+)?)$/);

export const roleSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  description: z.string().max(500).optional(),
  hierarchyLevel: z.number().int().min(0).max(100),
  isBuiltIn: z.boolean(),
  isActive: z.boolean(),
  organizationId: z.string().uuid().nullable(),
  permissions: z.array(z.string()),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const roleCreateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  description: z.string().max(500).optional(),
  hierarchyLevel: z.number().int().min(1).max(100), // 0 is reserved for super_admin
  permissions: z.array(z.string()),
  organizationId: z.string().uuid().optional(),
});
```

## Step 7: Create schemas barrel export

**Create `packages/dream/types/src/schemas/index.ts`:**

```typescript
export { userSchema, userCreateSchema, userUpdateSchema, userStatusSchema } from './user.schema';
export { organizationSchema, orgCreateSchema, orgStatusSchema, currencySchema, regionSchema } from './organization.schema';
export { roleSchema, roleCreateSchema, permissionStringSchema } from './role.schema';
```

## Step 8: Run test -- verify it passes

```bash
cd packages/dream/types && npx vitest run tests/schemas.test.ts
```

**Expected output:**

```
 ✓ tests/schemas.test.ts (11)
   ✓ Zod schemas (11)
     ✓ userSchema > validates a correct user
     ✓ userSchema > rejects invalid email
     ✓ userSchema > rejects invalid status
     ✓ userCreateSchema > validates minimal create input
     ✓ userCreateSchema > validates phone in E.164 format
     ✓ userCreateSchema > rejects invalid phone format
     ✓ organizationSchema > validates organization with required fields
     ✓ organizationSchema > rejects invalid slug format
     ✓ roleSchema > validates a role with permissions array
     ✓ roleSchema > rejects hierarchy level below 0
     ✓ roleSchema > rejects hierarchy level above 100

 Test Files  1 passed (1)
 Tests  11 passed (11)
```

## Step 9: Commit

```bash
git add packages/dream/types/src/schemas/ packages/dream/types/tests/schemas.test.ts
git commit -m "feat(types): add Zod validation schemas for User, Organization, Role"
```

---

# Task 8: Verify @dream/types build and all tests

## What you're verifying

Full package integrity: all tests pass, typecheck succeeds, build produces correct output files.

## Step 1: Run full test suite

```bash
cd packages/dream/types && npx vitest run
```

**Expected output:**

```
 ✓ tests/users.test.ts (4)
 ✓ tests/organizations.test.ts (4)
 ✓ tests/roles.test.ts (4)
 ✓ tests/sessions.test.ts (2)
 ✓ tests/audit.test.ts (2)
 ✓ tests/responses.test.ts (4)
 ✓ tests/index.test.ts (1)
 ✓ tests/schemas.test.ts (11)

 Test Files  8 passed (8)
 Tests  32 passed (32)
```

## Step 2: Run typecheck

```bash
cd packages/dream/types && npx tsc --noEmit
```

**Expected output:** No output, exit code 0. This confirms every import resolves and all types are consistent.

## Step 3: Run build

```bash
cd packages/dream/types && npx tsc
```

**Expected output:** No errors. A `dist/` directory is created.

## Step 4: Verify output files exist

```bash
ls packages/dream/types/dist/index.js
ls packages/dream/types/dist/index.d.ts
ls packages/dream/types/dist/schemas/index.js
ls packages/dream/types/dist/schemas/index.d.ts
ls packages/dream/types/dist/users.js
ls packages/dream/types/dist/organizations.js
ls packages/dream/types/dist/roles.js
ls packages/dream/types/dist/sessions.js
ls packages/dream/types/dist/audit.js
```

**Expected output:** All files exist. Each `.ts` source file has a corresponding `.js`, `.d.ts`, and `.d.ts.map` in `dist/`.

## Step 5: Verify sub-path export structure

```bash
ls packages/dream/types/dist/schemas/
```

**Expected output:**

```
index.d.ts
index.d.ts.map
index.js
index.js.map
organization.schema.d.ts
organization.schema.d.ts.map
organization.schema.js
organization.schema.js.map
role.schema.d.ts
role.schema.d.ts.map
role.schema.js
role.schema.js.map
user.schema.d.ts
user.schema.d.ts.map
user.schema.js
user.schema.js.map
```

## Step 6: Add dist to .gitignore (if not already present)

Check if `packages/dream/types/.gitignore` exists. If not, create it:

```
dist/
node_modules/
```

## Step 7: Commit any fixes

If everything passed with no changes needed:

```bash
git add packages/dream/types/.gitignore
git commit -m "chore(types): add .gitignore for build artifacts"
```

---

## Summary: What you built in Tasks 1-8

| Task | Duration | What was created |
|------|----------|------------------|
| 1 | ~5 min | Monorepo workspace with 5 `@dream/*` packages, tsconfig, vitest config |
| 2 | ~3 min | `User`, `Organization` types with tests (8 tests) |
| 3 | ~3 min | `Role`, `Permission`, `Membership` types with tests (4 tests) |
| 4 | ~4 min | `Session`, `Audit`, `Invitation`, `SSO`, `Team`, `Department` types with tests (4 tests) |
| 5 | ~3 min | `ApiResponse`, `ApiErrorResponse`, pagination types with tests (4 tests) |
| 6 | ~2 min | Barrel `index.ts` re-exporting all types, typecheck verification (1 test) |
| 7 | ~5 min | Zod schemas for User, Organization, Role with validation tests (11 tests) |
| 8 | ~2 min | Full build verification, output file checks |

**Total: 8 commits, 32 tests, ~27 min**

**File tree after Task 8:**

```
packages/dream/types/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── .gitignore
├── src/
│   ├── index.ts              # Barrel export
│   ├── users.ts              # User, UserStatus, UserCreateInput, UserUpdateInput
│   ├── organizations.ts      # Organization, OrgCreateInput, Currency, Region
│   ├── roles.ts              # Role, BuiltInRole, RoleSlug, CustomRole
│   ├── permissions.ts        # Permission, PermissionString
│   ├── memberships.ts        # OrganizationMembership, RoleAssignment
│   ├── sessions.ts           # Session, SessionUser, JWTPayload
│   ├── audit.ts              # AuditEvent, AuditEventType, AuditQueryParams
│   ├── invitations.ts        # Invitation, InvitationType, InvitationStatus
│   ├── sso.ts                # SSOAccount, SSOProvider
│   ├── teams.ts              # Team, TeamMember, TeamCreateInput
│   ├── departments.ts        # Department, DepartmentCreateInput
│   ├── responses.ts          # ApiResponse<T>, ApiErrorResponse, PaginatedResponse<T>
│   ├── pagination.ts         # PaginationParams, CursorPaginationParams
│   └── schemas/
│       ├── index.ts           # Schema barrel export
│       ├── user.schema.ts     # userSchema, userCreateSchema, userUpdateSchema
│       ├── organization.schema.ts  # organizationSchema, orgCreateSchema
│       └── role.schema.ts     # roleSchema, roleCreateSchema
├── tests/
│   ├── users.test.ts
│   ├── organizations.test.ts
│   ├── roles.test.ts
│   ├── sessions.test.ts
│   ├── audit.test.ts
│   ├── responses.test.ts
│   ├── index.test.ts
│   └── schemas.test.ts
└── dist/                      # Generated by tsc (gitignored)
```

<!-- ═══ Tasks 9-14: @dream/errors ═══ -->



Let me first explore the existing codebase structure to understand the conventions, dependencies, and patterns already established.

Now let me check if there are already existing implementation plan tasks (1-8) to match the format and conventions.

Let me look at the contracts for @dream/types (since @dream/errors depends on it) and any existing package structure for reference.

Now let me look for any existing @dream/types package or any existing tasks 1-8 pattern to match the format.

Let me check the existing contracts for dream-types more carefully and see the spec for the data-model to understand the exact types needed.

Now let me check if there's already an existing package structure or tsconfig pattern I should follow. Let me look at what tasks 1-8 might have already set up (package.json, tsconfig, vitest config).

Now I have all the context I need. Let me check the node package.json to see if vitest is already there, and understand the existing test setup.

Now I have all the context I need to write the implementation plan tasks 9-14. Let me also check if there's a vitest config to see the pattern.

Now I have all the context needed. The tasks 1-8 presumably set up the package scaffolding (package.json, tsconfig.json, vitest.config.ts) and the @dream/types package. Tasks 9-14 cover the @dream/errors implementation. Let me write these out now.

---

## Task 9: Create PlatformError base class and 7 subclasses

**Goal**: Implement the error hierarchy that every API route and SDK consumer uses to throw typed, HTTP-status-aware errors.

**Files to create**:
- `packages/dream/errors/src/platform-error.ts`
- `packages/dream/errors/tests/platform-error.test.ts`

### Step 1: Write the failing test

Create `packages/dream/errors/tests/platform-error.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  PlatformError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServerError,
} from '../src/platform-error';

describe('PlatformError', () => {
  it('sets all properties from options', () => {
    const error = new PlatformError({
      status: 500,
      code: 'test/error',
      message: 'Something went wrong internally',
      userMessage: 'Something went wrong. Please try again.',
      requestId: 'req_abc123',
      param: 'email',
    });

    expect(error.status).toBe(500);
    expect(error.code).toBe('test/error');
    expect(error.message).toBe('Something went wrong internally');
    expect(error.userMessage).toBe('Something went wrong. Please try again.');
    expect(error.requestId).toBe('req_abc123');
    expect(error.param).toBe('email');
  });

  it('extends Error', () => {
    const error = new PlatformError({
      status: 500,
      code: 'test/error',
      message: 'Test error',
      userMessage: 'Test error occurred.',
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(PlatformError);
  });

  it('sets name to "PlatformError"', () => {
    const error = new PlatformError({
      status: 500,
      code: 'test/error',
      message: 'Test error',
      userMessage: 'Test error occurred.',
    });

    expect(error.name).toBe('PlatformError');
  });

  it('captures stack trace', () => {
    const error = new PlatformError({
      status: 500,
      code: 'test/error',
      message: 'Test error',
      userMessage: 'Test error occurred.',
    });

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('PlatformError');
  });

  it('makes requestId and param optional', () => {
    const error = new PlatformError({
      status: 400,
      code: 'test/error',
      message: 'Test error',
      userMessage: 'Test error occurred.',
    });

    expect(error.requestId).toBeUndefined();
    expect(error.param).toBeUndefined();
  });

  it('serializes to JSON correctly', () => {
    const error = new PlatformError({
      status: 404,
      code: 'users/not-found',
      message: 'User usr_abc123 not found',
      userMessage: 'The requested user could not be found.',
      requestId: 'req_xyz789',
      param: 'id',
    });

    const json = error.toJSON();

    expect(json).toEqual({
      code: 'users/not-found',
      message: 'User usr_abc123 not found',
      userMessage: 'The requested user could not be found.',
      requestId: 'req_xyz789',
      param: 'id',
    });
  });

  it('toJSON omits undefined optional fields', () => {
    const error = new PlatformError({
      status: 400,
      code: 'test/error',
      message: 'Test error',
      userMessage: 'Test error occurred.',
    });

    const json = error.toJSON();

    expect(json).toEqual({
      code: 'test/error',
      message: 'Test error',
      userMessage: 'Test error occurred.',
    });
    expect('requestId' in json).toBe(false);
    expect('param' in json).toBe(false);
  });
});

describe('ValidationError', () => {
  it('has status 400', () => {
    const error = new ValidationError({
      code: 'users/invalid-email',
      message: 'Email is invalid',
      userMessage: 'Please enter a valid email address.',
      param: 'email',
    });

    expect(error.status).toBe(400);
  });

  it('is instanceof PlatformError and ValidationError', () => {
    const error = new ValidationError({
      code: 'users/invalid-email',
      message: 'Email is invalid',
      userMessage: 'Please enter a valid email.',
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(PlatformError);
    expect(error).toBeInstanceOf(ValidationError);
  });

  it('has name "ValidationError"', () => {
    const error = new ValidationError({
      code: 'test/validation',
      message: 'Invalid',
      userMessage: 'Invalid input.',
    });

    expect(error.name).toBe('ValidationError');
  });
});

describe('AuthenticationError', () => {
  it('has status 401', () => {
    const error = new AuthenticationError({
      code: 'auth/unauthenticated',
      message: 'No valid session found',
      userMessage: 'Please sign in to continue.',
    });

    expect(error.status).toBe(401);
  });

  it('is instanceof PlatformError', () => {
    const error = new AuthenticationError({
      code: 'auth/unauthenticated',
      message: 'No valid session',
      userMessage: 'Please sign in.',
    });

    expect(error).toBeInstanceOf(PlatformError);
    expect(error).toBeInstanceOf(AuthenticationError);
  });

  it('has name "AuthenticationError"', () => {
    const error = new AuthenticationError({
      code: 'auth/unauthenticated',
      message: 'No session',
      userMessage: 'Sign in required.',
    });

    expect(error.name).toBe('AuthenticationError');
  });
});

describe('AuthorizationError', () => {
  it('has status 403', () => {
    const error = new AuthorizationError({
      code: 'rbac/permission-denied',
      message: 'Missing permission: users:write',
      userMessage: 'You do not have permission to perform this action.',
    });

    expect(error.status).toBe(403);
  });

  it('is instanceof PlatformError', () => {
    const error = new AuthorizationError({
      code: 'rbac/permission-denied',
      message: 'Denied',
      userMessage: 'Permission denied.',
    });

    expect(error).toBeInstanceOf(PlatformError);
    expect(error).toBeInstanceOf(AuthorizationError);
  });
});

describe('NotFoundError', () => {
  it('has status 404', () => {
    const error = new NotFoundError({
      code: 'users/not-found',
      message: 'User usr_abc123 not found',
      userMessage: 'The requested user could not be found.',
    });

    expect(error.status).toBe(404);
  });

  it('is instanceof PlatformError', () => {
    const error = new NotFoundError({
      code: 'users/not-found',
      message: 'Not found',
      userMessage: 'Resource not found.',
    });

    expect(error).toBeInstanceOf(PlatformError);
    expect(error).toBeInstanceOf(NotFoundError);
  });
});

describe('ConflictError', () => {
  it('has status 409', () => {
    const error = new ConflictError({
      code: 'users/email-taken',
      message: 'Email already registered',
      userMessage: 'An account with this email already exists.',
    });

    expect(error.status).toBe(409);
  });

  it('is instanceof PlatformError', () => {
    const error = new ConflictError({
      code: 'users/email-taken',
      message: 'Conflict',
      userMessage: 'Conflict.',
    });

    expect(error).toBeInstanceOf(PlatformError);
    expect(error).toBeInstanceOf(ConflictError);
  });
});

describe('RateLimitError', () => {
  it('has status 429', () => {
    const error = new RateLimitError({
      code: 'rate-limit/exceeded',
      message: 'Too many requests',
      userMessage: 'Too many requests. Please try again later.',
    });

    expect(error.status).toBe(429);
  });

  it('supports retryAfter property', () => {
    const error = new RateLimitError({
      code: 'rate-limit/exceeded',
      message: 'Too many requests',
      userMessage: 'Please wait before retrying.',
      retryAfter: 60,
    });

    expect(error.retryAfter).toBe(60);
  });

  it('makes retryAfter optional', () => {
    const error = new RateLimitError({
      code: 'rate-limit/exceeded',
      message: 'Too many requests',
      userMessage: 'Please wait.',
    });

    expect(error.retryAfter).toBeUndefined();
  });

  it('is instanceof PlatformError', () => {
    const error = new RateLimitError({
      code: 'rate-limit/exceeded',
      message: 'Rate limited',
      userMessage: 'Rate limited.',
    });

    expect(error).toBeInstanceOf(PlatformError);
    expect(error).toBeInstanceOf(RateLimitError);
  });
});

describe('ServerError', () => {
  it('has status 500', () => {
    const error = new ServerError({
      code: 'server/internal',
      message: 'Unexpected database connection failure',
      userMessage: 'An unexpected error occurred. Please try again.',
    });

    expect(error.status).toBe(500);
  });

  it('is instanceof PlatformError', () => {
    const error = new ServerError({
      code: 'server/internal',
      message: 'Internal',
      userMessage: 'Internal error.',
    });

    expect(error).toBeInstanceOf(PlatformError);
    expect(error).toBeInstanceOf(ServerError);
  });

  it('has name "ServerError"', () => {
    const error = new ServerError({
      code: 'server/internal',
      message: 'Internal',
      userMessage: 'Internal error.',
    });

    expect(error.name).toBe('ServerError');
  });
});
```

### Step 2: Verify test fails

```bash
cd packages/dream/errors && npx vitest run tests/platform-error.test.ts
```

**Expected output**: FAIL. The import `../src/platform-error` does not exist yet.

### Step 3: Implement

Create `packages/dream/errors/src/platform-error.ts`:

```typescript
// === Types ===

export interface PlatformErrorOptions {
  status: number;
  code: string;
  message: string;
  userMessage: string;
  requestId?: string;
  param?: string;
}

export interface SubclassErrorOptions {
  code: string;
  message: string;
  userMessage: string;
  requestId?: string;
  param?: string;
}

export interface RateLimitErrorOptions extends SubclassErrorOptions {
  retryAfter?: number;
}

// === Error JSON shape (matches API error response contract) ===

export interface PlatformErrorJSON {
  code: string;
  message: string;
  userMessage: string;
  requestId?: string;
  param?: string;
}

// === Base Class ===

export class PlatformError extends Error {
  readonly status: number;
  readonly code: string;
  readonly userMessage: string;
  readonly requestId?: string;
  readonly param?: string;

  constructor(options: PlatformErrorOptions) {
    super(options.message);
    this.name = 'PlatformError';
    this.status = options.status;
    this.code = options.code;
    this.userMessage = options.userMessage;
    this.requestId = options.requestId;
    this.param = options.param;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON(): PlatformErrorJSON {
    const json: PlatformErrorJSON = {
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
    };

    if (this.requestId !== undefined) {
      json.requestId = this.requestId;
    }

    if (this.param !== undefined) {
      json.param = this.param;
    }

    return json;
  }
}

// === Subclasses ===

export class ValidationError extends PlatformError {
  constructor(options: SubclassErrorOptions) {
    super({ ...options, status: 400 });
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends PlatformError {
  constructor(options: SubclassErrorOptions) {
    super({ ...options, status: 401 });
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends PlatformError {
  constructor(options: SubclassErrorOptions) {
    super({ ...options, status: 403 });
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends PlatformError {
  constructor(options: SubclassErrorOptions) {
    super({ ...options, status: 404 });
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends PlatformError {
  constructor(options: SubclassErrorOptions) {
    super({ ...options, status: 409 });
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends PlatformError {
  readonly retryAfter?: number;

  constructor(options: RateLimitErrorOptions) {
    super({ ...options, status: 429 });
    this.name = 'RateLimitError';
    this.retryAfter = options.retryAfter;
  }
}

export class ServerError extends PlatformError {
  constructor(options: SubclassErrorOptions) {
    super({ ...options, status: 500 });
    this.name = 'ServerError';
  }
}
```

### Step 4: Verify test passes

```bash
cd packages/dream/errors && npx vitest run tests/platform-error.test.ts
```

**Expected output**:

```
 ✓ tests/platform-error.test.ts (19 tests)
   ✓ PlatformError > sets all properties from options
   ✓ PlatformError > extends Error
   ✓ PlatformError > sets name to "PlatformError"
   ✓ PlatformError > captures stack trace
   ✓ PlatformError > makes requestId and param optional
   ✓ PlatformError > serializes to JSON correctly
   ✓ PlatformError > toJSON omits undefined optional fields
   ✓ ValidationError > has status 400
   ✓ ValidationError > is instanceof PlatformError and ValidationError
   ✓ ValidationError > has name "ValidationError"
   ✓ AuthenticationError > has status 401
   ✓ AuthenticationError > is instanceof PlatformError
   ✓ AuthenticationError > has name "AuthenticationError"
   ✓ AuthorizationError > has status 403
   ✓ AuthorizationError > is instanceof PlatformError
   ✓ NotFoundError > has status 404
   ✓ NotFoundError > is instanceof PlatformError
   ✓ ConflictError > has status 409
   ✓ ConflictError > is instanceof PlatformError
   ✓ RateLimitError > has status 429
   ✓ RateLimitError > supports retryAfter property
   ✓ RateLimitError > makes retryAfter optional
   ✓ RateLimitError > is instanceof PlatformError
   ✓ ServerError > has status 500
   ✓ ServerError > is instanceof PlatformError
   ✓ ServerError > has name "ServerError"

Test Files  1 passed (1)
Tests       19 passed (19)
```

### Step 5: Commit

```bash
git add packages/dream/errors/src/platform-error.ts packages/dream/errors/tests/platform-error.test.ts
git commit -m "feat(errors): add PlatformError base class and 7 HTTP status subclasses

TDD: 19 tests covering properties, instanceof hierarchy, stack traces,
JSON serialization, and optional fields (requestId, param, retryAfter)."
```

---

## Task 10: Create response formatters

**Goal**: Implement `successResponse`, `errorResponse`, and `paginatedResponse` functions that produce the standard API response shapes. These return plain objects (not NextResponse) so they are testable without a Next.js environment. The `createApiHandler` (Task 12) wraps these in `Response` objects.

**Files to create**:
- `packages/dream/errors/src/response.ts`
- `packages/dream/errors/tests/response.test.ts`

### Step 1: Write the failing test

Create `packages/dream/errors/tests/response.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { successResponse, errorResponse, paginatedResponse } from '../src/response';
import { NotFoundError, ValidationError, PlatformError } from '../src/platform-error';

describe('successResponse', () => {
  it('wraps data with success: true', () => {
    const result = successResponse({ id: 'usr_123', name: 'Alice' });

    expect(result).toEqual({
      success: true,
      data: { id: 'usr_123', name: 'Alice' },
    });
  });

  it('works with arrays', () => {
    const result = successResponse([1, 2, 3]);

    expect(result).toEqual({
      success: true,
      data: [1, 2, 3],
    });
  });

  it('works with null data', () => {
    const result = successResponse(null);

    expect(result).toEqual({
      success: true,
      data: null,
    });
  });

  it('works with primitive data', () => {
    const result = successResponse('deleted');

    expect(result).toEqual({
      success: true,
      data: 'deleted',
    });
  });
});

describe('errorResponse', () => {
  it('extracts error fields from PlatformError', () => {
    const error = new NotFoundError({
      code: 'users/not-found',
      message: 'User usr_abc123 not found in tenant acme_corp',
      userMessage: 'The requested user could not be found.',
    });

    const result = errorResponse(error);

    expect(result).toEqual({
      success: false,
      error: {
        code: 'users/not-found',
        message: 'User usr_abc123 not found in tenant acme_corp',
        userMessage: 'The requested user could not be found.',
      },
    });
  });

  it('includes requestId when present', () => {
    const error = new NotFoundError({
      code: 'users/not-found',
      message: 'User not found',
      userMessage: 'User not found.',
      requestId: 'req_xyz789',
    });

    const result = errorResponse(error);

    expect(result.error.requestId).toBe('req_xyz789');
  });

  it('includes param when present', () => {
    const error = new ValidationError({
      code: 'users/invalid-email',
      message: 'Email is invalid',
      userMessage: 'Please enter a valid email address.',
      param: 'email',
    });

    const result = errorResponse(error);

    expect(result.error.param).toBe('email');
  });

  it('omits requestId and param when not present', () => {
    const error = new NotFoundError({
      code: 'users/not-found',
      message: 'Not found',
      userMessage: 'Not found.',
    });

    const result = errorResponse(error);

    expect('requestId' in result.error).toBe(false);
    expect('param' in result.error).toBe(false);
  });

  it('works with base PlatformError', () => {
    const error = new PlatformError({
      status: 503,
      code: 'service/unavailable',
      message: 'Service temporarily unavailable',
      userMessage: 'The service is temporarily unavailable.',
      requestId: 'req_123',
    });

    const result = errorResponse(error);

    expect(result.success).toBe(false);
    expect(result.error.code).toBe('service/unavailable');
    expect(result.error.requestId).toBe('req_123');
  });
});

describe('paginatedResponse', () => {
  it('calculates totalPages correctly', () => {
    const result = paginatedResponse(
      [{ id: '1' }, { id: '2' }],
      { page: 1, pageSize: 2, totalItems: 5 },
    );

    expect(result.pagination.totalPages).toBe(3); // ceil(5/2) = 3
  });

  it('calculates hasNext and hasPrevious for first page', () => {
    const result = paginatedResponse(
      [{ id: '1' }, { id: '2' }],
      { page: 1, pageSize: 2, totalItems: 5 },
    );

    expect(result.pagination.hasNext).toBe(true);
    expect(result.pagination.hasPrevious).toBe(false);
  });

  it('calculates hasNext and hasPrevious for middle page', () => {
    const result = paginatedResponse(
      [{ id: '3' }, { id: '4' }],
      { page: 2, pageSize: 2, totalItems: 5 },
    );

    expect(result.pagination.hasNext).toBe(true);
    expect(result.pagination.hasPrevious).toBe(true);
  });

  it('calculates hasNext and hasPrevious for last page', () => {
    const result = paginatedResponse(
      [{ id: '5' }],
      { page: 3, pageSize: 2, totalItems: 5 },
    );

    expect(result.pagination.hasNext).toBe(false);
    expect(result.pagination.hasPrevious).toBe(true);
  });

  it('returns full pagination metadata', () => {
    const result = paginatedResponse(
      [{ id: '1' }],
      { page: 1, pageSize: 10, totalItems: 1 },
    );

    expect(result).toEqual({
      success: true,
      data: [{ id: '1' }],
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    });
  });

  it('handles empty data', () => {
    const result = paginatedResponse(
      [],
      { page: 1, pageSize: 10, totalItems: 0 },
    );

    expect(result.data).toEqual([]);
    expect(result.pagination.totalPages).toBe(0);
    expect(result.pagination.hasNext).toBe(false);
    expect(result.pagination.hasPrevious).toBe(false);
  });
});
```

### Step 2: Verify test fails

```bash
cd packages/dream/errors && npx vitest run tests/response.test.ts
```

**Expected output**: FAIL. The import `../src/response` does not exist yet.

### Step 3: Implement

Create `packages/dream/errors/src/response.ts`:

```typescript
import type { PlatformError, PlatformErrorJSON } from './platform-error';

// === Types ===

export interface SuccessResponseBody<T> {
  success: true;
  data: T;
}

export interface ErrorResponseBody {
  success: false;
  error: PlatformErrorJSON;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  totalItems: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponseBody<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}

// === Functions ===

export function successResponse<T>(data: T): SuccessResponseBody<T> {
  return {
    success: true,
    data,
  };
}

export function errorResponse(error: PlatformError): ErrorResponseBody {
  return {
    success: false,
    error: error.toJSON(),
  };
}

export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationParams,
): PaginatedResponseBody<T> {
  const { page, pageSize, totalItems } = pagination;
  const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 0;

  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
  };
}
```

### Step 4: Verify test passes

```bash
cd packages/dream/errors && npx vitest run tests/response.test.ts
```

**Expected output**:

```
 ✓ tests/response.test.ts (12 tests)
   ✓ successResponse > wraps data with success: true
   ✓ successResponse > works with arrays
   ✓ successResponse > works with null data
   ✓ successResponse > works with primitive data
   ✓ errorResponse > extracts error fields from PlatformError
   ✓ errorResponse > includes requestId when present
   ✓ errorResponse > includes param when present
   ✓ errorResponse > omits requestId and param when not present
   ✓ errorResponse > works with base PlatformError
   ✓ paginatedResponse > calculates totalPages correctly
   ✓ paginatedResponse > calculates hasNext and hasPrevious for first page
   ✓ paginatedResponse > calculates hasNext and hasPrevious for middle page
   ✓ paginatedResponse > calculates hasNext and hasPrevious for last page
   ✓ paginatedResponse > returns full pagination metadata
   ✓ paginatedResponse > handles empty data

Test Files  1 passed (1)
Tests       12 passed (12)
```

### Step 5: Commit

```bash
git add packages/dream/errors/src/response.ts packages/dream/errors/tests/response.test.ts
git commit -m "feat(errors): add response formatters — successResponse, errorResponse, paginatedResponse

TDD: 12 tests covering data wrapping, error field extraction, pagination
calculation (totalPages, hasNext, hasPrevious), and edge cases (empty data)."
```

---

## Task 11: Create audit event emitter

**Goal**: Implement the `AuditEmitter` interface, an `InMemoryAuditEmitter` for testing/development, and a `createAuditEmitter` factory for custom implementations.

**Files to create**:
- `packages/dream/errors/src/audit.ts`
- `packages/dream/errors/tests/audit.test.ts`

### Step 1: Write the failing test

Create `packages/dream/errors/tests/audit.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import {
  InMemoryAuditEmitter,
  createAuditEmitter,
  type AuditEmitter,
  type AuditEventInput,
} from '../src/audit';

const makeEvent = (overrides?: Partial<AuditEventInput>): AuditEventInput => ({
  actorId: 'usr_actor123',
  action: 'user.updated',
  resourceType: 'user',
  resourceId: 'usr_target456',
  tenantId: 'tnt_acme',
  ipAddress: '192.168.1.1',
  requestId: 'req_abc789',
  ...overrides,
});

describe('InMemoryAuditEmitter', () => {
  it('stores emitted events', async () => {
    const emitter = new InMemoryAuditEmitter();
    const event = makeEvent();

    await emitter.emit(event);

    expect(emitter.events).toHaveLength(1);
    expect(emitter.events[0]).toEqual(event);
  });

  it('stores multiple events in order', async () => {
    const emitter = new InMemoryAuditEmitter();

    await emitter.emit(makeEvent({ action: 'user.created' }));
    await emitter.emit(makeEvent({ action: 'user.updated' }));
    await emitter.emit(makeEvent({ action: 'user.deleted' }));

    expect(emitter.events).toHaveLength(3);
    expect(emitter.events[0].action).toBe('user.created');
    expect(emitter.events[1].action).toBe('user.updated');
    expect(emitter.events[2].action).toBe('user.deleted');
  });

  it('emit returns a promise', async () => {
    const emitter = new InMemoryAuditEmitter();
    const result = emitter.emit(makeEvent());

    expect(result).toBeInstanceOf(Promise);
    await result; // should resolve without error
  });

  it('stores events with all required fields', async () => {
    const emitter = new InMemoryAuditEmitter();
    const event = makeEvent({
      beforeState: { name: 'Old Name' },
      afterState: { name: 'New Name' },
    });

    await emitter.emit(event);

    const stored = emitter.events[0];
    expect(stored.actorId).toBe('usr_actor123');
    expect(stored.action).toBe('user.updated');
    expect(stored.resourceType).toBe('user');
    expect(stored.resourceId).toBe('usr_target456');
    expect(stored.tenantId).toBe('tnt_acme');
    expect(stored.ipAddress).toBe('192.168.1.1');
    expect(stored.requestId).toBe('req_abc789');
    expect(stored.beforeState).toEqual({ name: 'Old Name' });
    expect(stored.afterState).toEqual({ name: 'New Name' });
  });

  it('clear() removes all events', async () => {
    const emitter = new InMemoryAuditEmitter();
    await emitter.emit(makeEvent());
    await emitter.emit(makeEvent());

    expect(emitter.events).toHaveLength(2);

    emitter.clear();

    expect(emitter.events).toHaveLength(0);
  });
});

describe('createAuditEmitter', () => {
  it('accepts a custom emit function', async () => {
    const customEmit = vi.fn().mockResolvedValue(undefined);
    const emitter = createAuditEmitter(customEmit);
    const event = makeEvent();

    await emitter.emit(event);

    expect(customEmit).toHaveBeenCalledOnce();
    expect(customEmit).toHaveBeenCalledWith(event);
  });

  it('returns an object satisfying AuditEmitter interface', () => {
    const emitter = createAuditEmitter(vi.fn());

    expect(typeof emitter.emit).toBe('function');
  });

  it('propagates the promise from custom emit', async () => {
    const customEmit = vi.fn().mockResolvedValue(undefined);
    const emitter = createAuditEmitter(customEmit);

    const result = emitter.emit(makeEvent());

    expect(result).toBeInstanceOf(Promise);
    await result;
  });

  it('propagates errors from custom emit', async () => {
    const customEmit = vi.fn().mockRejectedValue(new Error('DB write failed'));
    const emitter = createAuditEmitter(customEmit);

    await expect(emitter.emit(makeEvent())).rejects.toThrow('DB write failed');
  });
});
```

### Step 2: Verify test fails

```bash
cd packages/dream/errors && npx vitest run tests/audit.test.ts
```

**Expected output**: FAIL. The import `../src/audit` does not exist yet.

### Step 3: Implement

Create `packages/dream/errors/src/audit.ts`:

```typescript
// === Types ===

export interface AuditEventInput {
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  tenantId: string;
  ipAddress: string;
  requestId: string;
}

export interface AuditEmitter {
  emit(event: AuditEventInput): Promise<void>;
}

// === InMemoryAuditEmitter (for testing and development) ===

export class InMemoryAuditEmitter implements AuditEmitter {
  readonly events: AuditEventInput[] = [];

  async emit(event: AuditEventInput): Promise<void> {
    this.events.push(event);
  }

  clear(): void {
    this.events.length = 0;
  }
}

// === Factory ===

export function createAuditEmitter(
  emitFn: (event: AuditEventInput) => Promise<void>,
): AuditEmitter {
  return {
    emit: emitFn,
  };
}
```

### Step 4: Verify test passes

```bash
cd packages/dream/errors && npx vitest run tests/audit.test.ts
```

**Expected output**:

```
 ✓ tests/audit.test.ts (9 tests)
   ✓ InMemoryAuditEmitter > stores emitted events
   ✓ InMemoryAuditEmitter > stores multiple events in order
   ✓ InMemoryAuditEmitter > emit returns a promise
   ✓ InMemoryAuditEmitter > stores events with all required fields
   ✓ InMemoryAuditEmitter > clear() removes all events
   ✓ createAuditEmitter > accepts a custom emit function
   ✓ createAuditEmitter > returns an object satisfying AuditEmitter interface
   ✓ createAuditEmitter > propagates the promise from custom emit
   ✓ createAuditEmitter > propagates errors from custom emit

Test Files  1 passed (1)
Tests       9 passed (9)
```

### Step 5: Commit

```bash
git add packages/dream/errors/src/audit.ts packages/dream/errors/tests/audit.test.ts
git commit -m "feat(errors): add AuditEmitter interface, InMemoryAuditEmitter, and createAuditEmitter factory

TDD: 9 tests covering event storage, ordering, promise semantics,
custom emit functions, error propagation, and clear()."
```

---

## Task 12: Create createApiHandler (core error handling and response formatting)

**Goal**: Implement the central API route wrapper that generates `requestId`, catches `PlatformError` subclasses, maps `ZodError` to `ValidationError`, catches unknown errors as `ServerError`, and returns formatted responses. Uses standard `Request`/`Response` (not Next.js) for testability.

**Files to create**:
- `packages/dream/errors/src/handler.ts`
- `packages/dream/errors/tests/handler.test.ts`

**Dependencies**: This file imports from `./platform-error` and `./response` (created in Tasks 9-10). It also handles `ZodError` — we detect it by checking the error's `name` property (`"ZodError"`) and `issues` array, so there is no hard dependency on the `zod` package.

### Step 1: Write the failing test

Create `packages/dream/errors/tests/handler.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiHandler } from '../src/handler';
import {
  PlatformError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  ServerError,
} from '../src/platform-error';
import type { ApiContext } from '../src/handler';

// Helper to create a minimal Request
function makeRequest(url = 'http://localhost/api/test', init?: RequestInit): Request {
  return new Request(url, init);
}

// Helper to create a mock ApiContext
function makeContext(overrides?: Partial<ApiContext>): ApiContext {
  return {
    user: {
      userId: 'usr_test123',
      email: 'test@example.com',
      name: 'Test User',
    },
    tenantId: 'tnt_acme',
    permissions: ['users:read', 'users:write'],
    requestId: 'req_test',
    params: {},
    ...overrides,
  };
}

// Fake ZodError (mimics Zod's error shape without importing zod)
class FakeZodError extends Error {
  issues: Array<{ path: (string | number)[]; message: string }>;

  constructor(issues: Array<{ path: (string | number)[]; message: string }>) {
    super('Validation failed');
    this.name = 'ZodError';
    this.issues = issues;
  }
}

describe('createApiHandler', () => {
  it('returns success response when handler resolves', async () => {
    const handler = createApiHandler(async (_req, _ctx) => {
      return { id: 'usr_123', name: 'Alice' };
    });

    const request = makeRequest();
    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      success: true,
      data: { id: 'usr_123', name: 'Alice' },
    });
  });

  it('generates a requestId and sets X-Request-ID header', async () => {
    const handler = createApiHandler(async (_req, _ctx) => {
      return { ok: true };
    });

    const request = makeRequest();
    const response = await handler(request);

    const requestId = response.headers.get('X-Request-ID');
    expect(requestId).toBeDefined();
    expect(requestId).toBeTruthy();
    expect(typeof requestId).toBe('string');
  });

  it('passes requestId to the handler context', async () => {
    let capturedRequestId: string | undefined;

    const handler = createApiHandler(async (_req, ctx) => {
      capturedRequestId = ctx.requestId;
      return { ok: true };
    });

    const request = makeRequest();
    const response = await handler(request);

    const headerRequestId = response.headers.get('X-Request-ID');
    expect(capturedRequestId).toBe(headerRequestId);
  });

  it('catches ValidationError and returns 400', async () => {
    const handler = createApiHandler(async () => {
      throw new ValidationError({
        code: 'users/invalid-email',
        message: 'Email is invalid',
        userMessage: 'Please enter a valid email address.',
        param: 'email',
      });
    });

    const request = makeRequest();
    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('users/invalid-email');
    expect(body.error.param).toBe('email');
  });

  it('catches NotFoundError and returns 404', async () => {
    const handler = createApiHandler(async () => {
      throw new NotFoundError({
        code: 'users/not-found',
        message: 'User usr_abc123 not found',
        userMessage: 'The requested user could not be found.',
      });
    });

    const request = makeRequest();
    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('users/not-found');
  });

  it('catches AuthenticationError and returns 401', async () => {
    const handler = createApiHandler(async () => {
      throw new AuthenticationError({
        code: 'auth/unauthenticated',
        message: 'No valid session',
        userMessage: 'Please sign in to continue.',
      });
    });

    const request = makeRequest();
    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('auth/unauthenticated');
  });

  it('adds requestId to PlatformError in error response', async () => {
    const handler = createApiHandler(async () => {
      throw new NotFoundError({
        code: 'users/not-found',
        message: 'Not found',
        userMessage: 'Not found.',
      });
    });

    const request = makeRequest();
    const response = await handler(request);
    const body = await response.json();

    expect(body.error.requestId).toBeDefined();
    expect(body.error.requestId).toBe(response.headers.get('X-Request-ID'));
  });

  it('catches ZodError and maps to ValidationError (400)', async () => {
    const handler = createApiHandler(async () => {
      throw new FakeZodError([
        { path: ['email'], message: 'Invalid email' },
        { path: ['name'], message: 'Required' },
      ]);
    });

    const request = makeRequest();
    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('validation/invalid-input');
    expect(body.error.requestId).toBeDefined();
  });

  it('catches unknown errors and maps to ServerError (500)', async () => {
    const handler = createApiHandler(async () => {
      throw new Error('Unexpected database connection failure');
    });

    const request = makeRequest();
    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('server/internal-error');
    expect(body.error.userMessage).toBe(
      'An unexpected error occurred. Please try again.',
    );
    // Internal message should NOT be exposed
    expect(body.error.message).not.toContain('database connection');
  });

  it('catches non-Error throwables and maps to ServerError (500)', async () => {
    const handler = createApiHandler(async () => {
      throw 'string error'; // eslint-disable-line no-throw-literal
    });

    const request = makeRequest();
    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('server/internal-error');
  });

  it('sets Content-Type to application/json', async () => {
    const handler = createApiHandler(async () => {
      return { ok: true };
    });

    const request = makeRequest();
    const response = await handler(request);

    expect(response.headers.get('Content-Type')).toContain('application/json');
  });
});
```

### Step 2: Verify test fails

```bash
cd packages/dream/errors && npx vitest run tests/handler.test.ts
```

**Expected output**: FAIL. The import `../src/handler` does not exist yet.

### Step 3: Implement

Create `packages/dream/errors/src/handler.ts`:

```typescript
import { PlatformError, ValidationError, type SubclassErrorOptions } from './platform-error';
import { successResponse, errorResponse } from './response';

// === Types ===

export interface SessionUser {
  userId: string;
  email: string;
  name: string;
}

export interface ApiContext {
  user: SessionUser;
  tenantId: string;
  permissions: string[];
  requestId: string;
  params: Record<string, string>;
}

export interface ApiHandlerOptions {
  requireAuth?: boolean;
  requiredPermissions?: string[];
  requiredRole?: string;
  minimumRoleLevel?: number;
  auditAction?: string;
}

export type ApiHandler<T = unknown> = (
  request: Request,
  context: ApiContext,
) => Promise<T>;

// === ZodError detection ===

interface ZodLikeError {
  name: string;
  issues: Array<{ path: (string | number)[]; message: string }>;
}

function isZodError(error: unknown): error is ZodLikeError {
  return (
    error instanceof Error &&
    error.name === 'ZodError' &&
    'issues' in error &&
    Array.isArray((error as ZodLikeError).issues)
  );
}

// === createApiHandler ===

export function createApiHandler<T>(
  handler: ApiHandler<T>,
  _options?: ApiHandlerOptions,
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const requestId = crypto.randomUUID();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
    };

    try {
      // Build a minimal context for now.
      // Auth, RBAC, and tenant extraction are integrated in later packages.
      const context: ApiContext = {
        user: { userId: '', email: '', name: '' },
        tenantId: '',
        permissions: [],
        requestId,
        params: {},
      };

      const result = await handler(request, context);
      const body = successResponse(result);

      return new Response(JSON.stringify(body), {
        status: 200,
        headers,
      });
    } catch (error: unknown) {
      if (error instanceof PlatformError) {
        // Attach requestId to the error so it appears in the response body
        const errorWithRequestId = new (error.constructor as new (opts: SubclassErrorOptions & { status?: number; retryAfter?: number }) => PlatformError)({
          ...error,
          message: error.message,
          requestId,
        });

        const body = errorResponse(errorWithRequestId);

        return new Response(JSON.stringify(body), {
          status: error.status,
          headers,
        });
      }

      if (isZodError(error)) {
        const zodMessages = error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join('; ');

        const validationError = new ValidationError({
          code: 'validation/invalid-input',
          message: zodMessages,
          userMessage: 'The provided input is invalid. Please check your data and try again.',
          requestId,
        });

        const body = errorResponse(validationError);

        return new Response(JSON.stringify(body), {
          status: 400,
          headers,
        });
      }

      // Unknown error — do NOT expose internal details
      const serverError = new PlatformError({
        status: 500,
        code: 'server/internal-error',
        message: 'An internal server error occurred',
        userMessage: 'An unexpected error occurred. Please try again.',
        requestId,
      });

      const body = errorResponse(serverError);

      return new Response(JSON.stringify(body), {
        status: 500,
        headers,
      });
    }
  };
}
```

### Step 4: Verify test passes

```bash
cd packages/dream/errors && npx vitest run tests/handler.test.ts
```

**Expected output**:

```
 ✓ tests/handler.test.ts (11 tests)
   ✓ createApiHandler > returns success response when handler resolves
   ✓ createApiHandler > generates a requestId and sets X-Request-ID header
   ✓ createApiHandler > passes requestId to the handler context
   ✓ createApiHandler > catches ValidationError and returns 400
   ✓ createApiHandler > catches NotFoundError and returns 404
   ✓ createApiHandler > catches AuthenticationError and returns 401
   ✓ createApiHandler > adds requestId to PlatformError in error response
   ✓ createApiHandler > catches ZodError and maps to ValidationError (400)
   ✓ createApiHandler > catches unknown errors and maps to ServerError (500)
   ✓ createApiHandler > catches non-Error throwables and maps to ServerError (500)
   ✓ createApiHandler > sets Content-Type to application/json

Test Files  1 passed (1)
Tests       11 passed (11)
```

### Step 5: Commit

```bash
git add packages/dream/errors/src/handler.ts packages/dream/errors/tests/handler.test.ts
git commit -m "feat(errors): add createApiHandler with error catching and response formatting

TDD: 11 tests covering success responses, requestId generation/propagation,
PlatformError catch (400/401/404), ZodError mapping, unknown error masking,
and Content-Type headers. Auth/RBAC/tenant integration deferred to later packages."
```

---

## Task 13: Create barrel export for @dream/errors

**Goal**: Create the package entry point that re-exports everything from all four source files. Also create a simple test verifying all public exports are accessible.

**Files to create**:
- `packages/dream/errors/src/index.ts`
- `packages/dream/errors/tests/index.test.ts`

### Step 1: Write the failing test

Create `packages/dream/errors/tests/index.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import * as ErrorsPackage from '../src/index';

describe('@dream/errors barrel export', () => {
  it('exports PlatformError base class', () => {
    expect(ErrorsPackage.PlatformError).toBeDefined();
    expect(typeof ErrorsPackage.PlatformError).toBe('function');
  });

  it('exports all 7 error subclasses', () => {
    expect(ErrorsPackage.ValidationError).toBeDefined();
    expect(ErrorsPackage.AuthenticationError).toBeDefined();
    expect(ErrorsPackage.AuthorizationError).toBeDefined();
    expect(ErrorsPackage.NotFoundError).toBeDefined();
    expect(ErrorsPackage.ConflictError).toBeDefined();
    expect(ErrorsPackage.RateLimitError).toBeDefined();
    expect(ErrorsPackage.ServerError).toBeDefined();
  });

  it('exports createApiHandler', () => {
    expect(ErrorsPackage.createApiHandler).toBeDefined();
    expect(typeof ErrorsPackage.createApiHandler).toBe('function');
  });

  it('exports response formatters', () => {
    expect(ErrorsPackage.successResponse).toBeDefined();
    expect(typeof ErrorsPackage.successResponse).toBe('function');

    expect(ErrorsPackage.errorResponse).toBeDefined();
    expect(typeof ErrorsPackage.errorResponse).toBe('function');

    expect(ErrorsPackage.paginatedResponse).toBeDefined();
    expect(typeof ErrorsPackage.paginatedResponse).toBe('function');
  });

  it('exports InMemoryAuditEmitter', () => {
    expect(ErrorsPackage.InMemoryAuditEmitter).toBeDefined();
    expect(typeof ErrorsPackage.InMemoryAuditEmitter).toBe('function');
  });

  it('exports createAuditEmitter factory', () => {
    expect(ErrorsPackage.createAuditEmitter).toBeDefined();
    expect(typeof ErrorsPackage.createAuditEmitter).toBe('function');
  });

  it('error subclasses produce correct instances through barrel import', () => {
    const error = new ErrorsPackage.NotFoundError({
      code: 'test/not-found',
      message: 'Not found',
      userMessage: 'Not found.',
    });

    expect(error).toBeInstanceOf(ErrorsPackage.PlatformError);
    expect(error).toBeInstanceOf(ErrorsPackage.NotFoundError);
    expect(error.status).toBe(404);
  });
});
```

### Step 2: Verify test fails

```bash
cd packages/dream/errors && npx vitest run tests/index.test.ts
```

**Expected output**: FAIL. The import `../src/index` does not exist yet.

### Step 3: Implement

Create `packages/dream/errors/src/index.ts`:

```typescript
// === Error Classes ===
export {
  PlatformError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServerError,
} from './platform-error';

export type {
  PlatformErrorOptions,
  SubclassErrorOptions,
  RateLimitErrorOptions,
  PlatformErrorJSON,
} from './platform-error';

// === API Handler ===
export { createApiHandler } from './handler';

export type {
  ApiContext,
  ApiHandler,
  ApiHandlerOptions,
  SessionUser,
} from './handler';

// === Response Formatters ===
export { successResponse, errorResponse, paginatedResponse } from './response';

export type {
  SuccessResponseBody,
  ErrorResponseBody,
  PaginationParams,
  PaginationMeta,
  PaginatedResponseBody,
} from './response';

// === Audit ===
export { InMemoryAuditEmitter, createAuditEmitter } from './audit';

export type { AuditEmitter, AuditEventInput } from './audit';
```

### Step 4: Verify test passes

```bash
cd packages/dream/errors && npx vitest run tests/index.test.ts
```

**Expected output**:

```
 ✓ tests/index.test.ts (7 tests)
   ✓ @dream/errors barrel export > exports PlatformError base class
   ✓ @dream/errors barrel export > exports all 7 error subclasses
   ✓ @dream/errors barrel export > exports createApiHandler
   ✓ @dream/errors barrel export > exports response formatters
   ✓ @dream/errors barrel export > exports InMemoryAuditEmitter
   ✓ @dream/errors barrel export > exports createAuditEmitter factory
   ✓ @dream/errors barrel export > error subclasses produce correct instances through barrel import

Test Files  1 passed (1)
Tests       7 passed (7)
```

### Step 5: Commit

```bash
git add packages/dream/errors/src/index.ts packages/dream/errors/tests/index.test.ts
git commit -m "feat(errors): add barrel export for @dream/errors package

TDD: 7 tests verifying all public exports are accessible — error classes,
createApiHandler, response formatters, audit emitter, and type re-exports."
```

---

## Task 14: Verify @dream/errors -- full test suite, typecheck, build

**Goal**: Run all tests together, verify TypeScript compilation, and produce the `dist/` output. Fix any issues discovered.

**No new files to create.** This task validates the full package.

### Step 1: Run full test suite

```bash
cd packages/dream/errors && npx vitest run
```

**Expected output**:

```
 ✓ tests/platform-error.test.ts (19 tests)
 ✓ tests/response.test.ts (12 tests)
 ✓ tests/audit.test.ts (9 tests)
 ✓ tests/handler.test.ts (11 tests)
 ✓ tests/index.test.ts (7 tests)

Test Files  5 passed (5)
Tests       58 passed (58)
```

If any test fails, fix the source code (not the test) and re-run.

### Step 2: Run typecheck

```bash
cd packages/dream/errors && npx tsc --noEmit
```

**Expected output**: No output (exit code 0). No type errors.

If there are type errors, fix them in the source files and re-run until clean.

Common issues to watch for:
- Missing `crypto` type: add `"lib": ["ES2022"]` to `tsconfig.json` (should already be set from Task 7/8 scaffolding)
- Import resolution errors: verify `"moduleResolution": "bundler"` in `tsconfig.json`

### Step 3: Run build

```bash
cd packages/dream/errors && npx tsc
```

**Expected output**: `dist/` directory is created with compiled JavaScript and declaration files:

```
dist/
├── index.js
├── index.d.ts
├── platform-error.js
├── platform-error.d.ts
├── response.js
├── response.d.ts
├── audit.js
├── audit.d.ts
├── handler.js
└── handler.d.ts
```

Verify the dist directory was created:

```bash
ls packages/dream/errors/dist/
```

**Expected output**: The files listed above (`.js` and `.d.ts` for each source file).

### Step 4: Verify dist files are importable

```bash
cd packages/dream/errors && node -e "const e = require('./dist/index.js'); console.log(Object.keys(e).sort().join(', '))"
```

**Expected output** (approximate, depends on CommonJS vs ESM — if ESM, use a different check):

```
AuthenticationError, AuthorizationError, ConflictError, InMemoryAuditEmitter, NotFoundError, PlatformError, RateLimitError, ServerError, ValidationError, createApiHandler, createAuditEmitter, errorResponse, paginatedResponse, successResponse
```

If the package uses ESM output only (no CommonJS), verify with:

```bash
cd packages/dream/errors && node --input-type=module -e "import * as e from './dist/index.js'; console.log(Object.keys(e).sort().join(', '))"
```

### Step 5: Commit

```bash
git add -A packages/dream/errors/dist/
git commit -m "chore(errors): verify full test suite (58 pass), typecheck, and build

All 5 test files pass (58 tests), tsc --noEmit clean, dist/ generated.
@dream/errors package is ready for consumption."
```

**Note**: If your `.gitignore` excludes `dist/` (which is typical), skip adding `dist/` and adjust the commit message:

```bash
git commit --allow-empty -m "chore(errors): verify full test suite (58 pass), typecheck, and build

All 5 test files pass (58 tests), tsc --noEmit clean, dist/ builds successfully.
@dream/errors package is ready for consumption."
```

---

### Package summary after Tasks 9-14

```
packages/dream/errors/
├── src/
│   ├── index.ts              # Barrel export (Task 13)
│   ├── platform-error.ts     # PlatformError + 7 subclasses (Task 9)
│   ├── response.ts           # successResponse, errorResponse, paginatedResponse (Task 10)
│   ├── audit.ts              # AuditEmitter, InMemoryAuditEmitter, createAuditEmitter (Task 11)
│   └── handler.ts            # createApiHandler (Task 12)
├── tests/
│   ├── platform-error.test.ts  # 19 tests
│   ├── response.test.ts        # 12 tests
│   ├── audit.test.ts           # 9 tests
│   ├── handler.test.ts         # 11 tests
│   └── index.test.ts           # 7 tests
├── package.json               # (created in Tasks 1-8)
├── tsconfig.json              # (created in Tasks 1-8)
└── vitest.config.ts           # (created in Tasks 1-8)
```

**Total tests**: 58
**Total source files**: 5
**Total test files**: 5

<!-- ═══ Tasks 15-20: @dream/rbac ═══ -->



# Task 15: Create Permission Matching Functions

## Goal
Implement the core permission matching logic: `matchesPermission()`, `hasAnyPermission()`, and `hasAllPermissions()`.

## Files to Create
- `packages/dream/rbac/src/permissions.ts`
- `packages/dream/rbac/tests/permissions.test.ts`

## Step 1: Write the Failing Tests

Create the test file first.

**Create `packages/dream/rbac/tests/permissions.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';
import {
  matchesPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '../src/permissions';

describe('matchesPermission', () => {
  // 1. Exact match works
  it('should match exact permission strings', () => {
    expect(matchesPermission('users:read', 'users:read')).toBe(true);
  });

  // 2. Action wildcard matches any action on same resource
  it('should match action wildcard against any action on same resource', () => {
    expect(matchesPermission('users:*', 'users:read')).toBe(true);
    expect(matchesPermission('users:*', 'users:write')).toBe(true);
    expect(matchesPermission('users:*', 'users:delete')).toBe(true);
  });

  // 3. Global wildcard matches everything
  it('should match global wildcard against any permission', () => {
    expect(matchesPermission('*', 'users:read')).toBe(true);
    expect(matchesPermission('*', 'teams:write')).toBe(true);
    expect(matchesPermission('*', 'settings:delete')).toBe(true);
  });

  // 4. Different resources don't match
  it('should not match different resources', () => {
    expect(matchesPermission('users:read', 'teams:read')).toBe(false);
  });

  // 5. Different actions don't match
  it('should not match different actions on same resource', () => {
    expect(matchesPermission('users:read', 'users:write')).toBe(false);
  });

  // 6. Wildcard only works on action part
  it('should not allow wildcard on resource part to match different resources', () => {
    expect(matchesPermission('*:read', 'users:read')).toBe(false);
  });

  // 7. Scope extension matching
  it('should match base permission against scoped permission', () => {
    expect(matchesPermission('users:read', 'users:read:self')).toBe(true);
  });

  // 8. Action wildcard matches scoped permissions
  it('should match action wildcard against scoped permissions', () => {
    expect(matchesPermission('users:*', 'users:read:self')).toBe(true);
  });

  // 9. Case sensitivity
  it('should be case-sensitive for permission strings', () => {
    expect(matchesPermission('users:read', 'Users:Read')).toBe(false);
    expect(matchesPermission('USERS:READ', 'users:read')).toBe(false);
  });

  // 10. Invalid format handling
  it('should handle invalid formats gracefully without crashing', () => {
    expect(matchesPermission('', 'users:read')).toBe(false);
    expect(matchesPermission('users:read', '')).toBe(false);
    expect(matchesPermission('', '')).toBe(false);
    expect(matchesPermission('invalid', 'users:read')).toBe(false);
  });
});

describe('hasAnyPermission', () => {
  // 11. Empty permissions array returns false
  it('should return false when user has no permissions', () => {
    expect(hasAnyPermission([], ['users:read'])).toBe(false);
  });

  // 12. Single matching permission returns true
  it('should return true when user has at least one matching permission', () => {
    expect(hasAnyPermission(['users:read'], ['users:read', 'users:write'])).toBe(true);
  });

  // 13. No matching permission returns false
  it('should return false when no permissions match', () => {
    expect(hasAnyPermission(['teams:read'], ['users:read', 'users:write'])).toBe(false);
  });

  // 14. Global wildcard in hasAnyPermission
  it('should return true when user has global wildcard', () => {
    expect(hasAnyPermission(['*'], ['users:read', 'teams:write'])).toBe(true);
  });

  // 15. Empty required array returns false (nothing to match)
  it('should return false when required permissions array is empty', () => {
    expect(hasAnyPermission(['users:read'], [])).toBe(false);
  });
});

describe('hasAllPermissions', () => {
  // 16. All matching returns true
  it('should return true when user has all required permissions', () => {
    expect(
      hasAllPermissions(['users:read', 'users:write', 'teams:read'], ['users:read', 'teams:read']),
    ).toBe(true);
  });

  // 17. One missing returns false
  it('should return false when user is missing one required permission', () => {
    expect(hasAllPermissions(['users:read'], ['users:read', 'users:write'])).toBe(false);
  });

  // 18. Empty required array returns true (vacuous truth)
  it('should return true when required permissions array is empty', () => {
    expect(hasAllPermissions(['users:read'], [])).toBe(true);
  });

  // 19. Wildcard satisfies all requirements
  it('should return true when user has global wildcard', () => {
    expect(hasAllPermissions(['*'], ['users:read', 'teams:write', 'settings:delete'])).toBe(true);
  });

  // 20. Action wildcard satisfies resource-specific requirements
  it('should return true when action wildcard covers required permissions', () => {
    expect(hasAllPermissions(['users:*'], ['users:read', 'users:write'])).toBe(true);
  });
});
```

## Step 2: Verify Tests Fail

Run:
```bash
cd packages/dream/rbac && npx vitest run tests/permissions.test.ts
```

**Expected output:** All tests fail with errors like:
```
Error: Failed to resolve import '../src/permissions'
```

This confirms the tests are looking for code that doesn't exist yet.

## Step 3: Implement the Permission Matching Functions

**Create `packages/dream/rbac/src/permissions.ts`:**

```typescript
/**
 * Matches a single user permission against a required permission.
 *
 * Matching rules:
 * - Exact: 'users:read' matches 'users:read'
 * - Action wildcard: 'users:*' matches 'users:read'
 * - Global wildcard: '*' matches anything
 * - Scope extension: 'users:read' matches 'users:read:self'
 * - No cross-resource wildcard: '*:read' does NOT match 'users:read'
 */
export function matchesPermission(
  userPermission: string,
  requiredPermission: string,
): boolean {
  // Handle empty strings
  if (!userPermission || !requiredPermission) {
    return false;
  }

  // Global wildcard matches everything
  if (userPermission === '*') {
    return true;
  }

  // Both must be in resource:action format
  const userParts = userPermission.split(':');
  const requiredParts = requiredPermission.split(':');

  if (userParts.length < 2 || requiredParts.length < 2) {
    return false;
  }

  const [userResource, userAction] = userParts;
  const [requiredResource, requiredAction] = requiredParts;

  // Resources must match exactly
  if (userResource !== requiredResource) {
    return false;
  }

  // Action wildcard matches any action (including scoped)
  if (userAction === '*') {
    return true;
  }

  // Exact action match
  if (userAction === requiredAction) {
    return true;
  }

  return false;
}

/**
 * Returns true if the user has ANY of the required permissions (OR logic).
 * Returns false if requiredPermissions is empty.
 */
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: string[],
): boolean {
  if (requiredPermissions.length === 0) {
    return false;
  }

  return requiredPermissions.some((required) =>
    userPermissions.some((user) => matchesPermission(user, required)),
  );
}

/**
 * Returns true if the user has ALL of the required permissions (AND logic).
 * Returns true if requiredPermissions is empty (vacuous truth).
 */
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: string[],
): boolean {
  if (requiredPermissions.length === 0) {
    return true;
  }

  return requiredPermissions.every((required) =>
    userPermissions.some((user) => matchesPermission(user, required)),
  );
}
```

## Step 4: Verify Tests Pass

Run:
```bash
cd packages/dream/rbac && npx vitest run tests/permissions.test.ts
```

**Expected output:**
```
 ✓ tests/permissions.test.ts (20 tests)
   ✓ matchesPermission > should match exact permission strings
   ✓ matchesPermission > should match action wildcard against any action on same resource
   ✓ matchesPermission > should match global wildcard against any permission
   ✓ matchesPermission > should not match different resources
   ✓ matchesPermission > should not match different actions on same resource
   ✓ matchesPermission > should not allow wildcard on resource part to match different resources
   ✓ matchesPermission > should match base permission against scoped permission
   ✓ matchesPermission > should match action wildcard against scoped permissions
   ✓ matchesPermission > should be case-sensitive for permission strings
   ✓ matchesPermission > should handle invalid formats gracefully without crashing
   ✓ hasAnyPermission > should return false when user has no permissions
   ✓ hasAnyPermission > should return true when user has at least one matching permission
   ✓ hasAnyPermission > should return false when no permissions match
   ✓ hasAnyPermission > should return true when user has global wildcard
   ✓ hasAnyPermission > should return false when required permissions array is empty
   ✓ hasAllPermissions > should return true when user has all required permissions
   ✓ hasAllPermissions > should return false when user is missing one required permission
   ✓ hasAllPermissions > should return true when required permissions array is empty
   ✓ hasAllPermissions > should return true when user has global wildcard
   ✓ hasAllPermissions > should return true when action wildcard covers required permissions

Test Files  1 passed (1)
     Tests  20 passed (20)
```

## Step 5: Commit

```bash
cd packages/dream/rbac && git add src/permissions.ts tests/permissions.test.ts && git commit -m "feat(rbac): add permission matching functions

- matchesPermission with exact, wildcard, global, and scope extension matching
- hasAnyPermission (OR logic) and hasAllPermissions (AND logic)
- 20 tests covering all matching rules and edge cases"
```

---

# Task 16: Create PERMISSIONS Constant and Role Hierarchy

## Goal
Implement the `PERMISSIONS` typed constant, `BUILT_IN_ROLES`, `requireMinimumRole()`, and `getRoleBySlug()`.

## Files to Create
- `packages/dream/rbac/src/constants.ts`
- `packages/dream/rbac/src/hierarchy.ts`
- `packages/dream/rbac/tests/hierarchy.test.ts`

## Step 1: Write the Failing Tests

**Create `packages/dream/rbac/tests/hierarchy.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';
import { BUILT_IN_ROLES, requireMinimumRole, getRoleBySlug } from '../src/hierarchy';
import { PERMISSIONS } from '../src/constants';

describe('BUILT_IN_ROLES', () => {
  it('should have exactly 5 entries', () => {
    expect(Object.keys(BUILT_IN_ROLES)).toHaveLength(5);
  });

  it('should contain super_admin, admin, manager, user, guest', () => {
    expect(BUILT_IN_ROLES).toHaveProperty('super_admin');
    expect(BUILT_IN_ROLES).toHaveProperty('admin');
    expect(BUILT_IN_ROLES).toHaveProperty('manager');
    expect(BUILT_IN_ROLES).toHaveProperty('user');
    expect(BUILT_IN_ROLES).toHaveProperty('guest');
  });

  it('should have correct hierarchy levels', () => {
    expect(BUILT_IN_ROLES.super_admin.hierarchyLevel).toBe(0);
    expect(BUILT_IN_ROLES.admin.hierarchyLevel).toBe(10);
    expect(BUILT_IN_ROLES.manager.hierarchyLevel).toBe(20);
    expect(BUILT_IN_ROLES.user.hierarchyLevel).toBe(30);
    expect(BUILT_IN_ROLES.guest.hierarchyLevel).toBe(40);
  });

  it('should give super_admin the global wildcard permission', () => {
    expect(BUILT_IN_ROLES.super_admin.permissions).toEqual(['*']);
  });

  it('should have slug matching the key for each role', () => {
    for (const [key, role] of Object.entries(BUILT_IN_ROLES)) {
      expect(role.slug).toBe(key);
    }
  });

  it('should have a name for each role', () => {
    for (const role of Object.values(BUILT_IN_ROLES)) {
      expect(role.name).toBeTruthy();
      expect(typeof role.name).toBe('string');
    }
  });
});

describe('requireMinimumRole', () => {
  it('should return true when user level equals required level', () => {
    expect(requireMinimumRole(10, 10)).toBe(true);
  });

  it('should return true when user level is more privileged (lower number)', () => {
    expect(requireMinimumRole(0, 10)).toBe(true);
  });

  it('should return false when user level is less privileged (higher number)', () => {
    expect(requireMinimumRole(30, 10)).toBe(false);
  });

  it('should return true for super_admin against any requirement', () => {
    expect(requireMinimumRole(0, 40)).toBe(true);
  });

  it('should return false for guest against admin requirement', () => {
    expect(requireMinimumRole(40, 10)).toBe(false);
  });
});

describe('getRoleBySlug', () => {
  it('should return role definition for valid built-in slug', () => {
    const role = getRoleBySlug('admin');
    expect(role).toBeDefined();
    expect(role!.slug).toBe('admin');
    expect(role!.hierarchyLevel).toBe(10);
  });

  it('should return undefined for unknown slug', () => {
    expect(getRoleBySlug('nonexistent')).toBeUndefined();
  });
});

describe('PERMISSIONS constant', () => {
  it('should have GLOBAL wildcard', () => {
    expect(PERMISSIONS.GLOBAL).toBe('*');
  });

  it('should have USERS permissions', () => {
    expect(PERMISSIONS.USERS.READ).toBe('users:read');
    expect(PERMISSIONS.USERS.WRITE).toBe('users:write');
    expect(PERMISSIONS.USERS.DELETE).toBe('users:delete');
    expect(PERMISSIONS.USERS.WILDCARD).toBe('users:*');
  });

  it('should have TEAMS permissions', () => {
    expect(PERMISSIONS.TEAMS.READ).toBe('teams:read');
    expect(PERMISSIONS.TEAMS.WRITE).toBe('teams:write');
    expect(PERMISSIONS.TEAMS.MANAGE).toBe('teams:manage');
    expect(PERMISSIONS.TEAMS.WILDCARD).toBe('teams:*');
  });

  it('should have ROLES permissions', () => {
    expect(PERMISSIONS.ROLES.READ).toBe('roles:read');
    expect(PERMISSIONS.ROLES.WRITE).toBe('roles:write');
    expect(PERMISSIONS.ROLES.ASSIGN).toBe('roles:assign');
    expect(PERMISSIONS.ROLES.WILDCARD).toBe('roles:*');
  });

  it('should have SETTINGS permissions', () => {
    expect(PERMISSIONS.SETTINGS.READ).toBe('settings:read');
    expect(PERMISSIONS.SETTINGS.WRITE).toBe('settings:write');
    expect(PERMISSIONS.SETTINGS.WILDCARD).toBe('settings:*');
  });

  it('should have AUDIT permissions', () => {
    expect(PERMISSIONS.AUDIT.READ).toBe('audit:read');
    expect(PERMISSIONS.AUDIT.EXPORT).toBe('audit:export');
    expect(PERMISSIONS.AUDIT.WILDCARD).toBe('audit:*');
  });
});
```

## Step 2: Verify Tests Fail

Run:
```bash
cd packages/dream/rbac && npx vitest run tests/hierarchy.test.ts
```

**Expected output:** All tests fail with:
```
Error: Failed to resolve import '../src/hierarchy'
```

## Step 3: Implement the Constants and Hierarchy

**Create `packages/dream/rbac/src/constants.ts`:**

```typescript
/**
 * Typed PERMISSIONS constant for autocomplete-friendly permission references.
 * Use these instead of raw strings to avoid typos and enable IDE support.
 */
export const PERMISSIONS = {
  USERS: {
    READ: 'users:read',
    WRITE: 'users:write',
    DELETE: 'users:delete',
    WILDCARD: 'users:*',
  },
  TEAMS: {
    READ: 'teams:read',
    WRITE: 'teams:write',
    MANAGE: 'teams:manage',
    WILDCARD: 'teams:*',
  },
  ROLES: {
    READ: 'roles:read',
    WRITE: 'roles:write',
    ASSIGN: 'roles:assign',
    WILDCARD: 'roles:*',
  },
  INVOICES: {
    READ: 'invoices:read',
    WRITE: 'invoices:write',
    DELETE: 'invoices:delete',
    WILDCARD: 'invoices:*',
  },
  REPORTS: {
    READ: 'reports:read',
    EXPORT: 'reports:export',
    WILDCARD: 'reports:*',
  },
  SETTINGS: {
    READ: 'settings:read',
    WRITE: 'settings:write',
    WILDCARD: 'settings:*',
  },
  AUDIT: {
    READ: 'audit:read',
    EXPORT: 'audit:export',
    WILDCARD: 'audit:*',
  },
  GLOBAL: '*',
} as const;
```

**Create `packages/dream/rbac/src/hierarchy.ts`:**

```typescript
import type { BuiltInRole, RoleDefinition } from '@dream/types';

/**
 * Built-in role definitions with hierarchy levels.
 * Lower hierarchyLevel = higher privilege.
 */
export const BUILT_IN_ROLES: Record<BuiltInRole, RoleDefinition> = {
  super_admin: {
    slug: 'super_admin',
    name: 'Super Admin',
    hierarchyLevel: 0,
    permissions: ['*'],
  },
  admin: {
    slug: 'admin',
    name: 'Admin',
    hierarchyLevel: 10,
    permissions: [
      'users:*',
      'roles:*',
      'teams:*',
      'departments:*',
      'invitations:*',
      'settings:*',
      'audit:read',
    ],
  },
  manager: {
    slug: 'manager',
    name: 'Manager',
    hierarchyLevel: 20,
    permissions: [
      'users:read',
      'teams:*',
      'departments:read',
      'invitations:create',
      'invitations:read',
    ],
  },
  user: {
    slug: 'user',
    name: 'User',
    hierarchyLevel: 30,
    permissions: ['users:read:self', 'teams:read', 'departments:read'],
  },
  guest: {
    slug: 'guest',
    name: 'Guest',
    hierarchyLevel: 40,
    permissions: ['users:read:self'],
  },
};

/**
 * Checks if a user's hierarchy level meets or exceeds the required level.
 * Lower number = more privileged. Returns true if userLevel <= requiredLevel.
 */
export function requireMinimumRole(
  userLevel: number,
  requiredLevel: number,
): boolean {
  return userLevel <= requiredLevel;
}

/**
 * Looks up a role definition by its slug.
 * Searches built-in roles first, then any registered custom roles.
 */
export function getRoleBySlug(slug: string): RoleDefinition | undefined {
  return (BUILT_IN_ROLES as Record<string, RoleDefinition>)[slug];
}
```

## Step 4: Verify Tests Pass

Run:
```bash
cd packages/dream/rbac && npx vitest run tests/hierarchy.test.ts
```

**Expected output:**
```
 ✓ tests/hierarchy.test.ts (18 tests)
   ✓ BUILT_IN_ROLES > should have exactly 5 entries
   ✓ BUILT_IN_ROLES > should contain super_admin, admin, manager, user, guest
   ✓ BUILT_IN_ROLES > should have correct hierarchy levels
   ✓ BUILT_IN_ROLES > should give super_admin the global wildcard permission
   ✓ BUILT_IN_ROLES > should have slug matching the key for each role
   ✓ BUILT_IN_ROLES > should have a name for each role
   ✓ requireMinimumRole > should return true when user level equals required level
   ✓ requireMinimumRole > should return true when user level is more privileged
   ✓ requireMinimumRole > should return false when user level is less privileged
   ✓ requireMinimumRole > should return true for super_admin against any requirement
   ✓ requireMinimumRole > should return false for guest against admin requirement
   ✓ getRoleBySlug > should return role definition for valid built-in slug
   ✓ getRoleBySlug > should return undefined for unknown slug
   ✓ PERMISSIONS constant > should have GLOBAL wildcard
   ✓ PERMISSIONS constant > should have USERS permissions
   ✓ PERMISSIONS constant > should have TEAMS permissions
   ✓ PERMISSIONS constant > should have ROLES permissions
   ✓ PERMISSIONS constant > should have SETTINGS permissions
   ✓ PERMISSIONS constant > should have AUDIT permissions

Test Files  1 passed (1)
     Tests  18 passed (18)
```

## Step 5: Commit

```bash
cd packages/dream/rbac && git add src/constants.ts src/hierarchy.ts tests/hierarchy.test.ts && git commit -m "feat(rbac): add PERMISSIONS constant, BUILT_IN_ROLES, and role hierarchy

- PERMISSIONS typed constant with autocomplete-friendly resource:action strings
- BUILT_IN_ROLES with 5 roles (super_admin through guest) and hierarchy levels
- requireMinimumRole() for hierarchy-based access checks
- getRoleBySlug() for role lookups
- 18 tests covering all roles, hierarchy logic, and permission constants"
```

---

# Task 17: Create defineCustomRoles and Role Registry

## Goal
Implement `defineCustomRoles()` which validates and registers custom role definitions.

## Files to Create
- `packages/dream/rbac/src/custom-roles.ts`
- `packages/dream/rbac/tests/custom-roles.test.ts`

## Step 1: Write the Failing Tests

**Create `packages/dream/rbac/tests/custom-roles.test.ts`:**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { defineCustomRoles, resetCustomRoles } from '../src/custom-roles';
import { getRoleBySlug } from '../src/hierarchy';

describe('defineCustomRoles', () => {
  beforeEach(() => {
    resetCustomRoles();
  });

  it('should accept a valid custom role and return it', () => {
    const result = defineCustomRoles([
      {
        slug: 'team-lead',
        name: 'Team Lead',
        hierarchyLevel: 15,
        permissions: ['users:read', 'teams:*'],
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('team-lead');
    expect(result[0].name).toBe('Team Lead');
    expect(result[0].hierarchyLevel).toBe(15);
    expect(result[0].permissions).toEqual(['users:read', 'teams:*']);
  });

  it('should reject hierarchy level 0 (reserved for super_admin)', () => {
    expect(() =>
      defineCustomRoles([
        {
          slug: 'custom-top',
          name: 'Custom Top',
          hierarchyLevel: 0,
          permissions: ['*'],
        },
      ]),
    ).toThrow('Hierarchy level must be between 1 and 100');
  });

  it('should reject hierarchy level greater than 100', () => {
    expect(() =>
      defineCustomRoles([
        {
          slug: 'custom-low',
          name: 'Custom Low',
          hierarchyLevel: 101,
          permissions: ['users:read'],
        },
      ]),
    ).toThrow('Hierarchy level must be between 1 and 100');
  });

  it('should reject invalid slug format', () => {
    expect(() =>
      defineCustomRoles([
        {
          slug: 'Invalid Slug!',
          name: 'Bad Slug',
          hierarchyLevel: 25,
          permissions: ['users:read'],
        },
      ]),
    ).toThrow('Invalid slug format');
  });

  it('should accept slugs with lowercase letters, numbers, and hyphens', () => {
    const result = defineCustomRoles([
      {
        slug: 'dept-manager-2',
        name: 'Department Manager 2',
        hierarchyLevel: 18,
        permissions: ['departments:*'],
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('dept-manager-2');
  });

  it('should return multiple custom roles in order', () => {
    const result = defineCustomRoles([
      {
        slug: 'senior-manager',
        name: 'Senior Manager',
        hierarchyLevel: 15,
        permissions: ['users:read', 'teams:*'],
      },
      {
        slug: 'junior-user',
        name: 'Junior User',
        hierarchyLevel: 35,
        permissions: ['users:read:self'],
      },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe('senior-manager');
    expect(result[1].slug).toBe('junior-user');
  });

  it('should allow custom roles with product-specific permissions', () => {
    const result = defineCustomRoles([
      {
        slug: 'billing-admin',
        name: 'Billing Admin',
        hierarchyLevel: 12,
        permissions: ['invoices:*', 'payments:*', 'subscriptions:read'],
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].permissions).toContain('invoices:*');
    expect(result[0].permissions).toContain('payments:*');
  });

  it('should make custom roles findable via getRoleBySlug', () => {
    defineCustomRoles([
      {
        slug: 'custom-viewer',
        name: 'Custom Viewer',
        hierarchyLevel: 35,
        permissions: ['users:read:self'],
      },
    ]);

    const found = getRoleBySlug('custom-viewer');
    expect(found).toBeDefined();
    expect(found!.slug).toBe('custom-viewer');
    expect(found!.hierarchyLevel).toBe(35);
  });

  it('should support optional organizationId scoping', () => {
    const result = defineCustomRoles([
      {
        slug: 'org-admin',
        name: 'Org Admin',
        hierarchyLevel: 11,
        permissions: ['users:*', 'teams:*'],
        organizationId: 'org-123',
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('org-admin');
  });

  it('should reject empty permissions array', () => {
    expect(() =>
      defineCustomRoles([
        {
          slug: 'no-perms',
          name: 'No Permissions',
          hierarchyLevel: 50,
          permissions: [],
        },
      ]),
    ).toThrow('Permissions must be a non-empty array');
  });
});
```

## Step 2: Verify Tests Fail

Run:
```bash
cd packages/dream/rbac && npx vitest run tests/custom-roles.test.ts
```

**Expected output:**
```
Error: Failed to resolve import '../src/custom-roles'
```

## Step 3: Implement defineCustomRoles

**Create `packages/dream/rbac/src/custom-roles.ts`:**

```typescript
import type { RoleDefinition } from '@dream/types';

export interface CustomRoleDefinition {
  slug: string;
  name: string;
  hierarchyLevel: number;
  permissions: string[];
  organizationId?: string;
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Internal registry of custom roles, keyed by slug */
let customRoleRegistry: Map<string, RoleDefinition> = new Map();

/**
 * Resets the custom role registry. Used for test cleanup.
 */
export function resetCustomRoles(): void {
  customRoleRegistry = new Map();
}

/**
 * Returns a custom role by slug, or undefined if not found.
 * Called by getRoleBySlug in hierarchy.ts as a fallback.
 */
export function getCustomRole(slug: string): RoleDefinition | undefined {
  return customRoleRegistry.get(slug);
}

/**
 * Validates and registers custom role definitions.
 *
 * Validation rules:
 * - Hierarchy level must be between 1 and 100 (0 reserved for super_admin)
 * - Slug must be lowercase alphanumeric with hyphens
 * - Permissions must be a non-empty array of strings
 *
 * @returns The validated RoleDefinition array
 */
export function defineCustomRoles(
  roles: CustomRoleDefinition[],
): RoleDefinition[] {
  const result: RoleDefinition[] = [];

  for (const role of roles) {
    // Validate hierarchy level
    if (role.hierarchyLevel < 1 || role.hierarchyLevel > 100) {
      throw new Error(
        `Hierarchy level must be between 1 and 100. Got ${role.hierarchyLevel} for role "${role.slug}".`,
      );
    }

    // Validate slug format
    if (!SLUG_PATTERN.test(role.slug)) {
      throw new Error(
        `Invalid slug format: "${role.slug}". Must be lowercase alphanumeric with hyphens.`,
      );
    }

    // Validate permissions
    if (!Array.isArray(role.permissions) || role.permissions.length === 0) {
      throw new Error(
        `Permissions must be a non-empty array of strings for role "${role.slug}".`,
      );
    }

    const roleDef: RoleDefinition = {
      slug: role.slug,
      name: role.name,
      hierarchyLevel: role.hierarchyLevel,
      permissions: role.permissions,
    };

    customRoleRegistry.set(role.slug, roleDef);
    result.push(roleDef);
  }

  return result;
}
```

Now update `packages/dream/rbac/src/hierarchy.ts` to also search custom roles.

**Add to the end of `getRoleBySlug` in `packages/dream/rbac/src/hierarchy.ts`:**

Replace the existing `getRoleBySlug` function:

```typescript
import type { BuiltInRole, RoleDefinition } from '@dream/types';
import { getCustomRole } from './custom-roles';

// ... BUILT_IN_ROLES and requireMinimumRole stay the same ...

/**
 * Looks up a role definition by its slug.
 * Searches built-in roles first, then any registered custom roles.
 */
export function getRoleBySlug(slug: string): RoleDefinition | undefined {
  const builtIn = (BUILT_IN_ROLES as Record<string, RoleDefinition>)[slug];
  if (builtIn) {
    return builtIn;
  }
  return getCustomRole(slug);
}
```

## Step 4: Verify Tests Pass

Run:
```bash
cd packages/dream/rbac && npx vitest run tests/custom-roles.test.ts
```

**Expected output:**
```
 ✓ tests/custom-roles.test.ts (10 tests)
   ✓ defineCustomRoles > should accept a valid custom role and return it
   ✓ defineCustomRoles > should reject hierarchy level 0
   ✓ defineCustomRoles > should reject hierarchy level greater than 100
   ✓ defineCustomRoles > should reject invalid slug format
   ✓ defineCustomRoles > should accept slugs with lowercase letters, numbers, and hyphens
   ✓ defineCustomRoles > should return multiple custom roles in order
   ✓ defineCustomRoles > should allow custom roles with product-specific permissions
   ✓ defineCustomRoles > should make custom roles findable via getRoleBySlug
   ✓ defineCustomRoles > should support optional organizationId scoping
   ✓ defineCustomRoles > should reject empty permissions array

Test Files  1 passed (1)
     Tests  10 passed (10)
```

Also verify previous tests still pass:
```bash
cd packages/dream/rbac && npx vitest run tests/hierarchy.test.ts
```

**Expected output:** All 18 tests still pass.

## Step 5: Commit

```bash
cd packages/dream/rbac && git add src/custom-roles.ts src/hierarchy.ts tests/custom-roles.test.ts && git commit -m "feat(rbac): add defineCustomRoles with validation and role registry

- defineCustomRoles validates hierarchy level (1-100), slug format, permissions
- Custom roles registered in internal registry, findable via getRoleBySlug
- Support for product-specific permissions and organizationId scoping
- resetCustomRoles() for test cleanup
- 10 tests covering validation, registration, and lookup"
```

---

# Task 18: Create Middleware Higher-Order Functions (Server-Side)

## Goal
Implement server-side middleware HOFs that wrap handlers with permission/role checks.

## Files to Create
- `packages/dream/rbac/src/middleware.ts`
- `packages/dream/rbac/tests/middleware.test.ts`

## Step 1: Write the Failing Tests

**Create `packages/dream/rbac/tests/middleware.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';
import {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole,
  requireMinimumRoleMiddleware,
} from '../src/middleware';

// Simple handler type matching the middleware signature
const echoHandler = async (req: any, ctx: any) => ({ ok: true });

function makeCtx(overrides: Partial<{
  permissions: string[];
  activeRole: string;
  roleLevel: number;
}> = {}) {
  return {
    permissions: overrides.permissions ?? [],
    activeRole: overrides.activeRole ?? 'user',
    roleLevel: overrides.roleLevel ?? 30,
  };
}

describe('requirePermission', () => {
  it('should allow when user has the required permission', async () => {
    const wrapped = requirePermission('users:read')(echoHandler);
    const result = await wrapped({}, makeCtx({ permissions: ['users:read'] }));
    expect(result).toEqual({ ok: true });
  });

  it('should throw AuthorizationError when permission is missing', async () => {
    const wrapped = requirePermission('users:write')(echoHandler);
    await expect(
      wrapped({}, makeCtx({ permissions: ['users:read'] })),
    ).rejects.toThrow();

    try {
      await wrapped({}, makeCtx({ permissions: ['users:read'] }));
    } catch (e: any) {
      expect(e.code).toBe('rbac/permission-denied');
    }
  });

  it('should allow when user has wildcard permission', async () => {
    const wrapped = requirePermission('users:read')(echoHandler);
    const result = await wrapped({}, makeCtx({ permissions: ['*'] }));
    expect(result).toEqual({ ok: true });
  });
});

describe('requireAnyPermission', () => {
  it('should allow when user has any of the required permissions', async () => {
    const wrapped = requireAnyPermission('users:read', 'users:write')(echoHandler);
    const result = await wrapped({}, makeCtx({ permissions: ['users:write'] }));
    expect(result).toEqual({ ok: true });
  });

  it('should throw when user has none of the required permissions', async () => {
    const wrapped = requireAnyPermission('users:write', 'users:delete')(echoHandler);
    await expect(
      wrapped({}, makeCtx({ permissions: ['users:read'] })),
    ).rejects.toThrow();

    try {
      await wrapped({}, makeCtx({ permissions: ['users:read'] }));
    } catch (e: any) {
      expect(e.code).toBe('rbac/permission-denied');
    }
  });
});

describe('requireAllPermissions', () => {
  it('should allow when user has all required permissions', async () => {
    const wrapped = requireAllPermissions('users:read', 'teams:read')(echoHandler);
    const result = await wrapped(
      {},
      makeCtx({ permissions: ['users:read', 'teams:read', 'settings:read'] }),
    );
    expect(result).toEqual({ ok: true });
  });

  it('should throw when user is missing one required permission', async () => {
    const wrapped = requireAllPermissions('users:read', 'teams:write')(echoHandler);
    await expect(
      wrapped({}, makeCtx({ permissions: ['users:read'] })),
    ).rejects.toThrow();

    try {
      await wrapped({}, makeCtx({ permissions: ['users:read'] }));
    } catch (e: any) {
      expect(e.code).toBe('rbac/permission-denied');
    }
  });
});

describe('requireRole', () => {
  it('should allow when user has the exact required role', async () => {
    const wrapped = requireRole('admin')(echoHandler);
    const result = await wrapped({}, makeCtx({ activeRole: 'admin' }));
    expect(result).toEqual({ ok: true });
  });

  it('should throw when user has a different role', async () => {
    const wrapped = requireRole('admin')(echoHandler);
    await expect(
      wrapped({}, makeCtx({ activeRole: 'user' })),
    ).rejects.toThrow();

    try {
      await wrapped({}, makeCtx({ activeRole: 'user' }));
    } catch (e: any) {
      expect(e.code).toBe('rbac/permission-denied');
    }
  });
});

describe('requireMinimumRoleMiddleware', () => {
  it('should allow when user level meets minimum', async () => {
    const wrapped = requireMinimumRoleMiddleware(20)(echoHandler);
    const result = await wrapped({}, makeCtx({ roleLevel: 10 }));
    expect(result).toEqual({ ok: true });
  });

  it('should allow when user level equals minimum', async () => {
    const wrapped = requireMinimumRoleMiddleware(20)(echoHandler);
    const result = await wrapped({}, makeCtx({ roleLevel: 20 }));
    expect(result).toEqual({ ok: true });
  });

  it('should throw when user level is too low (higher number)', async () => {
    const wrapped = requireMinimumRoleMiddleware(10)(echoHandler);
    await expect(
      wrapped({}, makeCtx({ roleLevel: 30 })),
    ).rejects.toThrow();

    try {
      await wrapped({}, makeCtx({ roleLevel: 30 }));
    } catch (e: any) {
      expect(e.code).toBe('rbac/permission-denied');
    }
  });

  it('should have error code rbac/permission-denied', async () => {
    const wrapped = requireMinimumRoleMiddleware(10)(echoHandler);
    try {
      await wrapped({}, makeCtx({ roleLevel: 30 }));
    } catch (e: any) {
      expect(e.code).toBe('rbac/permission-denied');
      expect(e.message).toBeTruthy();
    }
  });
});
```

## Step 2: Verify Tests Fail

Run:
```bash
cd packages/dream/rbac && npx vitest run tests/middleware.test.ts
```

**Expected output:**
```
Error: Failed to resolve import '../src/middleware'
```

## Step 3: Implement the Middleware HOFs

**Create `packages/dream/rbac/src/middleware.ts`:**

```typescript
import { matchesPermission, hasAnyPermission, hasAllPermissions } from './permissions';
import { requireMinimumRole } from './hierarchy';

/**
 * Authorization error thrown by RBAC middleware when access is denied.
 */
export class AuthorizationError extends Error {
  public readonly code = 'rbac/permission-denied';
  public readonly statusCode = 403;

  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

type HandlerContext = {
  permissions: string[];
  activeRole: string;
  roleLevel: number;
};

type SimpleHandler = (req: any, ctx: HandlerContext) => Promise<any>;
type MiddlewareHOF = (handler: SimpleHandler) => SimpleHandler;

/**
 * Requires a single permission. Throws AuthorizationError if the user
 * does not have a permission that matches the required one.
 */
export function requirePermission(permission: string): MiddlewareHOF {
  return (handler: SimpleHandler): SimpleHandler => {
    return async (req: any, ctx: HandlerContext) => {
      const hasPermission = ctx.permissions.some((p) =>
        matchesPermission(p, permission),
      );
      if (!hasPermission) {
        throw new AuthorizationError(
          `Missing required permission: ${permission}`,
        );
      }
      return handler(req, ctx);
    };
  };
}

/**
 * Requires any one of the listed permissions (OR logic).
 * Throws AuthorizationError if the user has none of them.
 */
export function requireAnyPermission(
  ...permissions: string[]
): MiddlewareHOF {
  return (handler: SimpleHandler): SimpleHandler => {
    return async (req: any, ctx: HandlerContext) => {
      if (!hasAnyPermission(ctx.permissions, permissions)) {
        throw new AuthorizationError(
          `Missing required permissions (any of): ${permissions.join(', ')}`,
        );
      }
      return handler(req, ctx);
    };
  };
}

/**
 * Requires all of the listed permissions (AND logic).
 * Throws AuthorizationError if the user is missing any one of them.
 */
export function requireAllPermissions(
  ...permissions: string[]
): MiddlewareHOF {
  return (handler: SimpleHandler): SimpleHandler => {
    return async (req: any, ctx: HandlerContext) => {
      if (!hasAllPermissions(ctx.permissions, permissions)) {
        throw new AuthorizationError(
          `Missing required permissions (all of): ${permissions.join(', ')}`,
        );
      }
      return handler(req, ctx);
    };
  };
}

/**
 * Requires an exact role match. Throws AuthorizationError if the
 * user's active role does not match.
 */
export function requireRole(role: string): MiddlewareHOF {
  return (handler: SimpleHandler): SimpleHandler => {
    return async (req: any, ctx: HandlerContext) => {
      if (ctx.activeRole !== role) {
        throw new AuthorizationError(
          `Required role "${role}" but user has role "${ctx.activeRole}"`,
        );
      }
      return handler(req, ctx);
    };
  };
}

/**
 * Requires the user's hierarchy level to be at or above (lower number)
 * the specified minimum level. Throws AuthorizationError if not met.
 */
export function requireMinimumRoleMiddleware(
  minimumLevel: number,
): MiddlewareHOF {
  return (handler: SimpleHandler): SimpleHandler => {
    return async (req: any, ctx: HandlerContext) => {
      if (!requireMinimumRole(ctx.roleLevel, minimumLevel)) {
        throw new AuthorizationError(
          `Insufficient role level. Required: ${minimumLevel}, user has: ${ctx.roleLevel}`,
        );
      }
      return handler(req, ctx);
    };
  };
}
```

## Step 4: Verify Tests Pass

Run:
```bash
cd packages/dream/rbac && npx vitest run tests/middleware.test.ts
```

**Expected output:**
```
 ✓ tests/middleware.test.ts (11 tests)
   ✓ requirePermission > should allow when user has the required permission
   ✓ requirePermission > should throw AuthorizationError when permission is missing
   ✓ requirePermission > should allow when user has wildcard permission
   ✓ requireAnyPermission > should allow when user has any of the required permissions
   ✓ requireAnyPermission > should throw when user has none of the required permissions
   ✓ requireAllPermissions > should allow when user has all required permissions
   ✓ requireAllPermissions > should throw when user is missing one required permission
   ✓ requireRole > should allow when user has the exact required role
   ✓ requireRole > should throw when user has a different role
   ✓ requireMinimumRoleMiddleware > should allow when user level meets minimum
   ✓ requireMinimumRoleMiddleware > should allow when user level equals minimum
   ✓ requireMinimumRoleMiddleware > should throw when user level is too low
   ✓ requireMinimumRoleMiddleware > should have error code rbac/permission-denied

Test Files  1 passed (1)
     Tests  11 passed (11)
```

## Step 5: Commit

```bash
cd packages/dream/rbac && git add src/middleware.ts tests/middleware.test.ts && git commit -m "feat(rbac): add middleware HOFs for permission and role enforcement

- requirePermission, requireAnyPermission, requireAllPermissions
- requireRole (exact match) and requireMinimumRoleMiddleware (hierarchy)
- AuthorizationError with code 'rbac/permission-denied' and statusCode 403
- 11 tests covering allow/deny paths for all middleware types"
```

---

# Task 19: Create React Components and Hooks

## Goal
Implement `PermissionGate`, `RoleGate`, `AdminGate` components and `usePermission`, `useRole`, `useHasMinimumRole` hooks.

## Files to Create
- `packages/dream/rbac/src/react/index.ts`
- `packages/dream/rbac/src/react/context.ts` (mock-friendly auth context bridge)
- `packages/dream/rbac/src/react/hooks.ts`
- `packages/dream/rbac/src/react/permission-gate.tsx`
- `packages/dream/rbac/src/react/role-gate.tsx`
- `packages/dream/rbac/src/react/admin-gate.tsx`
- `packages/dream/rbac/tests/react/gates.test.tsx`
- `packages/dream/rbac/tests/react/hooks.test.tsx`

## Step 1: Write the Failing Tests

**Create `packages/dream/rbac/tests/react/gates.test.tsx`:**

```tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PermissionGate } from '../../src/react/permission-gate';
import { RoleGate } from '../../src/react/role-gate';
import { AdminGate } from '../../src/react/admin-gate';
import { RbacTestProvider } from '../../src/react/context';

describe('PermissionGate', () => {
  it('should render children when user has the required permission', () => {
    render(
      <RbacTestProvider permissions={['users:read']} activeRole="user" roleLevel={30}>
        <PermissionGate permission="users:read">
          <span>Visible</span>
        </PermissionGate>
      </RbacTestProvider>,
    );
    expect(screen.getByText('Visible')).toBeDefined();
  });

  it('should render fallback when permission is denied', () => {
    render(
      <RbacTestProvider permissions={['teams:read']} activeRole="user" roleLevel={30}>
        <PermissionGate permission="users:write" fallback={<span>Denied</span>}>
          <span>Visible</span>
        </PermissionGate>
      </RbacTestProvider>,
    );
    expect(screen.queryByText('Visible')).toBeNull();
    expect(screen.getByText('Denied')).toBeDefined();
  });

  it('should render nothing when no fallback and permission denied', () => {
    const { container } = render(
      <RbacTestProvider permissions={['teams:read']} activeRole="user" roleLevel={30}>
        <PermissionGate permission="users:write">
          <span>Visible</span>
        </PermissionGate>
      </RbacTestProvider>,
    );
    expect(screen.queryByText('Visible')).toBeNull();
    expect(container.innerHTML).toBe('');
  });

  it('should render nothing when outside provider (unauthenticated)', () => {
    const { container } = render(
      <PermissionGate permission="users:read">
        <span>Visible</span>
      </PermissionGate>,
    );
    expect(screen.queryByText('Visible')).toBeNull();
    expect(container.innerHTML).toBe('');
  });

  it('should render children when user has wildcard permission', () => {
    render(
      <RbacTestProvider permissions={['*']} activeRole="super_admin" roleLevel={0}>
        <PermissionGate permission="users:delete">
          <span>Wildcard Access</span>
        </PermissionGate>
      </RbacTestProvider>,
    );
    expect(screen.getByText('Wildcard Access')).toBeDefined();
  });
});

describe('RoleGate', () => {
  it('should render children for matching role', () => {
    render(
      <RbacTestProvider permissions={[]} activeRole="admin" roleLevel={10}>
        <RoleGate role="admin">
          <span>Admin Content</span>
        </RoleGate>
      </RbacTestProvider>,
    );
    expect(screen.getByText('Admin Content')).toBeDefined();
  });

  it('should not render children for non-matching role', () => {
    render(
      <RbacTestProvider permissions={[]} activeRole="user" roleLevel={30}>
        <RoleGate role="admin" fallback={<span>Not Admin</span>}>
          <span>Admin Content</span>
        </RoleGate>
      </RbacTestProvider>,
    );
    expect(screen.queryByText('Admin Content')).toBeNull();
    expect(screen.getByText('Not Admin')).toBeDefined();
  });
});

describe('AdminGate', () => {
  it('should render children for admin (level 10)', () => {
    render(
      <RbacTestProvider permissions={[]} activeRole="admin" roleLevel={10}>
        <AdminGate>
          <span>Admin Panel</span>
        </AdminGate>
      </RbacTestProvider>,
    );
    expect(screen.getByText('Admin Panel')).toBeDefined();
  });

  it('should render children for super_admin (level 0)', () => {
    render(
      <RbacTestProvider permissions={['*']} activeRole="super_admin" roleLevel={0}>
        <AdminGate>
          <span>Admin Panel</span>
        </AdminGate>
      </RbacTestProvider>,
    );
    expect(screen.getByText('Admin Panel')).toBeDefined();
  });

  it('should not render children for user role (level 30)', () => {
    render(
      <RbacTestProvider permissions={[]} activeRole="user" roleLevel={30}>
        <AdminGate fallback={<span>Access Denied</span>}>
          <span>Admin Panel</span>
        </AdminGate>
      </RbacTestProvider>,
    );
    expect(screen.queryByText('Admin Panel')).toBeNull();
    expect(screen.getByText('Access Denied')).toBeDefined();
  });
});
```

**Create `packages/dream/rbac/tests/react/hooks.test.tsx`:**

```tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermission, useRole, useHasMinimumRole } from '../../src/react/hooks';
import { RbacTestProvider } from '../../src/react/context';

describe('usePermission', () => {
  it('should return true when user has the permission', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RbacTestProvider permissions={['users:read', 'teams:write']} activeRole="user" roleLevel={30}>
        {children}
      </RbacTestProvider>
    );

    const { result } = renderHook(() => usePermission('users:read'), { wrapper });
    expect(result.current).toBe(true);
  });

  it('should return false when user does not have the permission', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RbacTestProvider permissions={['users:read']} activeRole="user" roleLevel={30}>
        {children}
      </RbacTestProvider>
    );

    const { result } = renderHook(() => usePermission('users:delete'), { wrapper });
    expect(result.current).toBe(false);
  });

  it('should return false when outside provider', () => {
    const { result } = renderHook(() => usePermission('users:read'));
    expect(result.current).toBe(false);
  });
});

describe('useRole', () => {
  it('should return role information from context', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RbacTestProvider permissions={[]} activeRole="admin" roleLevel={10} roles={['admin', 'user']}>
        {children}
      </RbacTestProvider>
    );

    const { result } = renderHook(() => useRole(), { wrapper });
    expect(result.current.role).toBe('admin');
    expect(result.current.roles).toEqual(['admin', 'user']);
    expect(result.current.hierarchyLevel).toBe(10);
  });

  it('should return safe defaults when outside provider', () => {
    const { result } = renderHook(() => useRole());
    expect(result.current.role).toBe('');
    expect(result.current.roles).toEqual([]);
    expect(result.current.hierarchyLevel).toBe(-1);
  });
});

describe('useHasMinimumRole', () => {
  it('should return true when user meets minimum role', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RbacTestProvider permissions={[]} activeRole="admin" roleLevel={10}>
        {children}
      </RbacTestProvider>
    );

    const { result } = renderHook(() => useHasMinimumRole('manager'), { wrapper });
    expect(result.current).toBe(true);
  });

  it('should return false when user does not meet minimum role', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RbacTestProvider permissions={[]} activeRole="user" roleLevel={30}>
        {children}
      </RbacTestProvider>
    );

    const { result } = renderHook(() => useHasMinimumRole('admin'), { wrapper });
    expect(result.current).toBe(false);
  });

  it('should return false when outside provider', () => {
    const { result } = renderHook(() => useHasMinimumRole('user'));
    expect(result.current).toBe(false);
  });
});
```

## Step 2: Verify Tests Fail

Run:
```bash
cd packages/dream/rbac && npx vitest run tests/react/
```

**Expected output:**
```
Error: Failed to resolve import '../../src/react/permission-gate'
```

## Step 3: Implement the React Components and Hooks

**Create `packages/dream/rbac/src/react/context.ts`:**

```typescript
'use client';

import { createContext, useContext, createElement } from 'react';
import type { ReactNode } from 'react';

export interface RbacContextValue {
  permissions: string[];
  activeRole: string;
  roles: string[];
  roleLevel: number;
}

const defaultValue: RbacContextValue = {
  permissions: [],
  activeRole: '',
  roles: [],
  roleLevel: -1,
};

export const RbacContext = createContext<RbacContextValue | null>(null);

/**
 * Hook to access the RBAC context. Returns safe defaults when
 * used outside a provider (unauthenticated state).
 */
export function useRbacContext(): RbacContextValue {
  const ctx = useContext(RbacContext);
  return ctx ?? defaultValue;
}

/**
 * Test provider for RBAC context. Used in unit tests to simulate
 * authenticated users with specific permissions and roles.
 *
 * In production, the real AuthProvider from @dream/auth populates this context.
 */
export function RbacTestProvider(props: {
  permissions: string[];
  activeRole: string;
  roleLevel: number;
  roles?: string[];
  children: ReactNode;
}) {
  const value: RbacContextValue = {
    permissions: props.permissions,
    activeRole: props.activeRole,
    roles: props.roles ?? [props.activeRole],
    roleLevel: props.roleLevel,
  };

  return createElement(RbacContext.Provider, { value }, props.children);
}
```

**Create `packages/dream/rbac/src/react/hooks.ts`:**

```typescript
'use client';

import { useMemo } from 'react';
import { useRbacContext } from './context';
import { matchesPermission } from '../permissions';
import { BUILT_IN_ROLES } from '../hierarchy';
import { requireMinimumRole } from '../hierarchy';
import type { RoleDefinition } from '@dream/types';

/**
 * Returns whether the current user has the specified permission.
 * Returns false when outside a provider (unauthenticated).
 */
export function usePermission(permission: string): boolean {
  const { permissions } = useRbacContext();

  return useMemo(
    () => permissions.some((p) => matchesPermission(p, permission)),
    [permissions, permission],
  );
}

/**
 * Returns the current user's role information.
 * Returns safe defaults when outside a provider.
 */
export function useRole(): {
  role: string;
  roles: string[];
  hierarchyLevel: number;
} {
  const { activeRole, roles, roleLevel } = useRbacContext();

  return useMemo(
    () => ({
      role: activeRole,
      roles,
      hierarchyLevel: roleLevel,
    }),
    [activeRole, roles, roleLevel],
  );
}

/**
 * Returns whether the current user meets the minimum role requirement.
 * Looks up the minimum role's hierarchy level from BUILT_IN_ROLES.
 * Returns false when outside a provider.
 */
export function useHasMinimumRole(minimumRole: string): boolean {
  const { roleLevel } = useRbacContext();

  return useMemo(() => {
    // If outside provider, roleLevel is -1 (sentinel for unauthenticated)
    if (roleLevel < 0) {
      return false;
    }

    const roleDef = (BUILT_IN_ROLES as Record<string, RoleDefinition>)[minimumRole];
    if (!roleDef) {
      return false;
    }

    return requireMinimumRole(roleLevel, roleDef.hierarchyLevel);
  }, [roleLevel, minimumRole]);
}
```

**Create `packages/dream/rbac/src/react/permission-gate.tsx`:**

```tsx
'use client';

import type { ReactNode } from 'react';
import { usePermission } from './hooks';

export interface PermissionGateProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only if the current user has the required permission.
 * Renders fallback (default: null) otherwise.
 */
export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps): ReactNode {
  const hasPermission = usePermission(permission);

  if (!hasPermission) {
    return fallback;
  }

  return children;
}
```

**Create `packages/dream/rbac/src/react/role-gate.tsx`:**

```tsx
'use client';

import type { ReactNode } from 'react';
import { useRole } from './hooks';

export interface RoleGateProps {
  role: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only if the current user's active role matches exactly.
 * This is NOT hierarchy-based — use AdminGate for hierarchy checks.
 */
export function RoleGate({
  role,
  children,
  fallback = null,
}: RoleGateProps): ReactNode {
  const { role: activeRole } = useRole();

  if (activeRole !== role) {
    return fallback;
  }

  return children;
}
```

**Create `packages/dream/rbac/src/react/admin-gate.tsx`:**

```tsx
'use client';

import type { ReactNode } from 'react';
import { useRole } from './hooks';

export interface AdminGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only if the current user's hierarchy level is <= 10
 * (i.e., admin or super_admin).
 */
export function AdminGate({
  children,
  fallback = null,
}: AdminGateProps): ReactNode {
  const { hierarchyLevel } = useRole();

  // hierarchyLevel -1 means unauthenticated (outside provider)
  if (hierarchyLevel < 0 || hierarchyLevel > 10) {
    return fallback;
  }

  return children;
}
```

**Create `packages/dream/rbac/src/react/index.ts`:**

```typescript
// Context
export { RbacContext, RbacTestProvider, useRbacContext } from './context';
export type { RbacContextValue } from './context';

// Hooks
export { usePermission, useRole, useHasMinimumRole } from './hooks';

// Gate components
export { PermissionGate } from './permission-gate';
export type { PermissionGateProps } from './permission-gate';
export { RoleGate } from './role-gate';
export type { RoleGateProps } from './role-gate';
export { AdminGate } from './admin-gate';
export type { AdminGateProps } from './admin-gate';
```

## Step 4: Verify Tests Pass

Run:
```bash
cd packages/dream/rbac && npx vitest run tests/react/
```

**Expected output:**
```
 ✓ tests/react/gates.test.tsx (10 tests)
   ✓ PermissionGate > should render children when user has the required permission
   ✓ PermissionGate > should render fallback when permission is denied
   ✓ PermissionGate > should render nothing when no fallback and permission denied
   ✓ PermissionGate > should render nothing when outside provider
   ✓ PermissionGate > should render children when user has wildcard permission
   ✓ RoleGate > should render children for matching role
   ✓ RoleGate > should not render children for non-matching role
   ✓ AdminGate > should render children for admin
   ✓ AdminGate > should render children for super_admin
   ✓ AdminGate > should not render children for user role

 ✓ tests/react/hooks.test.tsx (8 tests)
   ✓ usePermission > should return true when user has the permission
   ✓ usePermission > should return false when user does not have the permission
   ✓ usePermission > should return false when outside provider
   ✓ useRole > should return role information from context
   ✓ useRole > should return safe defaults when outside provider
   ✓ useHasMinimumRole > should return true when user meets minimum role
   ✓ useHasMinimumRole > should return false when user does not meet minimum role
   ✓ useHasMinimumRole > should return false when outside provider

Test Files  2 passed (2)
     Tests  18 passed (18)
```

## Step 5: Commit

```bash
cd packages/dream/rbac && git add src/react/ tests/react/ && git commit -m "feat(rbac): add React components (PermissionGate, RoleGate, AdminGate) and hooks

- PermissionGate renders children based on permission matching
- RoleGate renders children for exact role match
- AdminGate renders children for hierarchy level <= 10
- usePermission, useRole, useHasMinimumRole hooks with safe defaults
- RbacTestProvider for unit testing without @dream/auth dependency
- 18 tests covering all components and hooks including edge cases"
```

---

# Task 20: Create Barrel Export and Verify @dream/rbac

## Goal
Create the main barrel export `index.ts`, add a comprehensive integration test, and verify everything works together (tests pass, typecheck passes, build succeeds).

## Files to Create
- `packages/dream/rbac/src/index.ts`
- `packages/dream/rbac/tests/index.test.ts`

## Step 1: Write the Failing Tests

**Create `packages/dream/rbac/tests/index.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';
import {
  // Permission matching
  matchesPermission,
  hasAnyPermission,
  hasAllPermissions,

  // Role hierarchy
  BUILT_IN_ROLES,
  requireMinimumRole,
  getRoleBySlug,

  // Custom roles
  defineCustomRoles,

  // Constants
  PERMISSIONS,

  // Middleware
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole,
  requireMinimumRoleMiddleware,
  AuthorizationError,
} from '../src/index';

describe('@dream/rbac barrel export', () => {
  describe('permission matching exports', () => {
    it('should export matchesPermission', () => {
      expect(typeof matchesPermission).toBe('function');
      expect(matchesPermission('users:read', 'users:read')).toBe(true);
    });

    it('should export hasAnyPermission', () => {
      expect(typeof hasAnyPermission).toBe('function');
      expect(hasAnyPermission(['users:read'], ['users:read'])).toBe(true);
    });

    it('should export hasAllPermissions', () => {
      expect(typeof hasAllPermissions).toBe('function');
      expect(hasAllPermissions(['users:read'], ['users:read'])).toBe(true);
    });
  });

  describe('role hierarchy exports', () => {
    it('should export BUILT_IN_ROLES', () => {
      expect(BUILT_IN_ROLES).toBeDefined();
      expect(Object.keys(BUILT_IN_ROLES)).toHaveLength(5);
    });

    it('should export requireMinimumRole', () => {
      expect(typeof requireMinimumRole).toBe('function');
      expect(requireMinimumRole(10, 20)).toBe(true);
    });

    it('should export getRoleBySlug', () => {
      expect(typeof getRoleBySlug).toBe('function');
      expect(getRoleBySlug('admin')).toBeDefined();
    });
  });

  describe('custom roles exports', () => {
    it('should export defineCustomRoles', () => {
      expect(typeof defineCustomRoles).toBe('function');
    });
  });

  describe('constants exports', () => {
    it('should export PERMISSIONS', () => {
      expect(PERMISSIONS).toBeDefined();
      expect(PERMISSIONS.GLOBAL).toBe('*');
      expect(PERMISSIONS.USERS.READ).toBe('users:read');
    });
  });

  describe('middleware exports', () => {
    it('should export requirePermission', () => {
      expect(typeof requirePermission).toBe('function');
    });

    it('should export requireAnyPermission', () => {
      expect(typeof requireAnyPermission).toBe('function');
    });

    it('should export requireAllPermissions', () => {
      expect(typeof requireAllPermissions).toBe('function');
    });

    it('should export requireRole', () => {
      expect(typeof requireRole).toBe('function');
    });

    it('should export requireMinimumRoleMiddleware', () => {
      expect(typeof requireMinimumRoleMiddleware).toBe('function');
    });

    it('should export AuthorizationError', () => {
      const err = new AuthorizationError('test');
      expect(err.code).toBe('rbac/permission-denied');
      expect(err.statusCode).toBe(403);
    });
  });

  describe('integration: full permission evaluation flow', () => {
    it('should evaluate admin permissions against PERMISSIONS constant', () => {
      const adminRole = BUILT_IN_ROLES.admin;
      const adminPerms = adminRole.permissions;

      // Admin has users:* so should match users:read
      expect(hasAnyPermission(adminPerms, [PERMISSIONS.USERS.READ])).toBe(true);

      // Admin has audit:read so should match
      expect(hasAnyPermission(adminPerms, [PERMISSIONS.AUDIT.READ])).toBe(true);

      // Admin does NOT have invoices permissions
      expect(hasAnyPermission(adminPerms, [PERMISSIONS.INVOICES.READ])).toBe(false);
    });

    it('should evaluate super_admin global wildcard', () => {
      const superAdminPerms = BUILT_IN_ROLES.super_admin.permissions;

      // Super admin has '*' which matches everything
      expect(hasAllPermissions(superAdminPerms, [
        PERMISSIONS.USERS.DELETE,
        PERMISSIONS.TEAMS.MANAGE,
        PERMISSIONS.INVOICES.WRITE,
        PERMISSIONS.REPORTS.EXPORT,
      ])).toBe(true);
    });

    it('should evaluate guest minimal permissions', () => {
      const guestPerms = BUILT_IN_ROLES.guest.permissions;

      // Guest only has users:read:self
      expect(hasAnyPermission(guestPerms, [PERMISSIONS.USERS.READ])).toBe(false);
      expect(hasAnyPermission(guestPerms, [PERMISSIONS.TEAMS.READ])).toBe(false);
    });
  });
});
```

## Step 2: Verify Tests Fail

Run:
```bash
cd packages/dream/rbac && npx vitest run tests/index.test.ts
```

**Expected output:**
```
Error: Failed to resolve import '../src/index'
```

## Step 3: Create the Barrel Export

**Create `packages/dream/rbac/src/index.ts`:**

```typescript
// Permission matching
export {
  matchesPermission,
  hasAnyPermission,
  hasAllPermissions,
} from './permissions';

// Role hierarchy
export {
  BUILT_IN_ROLES,
  requireMinimumRole,
  getRoleBySlug,
} from './hierarchy';

// Custom roles
export {
  defineCustomRoles,
  resetCustomRoles,
} from './custom-roles';
export type { CustomRoleDefinition } from './custom-roles';

// Constants
export { PERMISSIONS } from './constants';

// Middleware
export {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole,
  requireMinimumRoleMiddleware,
  AuthorizationError,
} from './middleware';
```

## Step 4: Verify All Tests Pass

Run all RBAC tests:
```bash
cd packages/dream/rbac && npx vitest run
```

**Expected output:**
```
 ✓ tests/permissions.test.ts (20 tests)
 ✓ tests/hierarchy.test.ts (18 tests)
 ✓ tests/custom-roles.test.ts (10 tests)
 ✓ tests/middleware.test.ts (11 tests)
 ✓ tests/react/gates.test.tsx (10 tests)
 ✓ tests/react/hooks.test.tsx (8 tests)
 ✓ tests/index.test.ts (15 tests)

Test Files  7 passed (7)
     Tests  92 passed (92)
```

## Step 5: Verify TypeScript Compilation

Run:
```bash
cd packages/dream/rbac && npx tsc --noEmit
```

**Expected output:** No errors (clean exit with code 0).

## Step 6: Verify Build

Run:
```bash
cd packages/dream/rbac && npm run build
```

**Expected output:** Build completes successfully with no errors.

## Step 7: Commit

```bash
cd packages/dream/rbac && git add src/index.ts tests/index.test.ts && git commit -m "feat(rbac): add barrel export and integration tests for @dream/rbac

- Main barrel export from src/index.ts with all public APIs
- React components exported from @dream/rbac/react sub-path
- Integration tests verifying permission evaluation across role hierarchy
- All 92 tests pass, typecheck clean, build succeeds"
```

<!-- ═══ Tasks 21-30: @dream/auth + @dream/multi-tenant ═══ -->



Let me first explore the existing codebase structure to understand the conventions, existing packages, and configuration patterns already in use.

Now let me look at the existing Node package to understand conventions, and check if there's any existing plan doc that references earlier tasks 1-20.

Now let me look at existing test patterns and the existing "dream" concept if any, plus check for monorepo setup (turbo/lerna/nx).

Now let me check if there are existing tasks 1-20 in a plan file, and look at what vitest/testing config patterns are used.

Now let me check the dream-types and dream-errors contracts to understand the shared types that these packages depend on.

I now have all the context I need. Let me write the complete implementation plan for Tasks 21-30.

## Task 21: Create @dream/auth -- Account lockout logic

**Files to create:**
- `packages/dream/auth/src/lockout.ts`
- `packages/dream/auth/tests/lockout.test.ts`

**Prerequisite**: Tasks 1-20 complete (packages/dream/auth has package.json, tsconfig.json, vitest configured, and @dream/types is available).

---

### Step 1: Write the failing test

Create `packages/dream/auth/tests/lockout.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLockoutManager } from '../src/lockout';

describe('createLockoutManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('checkAccountLockout', () => {
    it('should return locked: false for a fresh user', async () => {
      const manager = createLockoutManager();
      const result = await manager.checkAccountLockout('user-1');
      expect(result).toEqual({ locked: false });
    });

    it('should return locked: true with lockedUntil when account is locked', async () => {
      const manager = createLockoutManager({ maxAttempts: 3, durationMinutes: 10 });

      await manager.recordFailedLogin('user-1');
      await manager.recordFailedLogin('user-1');
      await manager.recordFailedLogin('user-1');

      const result = await manager.checkAccountLockout('user-1');
      expect(result.locked).toBe(true);
      expect(result.lockedUntil).toBeInstanceOf(Date);
    });

    it('should return locked: false after lock duration expires', async () => {
      const manager = createLockoutManager({ maxAttempts: 3, durationMinutes: 10 });

      await manager.recordFailedLogin('user-1');
      await manager.recordFailedLogin('user-1');
      await manager.recordFailedLogin('user-1');

      // Advance time by 11 minutes (past the 10-minute lockout)
      vi.advanceTimersByTime(11 * 60 * 1000);

      const result = await manager.checkAccountLockout('user-1');
      expect(result.locked).toBe(false);
    });
  });

  describe('recordFailedLogin', () => {
    it('should return 4 remaining after 1 failure with default config', async () => {
      const manager = createLockoutManager();
      const result = await manager.recordFailedLogin('user-1');
      expect(result).toEqual({ locked: false, attemptsRemaining: 4 });
    });

    it('should lock account after 5 failures with default config', async () => {
      const manager = createLockoutManager();

      let result;
      for (let i = 0; i < 4; i++) {
        result = await manager.recordFailedLogin('user-1');
      }
      expect(result).toEqual({ locked: false, attemptsRemaining: 1 });

      result = await manager.recordFailedLogin('user-1');
      expect(result).toEqual({ locked: true, attemptsRemaining: 0 });
    });

    it('should work with custom maxAttempts', async () => {
      const manager = createLockoutManager({ maxAttempts: 3, durationMinutes: 15 });

      const result1 = await manager.recordFailedLogin('user-1');
      expect(result1).toEqual({ locked: false, attemptsRemaining: 2 });

      await manager.recordFailedLogin('user-1');
      const result3 = await manager.recordFailedLogin('user-1');
      expect(result3).toEqual({ locked: true, attemptsRemaining: 0 });
    });

    it('should work with custom durationMinutes', async () => {
      const manager = createLockoutManager({ maxAttempts: 2, durationMinutes: 30 });

      await manager.recordFailedLogin('user-1');
      await manager.recordFailedLogin('user-1');

      const check = await manager.checkAccountLockout('user-1');
      expect(check.locked).toBe(true);

      // 29 minutes — still locked
      vi.advanceTimersByTime(29 * 60 * 1000);
      const stillLocked = await manager.checkAccountLockout('user-1');
      expect(stillLocked.locked).toBe(true);

      // 31 minutes — unlocked
      vi.advanceTimersByTime(2 * 60 * 1000);
      const unlocked = await manager.checkAccountLockout('user-1');
      expect(unlocked.locked).toBe(false);
    });
  });

  describe('resetFailedLogins', () => {
    it('should reset attempts so account is no longer locked', async () => {
      const manager = createLockoutManager({ maxAttempts: 2, durationMinutes: 15 });

      await manager.recordFailedLogin('user-1');
      await manager.recordFailedLogin('user-1');

      const locked = await manager.checkAccountLockout('user-1');
      expect(locked.locked).toBe(true);

      await manager.resetFailedLogins('user-1');

      const afterReset = await manager.checkAccountLockout('user-1');
      expect(afterReset.locked).toBe(false);
    });

    it('should not throw for unknown user', async () => {
      const manager = createLockoutManager();
      await expect(manager.resetFailedLogins('nonexistent')).resolves.toBeUndefined();
    });
  });
});
```

### Step 2: Verify the test fails

```bash
cd packages/dream/auth && npx vitest run tests/lockout.test.ts
```

**Expected output**: Test fails with an import error — `Cannot find module '../src/lockout'` or similar, because the source file does not exist yet. This confirms the test is wired correctly and will fail until we write the implementation.

### Step 3: Write the implementation

Create `packages/dream/auth/src/lockout.ts`:

```typescript
export interface LockoutConfig {
  maxAttempts: number;
  durationMinutes: number;
}

export interface LockoutCheckResult {
  locked: boolean;
  lockedUntil?: Date;
}

export interface FailedLoginResult {
  locked: boolean;
  attemptsRemaining: number;
}

interface LockoutEntry {
  attempts: number;
  lockedUntil: Date | null;
}

export interface LockoutManager {
  checkAccountLockout(userId: string): Promise<LockoutCheckResult>;
  recordFailedLogin(userId: string): Promise<FailedLoginResult>;
  resetFailedLogins(userId: string): Promise<void>;
}

const DEFAULT_CONFIG: LockoutConfig = {
  maxAttempts: 5,
  durationMinutes: 15,
};

export function createLockoutManager(
  config?: Partial<LockoutConfig>,
): LockoutManager {
  const resolved: LockoutConfig = { ...DEFAULT_CONFIG, ...config };
  const store = new Map<string, LockoutEntry>();

  function getEntry(userId: string): LockoutEntry {
    return store.get(userId) ?? { attempts: 0, lockedUntil: null };
  }

  return {
    async checkAccountLockout(userId: string): Promise<LockoutCheckResult> {
      const entry = getEntry(userId);

      if (entry.lockedUntil === null) {
        return { locked: false };
      }

      if (entry.lockedUntil.getTime() <= Date.now()) {
        // Lock has expired — reset
        store.delete(userId);
        return { locked: false };
      }

      return { locked: true, lockedUntil: entry.lockedUntil };
    },

    async recordFailedLogin(userId: string): Promise<FailedLoginResult> {
      const entry = getEntry(userId);

      // If currently locked and lock hasn't expired, still return locked
      if (entry.lockedUntil && entry.lockedUntil.getTime() > Date.now()) {
        return { locked: true, attemptsRemaining: 0 };
      }

      const newAttempts = entry.attempts + 1;

      if (newAttempts >= resolved.maxAttempts) {
        const lockedUntil = new Date(
          Date.now() + resolved.durationMinutes * 60 * 1000,
        );
        store.set(userId, { attempts: newAttempts, lockedUntil });
        return { locked: true, attemptsRemaining: 0 };
      }

      store.set(userId, { attempts: newAttempts, lockedUntil: null });
      return {
        locked: false,
        attemptsRemaining: resolved.maxAttempts - newAttempts,
      };
    },

    async resetFailedLogins(userId: string): Promise<void> {
      store.delete(userId);
    },
  };
}
```

### Step 4: Verify the test passes

```bash
cd packages/dream/auth && npx vitest run tests/lockout.test.ts
```

**Expected output**:

```
 ✓ tests/lockout.test.ts (8 tests)
   ✓ createLockoutManager > checkAccountLockout > should return locked: false for a fresh user
   ✓ createLockoutManager > checkAccountLockout > should return locked: true with lockedUntil when account is locked
   ✓ createLockoutManager > checkAccountLockout > should return locked: false after lock duration expires
   ✓ createLockoutManager > recordFailedLogin > should return 4 remaining after 1 failure with default config
   ✓ createLockoutManager > recordFailedLogin > should lock account after 5 failures with default config
   ✓ createLockoutManager > recordFailedLogin > should work with custom maxAttempts
   ✓ createLockoutManager > recordFailedLogin > should work with custom durationMinutes
   ✓ createLockoutManager > resetFailedLogins > should reset attempts so account is no longer locked
   ✓ createLockoutManager > resetFailedLogins > should not throw for unknown user

Test Files  1 passed (1)
Tests  9 passed (9)
```

### Step 5: Commit

```bash
cd packages/dream/auth && git add src/lockout.ts tests/lockout.test.ts
git commit -m "feat(auth): add account lockout manager with configurable thresholds"
```

---

## Task 22: Create @dream/auth -- createAuthConfig factory

**Files to create:**
- `packages/dream/auth/src/config.ts`
- `packages/dream/auth/tests/config.test.ts`

**Prerequisite**: Task 21 complete (lockout.ts exists).

---

### Step 1: Write the failing test

Create `packages/dream/auth/tests/config.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { createAuthConfig } from '../src/config';
import type { AuthConfig } from '../src/config';

describe('createAuthConfig', () => {
  it('should set default session maxAge to 28800 (8 hours)', () => {
    const config = createAuthConfig({ providers: [] });
    expect(config.sessionMaxAge).toBe(28800);
  });

  it('should respect custom session maxAge', () => {
    const config = createAuthConfig({ providers: [], sessionMaxAge: 3600 });
    expect(config.sessionMaxAge).toBe(3600);
  });

  it('should set session strategy to jwt', () => {
    const config = createAuthConfig({ providers: [] });
    expect(config.sessionStrategy).toBe('jwt');
  });

  it('should apply default lockout config (5 attempts, 15 min)', () => {
    const config = createAuthConfig({ providers: [] });
    expect(config.lockout).toEqual({
      maxAttempts: 5,
      durationMinutes: 15,
    });
  });

  it('should override lockout config with custom values', () => {
    const config = createAuthConfig({
      providers: [],
      lockout: { maxAttempts: 3, durationMinutes: 30 },
    });
    expect(config.lockout).toEqual({
      maxAttempts: 3,
      durationMinutes: 30,
    });
  });

  it('should pass through publicRoutes', () => {
    const routes = ['/login', '/api/health', '/signup'];
    const config = createAuthConfig({ providers: [], publicRoutes: routes });
    expect(config.publicRoutes).toEqual(routes);
  });

  it('should default publicRoutes to empty array', () => {
    const config = createAuthConfig({ providers: [] });
    expect(config.publicRoutes).toEqual([]);
  });

  it('should store providers array', () => {
    const config = createAuthConfig({
      providers: ['credentials', 'google'],
    });
    expect(config.providers).toEqual(['credentials', 'google']);
  });

  it('should pass through callbacks', () => {
    const onSignIn = async () => true;
    const onSignOut = async () => {};
    const config = createAuthConfig({
      providers: [],
      callbacks: { onSignIn, onSignOut },
    });
    expect(config.callbacks?.onSignIn).toBe(onSignIn);
    expect(config.callbacks?.onSignOut).toBe(onSignOut);
  });

  it('should produce all defaults from empty-ish config', () => {
    const config = createAuthConfig({ providers: [] });

    expect(config.sessionMaxAge).toBe(28800);
    expect(config.sessionStrategy).toBe('jwt');
    expect(config.lockout).toEqual({ maxAttempts: 5, durationMinutes: 15 });
    expect(config.publicRoutes).toEqual([]);
    expect(config.providers).toEqual([]);
    expect(config.callbacks).toBeUndefined();
  });
});
```

### Step 2: Verify the test fails

```bash
cd packages/dream/auth && npx vitest run tests/config.test.ts
```

**Expected output**: Test fails with `Cannot find module '../src/config'`.

### Step 3: Write the implementation

Create `packages/dream/auth/src/config.ts`:

```typescript
export type AuthProvider = 'credentials' | 'azure-entra' | 'google' | 'generic-oidc';

export interface AzureEntraConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
}

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
}

export interface LockoutConfig {
  maxAttempts: number;
  durationMinutes: number;
}

export interface AuthCallbacks {
  enrichJwt?: (token: Record<string, unknown>, user: unknown, account: unknown) => Promise<Record<string, unknown>>;
  onSignIn?: (user: unknown, account: unknown) => Promise<boolean>;
  onSignOut?: (session: unknown) => Promise<void>;
}

export interface AuthConfig {
  providers: AuthProvider[];
  azure?: AzureEntraConfig;
  google?: GoogleOAuthConfig;
  sessionMaxAge?: number;
  lockout?: LockoutConfig;
  publicRoutes?: string[];
  callbacks?: AuthCallbacks;
}

export interface ResolvedAuthConfig {
  providers: AuthProvider[];
  azure?: AzureEntraConfig;
  google?: GoogleOAuthConfig;
  sessionMaxAge: number;
  sessionStrategy: 'jwt';
  lockout: LockoutConfig;
  publicRoutes: string[];
  callbacks?: AuthCallbacks;
}

const DEFAULT_SESSION_MAX_AGE = 28800; // 8 hours in seconds

const DEFAULT_LOCKOUT: LockoutConfig = {
  maxAttempts: 5,
  durationMinutes: 15,
};

export function createAuthConfig(config: AuthConfig): ResolvedAuthConfig {
  return {
    providers: config.providers,
    azure: config.azure,
    google: config.google,
    sessionMaxAge: config.sessionMaxAge ?? DEFAULT_SESSION_MAX_AGE,
    sessionStrategy: 'jwt',
    lockout: config.lockout ?? { ...DEFAULT_LOCKOUT },
    publicRoutes: config.publicRoutes ?? [],
    callbacks: config.callbacks,
  };
}
```

### Step 4: Verify the test passes

```bash
cd packages/dream/auth && npx vitest run tests/config.test.ts
```

**Expected output**:

```
 ✓ tests/config.test.ts (10 tests)
   ✓ createAuthConfig > should set default session maxAge to 28800 (8 hours)
   ✓ createAuthConfig > should respect custom session maxAge
   ✓ createAuthConfig > should set session strategy to jwt
   ✓ createAuthConfig > should apply default lockout config (5 attempts, 15 min)
   ✓ createAuthConfig > should override lockout config with custom values
   ✓ createAuthConfig > should pass through publicRoutes
   ✓ createAuthConfig > should default publicRoutes to empty array
   ✓ createAuthConfig > should store providers array
   ✓ createAuthConfig > should pass through callbacks
   ✓ createAuthConfig > should produce all defaults from empty-ish config

Test Files  1 passed (1)
Tests  10 passed (10)
```

### Step 5: Commit

```bash
cd packages/dream/auth && git add src/config.ts tests/config.test.ts
git commit -m "feat(auth): add createAuthConfig factory with 8hr session and lockout defaults"
```

---

## Task 23: Create @dream/auth -- JWT enrichment

**Files to create:**
- `packages/dream/auth/src/jwt.ts`
- `packages/dream/auth/tests/jwt.test.ts`

**Prerequisite**: Task 22 complete.

---

### Step 1: Write the failing test

Create `packages/dream/auth/tests/jwt.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { enrichJwtToken } from '../src/jwt';
import type { JwtEnrichmentContext } from '../src/jwt';

const baseToken = {
  sub: 'user-123',
  email: 'alice@acme.com',
  name: 'Alice',
  iat: 1700000000,
};

const context: JwtEnrichmentContext = {
  tenantId: 'org-456',
  roleSlugs: ['admin', 'manager'],
  activeRole: 'admin',
  permissions: ['users:read', 'users:write', 'teams:*'],
  tenantStatus: 'active',
  planTier: 'enterprise',
  authProvider: 'azure-entra',
};

describe('enrichJwtToken', () => {
  it('should add tenantId to token', () => {
    const result = enrichJwtToken(baseToken, context);
    expect(result.tenantId).toBe('org-456');
  });

  it('should add roleSlugs as roles', () => {
    const result = enrichJwtToken(baseToken, context);
    expect(result.roles).toEqual(['admin', 'manager']);
  });

  it('should add activeRole', () => {
    const result = enrichJwtToken(baseToken, context);
    expect(result.activeRole).toBe('admin');
  });

  it('should add permissions array', () => {
    const result = enrichJwtToken(baseToken, context);
    expect(result.permissions).toEqual(['users:read', 'users:write', 'teams:*']);
  });

  it('should add tenantStatus', () => {
    const result = enrichJwtToken(baseToken, context);
    expect(result.tenantStatus).toBe('active');
  });

  it('should add planTier', () => {
    const result = enrichJwtToken(baseToken, context);
    expect(result.planTier).toBe('enterprise');
  });

  it('should add authProvider', () => {
    const result = enrichJwtToken(baseToken, context);
    expect(result.authProvider).toBe('azure-entra');
  });

  it('should preserve existing token fields (sub, email, name)', () => {
    const result = enrichJwtToken(baseToken, context);
    expect(result.sub).toBe('user-123');
    expect(result.email).toBe('alice@acme.com');
    expect(result.name).toBe('Alice');
  });

  it('should set exp to iat + 28800', () => {
    const result = enrichJwtToken(baseToken, context);
    expect(result.exp).toBe(1700000000 + 28800);
  });

  it('should use provided iat if present', () => {
    const tokenWithIat = { ...baseToken, iat: 1700001000 };
    const result = enrichJwtToken(tokenWithIat, context);
    expect(result.exp).toBe(1700001000 + 28800);
  });
});
```

### Step 2: Verify the test fails

```bash
cd packages/dream/auth && npx vitest run tests/jwt.test.ts
```

**Expected output**: Test fails with `Cannot find module '../src/jwt'`.

### Step 3: Write the implementation

Create `packages/dream/auth/src/jwt.ts`:

```typescript
const SESSION_MAX_AGE = 28800; // 8 hours in seconds

export interface JwtEnrichmentContext {
  tenantId: string;
  roleSlugs: string[];
  activeRole: string;
  permissions: string[];
  tenantStatus: string;
  planTier: string;
  authProvider: string;
}

export function enrichJwtToken(
  token: Record<string, unknown>,
  context: JwtEnrichmentContext,
): Record<string, unknown> {
  const iat = typeof token.iat === 'number' ? token.iat : Math.floor(Date.now() / 1000);

  return {
    ...token,
    tenantId: context.tenantId,
    roles: context.roleSlugs,
    activeRole: context.activeRole,
    permissions: context.permissions,
    tenantStatus: context.tenantStatus,
    planTier: context.planTier,
    authProvider: context.authProvider,
    iat,
    exp: iat + SESSION_MAX_AGE,
  };
}
```

### Step 4: Verify the test passes

```bash
cd packages/dream/auth && npx vitest run tests/jwt.test.ts
```

**Expected output**:

```
 ✓ tests/jwt.test.ts (10 tests)
   ✓ enrichJwtToken > should add tenantId to token
   ✓ enrichJwtToken > should add roleSlugs as roles
   ✓ enrichJwtToken > should add activeRole
   ✓ enrichJwtToken > should add permissions array
   ✓ enrichJwtToken > should add tenantStatus
   ✓ enrichJwtToken > should add planTier
   ✓ enrichJwtToken > should add authProvider
   ✓ enrichJwtToken > should preserve existing token fields (sub, email, name)
   ✓ enrichJwtToken > should set exp to iat + 28800
   ✓ enrichJwtToken > should use provided iat if present

Test Files  1 passed (1)
Tests  10 passed (10)
```

### Step 5: Commit

```bash
cd packages/dream/auth && git add src/jwt.ts tests/jwt.test.ts
git commit -m "feat(auth): add JWT enrichment with tenant, roles, and permissions claims"
```

---

## Task 24: Create @dream/auth -- React AuthProvider and useAuth hook

**Files to create:**
- `packages/dream/auth/src/react/auth-context.ts`
- `packages/dream/auth/src/react/auth-provider.tsx`
- `packages/dream/auth/src/react/use-auth.ts`
- `packages/dream/auth/src/react/testing.ts`
- `packages/dream/auth/src/react/index.ts`
- `packages/dream/auth/tests/react/auth-provider.test.tsx`
- `packages/dream/auth/tests/react/use-auth.test.tsx`

**Prerequisite**: Task 23 complete. React and @testing-library/react are available as devDependencies in packages/dream/auth/package.json.

---

### Step 1: Write the failing tests

Create `packages/dream/auth/tests/react/use-auth.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from '../../src/react/use-auth';
import { MockAuthProvider } from '../../src/react/testing';

describe('useAuth', () => {
  it('should throw when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an <AuthProvider>');
  });
});
```

Create `packages/dream/auth/tests/react/auth-provider.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useAuth } from '../../src/react/use-auth';
import { MockAuthProvider } from '../../src/react/testing';
import type { SessionUser } from '../../src/react/auth-context';

const mockUser: SessionUser = {
  id: 'user-123',
  email: 'alice@acme.com',
  name: 'Alice',
  tenantId: 'org-456',
  roles: ['admin'],
  activeRole: 'admin',
  permissions: ['users:read', 'users:write'],
};

describe('MockAuthProvider', () => {
  it('should provide user data via useAuth', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockAuthProvider user={mockUser}>{children}</MockAuthProvider>
      ),
    });

    expect(result.current.user).toEqual(mockUser);
  });

  it('should set isAuthenticated to true when user exists', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockAuthProvider user={mockUser}>{children}</MockAuthProvider>
      ),
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should set isAuthenticated to false when user is null', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockAuthProvider user={null}>{children}</MockAuthProvider>
      ),
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should default isLoading to false', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockAuthProvider user={null}>{children}</MockAuthProvider>
      ),
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should call onSignOut when signOut is invoked', async () => {
    const onSignOut = vi.fn();
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockAuthProvider user={mockUser} onSignOut={onSignOut}>
          {children}
        </MockAuthProvider>
      ),
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it('should call onSwitchOrganization when switchOrganization is invoked', async () => {
    const onSwitchOrganization = vi.fn();
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockAuthProvider user={mockUser} onSwitchOrganization={onSwitchOrganization}>
          {children}
        </MockAuthProvider>
      ),
    });

    await act(async () => {
      await result.current.switchOrganization('org-789');
    });

    expect(onSwitchOrganization).toHaveBeenCalledWith('org-789');
  });
});
```

### Step 2: Verify the tests fail

```bash
cd packages/dream/auth && npx vitest run tests/react/
```

**Expected output**: Tests fail with `Cannot find module '../../src/react/use-auth'`.

### Step 3: Write the implementation

Create `packages/dream/auth/src/react/auth-context.ts`:

```typescript
import { createContext } from 'react';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  roles: string[];
  activeRole: string;
  permissions: string[];
}

export interface SignInOptions {
  callbackUrl?: string;
  redirect?: boolean;
}

export interface AuthContextValue {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (provider: string, options?: SignInOptions) => Promise<void>;
  signOut: () => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
```

Create `packages/dream/auth/src/react/use-auth.ts`:

```typescript
import { useContext } from 'react';
import { AuthContext } from './auth-context';
import type { AuthContextValue } from './auth-context';

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
}
```

Create `packages/dream/auth/src/react/auth-provider.tsx`:

```tsx
'use client';

import React, { useMemo } from 'react';
import { AuthContext } from './auth-context';
import type { AuthContextValue, SessionUser } from './auth-context';

export interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider wraps the application with authentication context.
 * In production, this integrates with NextAuth's SessionProvider.
 * For testing, use MockAuthProvider instead.
 */
export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const value = useMemo<AuthContextValue>(
    () => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      signIn: async () => {
        throw new Error('AuthProvider: signIn not implemented. Use NextAuth signIn().');
      },
      signOut: async () => {
        throw new Error('AuthProvider: signOut not implemented. Use NextAuth signOut().');
      },
      switchOrganization: async () => {
        throw new Error('AuthProvider: switchOrganization not implemented.');
      },
    }),
    [],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

Create `packages/dream/auth/src/react/testing.ts`:

```tsx
'use client';

import React, { useMemo } from 'react';
import { AuthContext } from './auth-context';
import type { AuthContextValue, SessionUser, SignInOptions } from './auth-context';

export interface MockAuthProviderProps {
  children: React.ReactNode;
  user: SessionUser | null;
  isLoading?: boolean;
  onSignIn?: (provider: string, options?: SignInOptions) => Promise<void>;
  onSignOut?: () => Promise<void>;
  onSwitchOrganization?: (organizationId: string) => Promise<void>;
}

export function MockAuthProvider({
  children,
  user,
  isLoading = false,
  onSignIn,
  onSignOut,
  onSwitchOrganization,
}: MockAuthProviderProps): React.JSX.Element {
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      signIn: onSignIn ?? (async () => {}),
      signOut: onSignOut ?? (async () => {}),
      switchOrganization: onSwitchOrganization ?? (async () => {}),
    }),
    [user, isLoading, onSignIn, onSignOut, onSwitchOrganization],
  );

  return React.createElement(AuthContext.Provider, { value }, children);
}
```

Create `packages/dream/auth/src/react/index.ts`:

```typescript
export { AuthProvider } from './auth-provider';
export { useAuth } from './use-auth';
export { MockAuthProvider } from './testing';
export type { AuthContextValue, SessionUser, SignInOptions } from './auth-context';
export type { MockAuthProviderProps } from './testing';
```

### Step 4: Verify the tests pass

```bash
cd packages/dream/auth && npx vitest run tests/react/
```

**Expected output**:

```
 ✓ tests/react/use-auth.test.tsx (1 test)
   ✓ useAuth > should throw when used outside AuthProvider

 ✓ tests/react/auth-provider.test.tsx (6 tests)
   ✓ MockAuthProvider > should provide user data via useAuth
   ✓ MockAuthProvider > should set isAuthenticated to true when user exists
   ✓ MockAuthProvider > should set isAuthenticated to false when user is null
   ✓ MockAuthProvider > should default isLoading to false
   ✓ MockAuthProvider > should call onSignOut when signOut is invoked
   ✓ MockAuthProvider > should call onSwitchOrganization when switchOrganization is invoked

Test Files  2 passed (2)
Tests  7 passed (7)
```

### Step 5: Commit

```bash
cd packages/dream/auth && git add src/react/ tests/react/
git commit -m "feat(auth): add AuthProvider, useAuth hook, and MockAuthProvider for testing"
```

---

## Task 25: Create @dream/auth -- Barrel export and verify

**Files to create:**
- `packages/dream/auth/src/index.ts`
- `packages/dream/auth/tests/index.test.ts`

**Prerequisite**: Tasks 21-24 complete.

---

### Step 1: Write the failing test

Create `packages/dream/auth/tests/index.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('@dream/auth barrel exports', () => {
  it('should export createAuthConfig from main entry', async () => {
    const mod = await import('../src/index');
    expect(mod.createAuthConfig).toBeTypeOf('function');
  });

  it('should export lockout functions from main entry', async () => {
    const mod = await import('../src/index');
    expect(mod.createLockoutManager).toBeTypeOf('function');
  });

  it('should export enrichJwtToken from main entry', async () => {
    const mod = await import('../src/index');
    expect(mod.enrichJwtToken).toBeTypeOf('function');
  });

  it('should export AuthProvider from react subpath', async () => {
    const mod = await import('../src/react/index');
    expect(mod.AuthProvider).toBeTypeOf('function');
  });

  it('should export useAuth from react subpath', async () => {
    const mod = await import('../src/react/index');
    expect(mod.useAuth).toBeTypeOf('function');
  });

  it('should export MockAuthProvider from react subpath', async () => {
    const mod = await import('../src/react/index');
    expect(mod.MockAuthProvider).toBeTypeOf('function');
  });
});
```

### Step 2: Verify the test fails

```bash
cd packages/dream/auth && npx vitest run tests/index.test.ts
```

**Expected output**: Test fails with `Cannot find module '../src/index'`.

### Step 3: Write the implementation

Create `packages/dream/auth/src/index.ts`:

```typescript
// @dream/auth — Barrel export
// Server-side: config, lockout, JWT enrichment

export { createAuthConfig } from './config';
export type {
  AuthConfig,
  ResolvedAuthConfig,
  AuthProvider as AuthProviderType,
  LockoutConfig,
  AuthCallbacks,
  AzureEntraConfig,
  GoogleOAuthConfig,
} from './config';

export { createLockoutManager } from './lockout';
export type {
  LockoutManager,
  LockoutCheckResult,
  FailedLoginResult,
} from './lockout';

export { enrichJwtToken } from './jwt';
export type { JwtEnrichmentContext } from './jwt';
```

### Step 4: Verify the test passes

```bash
cd packages/dream/auth && npx vitest run tests/index.test.ts
```

**Expected output**:

```
 ✓ tests/index.test.ts (6 tests)
   ✓ @dream/auth barrel exports > should export createAuthConfig from main entry
   ✓ @dream/auth barrel exports > should export lockout functions from main entry
   ✓ @dream/auth barrel exports > should export enrichJwtToken from main entry
   ✓ @dream/auth barrel exports > should export AuthProvider from react subpath
   ✓ @dream/auth barrel exports > should export useAuth from react subpath
   ✓ @dream/auth barrel exports > should export MockAuthProvider from react subpath

Test Files  1 passed (1)
Tests  6 passed (6)
```

### Step 5: Run all auth tests and typecheck

```bash
cd packages/dream/auth && npx vitest run
```

**Expected output**:

```
 ✓ tests/lockout.test.ts (9 tests)
 ✓ tests/config.test.ts (10 tests)
 ✓ tests/jwt.test.ts (10 tests)
 ✓ tests/react/use-auth.test.tsx (1 test)
 ✓ tests/react/auth-provider.test.tsx (6 tests)
 ✓ tests/index.test.ts (6 tests)

Test Files  6 passed (6)
Tests  42 passed (42)
```

```bash
cd packages/dream/auth && npx tsc --noEmit
```

**Expected output**: No errors (exit code 0).

### Step 6: Commit

```bash
cd packages/dream/auth && git add src/index.ts tests/index.test.ts
git commit -m "feat(auth): add barrel exports for @dream/auth package"
```

---

## Task 26: Create @dream/multi-tenant -- Tenant extraction chain

**Files to create:**
- `packages/dream/multi-tenant/src/extraction.ts`
- `packages/dream/multi-tenant/tests/extraction.test.ts`

**Prerequisite**: packages/dream/multi-tenant has package.json, tsconfig.json, vitest configured (done in earlier tasks).

---

### Step 1: Write the failing test

Create `packages/dream/multi-tenant/tests/extraction.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  extractTenantFromSubdomain,
  extractTenantFromHeader,
  extractTenantFromQuery,
} from '../src/extraction';

describe('extractTenantFromSubdomain', () => {
  it('should extract tenant from subdomain: acme.dreamteam.app → acme', () => {
    const result = extractTenantFromSubdomain('acme.dreamteam.app', {
      baseDomain: 'dreamteam.app',
    });
    expect(result).toBe('acme');
  });

  it('should return null for www subdomain', () => {
    const result = extractTenantFromSubdomain('www.dreamteam.app', {
      baseDomain: 'dreamteam.app',
    });
    expect(result).toBeNull();
  });

  it('should return null for api subdomain', () => {
    const result = extractTenantFromSubdomain('api.dreamteam.app', {
      baseDomain: 'dreamteam.app',
    });
    expect(result).toBeNull();
  });

  it('should respect custom excludeSubdomains', () => {
    const result = extractTenantFromSubdomain('staging.dreamteam.app', {
      baseDomain: 'dreamteam.app',
      excludeSubdomains: ['staging', 'preview'],
    });
    expect(result).toBeNull();
  });

  it('should return null for bare domain (no subdomain)', () => {
    const result = extractTenantFromSubdomain('dreamteam.app', {
      baseDomain: 'dreamteam.app',
    });
    expect(result).toBeNull();
  });

  it('should handle multi-level base domains', () => {
    const result = extractTenantFromSubdomain('acme.app.example.co.uk', {
      baseDomain: 'app.example.co.uk',
    });
    expect(result).toBe('acme');
  });
});

describe('extractTenantFromHeader', () => {
  it('should read X-Tenant-ID header', () => {
    const headers = new Headers({ 'X-Tenant-ID': 'org-123' });
    const result = extractTenantFromHeader(headers, 'X-Tenant-ID');
    expect(result).toBe('org-123');
  });

  it('should read custom header name', () => {
    const headers = new Headers({ 'X-Organization': 'org-456' });
    const result = extractTenantFromHeader(headers, 'X-Organization');
    expect(result).toBe('org-456');
  });

  it('should return null when header is missing', () => {
    const headers = new Headers();
    const result = extractTenantFromHeader(headers, 'X-Tenant-ID');
    expect(result).toBeNull();
  });
});

describe('extractTenantFromQuery', () => {
  it('should extract tenantId from query string', () => {
    const result = extractTenantFromQuery(
      'https://app.example.com/api/users?tenantId=org-789',
      'tenantId',
    );
    expect(result).toBe('org-789');
  });

  it('should return null when query param is missing', () => {
    const result = extractTenantFromQuery(
      'https://app.example.com/api/users',
      'tenantId',
    );
    expect(result).toBeNull();
  });

  it('should use custom param name', () => {
    const result = extractTenantFromQuery(
      'https://app.example.com/api/users?orgId=org-111',
      'orgId',
    );
    expect(result).toBe('org-111');
  });
});
```

### Step 2: Verify the test fails

```bash
cd packages/dream/multi-tenant && npx vitest run tests/extraction.test.ts
```

**Expected output**: Test fails with `Cannot find module '../src/extraction'`.

### Step 3: Write the implementation

Create `packages/dream/multi-tenant/src/extraction.ts`:

```typescript
export interface SubdomainConfig {
  baseDomain: string;
  excludeSubdomains?: string[];
}

const DEFAULT_EXCLUDED_SUBDOMAINS = ['www', 'api', 'admin', 'auth', 'mail', 'cdn', 'static'];

export function extractTenantFromSubdomain(
  hostname: string,
  config: SubdomainConfig,
): string | null {
  const { baseDomain, excludeSubdomains } = config;
  const excluded = excludeSubdomains ?? DEFAULT_EXCLUDED_SUBDOMAINS;

  // hostname must end with .baseDomain and have something before it
  if (!hostname.endsWith(`.${baseDomain}`)) {
    return null;
  }

  const subdomain = hostname.slice(0, hostname.length - baseDomain.length - 1);

  // No subdomain or contains dots (nested subdomain — not a tenant)
  if (!subdomain || subdomain.includes('.')) {
    return null;
  }

  if (excluded.includes(subdomain)) {
    return null;
  }

  return subdomain;
}

export function extractTenantFromHeader(
  headers: Headers,
  headerName: string,
): string | null {
  return headers.get(headerName) ?? null;
}

export function extractTenantFromQuery(
  url: string,
  paramName: string,
): string | null {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get(paramName) ?? null;
  } catch {
    return null;
  }
}
```

### Step 4: Verify the test passes

```bash
cd packages/dream/multi-tenant && npx vitest run tests/extraction.test.ts
```

**Expected output**:

```
 ✓ tests/extraction.test.ts (12 tests)
   ✓ extractTenantFromSubdomain > should extract tenant from subdomain: acme.dreamteam.app → acme
   ✓ extractTenantFromSubdomain > should return null for www subdomain
   ✓ extractTenantFromSubdomain > should return null for api subdomain
   ✓ extractTenantFromSubdomain > should respect custom excludeSubdomains
   ✓ extractTenantFromSubdomain > should return null for bare domain (no subdomain)
   ✓ extractTenantFromSubdomain > should handle multi-level base domains
   ✓ extractTenantFromHeader > should read X-Tenant-ID header
   ✓ extractTenantFromHeader > should read custom header name
   ✓ extractTenantFromHeader > should return null when header is missing
   ✓ extractTenantFromQuery > should extract tenantId from query string
   ✓ extractTenantFromQuery > should return null when query param is missing
   ✓ extractTenantFromQuery > should use custom param name

Test Files  1 passed (1)
Tests  12 passed (12)
```

### Step 5: Commit

```bash
cd packages/dream/multi-tenant && git add src/extraction.ts tests/extraction.test.ts
git commit -m "feat(multi-tenant): add tenant extraction from subdomain, header, and query"
```

---

## Task 27: Create @dream/multi-tenant -- createTenantConfig factory

**Files to create:**
- `packages/dream/multi-tenant/src/config.ts`
- `packages/dream/multi-tenant/tests/config.test.ts`

**Prerequisite**: Task 26 complete.

---

### Step 1: Write the failing test

Create `packages/dream/multi-tenant/tests/config.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { createTenantConfig } from '../src/config';

describe('createTenantConfig', () => {
  it('should default mode to multi', () => {
    const config = createTenantConfig({ mode: 'multi' });
    expect(config.mode).toBe('multi');
  });

  it('should default extractionSources to [session]', () => {
    const config = createTenantConfig({ mode: 'multi' });
    expect(config.extractionSources).toEqual(['session']);
  });

  it('should accept single mode with singleTenantId', () => {
    const config = createTenantConfig({
      mode: 'single',
      singleTenantId: 'org-fixed-123',
    });
    expect(config.mode).toBe('single');
    expect(config.singleTenantId).toBe('org-fixed-123');
  });

  it('should throw when single mode is used without singleTenantId', () => {
    expect(() => {
      createTenantConfig({ mode: 'single' });
    }).toThrow('singleTenantId is required when mode is "single"');
  });

  it('should default headerName to X-Tenant-ID', () => {
    const config = createTenantConfig({ mode: 'multi' });
    expect(config.headerName).toBe('X-Tenant-ID');
  });

  it('should default queryParam to tenantId', () => {
    const config = createTenantConfig({ mode: 'multi' });
    expect(config.queryParam).toBe('tenantId');
  });

  it('should default statusEnforcement to true', () => {
    const config = createTenantConfig({ mode: 'multi' });
    expect(config.statusEnforcement).toBe(true);
  });

  it('should override defaults with custom config', () => {
    const config = createTenantConfig({
      mode: 'multi',
      extractionSources: ['subdomain', 'header'],
      headerName: 'X-Org-ID',
      queryParam: 'orgId',
      statusEnforcement: false,
    });
    expect(config.extractionSources).toEqual(['subdomain', 'header']);
    expect(config.headerName).toBe('X-Org-ID');
    expect(config.queryParam).toBe('orgId');
    expect(config.statusEnforcement).toBe(false);
  });

  it('should apply default excludeSubdomains to SubdomainConfig', () => {
    const config = createTenantConfig({
      mode: 'multi',
      subdomainConfig: { baseDomain: 'dreamteam.app' },
    });
    expect(config.subdomainConfig).toBeDefined();
    expect(config.subdomainConfig!.excludeSubdomains).toContain('www');
    expect(config.subdomainConfig!.excludeSubdomains).toContain('api');
    expect(config.subdomainConfig!.excludeSubdomains).toContain('admin');
    expect(config.subdomainConfig!.excludeSubdomains).toContain('auth');
    expect(config.subdomainConfig!.excludeSubdomains).toContain('mail');
    expect(config.subdomainConfig!.excludeSubdomains).toContain('cdn');
    expect(config.subdomainConfig!.excludeSubdomains).toContain('static');
  });

  it('should merge custom excludeSubdomains with defaults', () => {
    const config = createTenantConfig({
      mode: 'multi',
      subdomainConfig: {
        baseDomain: 'dreamteam.app',
        excludeSubdomains: ['staging', 'preview'],
      },
    });
    expect(config.subdomainConfig!.excludeSubdomains).toContain('www');
    expect(config.subdomainConfig!.excludeSubdomains).toContain('staging');
    expect(config.subdomainConfig!.excludeSubdomains).toContain('preview');
  });

  it('should set subdomainConfig to null when not provided', () => {
    const config = createTenantConfig({ mode: 'multi' });
    expect(config.subdomainConfig).toBeNull();
  });
});
```

### Step 2: Verify the test fails

```bash
cd packages/dream/multi-tenant && npx vitest run tests/config.test.ts
```

**Expected output**: Test fails with `Cannot find module '../src/config'`.

### Step 3: Write the implementation

Create `packages/dream/multi-tenant/src/config.ts`:

```typescript
import type { SubdomainConfig } from './extraction';

export type ExtractionSource = 'session' | 'subdomain' | 'header' | 'query';

export interface TenantConfig {
  mode: 'multi' | 'single';
  extractionSources?: ExtractionSource[];
  singleTenantId?: string;
  subdomainConfig?: { baseDomain: string; excludeSubdomains?: string[] };
  headerName?: string;
  queryParam?: string;
  statusEnforcement?: boolean;
}

export interface ResolvedSubdomainConfig {
  baseDomain: string;
  excludeSubdomains: string[];
}

export interface ResolvedTenantConfig {
  mode: 'multi' | 'single';
  extractionSources: ExtractionSource[];
  singleTenantId: string | null;
  subdomainConfig: ResolvedSubdomainConfig | null;
  headerName: string;
  queryParam: string;
  statusEnforcement: boolean;
}

const DEFAULT_EXCLUDED_SUBDOMAINS = ['www', 'api', 'admin', 'auth', 'mail', 'cdn', 'static'];

export function createTenantConfig(config: TenantConfig): ResolvedTenantConfig {
  if (config.mode === 'single' && !config.singleTenantId) {
    throw new Error('singleTenantId is required when mode is "single"');
  }

  let subdomainConfig: ResolvedSubdomainConfig | null = null;
  if (config.subdomainConfig) {
    const customExcludes = config.subdomainConfig.excludeSubdomains ?? [];
    const mergedExcludes = Array.from(
      new Set([...DEFAULT_EXCLUDED_SUBDOMAINS, ...customExcludes]),
    );
    subdomainConfig = {
      baseDomain: config.subdomainConfig.baseDomain,
      excludeSubdomains: mergedExcludes,
    };
  }

  return {
    mode: config.mode,
    extractionSources: config.extractionSources ?? ['session'],
    singleTenantId: config.singleTenantId ?? null,
    subdomainConfig,
    headerName: config.headerName ?? 'X-Tenant-ID',
    queryParam: config.queryParam ?? 'tenantId',
    statusEnforcement: config.statusEnforcement ?? true,
  };
}
```

### Step 4: Verify the test passes

```bash
cd packages/dream/multi-tenant && npx vitest run tests/config.test.ts
```

**Expected output**:

```
 ✓ tests/config.test.ts (11 tests)
   ✓ createTenantConfig > should default mode to multi
   ✓ createTenantConfig > should default extractionSources to [session]
   ✓ createTenantConfig > should accept single mode with singleTenantId
   ✓ createTenantConfig > should throw when single mode is used without singleTenantId
   ✓ createTenantConfig > should default headerName to X-Tenant-ID
   ✓ createTenantConfig > should default queryParam to tenantId
   ✓ createTenantConfig > should default statusEnforcement to true
   ✓ createTenantConfig > should override defaults with custom config
   ✓ createTenantConfig > should apply default excludeSubdomains to SubdomainConfig
   ✓ createTenantConfig > should merge custom excludeSubdomains with defaults
   ✓ createTenantConfig > should set subdomainConfig to null when not provided

Test Files  1 passed (1)
Tests  11 passed (11)
```

### Step 5: Commit

```bash
cd packages/dream/multi-tenant && git add src/config.ts tests/config.test.ts
git commit -m "feat(multi-tenant): add createTenantConfig factory with extraction and subdomain defaults"
```

---

## Task 28: Create @dream/multi-tenant -- Tenant status enforcement

**Files to create:**
- `packages/dream/multi-tenant/src/status.ts`
- `packages/dream/multi-tenant/tests/status.test.ts`

**Prerequisite**: Task 27 complete.

---

### Step 1: Write the failing test

Create `packages/dream/multi-tenant/tests/status.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { checkTenantStatus } from '../src/status';
import type { OrganizationStatus } from '../src/status';

describe('checkTenantStatus', () => {
  it('should return valid for active organization', () => {
    const result = checkTenantStatus('active');
    expect(result).toEqual({ valid: true });
  });

  it('should return invalid with error for suspended organization', () => {
    const result = checkTenantStatus('suspended');
    expect(result).toEqual({
      valid: false,
      error: 'Organization is suspended. Contact your administrator.',
    });
  });

  it('should return invalid with error for archived organization', () => {
    const result = checkTenantStatus('archived');
    expect(result).toEqual({
      valid: false,
      error: 'Organization has been archived. Read-only access only.',
    });
  });
});
```

### Step 2: Verify the test fails

```bash
cd packages/dream/multi-tenant && npx vitest run tests/status.test.ts
```

**Expected output**: Test fails with `Cannot find module '../src/status'`.

### Step 3: Write the implementation

Create `packages/dream/multi-tenant/src/status.ts`:

```typescript
export type OrganizationStatus = 'active' | 'suspended' | 'archived';

export interface TenantStatusResult {
  valid: boolean;
  error?: string;
}

const STATUS_ERRORS: Record<string, string> = {
  suspended: 'Organization is suspended. Contact your administrator.',
  archived: 'Organization has been archived. Read-only access only.',
};

export function checkTenantStatus(status: OrganizationStatus): TenantStatusResult {
  if (status === 'active') {
    return { valid: true };
  }

  return {
    valid: false,
    error: STATUS_ERRORS[status],
  };
}
```

### Step 4: Verify the test passes

```bash
cd packages/dream/multi-tenant && npx vitest run tests/status.test.ts
```

**Expected output**:

```
 ✓ tests/status.test.ts (3 tests)
   ✓ checkTenantStatus > should return valid for active organization
   ✓ checkTenantStatus > should return invalid with error for suspended organization
   ✓ checkTenantStatus > should return invalid with error for archived organization

Test Files  1 passed (1)
Tests  3 passed (3)
```

### Step 5: Commit

```bash
cd packages/dream/multi-tenant && git add src/status.ts tests/status.test.ts
git commit -m "feat(multi-tenant): add tenant status enforcement for suspended and archived orgs"
```

---

## Task 29: Create @dream/multi-tenant -- React TenantProvider and useTenant hook

**Files to create:**
- `packages/dream/multi-tenant/src/react/tenant-context.ts`
- `packages/dream/multi-tenant/src/react/tenant-provider.tsx`
- `packages/dream/multi-tenant/src/react/use-tenant.ts`
- `packages/dream/multi-tenant/src/react/testing.ts`
- `packages/dream/multi-tenant/src/react/index.ts`
- `packages/dream/multi-tenant/tests/react/tenant-provider.test.tsx`

**Prerequisite**: Task 28 complete. React and @testing-library/react are available as devDependencies.

---

### Step 1: Write the failing test

Create `packages/dream/multi-tenant/tests/react/tenant-provider.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useTenant } from '../../src/react/use-tenant';
import { MockTenantProvider } from '../../src/react/testing';
import type { Organization } from '../../src/react/tenant-context';

const mockOrg: Organization = {
  id: 'org-456',
  name: 'Acme Corp',
  slug: 'acme',
  status: 'active',
  planTier: 'enterprise',
};

const mockOrgs: Organization[] = [
  mockOrg,
  {
    id: 'org-789',
    name: 'Beta Inc',
    slug: 'beta',
    status: 'active',
    planTier: 'pro',
  },
];

describe('useTenant', () => {
  it('should throw when used outside TenantProvider', () => {
    expect(() => {
      renderHook(() => useTenant());
    }).toThrow(
      'useTenant must be used within a <TenantProvider>. Ensure <TenantProvider> is nested inside <AuthProvider> in your root layout.',
    );
  });
});

describe('MockTenantProvider', () => {
  it('should provide tenantId', () => {
    const { result } = renderHook(() => useTenant(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockTenantProvider tenantId="org-456" organization={mockOrg} organizations={mockOrgs}>
          {children}
        </MockTenantProvider>
      ),
    });

    expect(result.current.tenantId).toBe('org-456');
  });

  it('should provide organization', () => {
    const { result } = renderHook(() => useTenant(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockTenantProvider tenantId="org-456" organization={mockOrg} organizations={mockOrgs}>
          {children}
        </MockTenantProvider>
      ),
    });

    expect(result.current.organization).toEqual(mockOrg);
  });

  it('should provide organizations list', () => {
    const { result } = renderHook(() => useTenant(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockTenantProvider tenantId="org-456" organization={mockOrg} organizations={mockOrgs}>
          {children}
        </MockTenantProvider>
      ),
    });

    expect(result.current.organizations).toHaveLength(2);
    expect(result.current.organizations[0].name).toBe('Acme Corp');
    expect(result.current.organizations[1].name).toBe('Beta Inc');
  });

  it('should call onSwitchOrganization callback', async () => {
    const onSwitchOrganization = vi.fn();
    const { result } = renderHook(() => useTenant(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockTenantProvider
          tenantId="org-456"
          organization={mockOrg}
          organizations={mockOrgs}
          onSwitchOrganization={onSwitchOrganization}
        >
          {children}
        </MockTenantProvider>
      ),
    });

    await act(async () => {
      await result.current.switchOrganization('org-789');
    });

    expect(onSwitchOrganization).toHaveBeenCalledWith('org-789');
  });

  it('should default isLoading to false', () => {
    const { result } = renderHook(() => useTenant(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockTenantProvider tenantId="org-456" organization={mockOrg} organizations={mockOrgs}>
          {children}
        </MockTenantProvider>
      ),
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should support isLoading override', () => {
    const { result } = renderHook(() => useTenant(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockTenantProvider
          tenantId="org-456"
          organization={mockOrg}
          organizations={mockOrgs}
          isLoading={true}
        >
          {children}
        </MockTenantProvider>
      ),
    });

    expect(result.current.isLoading).toBe(true);
  });
});
```

### Step 2: Verify the test fails

```bash
cd packages/dream/multi-tenant && npx vitest run tests/react/
```

**Expected output**: Test fails with `Cannot find module '../../src/react/use-tenant'`.

### Step 3: Write the implementation

Create `packages/dream/multi-tenant/src/react/tenant-context.ts`:

```typescript
import { createContext } from 'react';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: string;
  planTier: string;
}

export interface TenantContextValue {
  tenantId: string | null;
  organization: Organization | null;
  isLoading: boolean;
  switchOrganization: (organizationId: string) => Promise<void>;
  organizations: Organization[];
}

export const TenantContext = createContext<TenantContextValue | null>(null);
```

Create `packages/dream/multi-tenant/src/react/use-tenant.ts`:

```typescript
import { useContext } from 'react';
import { TenantContext } from './tenant-context';
import type { TenantContextValue } from './tenant-context';

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (context === null) {
    throw new Error(
      'useTenant must be used within a <TenantProvider>. Ensure <TenantProvider> is nested inside <AuthProvider> in your root layout.',
    );
  }
  return context;
}
```

Create `packages/dream/multi-tenant/src/react/tenant-provider.tsx`:

```tsx
'use client';

import React, { useMemo } from 'react';
import { TenantContext } from './tenant-context';
import type { TenantContextValue } from './tenant-context';

export interface TenantProviderProps {
  children: React.ReactNode;
}

/**
 * TenantProvider wraps the application with tenant/organization context.
 * In production, this resolves the tenant from the current auth session.
 * For testing, use MockTenantProvider instead.
 */
export function TenantProvider({ children }: TenantProviderProps): React.JSX.Element {
  const value = useMemo<TenantContextValue>(
    () => ({
      tenantId: null,
      organization: null,
      isLoading: true,
      switchOrganization: async () => {
        throw new Error('TenantProvider: switchOrganization not implemented.');
      },
      organizations: [],
    }),
    [],
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}
```

Create `packages/dream/multi-tenant/src/react/testing.ts`:

```tsx
'use client';

import React, { useMemo } from 'react';
import { TenantContext } from './tenant-context';
import type { TenantContextValue, Organization } from './tenant-context';

export interface MockTenantProviderProps {
  children: React.ReactNode;
  tenantId: string | null;
  organization: Organization | null;
  organizations: Organization[];
  isLoading?: boolean;
  onSwitchOrganization?: (organizationId: string) => Promise<void>;
}

export function MockTenantProvider({
  children,
  tenantId,
  organization,
  organizations,
  isLoading = false,
  onSwitchOrganization,
}: MockTenantProviderProps): React.JSX.Element {
  const value = useMemo<TenantContextValue>(
    () => ({
      tenantId,
      organization,
      isLoading,
      switchOrganization: onSwitchOrganization ?? (async () => {}),
      organizations,
    }),
    [tenantId, organization, isLoading, onSwitchOrganization, organizations],
  );

  return React.createElement(TenantContext.Provider, { value }, children);
}
```

Create `packages/dream/multi-tenant/src/react/index.ts`:

```typescript
export { TenantProvider } from './tenant-provider';
export { useTenant } from './use-tenant';
export { MockTenantProvider } from './testing';
export type { TenantContextValue, Organization } from './tenant-context';
export type { MockTenantProviderProps } from './testing';
```

### Step 4: Verify the test passes

```bash
cd packages/dream/multi-tenant && npx vitest run tests/react/
```

**Expected output**:

```
 ✓ tests/react/tenant-provider.test.tsx (7 tests)
   ✓ useTenant > should throw when used outside TenantProvider
   ✓ MockTenantProvider > should provide tenantId
   ✓ MockTenantProvider > should provide organization
   ✓ MockTenantProvider > should provide organizations list
   ✓ MockTenantProvider > should call onSwitchOrganization callback
   ✓ MockTenantProvider > should default isLoading to false
   ✓ MockTenantProvider > should support isLoading override

Test Files  1 passed (1)
Tests  7 passed (7)
```

### Step 5: Commit

```bash
cd packages/dream/multi-tenant && git add src/react/ tests/react/
git commit -m "feat(multi-tenant): add TenantProvider, useTenant hook, and MockTenantProvider"
```

---

## Task 30: Create @dream/multi-tenant -- Barrel export and verify

**Files to create:**
- `packages/dream/multi-tenant/src/index.ts`
- `packages/dream/multi-tenant/tests/index.test.ts`

**Prerequisite**: Tasks 26-29 complete.

---

### Step 1: Write the failing test

Create `packages/dream/multi-tenant/tests/index.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('@dream/multi-tenant barrel exports', () => {
  it('should export createTenantConfig from main entry', async () => {
    const mod = await import('../src/index');
    expect(mod.createTenantConfig).toBeTypeOf('function');
  });

  it('should export extraction functions from main entry', async () => {
    const mod = await import('../src/index');
    expect(mod.extractTenantFromSubdomain).toBeTypeOf('function');
    expect(mod.extractTenantFromHeader).toBeTypeOf('function');
    expect(mod.extractTenantFromQuery).toBeTypeOf('function');
  });

  it('should export checkTenantStatus from main entry', async () => {
    const mod = await import('../src/index');
    expect(mod.checkTenantStatus).toBeTypeOf('function');
  });

  it('should export TenantProvider from react subpath', async () => {
    const mod = await import('../src/react/index');
    expect(mod.TenantProvider).toBeTypeOf('function');
  });

  it('should export useTenant from react subpath', async () => {
    const mod = await import('../src/react/index');
    expect(mod.useTenant).toBeTypeOf('function');
  });

  it('should export MockTenantProvider from react subpath', async () => {
    const mod = await import('../src/react/index');
    expect(mod.MockTenantProvider).toBeTypeOf('function');
  });
});
```

### Step 2: Verify the test fails

```bash
cd packages/dream/multi-tenant && npx vitest run tests/index.test.ts
```

**Expected output**: Test fails with `Cannot find module '../src/index'`.

### Step 3: Write the implementation

Create `packages/dream/multi-tenant/src/index.ts`:

```typescript
// @dream/multi-tenant — Barrel export
// Server-side: config, extraction, status enforcement

export { createTenantConfig } from './config';
export type {
  TenantConfig,
  ResolvedTenantConfig,
  ResolvedSubdomainConfig,
  ExtractionSource,
} from './config';

export {
  extractTenantFromSubdomain,
  extractTenantFromHeader,
  extractTenantFromQuery,
} from './extraction';
export type { SubdomainConfig } from './extraction';

export { checkTenantStatus } from './status';
export type { OrganizationStatus, TenantStatusResult } from './status';
```

### Step 4: Verify the test passes

```bash
cd packages/dream/multi-tenant && npx vitest run tests/index.test.ts
```

**Expected output**:

```
 ✓ tests/index.test.ts (6 tests)
   ✓ @dream/multi-tenant barrel exports > should export createTenantConfig from main entry
   ✓ @dream/multi-tenant barrel exports > should export extraction functions from main entry
   ✓ @dream/multi-tenant barrel exports > should export checkTenantStatus from main entry
   ✓ @dream/multi-tenant barrel exports > should export TenantProvider from react subpath
   ✓ @dream/multi-tenant barrel exports > should export useTenant from react subpath
   ✓ @dream/multi-tenant barrel exports > should export MockTenantProvider from react subpath

Test Files  1 passed (1)
Tests  6 passed (6)
```

### Step 5: Run all multi-tenant tests and typecheck

```bash
cd packages/dream/multi-tenant && npx vitest run
```

**Expected output**:

```
 ✓ tests/extraction.test.ts (12 tests)
 ✓ tests/config.test.ts (11 tests)
 ✓ tests/status.test.ts (3 tests)
 ✓ tests/react/tenant-provider.test.tsx (7 tests)
 ✓ tests/index.test.ts (6 tests)

Test Files  5 passed (5)
Tests  39 passed (39)
```

```bash
cd packages/dream/multi-tenant && npx tsc --noEmit
```

**Expected output**: No errors (exit code 0).

### Step 6: Commit

```bash
cd packages/dream/multi-tenant && git add src/index.ts tests/index.test.ts
git commit -m "feat(multi-tenant): add barrel exports for @dream/multi-tenant package"
```

---

## Summary: Tasks 21-30

| Task | Package | Module | Files Created | Tests |
|------|---------|--------|---------------|-------|
| 21 | @dream/auth | Account lockout | `src/lockout.ts`, `tests/lockout.test.ts` | 9 |
| 22 | @dream/auth | createAuthConfig | `src/config.ts`, `tests/config.test.ts` | 10 |
| 23 | @dream/auth | JWT enrichment | `src/jwt.ts`, `tests/jwt.test.ts` | 10 |
| 24 | @dream/auth | React AuthProvider | `src/react/{5 files}`, `tests/react/{2 files}` | 7 |
| 25 | @dream/auth | Barrel export | `src/index.ts`, `tests/index.test.ts` | 6 |
| 26 | @dream/multi-tenant | Tenant extraction | `src/extraction.ts`, `tests/extraction.test.ts` | 12 |
| 27 | @dream/multi-tenant | createTenantConfig | `src/config.ts`, `tests/config.test.ts` | 11 |
| 28 | @dream/multi-tenant | Status enforcement | `src/status.ts`, `tests/status.test.ts` | 3 |
| 29 | @dream/multi-tenant | React TenantProvider | `src/react/{5 files}`, `tests/react/{1 file}` | 7 |
| 30 | @dream/multi-tenant | Barrel export | `src/index.ts`, `tests/index.test.ts` | 6 |

**Total**: 10 tasks, 25 source files, 12 test files, 81 tests.

**Cumulative file tree after Task 30:**

```
packages/dream/auth/
├── src/
│   ├── index.ts
│   ├── config.ts
│   ├── lockout.ts
│   ├── jwt.ts
│   └── react/
│       ├── index.ts
│       ├── auth-context.ts
│       ├── auth-provider.tsx
│       ├── use-auth.ts
│       └── testing.ts
└── tests/
    ├── index.test.ts
    ├── lockout.test.ts
    ├── config.test.ts
    ├── jwt.test.ts
    └── react/
        ├── auth-provider.test.tsx
        └── use-auth.test.tsx

packages/dream/multi-tenant/
├── src/
│   ├── index.ts
│   ├── config.ts
│   ├── extraction.ts
│   ├── status.ts
│   └── react/
│       ├── index.ts
│       ├── tenant-context.ts
│       ├── tenant-provider.tsx
│       ├── use-tenant.ts
│       └── testing.ts
└── tests/
    ├── index.test.ts
    ├── extraction.test.ts
    ├── config.test.ts
    ├── status.test.ts
    └── react/
        └── tenant-provider.test.tsx
```

<!-- ═══ Tasks 31-35: Integration + Final Verification ═══ -->



I need to understand the existing codebase structure before writing the implementation plan. Let me examine the current state of the dream packages.

The dream packages haven't been created yet. Let me check the existing plan documents to understand the specification and what Tasks 1-30 established.

Now let me check the existing quickstart and UX design for any relevant patterns used in earlier tasks.

Now let me check if there are existing implementation plan tasks to understand the format and what Tasks 1-30 look like.

No `dream/` directory exists yet -- the packages haven't been created. Let me check if there's a root `package.json` for workspace config.

Now I have full context. Let me look at the existing node package's vitest and tsconfig patterns for consistency.

I now have all the context I need. Let me produce the final implementation plan for Tasks 31-35.

## Task 31: Cross-package integration test -- createApiHandler full flow (3 min)

**Goal**: Verify that `createApiHandler` from `@dream/errors` integrates correctly with `@dream/rbac` (permission matching), `@dream/types` (error response shapes), and mock auth/tenant layers, testing both success and failure paths.

### Step 1: Write the failing test

**Create**: `packages/dream/errors/tests/integration/full-handler.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZodError, z } from 'zod';
import {
  createApiHandler,
  PlatformError,
  NotFoundError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  successResponse,
  errorResponse,
} from '../../src/index';
import { matchesPermission } from '@dream/rbac';
import type { ApiResponse, ApiErrorResponse, SessionUser } from '@dream/types';

// ── Mock auth + tenant functions ──────────────────────────────────────────
// These simulate what the real Next.js server would provide.
// createApiHandler delegates to these internally.

function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): Request {
  const init: RequestInit = {
    method: options.method ?? 'GET',
    headers: new Headers(options.headers ?? {}),
  };
  if (options.body) {
    init.body = JSON.stringify(options.body);
    (init.headers as Headers).set('Content-Type', 'application/json');
  }
  return new Request(url, init);
}

// ── Mock session user fixtures ────────────────────────────────────────────

const adminUser: SessionUser = {
  id: 'usr-admin-001',
  email: 'admin@acme.com',
  name: 'Admin User',
  tenantId: 'org-acme-001',
  roleSlugs: ['admin'],
  activeRole: 'admin',
  permissions: ['users:*', 'teams:*', 'settings:*', 'audit:read'],
  tenantStatus: 'active',
};

const viewerUser: SessionUser = {
  id: 'usr-viewer-001',
  email: 'viewer@acme.com',
  name: 'Viewer User',
  tenantId: 'org-acme-001',
  roleSlugs: ['guest'],
  activeRole: 'guest',
  permissions: ['users:read'],
  tenantStatus: 'active',
};

// ── Mock audit emitter ────────────────────────────────────────────────────

const mockAuditEmit = vi.fn().mockResolvedValue(undefined);
const mockAuditEmitter = { emit: mockAuditEmit };

// ── Tests ─────────────────────────────────────────────────────────────────

describe('createApiHandler — full cross-package integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Scenario 1: Full success flow ────────────────────────────────────

  it('returns { success: true, data } when auth + permission + tenant + handler all pass', async () => {
    const handler = createApiHandler(
      async (_req, ctx) => {
        return { id: 'usr-123', name: 'Updated User' };
      },
      {
        requireAuth: true,
        requiredPermissions: ['users:write'],
        auditAction: 'user.updated',
        _testOverrides: {
          getSession: async () => adminUser,
          getTenantId: async () => 'org-acme-001',
          auditEmitter: mockAuditEmitter,
        },
      }
    );

    const req = createMockRequest('http://localhost/api/users/usr-123', {
      method: 'PUT',
      body: { name: 'Updated User' },
    });

    const res = await handler(req, { params: Promise.resolve({ id: 'usr-123' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ id: 'usr-123', name: 'Updated User' });
  });

  // ── Scenario 2: Auth failure → 401 ──────────────────────────────────

  it('returns 401 with auth/unauthenticated when session is null', async () => {
    const handler = createApiHandler(
      async () => ({ id: 'never-reached' }),
      {
        requireAuth: true,
        _testOverrides: {
          getSession: async () => null,
          getTenantId: async () => null,
        },
      }
    );

    const req = createMockRequest('http://localhost/api/users');
    const res = await handler(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('auth/unauthenticated');
    expect(body.error.requestId).toBeDefined();
    expect(body.error.userMessage).toBeDefined();
  });

  // ── Scenario 3: Permission failure → 403 ────────────────────────────

  it('returns 403 with rbac/permission-denied when user lacks required permission', async () => {
    const handler = createApiHandler(
      async () => ({ id: 'never-reached' }),
      {
        requireAuth: true,
        requiredPermissions: ['users:delete'],
        _testOverrides: {
          getSession: async () => viewerUser, // only has users:read
          getTenantId: async () => 'org-acme-001',
        },
      }
    );

    const req = createMockRequest('http://localhost/api/users/usr-123', {
      method: 'DELETE',
    });
    const res = await handler(req, { params: Promise.resolve({ id: 'usr-123' }) });
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('rbac/permission-denied');
    expect(body.error.requestId).toBeDefined();
  });

  // ── Scenario 4: NotFoundError from handler → 404 ────────────────────

  it('returns 404 with correct error format when handler throws NotFoundError', async () => {
    const handler = createApiHandler(
      async (_req, ctx) => {
        throw new NotFoundError({
          code: 'users/not-found',
          message: `User ${ctx.params.id} not found in tenant ${ctx.tenantId}`,
          userMessage: 'The requested user could not be found.',
        });
      },
      {
        requireAuth: true,
        requiredPermissions: ['users:read'],
        _testOverrides: {
          getSession: async () => adminUser,
          getTenantId: async () => 'org-acme-001',
        },
      }
    );

    const req = createMockRequest('http://localhost/api/users/usr-999');
    const res = await handler(req, { params: Promise.resolve({ id: 'usr-999' }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('users/not-found');
    expect(body.error.userMessage).toBe('The requested user could not be found.');
    expect(body.error.requestId).toBeDefined();
  });

  // ── Scenario 5: Zod ValidationError → 400 ───────────────────────────

  it('returns 400 with validation error format when Zod schema fails', async () => {
    const schema = z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email'),
    });

    const handler = createApiHandler(
      async (req) => {
        const body = schema.parse(await req.json());
        return body;
      },
      {
        requireAuth: true,
        requiredPermissions: ['users:write'],
        _testOverrides: {
          getSession: async () => adminUser,
          getTenantId: async () => 'org-acme-001',
        },
      }
    );

    const req = createMockRequest('http://localhost/api/users', {
      method: 'POST',
      body: { name: '', email: 'not-an-email' },
    });
    const res = await handler(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toMatch(/validation/);
    expect(body.error.requestId).toBeDefined();
  });

  // ── Scenario 6: Unknown error → 500 ─────────────────────────────────

  it('returns 500 with generic userMessage when handler throws unknown error', async () => {
    const handler = createApiHandler(
      async () => {
        throw new Error('Database connection lost');
      },
      {
        requireAuth: true,
        _testOverrides: {
          getSession: async () => adminUser,
          getTenantId: async () => 'org-acme-001',
        },
      }
    );

    const req = createMockRequest('http://localhost/api/users');
    const res = await handler(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error.code).toMatch(/server/);
    // Must NOT expose internal error details to the caller
    expect(body.error.userMessage).not.toContain('Database connection lost');
    expect(body.error.requestId).toBeDefined();
  });

  // ── Scenario 7: requestId is generated and included ──────────────────

  it('generates a requestId and includes it in both success and error responses', async () => {
    const handler = createApiHandler(
      async () => ({ ok: true }),
      {
        requireAuth: true,
        _testOverrides: {
          getSession: async () => adminUser,
          getTenantId: async () => 'org-acme-001',
        },
      }
    );

    const req = createMockRequest('http://localhost/api/health');
    const res = await handler(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(200);
    // requestId should be in the response header or body
    const requestId = res.headers.get('X-Request-ID') ?? body.requestId;
    expect(requestId).toBeDefined();
    expect(typeof requestId).toBe('string');
    expect(requestId.length).toBeGreaterThan(0);
  });

  // ── Scenario 8: Audit event emitted on success ──────────────────────

  it('emits audit event with correct fields when auditAction is set and handler succeeds', async () => {
    const handler = createApiHandler(
      async (_req, ctx) => {
        return { id: ctx.params.id, name: 'Updated User' };
      },
      {
        requireAuth: true,
        requiredPermissions: ['users:write'],
        auditAction: 'user.updated',
        _testOverrides: {
          getSession: async () => adminUser,
          getTenantId: async () => 'org-acme-001',
          auditEmitter: mockAuditEmitter,
        },
      }
    );

    const req = createMockRequest('http://localhost/api/users/usr-123', {
      method: 'PUT',
      body: { name: 'Updated User' },
    });

    const res = await handler(req, { params: Promise.resolve({ id: 'usr-123' }) });
    expect(res.status).toBe(200);

    // Wait for async audit emission
    await vi.waitFor(() => {
      expect(mockAuditEmit).toHaveBeenCalledTimes(1);
    });

    const auditCall = mockAuditEmit.mock.calls[0][0];
    expect(auditCall.action).toBe('user.updated');
    expect(auditCall.actorId).toBe('usr-admin-001');
    expect(auditCall.tenantId).toBe('org-acme-001');
    expect(auditCall.requestId).toBeDefined();
  });

  // ── Scenario 9: No audit event emitted on failure ────────────────────

  it('does NOT emit audit event when handler throws an error', async () => {
    const handler = createApiHandler(
      async () => {
        throw new NotFoundError({
          code: 'users/not-found',
          message: 'Not found',
          userMessage: 'Not found.',
        });
      },
      {
        requireAuth: true,
        auditAction: 'user.updated',
        _testOverrides: {
          getSession: async () => adminUser,
          getTenantId: async () => 'org-acme-001',
          auditEmitter: mockAuditEmitter,
        },
      }
    );

    const req = createMockRequest('http://localhost/api/users/usr-999');
    await handler(req, { params: Promise.resolve({ id: 'usr-999' }) });

    expect(mockAuditEmit).not.toHaveBeenCalled();
  });

  // ── Scenario 10: Missing tenant → 400 ───────────────────────────────

  it('returns 400 with tenant/not-found when tenant cannot be resolved', async () => {
    const handler = createApiHandler(
      async () => ({ id: 'never-reached' }),
      {
        requireAuth: true,
        _testOverrides: {
          getSession: async () => ({ ...adminUser, tenantId: '' }),
          getTenantId: async () => null,
        },
      }
    );

    const req = createMockRequest('http://localhost/api/users');
    const res = await handler(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toMatch(/tenant/);
  });

  // ── Scenario 11: Public route (no auth required) ─────────────────────

  it('allows access to public routes without authentication', async () => {
    const handler = createApiHandler(
      async () => ({ status: 'healthy', timestamp: new Date().toISOString() }),
      {
        requireAuth: false,
        _testOverrides: {
          getSession: async () => null,
          getTenantId: async () => null,
        },
      }
    );

    const req = createMockRequest('http://localhost/api/health');
    const res = await handler(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('healthy');
  });

  // ── Scenario 12: Wildcard permission grants access ────────────────────

  it('grants access when user has wildcard permission matching the required one', async () => {
    const wildcardUser: SessionUser = {
      ...adminUser,
      permissions: ['users:*'],
    };

    const handler = createApiHandler(
      async () => ({ deleted: true }),
      {
        requireAuth: true,
        requiredPermissions: ['users:delete'],
        _testOverrides: {
          getSession: async () => wildcardUser,
          getTenantId: async () => 'org-acme-001',
        },
      }
    );

    const req = createMockRequest('http://localhost/api/users/usr-123', {
      method: 'DELETE',
    });
    const res = await handler(req, { params: Promise.resolve({ id: 'usr-123' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.deleted).toBe(true);
  });
});
```

### Step 2: Verify the test fails

```bash
cd packages/dream/errors && npx vitest run tests/integration/full-handler.test.ts
```

**Expected output**: FAIL -- the test file cannot resolve imports because the integration between packages has not been wired or `_testOverrides` is not yet implemented in `createApiHandler`. This confirms the test is valid and will drive the implementation.

### Step 3: Implement changes to make the test pass

The test above uses `_testOverrides` to inject mock dependencies into `createApiHandler`. This avoids requiring a real Next.js server. You need to update `createApiHandler` in `packages/dream/errors/src/handler.ts` to:

1. Accept an optional `_testOverrides` field in `ApiHandlerOptions`
2. Use `_testOverrides.getSession` instead of the real session resolution when provided
3. Use `_testOverrides.getTenantId` instead of the real tenant extraction when provided
4. Use `_testOverrides.auditEmitter` instead of the real emitter when provided
5. Check permissions using `matchesPermission` from `@dream/rbac`

Add to `packages/dream/errors/src/handler.ts`:

```typescript
import { matchesPermission } from '@dream/rbac';

interface TestOverrides {
  getSession?: () => Promise<SessionUser | null>;
  getTenantId?: () => Promise<string | null>;
  auditEmitter?: AuditEmitter;
}

// Add _testOverrides to ApiHandlerOptions
export interface ApiHandlerOptions {
  requireAuth?: boolean;
  requiredPermissions?: string[];
  requiredRole?: string;
  minimumRoleLevel?: number;
  validationSchema?: ZodSchema;
  auditAction?: string;
  /** @internal Test-only: inject mock dependencies */
  _testOverrides?: TestOverrides;
}
```

Then update `createApiHandler` to use `_testOverrides` when available, and to check permissions via `matchesPermission` from `@dream/rbac`.

### Step 4: Verify the test passes

```bash
cd packages/dream/errors && npx vitest run tests/integration/full-handler.test.ts
```

**Expected output**:
```
 ✓ tests/integration/full-handler.test.ts (12 tests)
   ✓ createApiHandler — full cross-package integration
     ✓ returns { success: true, data } when auth + permission + tenant + handler all pass
     ✓ returns 401 with auth/unauthenticated when session is null
     ✓ returns 403 with rbac/permission-denied when user lacks required permission
     ✓ returns 404 with correct error format when handler throws NotFoundError
     ✓ returns 400 with validation error format when Zod schema fails
     ✓ returns 500 with generic userMessage when handler throws unknown error
     ✓ generates a requestId and includes it in both success and error responses
     ✓ emits audit event with correct fields when auditAction is set and handler succeeds
     ✓ does NOT emit audit event when handler throws an error
     ✓ returns 400 with tenant/not-found when tenant cannot be resolved
     ✓ allows access to public routes without authentication
     ✓ grants access when user has wildcard permission matching the required one

 Test Files  1 passed (1)
 Tests       12 passed (12)
```

### Step 5: Commit

```bash
git add packages/dream/errors/tests/integration/full-handler.test.ts
git add packages/dream/errors/src/handler.ts
git commit -m "test(errors): add cross-package integration test for createApiHandler full flow

- Tests 12 scenarios: success, auth failure (401), permission failure (403),
  NotFoundError (404), Zod validation (400), unknown error (500), requestId
  generation, audit emission, missing tenant, public routes, wildcard permissions
- Uses _testOverrides to inject mock auth/tenant/audit without real Next.js server
- Verifies @dream/rbac matchesPermission integration for wildcard matching
- Verifies @dream/types error response shape conformance"
```

---

## Task 32: Cross-package integration test -- React provider composition (3 min)

**Goal**: Verify that `AuthProvider` + `TenantProvider` + RBAC gates compose correctly and that hooks from all 3 packages return correct values inside the nested provider hierarchy.

### Step 1: Write the failing test

**Create**: `packages/dream/auth/tests/integration/provider-composition.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MockAuthProvider } from '../../src/react/testing';
import { MockTenantProvider } from '@dream/multi-tenant/react/testing';
import { PermissionGate, AdminGate, RoleGate, usePermission, useRole } from '@dream/rbac/react';
import { useAuth } from '../../src/react';
import { useTenant } from '@dream/multi-tenant/react';
import type { SessionUser, Organization } from '@dream/types';

// ── Fixtures ──────────────────────────────────────────────────────────────

const adminUser: SessionUser = {
  id: 'usr-admin-001',
  email: 'admin@acme.com',
  name: 'Alice Admin',
  tenantId: 'org-acme-001',
  roleSlugs: ['admin'],
  activeRole: 'admin',
  permissions: ['users:*', 'teams:*', 'settings:*', 'audit:read', 'invoices:write'],
  tenantStatus: 'active',
};

const guestUser: SessionUser = {
  id: 'usr-guest-001',
  email: 'guest@acme.com',
  name: 'Bob Guest',
  tenantId: 'org-acme-001',
  roleSlugs: ['guest'],
  activeRole: 'guest',
  permissions: ['users:read'],
  tenantStatus: 'active',
};

const testOrg: Organization = {
  id: 'org-acme-001',
  name: 'Acme Corp',
  slug: 'acme',
  status: 'active',
  planTier: 'enterprise',
  logoUrl: 'https://acme.com/logo.png',
  primaryColor: '#FF5733',
  currency: 'USD',
  region: 'us-east',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-06-01'),
};

// ── Helper components that use hooks ──────────────────────────────────────

function AuthInfo() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <div>Not authenticated</div>;
  return (
    <div>
      <span data-testid="user-name">{user?.name}</span>
      <span data-testid="user-email">{user?.email}</span>
      <span data-testid="user-role">{user?.activeRole}</span>
    </div>
  );
}

function TenantInfo() {
  const { tenantId, organization, isLoading } = useTenant();
  if (isLoading) return <div>Loading tenant...</div>;
  return (
    <div>
      <span data-testid="tenant-id">{tenantId}</span>
      <span data-testid="org-name">{organization?.name}</span>
      <span data-testid="org-plan">{organization?.planTier}</span>
    </div>
  );
}

function PermissionCheck({ permission }: { permission: string }) {
  const hasPermission = usePermission(permission);
  return <span data-testid={`perm-${permission}`}>{hasPermission ? 'granted' : 'denied'}</span>;
}

function RoleInfo() {
  const { role, roles } = useRole();
  return (
    <div>
      <span data-testid="active-role">{role}</span>
      <span data-testid="all-roles">{roles.join(',')}</span>
    </div>
  );
}

// ── Full provider wrapper ────────────────────────────────────────────────

function FullProviders({
  user,
  tenantId,
  organization,
  children,
}: {
  user: SessionUser | null;
  tenantId: string;
  organization: Organization;
  children: React.ReactNode;
}) {
  return (
    <MockAuthProvider user={user}>
      <MockTenantProvider tenantId={tenantId} organization={organization}>
        {children}
      </MockTenantProvider>
    </MockAuthProvider>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('React provider composition — cross-package integration', () => {
  // ── 1. useAuth() works inside nested providers ──────────────────────

  it('useAuth() returns user data inside nested providers', () => {
    render(
      <FullProviders user={adminUser} tenantId="org-acme-001" organization={testOrg}>
        <AuthInfo />
      </FullProviders>
    );

    expect(screen.getByTestId('user-name')).toHaveTextContent('Alice Admin');
    expect(screen.getByTestId('user-email')).toHaveTextContent('admin@acme.com');
    expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
  });

  // ── 2. useTenant() works inside nested providers ────────────────────

  it('useTenant() returns organization data inside nested providers', () => {
    render(
      <FullProviders user={adminUser} tenantId="org-acme-001" organization={testOrg}>
        <TenantInfo />
      </FullProviders>
    );

    expect(screen.getByTestId('tenant-id')).toHaveTextContent('org-acme-001');
    expect(screen.getByTestId('org-name')).toHaveTextContent('Acme Corp');
    expect(screen.getByTestId('org-plan')).toHaveTextContent('enterprise');
  });

  // ── 3. usePermission() returns correct values ───────────────────────

  it('usePermission() returns true for granted permissions and false for denied ones', () => {
    render(
      <FullProviders user={adminUser} tenantId="org-acme-001" organization={testOrg}>
        <PermissionCheck permission="users:read" />
        <PermissionCheck permission="users:delete" />
        <PermissionCheck permission="invoices:write" />
        <PermissionCheck permission="billing:read" />
      </FullProviders>
    );

    // admin has users:* — should match users:read and users:delete
    expect(screen.getByTestId('perm-users:read')).toHaveTextContent('granted');
    expect(screen.getByTestId('perm-users:delete')).toHaveTextContent('granted');
    // admin has invoices:write explicitly
    expect(screen.getByTestId('perm-invoices:write')).toHaveTextContent('granted');
    // admin does NOT have billing:read
    expect(screen.getByTestId('perm-billing:read')).toHaveTextContent('denied');
  });

  // ── 4. PermissionGate renders based on user permissions ─────────────

  it('PermissionGate renders children when user has the permission', () => {
    render(
      <FullProviders user={adminUser} tenantId="org-acme-001" organization={testOrg}>
        <PermissionGate permission="users:write">
          <button>Edit User</button>
        </PermissionGate>
      </FullProviders>
    );

    expect(screen.getByText('Edit User')).toBeInTheDocument();
  });

  it('PermissionGate renders fallback when user lacks the permission', () => {
    render(
      <FullProviders user={guestUser} tenantId="org-acme-001" organization={testOrg}>
        <PermissionGate permission="users:write" fallback={<span>No access</span>}>
          <button>Edit User</button>
        </PermissionGate>
      </FullProviders>
    );

    expect(screen.queryByText('Edit User')).not.toBeInTheDocument();
    expect(screen.getByText('No access')).toBeInTheDocument();
  });

  // ── 5. AdminGate renders for admin user ─────────────────────────────

  it('AdminGate renders children for admin user', () => {
    render(
      <FullProviders user={adminUser} tenantId="org-acme-001" organization={testOrg}>
        <AdminGate>
          <span>Admin Panel</span>
        </AdminGate>
      </FullProviders>
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  // ── 6. AdminGate hides for guest user ───────────────────────────────

  it('AdminGate hides children for guest user', () => {
    render(
      <FullProviders user={guestUser} tenantId="org-acme-001" organization={testOrg}>
        <AdminGate fallback={<span>Restricted</span>}>
          <span>Admin Panel</span>
        </AdminGate>
      </FullProviders>
    );

    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
    expect(screen.getByText('Restricted')).toBeInTheDocument();
  });

  // ── 7. RoleGate matches active role ─────────────────────────────────

  it('RoleGate renders children when active role matches', () => {
    render(
      <FullProviders user={adminUser} tenantId="org-acme-001" organization={testOrg}>
        <RoleGate role="admin">
          <span>Admin Content</span>
        </RoleGate>
      </FullProviders>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('RoleGate hides children when active role does not match', () => {
    render(
      <FullProviders user={guestUser} tenantId="org-acme-001" organization={testOrg}>
        <RoleGate role="admin" fallback={<span>Not admin</span>}>
          <span>Admin Content</span>
        </RoleGate>
      </FullProviders>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.getByText('Not admin')).toBeInTheDocument();
  });

  // ── 8. useRole() returns role info ──────────────────────────────────

  it('useRole() returns active role and all role slugs', () => {
    render(
      <FullProviders user={adminUser} tenantId="org-acme-001" organization={testOrg}>
        <RoleInfo />
      </FullProviders>
    );

    expect(screen.getByTestId('active-role')).toHaveTextContent('admin');
    expect(screen.getByTestId('all-roles')).toHaveTextContent('admin');
  });

  // ── 9. Unauthenticated user — all gates deny ───────────────────────

  it('all gates render fallback when user is null (not authenticated)', () => {
    render(
      <FullProviders user={null} tenantId="org-acme-001" organization={testOrg}>
        <AuthInfo />
        <PermissionGate permission="users:read" fallback={<span>perm-denied</span>}>
          <span>perm-granted</span>
        </PermissionGate>
        <AdminGate fallback={<span>admin-denied</span>}>
          <span>admin-granted</span>
        </AdminGate>
        <RoleGate role="admin" fallback={<span>role-denied</span>}>
          <span>role-granted</span>
        </RoleGate>
      </FullProviders>
    );

    expect(screen.getByText('Not authenticated')).toBeInTheDocument();
    expect(screen.getByText('perm-denied')).toBeInTheDocument();
    expect(screen.getByText('admin-denied')).toBeInTheDocument();
    expect(screen.getByText('role-denied')).toBeInTheDocument();
  });
});
```

### Step 2: Verify the test fails

```bash
cd packages/dream/auth && npx vitest run tests/integration/provider-composition.test.tsx
```

**Expected output**: FAIL -- imports cannot be resolved because the React testing utilities (`MockAuthProvider`, `MockTenantProvider`) or the RBAC gates need to be wired to read from the correct context.

### Step 3: Implement to make the test pass

Ensure:
1. `MockAuthProvider` provides the auth context that `useAuth()` reads from
2. `MockTenantProvider` provides the tenant context that `useTenant()` reads from
3. RBAC gates (`PermissionGate`, `AdminGate`, `RoleGate`) and hooks (`usePermission`, `useRole`) read from the auth context populated by `MockAuthProvider`
4. Add `@testing-library/react` and `@testing-library/jest-dom` to `packages/dream/auth/package.json` devDependencies
5. Add `jsdom` environment to `packages/dream/auth/vitest.config.ts`:
   ```typescript
   import { defineConfig } from 'vitest/config';
   export default defineConfig({
     test: {
       environment: 'jsdom',
       setupFiles: ['./tests/setup.ts'],
     },
   });
   ```
6. Create `packages/dream/auth/tests/setup.ts`:
   ```typescript
   import '@testing-library/jest-dom/vitest';
   ```

### Step 4: Verify the test passes

```bash
cd packages/dream/auth && npx vitest run tests/integration/provider-composition.test.tsx
```

**Expected output**:
```
 ✓ tests/integration/provider-composition.test.tsx (9 tests)
   ✓ React provider composition — cross-package integration
     ✓ useAuth() returns user data inside nested providers
     ✓ useTenant() returns organization data inside nested providers
     ✓ usePermission() returns true for granted permissions and false for denied ones
     ✓ PermissionGate renders children when user has the permission
     ✓ PermissionGate renders fallback when user lacks the permission
     ✓ AdminGate renders children for admin user
     ✓ AdminGate hides children for guest user
     ✓ RoleGate renders children when active role matches
     ✓ RoleGate hides children when active role does not match
     ✓ useRole() returns active role and all role slugs
     ✓ all gates render fallback when user is null (not authenticated)

 Test Files  1 passed (1)
 Tests       11 passed (11)
```

### Step 5: Commit

```bash
git add packages/dream/auth/tests/integration/provider-composition.test.tsx
git add packages/dream/auth/tests/setup.ts
git add packages/dream/auth/vitest.config.ts
git commit -m "test(auth): add cross-package React provider composition integration test

- Verifies useAuth(), useTenant(), usePermission(), useRole() work inside
  nested MockAuthProvider + MockTenantProvider hierarchy
- Tests PermissionGate, AdminGate, RoleGate rendering for admin vs guest users
- Tests unauthenticated state: all gates deny, all hooks return safe defaults
- Validates wildcard permission matching (users:* matches users:delete)"
```

---

## Task 33: Full monorepo verification (3 min)

**Goal**: Run all tests, typecheck, and build across all 5 `@dream/*` packages. Fix any issues.

### Step 1: Run all tests

```bash
cd /Users/daniel/products/shared-platform-sdk/packages/dream/types && npx vitest run
```

**Expected**: All tests pass. If any fail, fix the failing test or implementation before continuing.

```bash
cd /Users/daniel/products/shared-platform-sdk/packages/dream/errors && npx vitest run
```

**Expected**: All tests pass (including the new integration test from Task 31).

```bash
cd /Users/daniel/products/shared-platform-sdk/packages/dream/rbac && npx vitest run
```

**Expected**: All tests pass.

```bash
cd /Users/daniel/products/shared-platform-sdk/packages/dream/auth && npx vitest run
```

**Expected**: All tests pass (including the new integration test from Task 32).

```bash
cd /Users/daniel/products/shared-platform-sdk/packages/dream/multi-tenant && npx vitest run
```

**Expected**: All tests pass.

### Step 2: Run typecheck across all packages

```bash
cd /Users/daniel/products/shared-platform-sdk/packages/dream/types && npx tsc --noEmit
cd /Users/daniel/products/shared-platform-sdk/packages/dream/errors && npx tsc --noEmit
cd /Users/daniel/products/shared-platform-sdk/packages/dream/rbac && npx tsc --noEmit
cd /Users/daniel/products/shared-platform-sdk/packages/dream/auth && npx tsc --noEmit
cd /Users/daniel/products/shared-platform-sdk/packages/dream/multi-tenant && npx tsc --noEmit
```

**Expected**: No type errors across any package. If there are errors:
- Fix unused imports (`noUnusedLocals`)
- Fix missing type exports
- Fix mismatched import paths between packages

### Step 3: Build all packages

```bash
cd /Users/daniel/products/shared-platform-sdk/packages/dream/types && npx tsc
cd /Users/daniel/products/shared-platform-sdk/packages/dream/errors && npx tsc
cd /Users/daniel/products/shared-platform-sdk/packages/dream/rbac && npx tsc
cd /Users/daniel/products/shared-platform-sdk/packages/dream/auth && npx tsc
cd /Users/daniel/products/shared-platform-sdk/packages/dream/multi-tenant && npx tsc
```

**Expected**: Each package produces a `dist/` directory with compiled `.js` and `.d.ts` files.

Verify:
```bash
ls packages/dream/types/dist/
ls packages/dream/errors/dist/
ls packages/dream/rbac/dist/
ls packages/dream/auth/dist/
ls packages/dream/multi-tenant/dist/
```

**Expected**: Each directory contains `index.js`, `index.d.ts`, and sub-module files.

### Step 4: Verify package.json cross-references

Read each package.json and confirm dependency declarations:

```bash
cat packages/dream/errors/package.json | grep -A 5 '"dependencies"'
```

**Expected**: `@dream/types` listed as a dependency (workspace reference `"@dream/types": "workspace:*"` or `"file:../types"`).

```bash
cat packages/dream/rbac/package.json | grep -A 5 '"dependencies"'
```

**Expected**: `@dream/types` listed as a dependency.

```bash
cat packages/dream/auth/package.json | grep -A 5 '"dependencies"'
```

**Expected**: `@dream/types` listed as a dependency.

```bash
cat packages/dream/multi-tenant/package.json | grep -A 5 '"dependencies"'
```

**Expected**: `@dream/types` listed as a dependency.

If any cross-references are missing, add them:

```json
{
  "dependencies": {
    "@dream/types": "workspace:*"
  }
}
```

### Step 5: Commit any fixes

```bash
git add -A packages/dream/
git status
```

If there are changes:

```bash
git commit -m "fix(dream): resolve cross-package type errors and dependency references

- Fix any type errors found during full monorepo verification
- Ensure all package.json files reference @dream/types as dependency
- Verify all 5 packages build, typecheck, and pass tests"
```

If there are no changes (everything already works), skip the commit.

---

## Task 34: Add root-level test and build scripts (2 min)

**Goal**: Add convenience scripts to the root so that all 5 dream packages can be tested and built with a single command.

### Step 1: Check current root package.json

```bash
cat /Users/daniel/products/shared-platform-sdk/Makefile | head -30
```

Check if the project uses a root `package.json` or `Makefile` for orchestration.

### Step 2: Add scripts to Makefile (or create root package.json)

**Option A**: If a root `package.json` exists, add scripts to it.

**Modify**: `/Users/daniel/products/shared-platform-sdk/package.json`

Add to the `"scripts"` section:

```json
{
  "scripts": {
    "dream:test": "cd packages/dream/types && npx vitest run && cd ../errors && npx vitest run && cd ../rbac && npx vitest run && cd ../auth && npx vitest run && cd ../multi-tenant && npx vitest run",
    "dream:build": "cd packages/dream/types && npx tsc && cd ../errors && npx tsc && cd ../rbac && npx tsc && cd ../auth && npx tsc && cd ../multi-tenant && npx tsc",
    "dream:typecheck": "cd packages/dream/types && npx tsc --noEmit && cd ../errors && npx tsc --noEmit && cd ../rbac && npx tsc --noEmit && cd ../auth && npx tsc --noEmit && cd ../multi-tenant && npx tsc --noEmit"
  }
}
```

**Option B**: If no root `package.json` exists (the project uses Makefile), add targets to the Makefile.

**Modify**: `/Users/daniel/products/shared-platform-sdk/Makefile`

Add these targets:

```makefile
# ── Dream packages ────────────────────────────────────────────────────────

.PHONY: dream-test dream-build dream-typecheck

dream-test:
	cd packages/dream/types && npx vitest run
	cd packages/dream/errors && npx vitest run
	cd packages/dream/rbac && npx vitest run
	cd packages/dream/auth && npx vitest run
	cd packages/dream/multi-tenant && npx vitest run

dream-build:
	cd packages/dream/types && npx tsc
	cd packages/dream/errors && npx tsc
	cd packages/dream/rbac && npx tsc
	cd packages/dream/auth && npx tsc
	cd packages/dream/multi-tenant && npx tsc

dream-typecheck:
	cd packages/dream/types && npx tsc --noEmit
	cd packages/dream/errors && npx tsc --noEmit
	cd packages/dream/rbac && npx tsc --noEmit
	cd packages/dream/auth && npx tsc --noEmit
	cd packages/dream/multi-tenant && npx tsc --noEmit
```

### Step 3: Verify the scripts work

**If using package.json**:
```bash
cd /Users/daniel/products/shared-platform-sdk && npm run dream:test
```

**If using Makefile**:
```bash
cd /Users/daniel/products/shared-platform-sdk && make dream-test
```

**Expected output**:
```
 ✓ packages/dream/types — X tests passed
 ✓ packages/dream/errors — X tests passed
 ✓ packages/dream/rbac — X tests passed
 ✓ packages/dream/auth — X tests passed
 ✓ packages/dream/multi-tenant — X tests passed
```

**Then build**:

```bash
npm run dream:build
# or
make dream-build
```

**Expected output**: All 5 packages compile without errors.

### Step 4: Commit

```bash
git add Makefile
# or: git add package.json
git commit -m "feat(dream): add root-level test, build, and typecheck scripts

- make dream-test: runs vitest across all 5 @dream/* packages
- make dream-build: compiles all 5 packages with tsc
- make dream-typecheck: type-checks all 5 packages without emitting"
```

---

## Task 35: Final commit and summary (2 min)

**Goal**: Ensure all changes are committed, run a final verification, and produce a summary of the entire foundation.

### Step 1: Check for uncommitted changes

```bash
cd /Users/daniel/products/shared-platform-sdk && git status
```

**Expected**: Clean working tree, or only untracked files that are not part of the dream packages.

If there are uncommitted changes in `packages/dream/`:

```bash
git add packages/dream/
git status
```

### Step 2: Run final full verification

```bash
make dream-test
```

**Expected**: All tests pass across all 5 packages.

```bash
make dream-build
```

**Expected**: All 5 packages build without errors.

```bash
make dream-typecheck
```

**Expected**: No type errors.

### Step 3: Commit any remaining changes

If `git status` shows uncommitted changes:

```bash
git add -A packages/dream/
git commit -m "chore(dream): final verification — all packages passing

- All tests green across @dream/types, @dream/errors, @dream/rbac, @dream/auth, @dream/multi-tenant
- All packages typecheck and build successfully
- Cross-package integration tests verify end-to-end flow"
```

### Step 4: Count test files and source files

```bash
cd /Users/daniel/products/shared-platform-sdk/packages/dream && find . -name "*.test.ts" -o -name "*.test.tsx" | grep -v node_modules | grep -v dist | wc -l
```

**Expected**: ~15-20 test files

```bash
cd /Users/daniel/products/shared-platform-sdk/packages/dream && find . -name "*.ts" -o -name "*.tsx" | grep -v test | grep -v node_modules | grep -v dist | wc -l
```

**Expected**: ~40-50 source files

### Step 5: Verify clean git status

```bash
cd /Users/daniel/products/shared-platform-sdk && git status
```

**Expected output**:
```
On branch 007-shared-platform-foundation
nothing to commit, working tree clean
```

### Final verification summary

After Task 35 completes, the implementer should see:

| Package | Tests | Typecheck | Build | Cross-refs |
|---------|-------|-----------|-------|------------|
| `@dream/types` | PASS | PASS | PASS | N/A (no deps) |
| `@dream/errors` | PASS | PASS | PASS | depends on `@dream/types`, `@dream/rbac` |
| `@dream/rbac` | PASS | PASS | PASS | depends on `@dream/types` |
| `@dream/auth` | PASS | PASS | PASS | depends on `@dream/types` |
| `@dream/multi-tenant` | PASS | PASS | PASS | depends on `@dream/types` |

**Files delivered in Tasks 31-35**:

| File | Package | Purpose |
|------|---------|---------|
| `packages/dream/errors/tests/integration/full-handler.test.ts` | `@dream/errors` | 12-scenario integration test for `createApiHandler` |
| `packages/dream/auth/tests/integration/provider-composition.test.tsx` | `@dream/auth` | 11-scenario React provider composition test |
| `packages/dream/auth/tests/setup.ts` | `@dream/auth` | Test setup for jsdom + jest-dom matchers |
| `Makefile` (modified) | root | `dream-test`, `dream-build`, `dream-typecheck` targets |

**Total across all 5 packages**: ~15-20 test files, ~40-50 source files, 5 `package.json`, 5 `tsconfig.json`, 5 `vitest.config.ts`.

---

## Implementation Summary

| Phase | Tasks | Package | Tests | Est. Time |
|-------|-------|---------|-------|-----------|
| Monorepo + Types | 1-8 | @dream/types | 32 | ~27 min |
| Errors | 9-14 | @dream/errors | 58 | ~25 min |
| RBAC | 15-20 | @dream/rbac | 92 | ~30 min |
| Auth | 21-25 | @dream/auth | 42 | ~20 min |
| Multi-Tenant | 26-30 | @dream/multi-tenant | 39 | ~20 min |
| Integration | 31-35 | Cross-package | 23 | ~15 min |
| **Total** | **35** | **5 packages** | **~286** | **~2.5 hrs** |

### Package Dependency Graph

```
@dream/types (no deps)
├── @dream/errors (depends on @dream/types)
├── @dream/rbac (depends on @dream/types)
├── @dream/auth (depends on @dream/types)
└── @dream/multi-tenant (depends on @dream/types)

Integration tests: @dream/errors + @dream/rbac (handler integration)
                   @dream/auth + @dream/multi-tenant + @dream/rbac (React provider composition)
```

### File Tree After Completion

```
packages/dream/
├── types/           # 14 source files, 8 test files, 32 tests
├── errors/          # 5 source files, 6 test files, 58 tests
├── rbac/            # 10 source files, 7 test files, 92 tests
├── auth/            # 8 source files, 6 test files, 42 tests
└── multi-tenant/    # 8 source files, 5 test files, 39 tests
```
