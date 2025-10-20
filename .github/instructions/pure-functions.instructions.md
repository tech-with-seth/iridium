# Pure Functions Instructions

## Overview

**Pure functions are the foundation of predictable, testable, and maintainable code.** This guide establishes patterns for writing pure functions throughout this application.

### What is a Pure Function?

A pure function is a function that:

1. **Deterministic**: Given the same input, always returns the same output
2. **No side effects**: Doesn't modify external state, perform I/O, or cause observable changes
3. **No external dependencies**: Doesn't read mutable external state

### Why Pure Functions?

- **Testability** - Easy to test without mocks, setup, or teardown
- **Predictability** - Behavior is guaranteed by inputs alone
- **Reusability** - Can be used anywhere without context dependencies
- **Composability** - Pure functions combine elegantly
- **Debugging** - Easier to reason about and trace issues
- **Parallelization** - Safe to run concurrently
- **Memoization** - Results can be cached reliably

### The Golden Rule

**Default to purity.** Make functions pure unless side effects are explicitly necessary.

## Core Principles

### The Three Rules

#### 1. Same Input → Same Output

```typescript
// ✅ PURE - Deterministic
function calculateDiscount(price: number, discountPercent: number): number {
    return price * (discountPercent / 100);
}

// ❌ IMPURE - Non-deterministic (depends on Date.now())
function isHolidayDiscount(price: number): number {
    const today = new Date();
    return today.getMonth() === 11 ? price * 0.5 : price;
}

// ✅ PURE - Date passed as parameter
function calculateHolidayPrice(price: number, date: Date): number {
    return date.getMonth() === 11 ? price * 0.5 : price;
}
```

#### 2. No Side Effects

```typescript
// ✅ PURE - Returns new array, doesn't mutate
function addItem<T>(items: T[], newItem: T): T[] {
    return [...items, newItem];
}

// ❌ IMPURE - Mutates input array
function addItemMutating<T>(items: T[], newItem: T): T[] {
    items.push(newItem);
    return items;
}

// ✅ PURE - Returns new object, doesn't mutate
function updateUser(user: User, updates: Partial<User>): User {
    return { ...user, ...updates };
}

// ❌ IMPURE - Mutates input object
function updateUserMutating(user: User, updates: Partial<User>): User {
    Object.assign(user, updates);
    return user;
}
```

#### 3. No External Dependencies

```typescript
// ❌ IMPURE - Depends on external mutable state
let taxRate = 0.08;
function calculateTax(price: number): number {
    return price * taxRate;
}

// ✅ PURE - Tax rate is a parameter
function calculateTax(price: number, taxRate: number): number {
    return price * taxRate;
}

// ❌ IMPURE - Reads from environment
function getApiUrl(): string {
    return process.env.API_URL || 'http://localhost';
}

// ✅ PURE - Environment value passed as parameter
function buildApiUrl(baseUrl: string, path: string): string {
    return `${baseUrl}${path}`;
}
```

## Organization Strategy

### File Structure

```
app/
├── lib/
│   └── utils/                    # Global pure utilities
│       ├── formatters.ts         # Date, currency, string formatters
│       ├── calculations.ts       # Business calculations
│       ├── transformers.ts       # Data transformations
│       └── guards.ts             # Type guards and predicates
├── routes/
│   └── [feature]/
│       ├── helpers.ts            # Feature-specific pure functions
│       └── route.tsx             # Route component (can use helpers)
└── models/
    └── [entity].server.ts        # Mix: pure transformers + impure DB operations
```

### When to Colocate vs Centralize

**Centralize** (`app/lib/utils/`) when:

- Function is used across multiple features
- Function is a general-purpose utility (formatting, validation, etc.)
- Function has no feature-specific context

**Colocate** (next to feature) when:

- Function is feature-specific
- Function is only used in one area of the app
- Function operates on feature-specific types

**Example: Centralized Utility**

```typescript
// app/lib/utils/formatters.ts
export function formatCurrency(
    amount: number,
    currency: string = 'USD'
): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(amount);
}

// Used everywhere
import { formatCurrency } from '~/lib/utils/formatters';
```

