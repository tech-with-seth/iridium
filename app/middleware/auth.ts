import { redirect } from 'react-router';

import { userContext } from '~/context';
import { getUser } from '~/lib/session.server';

export async function authMiddleware({
    request,
    context
}: {
    request: Request;
    context: any;
}) {
    const user = await getUser(request);

    if (!user?.id) {
        throw redirect('/sign-in');
    }

    context.set(userContext, user);
}
