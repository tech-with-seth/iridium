import { redirect } from 'react-router';
import type { Route } from '../routes/+types/chat';
import { userContext } from '~/context';
import { getUserFromSession } from '~/models/session.server';

export async function authMiddleware({
    request,
    context,
}: Parameters<Route.MiddlewareFunction>[0]) {
    const user = await getUserFromSession(request);

    if (!user) {
        throw redirect('/login');
    }

    context.set(userContext, user);
}
