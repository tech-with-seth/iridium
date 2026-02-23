import { redirect } from 'react-router';
import { userContext } from '~/context';
import { getUserFromSession } from '~/models/session.server';

// TODO: Add proper types
export async function authMiddleware({ request, context }: any) {
    const user = await getUserFromSession(request);

    if (!user) {
        throw redirect('/login');
    }

    context.set(userContext, user);
}