**Example: Colocated Helper**

```typescript
// app/routes/checkout/helpers.ts
import type { CartItem } from './types';

export function calculateCartTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Only used in checkout feature
import { calculateCartTotal } from './helpers';
```

## Pattern 1: Data Transformations

**Pure functions that reshape, filter, or map data without side effects.**

### Common Patterns

#### Filtering

```typescript
// app/lib/utils/transformers.ts
import type { User } from '~/generated/prisma/client';
import { Role } from '~/generated/prisma/client';

export function filterActiveUsers(users: User[]): User[] {
    return users.filter((user) => user.isActive);
}

export function filterByRole(users: User[], role: Role): User[] {
    return users.filter((user) => user.role === role);
}
```

#### Mapping

```typescript
import type { User } from '~/generated/prisma/client';

export interface UserSummary {
    id: string;
    name: string;
    email: string;
}

export function toUserSummary(user: User): UserSummary {
    return {
        id: user.id,
        name: user.name,
        email: user.email
    };
}

export function toUserSummaries(users: User[]): UserSummary[] {
    return users.map(toUserSummary);
}
```

#### Reshaping

```typescript
export interface GroupedUsers {
    [role: string]: User[];
}

export function groupUsersByRole(users: User[]): GroupedUsers {
    return users.reduce((groups, user) => {
        const role = user.role;
        return {
            ...groups,
            [role]: [...(groups[role] || []), user]
        };
    }, {} as GroupedUsers);
}
```

#### Sorting

```typescript
export function sortUsersByName(users: User[]): User[] {
    return [...users].sort((a, b) => a.name.localeCompare(b.name));
}

export function sortByCreatedAt<T extends { createdAt: Date }>(
    items: T[]
): T[] {
    return [...items].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
}
```

### Composition Pattern

```typescript
// Compose pure transformations
export function getActiveSortedUsers(users: User[]): User[] {
    return sortUsersByName(filterActiveUsers(users));
}

// Or use pipe pattern
export function pipe<T>(...fns: Array<(arg: T) => T>) {
    return (value: T) => fns.reduce((acc, fn) => fn(acc), value);
}

const processUsers = pipe(filterActiveUsers, sortUsersByName, toUserSummaries);

const result = processUsers(users);
```

## Pattern 2: Business Calculations

**Pure functions for pricing, scoring, permissions, and business rules.**

### Pricing Calculations

```typescript
// app/lib/utils/calculations.ts

export interface PriceBreakdown {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
}

export function calculatePrice(
    subtotal: number,
    taxRate: number,
    discountPercent: number = 0
): PriceBreakdown {
    const discount = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * taxRate;
    const total = taxableAmount + tax;

    return {
        subtotal,
        tax,
        discount,
        total
    };
}

export function applyVolumeDiscount(
    quantity: number,
    pricePerUnit: number
): number {
    if (quantity >= 100) return pricePerUnit * 0.8; // 20% off
    if (quantity >= 50) return pricePerUnit * 0.9; // 10% off
    return pricePerUnit;
}
```

### Scoring & Ranking

```typescript
export interface Post {
    likes: number;
    comments: number;
    shares: number;
    createdAt: Date;
}

export function calculateEngagementScore(post: Post): number {
    const likesWeight = 1;
    const commentsWeight = 3;
    const sharesWeight = 5;

    return (
        post.likes * likesWeight +
        post.comments * commentsWeight +
        post.shares * sharesWeight
    );
}

export function calculateRecencyBoost(createdAt: Date, now: Date): number {
    const hoursSinceCreation =
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    const decayRate = 0.95;

    return Math.pow(decayRate, hoursSinceCreation);
}

export function calculatePopularityScore(post: Post, now: Date): number {
    const engagementScore = calculateEngagementScore(post);
    const recencyBoost = calculateRecencyBoost(post.createdAt, now);

    return engagementScore * recencyBoost;
}
```

### Permission Checks

