---
name: create-unit-test
description: Create Vitest unit tests following project patterns. Use when writing tests for functions, components, models, or route loaders/actions.
---

# Create Unit Test

## When to Use

- Writing tests for any code
- User asks to "add tests" or "test this function"
- After implementing new features

## Test File Location

Tests are **co-located** with source files:

```
app/components/Button.tsx
app/components/Button.test.tsx     # Component test

app/models/user.server.ts
app/models/user.server.test.ts     # Model test
```

## Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Feature Name', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does something specific', () => {
        // Arrange
        const input = 'test';
        // Act
        const result = functionUnderTest(input);
        // Assert
        expect(result).toBe('expected');
    });
});
```

## Component Testing

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '~/test/utils';
import { Button } from './Button';

describe('Button', () => {
    it('renders and handles clicks', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click</Button>);

        screen.getByRole('button').click();
        expect(handleClick).toHaveBeenCalled();
    });
});
```

**Query by role, label, text** - NOT class or test IDs.

## Model Testing (Mock Prisma)

```typescript
// Mock BEFORE importing
vi.mock('~/db.server', () => ({
    prisma: { user: { findUnique: vi.fn() } },
}));

import { prisma } from '~/db.server';
import { getUserProfile } from './user.server';

describe('User Model', () => {
    it('fetches user', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '123' } as any);

        const result = await getUserProfile('123');

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: '123' },
            select: expect.any(Object),
        });
    });
});
```

**Critical:** Mock `~/db.server` BEFORE importing it.

## Mocking Patterns

```typescript
// Return value
mockFn.mockReturnValue('value');
mockFn.mockResolvedValue({ data: 'async' });

// Suppress console
vi.spyOn(console, 'error').mockImplementation(() => {});
```

## Running Tests

```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # Coverage
```

## Checklist

1. [ ] Create `*.test.ts(x)` co-located with source
2. [ ] Mock dependencies BEFORE importing them
3. [ ] Call `vi.clearAllMocks()` in `beforeEach`
4. [ ] Use semantic queries (role, label, text)

## Templates

- [Component Test](./templates/component.test.tsx)
- [Model Test](./templates/model.test.ts)
- [Route Test](./templates/route.test.ts)

## Full Reference

See `.github/instructions/unit-testing.instructions.md` for:
- Route loader/action testing
- Async module mocking
- Test utilities reference
- What to test vs. what not to test
