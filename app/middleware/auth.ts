import { redirect, type MiddlewareFunction } from 'react-router';
import { userContext } from '~/context';
import { getUserFromSession } from '~/models/session.server';

/**
 * Redirects unauthenticated requests to /login. On success, stashes the
 * resolved user in `userContext` so loaders/actions can skip a redundant
 * session lookup via `context.get(userContext)`.
 */
export const authMiddleware: MiddlewareFunction<Response> = async ({
    request,
    context,
}) => {
    const user = await getUserFromSession(request);

    if (!user) {
        throw redirect('/login');
    }

    context.set(userContext, user);
};