```typescript
import { Role } from '~/generated/prisma/client';

export function canEditContent(
    userRole: Role,
    contentOwnerId: string,
    userId: string
): boolean {
    // Admins can edit anything
    if (userRole === Role.ADMIN) return true;

    // Editors can edit their own content
    if (userRole === Role.EDITOR && contentOwnerId === userId) return true;

    return false;
}

export function canDeleteUser(performerRole: Role, targetRole: Role): boolean {
    const roleHierarchy = { USER: 1, EDITOR: 2, ADMIN: 3 };

    // Can only delete users with lower role
    return roleHierarchy[performerRole] > roleHierarchy[targetRole];
}
```

## Pattern 3: Formatting Helpers

**Pure functions for formatting dates, currency, strings, and other display values.**

### Date Formatting

```typescript
// app/lib/utils/formatters.ts

export function formatDate(
    date: Date,
    format: 'short' | 'long' | 'relative'
): string {
    const now = new Date();

    if (format === 'relative') {
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return formatDate(date, 'short');
    }

    if (format === 'short') {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
```

### Currency Formatting

```typescript
export function formatCurrency(
    amount: number,
    currency: string = 'USD'
): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(amount);
}

export function formatCompactNumber(num: number): string {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
}
```

### String Formatting

```typescript
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
}

export function slugify(str: string): string {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function pluralize(
    count: number,
    singular: string,
    plural?: string
): string {
    const pluralForm = plural || `${singular}s`;
    return count === 1 ? singular : pluralForm;
}
```

### Name Formatting

```typescript
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function getFullName(firstName: string, lastName: string): string {
    return `${firstName} ${lastName}`.trim();
}
```

## Pattern 4: Type Guards & Predicates

**Pure functions for runtime type checking and boolean conditions.**

### Type Guards

```typescript
// app/lib/utils/guards.ts

export function isString(value: unknown): value is string {
    return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
}

export function isNonEmptyString(value: unknown): value is string {
    return isString(value) && value.trim().length > 0;
}

export function isValidEmail(value: unknown): value is string {
    if (!isString(value)) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
}

export function isArray<T>(value: unknown): value is T[] {
    return Array.isArray(value);
}

export function isNonEmptyArray<T>(value: unknown): value is T[] {
    return Array.isArray(value) && value.length > 0;
}
```

### Predicates

```typescript
import type { User } from '~/generated/prisma/client';
import { Role } from '~/generated/prisma/client';

export function isActiveUser(user: User): boolean {
    return user.isActive === true;
}

export function hasRole(user: User, role: Role): boolean {
    const roleHierarchy: Record<Role, number> = {
        USER: 1,
        EDITOR: 2,
        ADMIN: 3
    };

    return roleHierarchy[user.role] >= roleHierarchy[role];
}

export function isVerified(user: User): boolean {
    return user.emailVerified !== null;
}

export function isExpired(expiresAt: Date, now: Date = new Date()): boolean {
    return expiresAt.getTime() < now.getTime();
}
```

### Null/Undefined Checks

```typescript
export function isDefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

export function isNotNull<T>(value: T | null): value is T {
    return value !== null;
}

export function filterDefined<T>(items: (T | null | undefined)[]): T[] {
    return items.filter(isDefined);
}
```

## Extracting Pure Logic from Impure Operations

**Separate pure business logic from side effects (DB, API, I/O).**

### The Pattern

1. **Identify** the pure business logic within impure operations
2. **Extract** the pure logic into a separate function
3. **Test** the pure function independently
4. **Compose** pure and impure functions in loaders/actions

### Example: Model Layer Separation

#### Before (Mixed)

```typescript
// app/models/order.server.ts - MIXED APPROACH
import { prisma } from '~/db.server';

export async function createOrder(userId: string, items: CartItem[]) {
    // ❌ Business logic mixed with DB operation
    const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const tax = total * 0.08;
    const finalTotal = total + tax;

    return prisma.order.create({
        data: {
            userId,
            items: { create: items },
            subtotal: total,
            tax,
            total: finalTotal
        }
    });
}
```

#### After (Separated)

