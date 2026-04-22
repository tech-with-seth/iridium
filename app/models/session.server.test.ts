import { describe, expect, it, vi, beforeEach } from 'vitest';

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock('~/lib/auth.server', () => ({
    auth: { api: { getSession } },
}));

vi.mock('~/lib/logger.server', () => ({
    log: { exception: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import {
    hasRole,
    getUserFromSession,
    requireUser,
    requireRole,
    requireAdmin,
    requireEditor,
} from './session.server';

// Role enum values matching the Prisma-generated enum
const Role = { USER: 'USER', EDITOR: 'EDITOR', ADMIN: 'ADMIN' } as const;
type Role = (typeof Role)[keyof typeof Role];

beforeEach(() => {
    vi.clearAllMocks();
});

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

function makeRequest(): Request {
    return new Request('http://localhost/test');
}

describe('getUserFromSession', () => {
    it('returns the session user when present', async () => {
        getSession.mockResolvedValue({ user: { id: 'u1', role: 'USER' } });

        const user = await getUserFromSession(makeRequest());

        expect(user).toEqual({ id: 'u1', role: 'USER' });
    });

    it('returns null when there is no session', async () => {
        getSession.mockResolvedValue(null);

        const user = await getUserFromSession(makeRequest());

        expect(user).toBeNull();
    });

    it('returns null and logs when getSession throws', async () => {
        getSession.mockRejectedValue(new Error('boom'));

        const user = await getUserFromSession(makeRequest());

        expect(user).toBeNull();
    });
});

describe('requireUser', () => {
    it('returns the user when authenticated', async () => {
        getSession.mockResolvedValue({ user: { id: 'u1' } });

        const user = await requireUser(makeRequest());
        expect(user).toEqual({ id: 'u1' });
    });

    it('throws a 401 Response when unauthenticated', async () => {
        getSession.mockResolvedValue(null);

        await expect(requireUser(makeRequest())).rejects.toMatchObject({
            status: 401,
        });
    });
});

describe('requireRole', () => {
    it('returns the user when role is allowed', async () => {
        getSession.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN' } });

        const user = await requireRole(makeRequest(), [Role.ADMIN]);

        expect(user.id).toBe('u1');
        expect(user.role).toBe('ADMIN');
    });

    it('throws 403 when role is not allowed', async () => {
        getSession.mockResolvedValue({ user: { id: 'u1', role: 'USER' } });

        await expect(
            requireRole(makeRequest(), [Role.ADMIN]),
        ).rejects.toMatchObject({ status: 403 });
    });

    it('throws 401 when there is no session', async () => {
        getSession.mockResolvedValue(null);

        await expect(
            requireRole(makeRequest(), [Role.ADMIN]),
        ).rejects.toMatchObject({ status: 401 });
    });
});

describe('requireAdmin', () => {
    it('passes for ADMIN', async () => {
        getSession.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN' } });

        await expect(requireAdmin(makeRequest())).resolves.toBeDefined();
    });

    it('rejects EDITOR', async () => {
        getSession.mockResolvedValue({ user: { id: 'u1', role: 'EDITOR' } });

        await expect(requireAdmin(makeRequest())).rejects.toMatchObject({
            status: 403,
        });
    });

    it('rejects USER', async () => {
        getSession.mockResolvedValue({ user: { id: 'u1', role: 'USER' } });

        await expect(requireAdmin(makeRequest())).rejects.toMatchObject({
            status: 403,
        });
    });
});

describe('requireEditor', () => {
    it('passes for EDITOR', async () => {
        getSession.mockResolvedValue({ user: { id: 'u1', role: 'EDITOR' } });

        await expect(requireEditor(makeRequest())).resolves.toBeDefined();
    });

    it('passes for ADMIN', async () => {
        getSession.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN' } });

        await expect(requireEditor(makeRequest())).resolves.toBeDefined();
    });

    it('rejects USER', async () => {
        getSession.mockResolvedValue({ user: { id: 'u1', role: 'USER' } });

        await expect(requireEditor(makeRequest())).rejects.toMatchObject({
            status: 403,
        });
    });
});
