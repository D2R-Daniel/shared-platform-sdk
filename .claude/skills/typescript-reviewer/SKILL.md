# TypeScript Code Review Skill

## Purpose
Review TypeScript code in the Node.js SDK for type safety, best practices, and consistency.

## When to Use
- After implementing new TypeScript features in `packages/node/`
- When modifying existing TypeScript code
- Before committing TypeScript changes

## Review Checklist

### Type Safety
- [ ] All function parameters have explicit types
- [ ] Return types are explicitly declared
- [ ] No use of `any` without justification
- [ ] Proper use of generics where applicable
- [ ] Union types used appropriately
- [ ] Type guards implemented for runtime checks

### Code Quality
- [ ] Follows project naming conventions (camelCase for variables, PascalCase for types/classes)
- [ ] Consistent use of async/await over raw promises
- [ ] Error handling with typed exceptions
- [ ] No unused imports or variables
- [ ] Proper use of access modifiers (private, public, readonly)

### SDK Patterns
- [ ] Client classes follow Builder pattern where appropriate
- [ ] Methods return typed responses, not raw JSON
- [ ] Errors extend base SDK exception classes
- [ ] Proper JSDoc comments for public APIs
- [ ] Consistent parameter ordering across similar methods

### Interface Design
- [ ] Request/Response types are separate interfaces
- [ ] Optional properties use `?` syntax
- [ ] Readonly properties marked appropriately
- [ ] Enums used for fixed value sets
- [ ] Type exports in index.ts

## Common Issues

### Avoid
```typescript
// Bad: Using any
function process(data: any): any { ... }

// Bad: Missing return type
async function fetchData(id: string) { ... }

// Bad: Not handling errors
const result = await client.get(url);
```

### Prefer
```typescript
// Good: Explicit types
function process(data: RequestData): ResponseData { ... }

// Good: Explicit return type
async function fetchData(id: string): Promise<User> { ... }

// Good: Error handling
try {
  const result = await client.get<User>(url);
} catch (error) {
  if (error instanceof ApiException) { ... }
}
```

## File Patterns
- `packages/node/src/**/*.ts` - Source files
- `packages/node/src/**/types.ts` - Type definitions
- `packages/node/src/**/errors.ts` - Exception classes
- `packages/node/src/**/client.ts` - Client implementations