```typescript
// app/routes/checkout/helpers.ts - PURE FUNCTIONS
export interface CartItem {
    id: string;
    price: number;
    quantity: number;
}

export interface OrderCalculation {
    subtotal: number;
    tax: number;
    total: number;
}

//  PURE - Business logic extracted
export function calculateOrderTotal(
    items: CartItem[],
    taxRate: number
): OrderCalculation {
    const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return { subtotal, tax, total };
}

// app/models/order.server.ts - IMPURE DB OPERATIONS
import { calculateOrderTotal } from '~/routes/checkout/helpers';

export async function createOrder(
    userId: string,
    items: CartItem[],
    taxRate: number
) {
    //  PURE - Use pure calculation
    const { subtotal, tax, total } = calculateOrderTotal(items, taxRate);

    // IMPURE - DB operation
    return prisma.order.create({
        data: {
            userId,
            items: { create: items },
            subtotal,
            tax,
            total
        }
    });
}
```

### Example: Route Handler Separation

#### Before (Mixed)

```typescript
// app/routes/api/posts.ts
export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const sortBy = url.searchParams.get('sort') || 'popular';

    const posts = await prisma.post.findMany({ include: { author: true } });

    // L Business logic mixed with route handler
    const now = new Date();
    const sorted = posts.sort((a, b) => {
        if (sortBy === 'popular') {
            const scoreA = a.likes * 1 + a.comments * 3;
            const scoreB = b.likes * 1 + b.comments * 3;
            return scoreB - scoreA;
        }
        return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return data({ posts: sorted });
}
```

#### After (Separated)

```typescript
// app/routes/posts/helpers.ts - PURE FUNCTIONS
import type { Post } from '~/generated/prisma/client';

export function calculateEngagementScore(post: Post): number {
    return post.likes * 1 + post.comments * 3;
}

export function sortPostsByPopularity(posts: Post[]): Post[] {
    return [...posts].sort((a, b) => {
        const scoreA = calculateEngagementScore(a);
        const scoreB = calculateEngagementScore(b);
        return scoreB - scoreA;
    });
}

export function sortPostsByDate(posts: Post[]): Post[] {
    return [...posts].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
}

export function sortPosts(posts: Post[], sortBy: 'popular' | 'recent'): Post[] {
    return sortBy === 'popular'
        ? sortPostsByPopularity(posts)
        : sortPostsByDate(posts);
}

// app/routes/api/posts.ts - IMPURE ROUTE HANDLER
import { sortPosts } from './helpers';

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const sortBy = (url.searchParams.get('sort') || 'popular') as
        | 'popular'
        | 'recent';

    // IMPURE - DB operation
    const posts = await prisma.post.findMany({ include: { author: true } });

    //  PURE - Use pure sorting logic
    const sorted = sortPosts(posts, sortBy);

    return data({ posts: sorted });
}
```

## Testing Pure Functions

**Pure functions are trivial to test - no mocks, setup, or teardown required.**

### Simple Unit Tests

```typescript
// app/lib/utils/__tests__/formatters.test.ts
import { describe, test, expect } from 'vitest';
import { formatCurrency, truncate, slugify } from '../formatters';

describe('formatCurrency', () => {
    test('formats USD correctly', () => {
        expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    test('formats EUR correctly', () => {
        expect(formatCurrency(1234.56, 'EUR')).toBe('�1,234.56');
    });

    test('handles zero', () => {
        expect(formatCurrency(0)).toBe('$0.00');
    });
});

describe('truncate', () => {
    test('truncates long strings', () => {
        expect(truncate('Hello World', 8)).toBe('Hello...');
    });

    test('does not truncate short strings', () => {
        expect(truncate('Hello', 10)).toBe('Hello');
    });
});

describe('slugify', () => {
    test('converts to lowercase and replaces spaces', () => {
        expect(slugify('Hello World')).toBe('hello-world');
    });

    test('removes special characters', () => {
        expect(slugify('Hello, World!')).toBe('hello-world');
    });
});
```

### Testing Business Logic

