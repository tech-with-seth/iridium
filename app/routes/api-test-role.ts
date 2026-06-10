import { z } from 'zod';
import { env } from '~/lib/env.server';
import { Role } from '~/generated/prisma/client';
import { updateUserRoleByEmail } from '~/models/user.server';
import type { Route } from './+types/api-test-role';

const schema = z.object({
    email: z.email(),
    role: z.enum([Role.USER, Role.EDITOR, Role.ADMIN]),
});

/**
 * Test-only: promote/demote a user by email so Playwright can mint admin
 * users without DB access. Returns 404 unless E2E_TEST_HOOKS is set, which
 * should only ever be true on the E2E test server. The caller must sign in
 * again afterwards: the session cookie caches the old role for up to 5 min.
 */
export async function action({ request }: Route.ActionArgs) {
    if (!env.E2E_TEST_HOOKS) {
        return Response.json({ error: 'Not found' }, { status: 404 });
    }

    const form = await request.formData();
    const parsed = schema.safeParse(Object.fromEntries(form));

    if (!parsed.success) {
        return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    await updateUserRoleByEmail(parsed.data.email, parsed.data.role);

    return Response.json({ ok: true });
}
