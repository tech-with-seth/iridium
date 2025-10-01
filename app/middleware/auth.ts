import { redirect } from 'react-router';

import { userContext } from '~/middleware/context';
import { getUser } from '~/lib/session.server';
import { Paths } from '~/constants';

export async function authMiddleware({
    request,
    context
}: {
    request: Request;
    context: any;
}) {
    const user = await getUser(request);

    if (!user?.id) {
        throw redirect(Paths.SIGN_IN);
    }

    context.set(userContext, user);
}