```typescript
// app/lib/utils/__tests__/calculations.test.ts
import { describe, test, expect } from 'vitest';
import { calculatePrice, applyVolumeDiscount } from '../calculations';

describe('calculatePrice', () => {
    test('calculates price with tax and no discount', () => {
        const result = calculatePrice(100, 0.08, 0);
        expect(result).toEqual({
            subtotal: 100,
            tax: 8,
            discount: 0,
            total: 108
        });
    });

    test('calculates price with tax and discount', () => {
        const result = calculatePrice(100, 0.08, 10);
        expect(result).toEqual({
            subtotal: 100,
            tax: 7.2,
            discount: 10,
            total: 97.2
        });
    });
});

describe('applyVolumeDiscount', () => {
    test('no discount for quantities under 50', () => {
        expect(applyVolumeDiscount(30, 10)).toBe(10);
    });

    test('10% discount for quantities 50-99', () => {
        expect(applyVolumeDiscount(75, 10)).toBe(9);
    });

    test('20% discount for quantities 100+', () => {
        expect(applyVolumeDiscount(150, 10)).toBe(8);
    });
});
```

### Property-Based Testing

```typescript
import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import { sortUsersByName } from '../transformers';

describe('sortUsersByName', () => {
    test('maintains array length', () => {
        fc.assert(
            fc.property(fc.array(fc.record({ name: fc.string() })), (users) => {
                const sorted = sortUsersByName(users);
                expect(sorted).toHaveLength(users.length);
            })
        );
    });

    test('does not mutate input', () => {
        fc.assert(
            fc.property(fc.array(fc.record({ name: fc.string() })), (users) => {
                const original = [...users];
                sortUsersByName(users);
                expect(users).toEqual(original);
            })
        );
    });
});
```

## Best Practices

### 1. Default to Immutability

```typescript
//  GOOD - Returns new array
function addToList<T>(list: T[], item: T): T[] {
    return [...list, item];
}

// L BAD - Mutates input
function addToList<T>(list: T[], item: T): T[] {
    list.push(item);
    return list;
}
```

### 2. Explicit Dependencies

```typescript
//  GOOD - All dependencies are parameters
function calculateShipping(
    weight: number,
    distance: number,
    ratePerKm: number
): number {
    return weight * distance * ratePerKm;
}

// L BAD - Hidden dependency on external state
const RATE_PER_KM = 0.5;
function calculateShipping(weight: number, distance: number): number {
    return weight * distance * RATE_PER_KM;
}
```

### 3. Single Responsibility

```typescript
//  GOOD - Each function does one thing
function calculateTax(subtotal: number, taxRate: number): number {
    return subtotal * taxRate;
}

function calculateTotal(subtotal: number, tax: number): number {
    return subtotal + tax;
}

// L BAD - Does too many things
function processPurchase(
    items: Item[],
    taxRate: number
): {
    subtotal: number;
    tax: number;
    total: number;
    formattedTotal: string;
} {
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    const formattedTotal = `$${total.toFixed(2)}`;
    return { subtotal, tax, total, formattedTotal };
}
```

### 4. Avoid Temporal Coupling

```typescript
//  GOOD - No temporal coupling, order doesn't matter
const tax = calculateTax(subtotal, TAX_RATE);
const shipping = calculateShipping(weight, SHIPPING_RATE);
const total = subtotal + tax + shipping;

// L BAD - Order matters due to shared state
let runningTotal = 0;
function addTax(subtotal: number, taxRate: number): void {
    runningTotal = subtotal + subtotal * taxRate;
}
function addShipping(rate: number): void {
    runningTotal += rate;
}
```

### 5. Use Type Safety

```typescript
//  GOOD - Type-safe with clear inputs/outputs
export interface PriceCalculation {
    subtotal: number;
    tax: number;
    total: number;
}

export function calculatePrice(
    subtotal: number,
    taxRate: number
): PriceCalculation {
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    return { subtotal, tax, total };
}

// L BAD - Weak typing, unclear return type
export function calculatePrice(subtotal: any, taxRate: any): any {
    return {
        subtotal,
        tax: subtotal * taxRate,
        total: subtotal + subtotal * taxRate
    };
}
```

### 6. Document Assumptions

