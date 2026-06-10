import { redirect } from 'react-router';
import { auth } from '~/lib/auth.server';
import type { Route } from './+types/stop-impersonating';

/**
 * Ends an admin impersonation session and returns to the admin panel.
 * Better Auth validates that the current session is actually impersonated,
 * so no extra role check is needed here (the impersonated user is not an
 * admin, which is exactly why this lives outside the /admin action).
 */
export async function action({ request }: Route.ActionArgs) {
    try {
        const { headers } = await auth.api.stopImpersonating({
            headers: request.headers,
            returnHeaders: true,
        });

        headers.set('Location', '/admin');

        return new Response(null, { status: 302, headers });
    } catch {
        // Not an impersonated session: nothing to stop.
        return redirect('/');
    }
}
