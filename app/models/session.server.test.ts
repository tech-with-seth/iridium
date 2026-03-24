import { describe, expect, it, vi } from 'vitest';

// Mock auth.server to avoid env validation side effects
vi.mock('~/lib/auth.server', () => ({
    auth: { api: { getSession: vi.fn() } },
}));

import { hasRole } from './session.server';

// Role enum values matching the Prisma-generated enum
const Role = { USER: 'USER', EDITOR: 'EDITOR', ADMIN: 'ADMIN' } as const;
type Role = (typeof Role)[keyof typeof Role];

describe('hasRole', () => {
    it('USER has USER role', () => {
        expect(hasRole({ role: Role.USER }, Role.USER)).toBe(true);
    });

    it('USER does not have EDITOR role', () => {
        expect(hasRole({ role: Role.USER }, Role.EDITOR)).toBe(false);
    });

    it('USER does not have ADMIN role', () => {
        expect(hasRole({ role: Role.USER }, Role.ADMIN)).toBe(false);
    });

    it('EDITOR has EDITOR role', () => {
        expect(hasRole({ role: Role.EDITOR }, Role.EDITOR)).toBe(true);
    });

    it('EDITOR has USER role (hierarchy)', () => {
        expect(hasRole({ role: Role.EDITOR }, Role.USER)).toBe(true);
    });

    it('EDITOR does not have ADMIN role', () => {
        expect(hasRole({ role: Role.EDITOR }, Role.ADMIN)).toBe(false);
    });

    it('ADMIN has all roles', () => {
        expect(hasRole({ role: Role.ADMIN }, Role.USER)).toBe(true);
        expect(hasRole({ role: Role.ADMIN }, Role.EDITOR)).toBe(true);
        expect(hasRole({ role: Role.ADMIN }, Role.ADMIN)).toBe(true);
    });
});