```typescript
/**
 * Calculates compound interest
 * @param principal - Initial amount (must be > 0)
 * @param rate - Annual interest rate as decimal (e.g., 0.05 for 5%)
 * @param years - Number of years (must be >= 0)
 * @param compoundsPerYear - How many times interest compounds per year (default: 12)
 * @returns Total amount after interest
 */
export function calculateCompoundInterest(
    principal: number,
    rate: number,
    years: number,
    compoundsPerYear: number = 12
): number {
    return (
        principal *
        Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * years)
    );
}
```

## Anti-Patterns to Avoid

### L Hidden Side Effects

```typescript
// L BAD - Looks pure but has side effects
function processUser(user: User): User {
    console.log('Processing user:', user.id); // Side effect: I/O
    return { ...user, processed: true };
}

// L BAD - Looks pure but mutates input
function sortItems(items: Item[]): Item[] {
    items.sort((a, b) => a.name.localeCompare(b.name)); // Side effect: mutation
    return items;
}

//  GOOD - Pure with no side effects
function sortItems(items: Item[]): Item[] {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
}
```

### L Non-Deterministic Functions

```typescript
// L BAD - Non-deterministic
function generateId(): string {
    return Math.random().toString(36);
}

function getCurrentUserId(): string | null {
    return localStorage.getItem('userId');
}

//  GOOD - Deterministic (pass random/storage as parameters)
function generateId(random: number): string {
    return random.toString(36);
}

function getUserId(storage: { userId: string | null }): string | null {
    return storage.userId;
}
```

### L Mixing Pure and Impure Code

```typescript
// L BAD - Mixes pure calculations with DB calls
async function getUserDiscount(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const baseDiscount = 0.1;
    return user.isPremium ? baseDiscount * 2 : baseDiscount;
}

//  GOOD - Separate pure and impure
function calculateDiscount(isPremium: boolean, baseDiscount: number): number {
    return isPremium ? baseDiscount * 2 : baseDiscount;
}

async function getUserDiscount(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return calculateDiscount(user.isPremium, 0.1);
}
```

### L Over-Engineering

```typescript
// L BAD - Unnecessary abstraction for simple operation
function add(a: number, b: number): number {
    return performArithmeticOperation(a, b, ArithmeticOperator.ADD);
}

//  GOOD - Keep it simple
function add(a: number, b: number): number {
    return a + b;
}
```

## When NOT to Use Pure Functions

Pure functions are not always appropriate:

### Database Operations

```typescript
// IMPURE (and that's okay) - DB operations are inherently impure
export async function getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
}
```

### Logging

```typescript
// IMPURE (and that's okay) - Logging is a side effect
export function logError(error: Error, context: string): void {
    console.error(`[${context}]`, error);
    // Could also send to error tracking service
}
```

### API Calls

```typescript
// IMPURE (and that's okay) - HTTP requests are side effects
export async function fetchUserData(userId: string): Promise<UserData> {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
}
```

### State Updates

```typescript
// IMPURE (and that's okay) - State updates in React are side effects
function useCounter() {
    const [count, setCount] = useState(0);

    function increment(): void {
        setCount((c) => c + 1);
    }

    return { count, increment };
}
```

**The key**: Separate pure business logic from necessary side effects, test the pure parts, and compose them together.

## Reference Implementations

### Existing Examples in Codebase

- **Form validations**: `app/lib/validations.ts` - Pure Zod schemas
- **Session helpers**: `app/lib/session.server.ts` - `hasRole()` is pure, `requireUser()` is impure
- **CVA utilities**: `app/cva.config.ts` - Pure className composition

### Recommended Implementations

Create these files as you build features:

- `app/lib/utils/formatters.ts` - Date, currency, string formatters
- `app/lib/utils/calculations.ts` - Business calculations
- `app/lib/utils/transformers.ts` - Data transformations
- `app/lib/utils/guards.ts` - Type guards and predicates
- `app/routes/[feature]/helpers.ts` - Feature-specific pure functions

## Related Documentation

- **Testing**: `.github/instructions/testing.instructions.md`
- **Model Layer**: See `AGENTS.md` - Model layer pattern
- **Type Safety**: `.github/instructions/zod.instructions.md`
- **Function Composition**: See CVA patterns in `.github/instructions/cva.instructions.md`
