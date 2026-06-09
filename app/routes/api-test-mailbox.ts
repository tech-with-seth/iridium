import { testMailbox } from '~/lib/email.server';
import { env } from '~/lib/env.server';
import type { Route } from './+types/api-test-mailbox';

/**
 * Test-only: lets Playwright read the most recent email "sent" to a given
 * recipient (e.g. to extract a password-reset link). Returns 404 unless
 * E2E_TEST_HOOKS is set, which should only ever be true on the E2E server.
 */
export async function loader({ request }: Route.LoaderArgs) {
    if (!env.E2E_TEST_HOOKS) {
        return Response.json({ error: 'Not found' }, { status: 404 });
    }

    const to = new URL(request.url).searchParams.get('to');

    if (!to) {
        return Response.json(
            { error: 'Missing "to" query param' },
            { status: 400 },
        );
    }

    return Response.json({ email: testMailbox.get(to) ?? null });
}
