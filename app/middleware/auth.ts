import { redirect } from 'react-router';

import { userContext } from '~/middleware/context';
import { getUserFromSession } from '~/lib/session.server';
import { Paths } from '~/constants';

export async function authMiddleware({
    request,
    context,
}: {
    request: Request;
    context: any;
}) {
    const user = await getUserFromSession(request);

    if (!user?.id) {
        throw redirect(Paths.HOME);
    }

    context.set(userContext, user);
}
