import type { LoaderFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { Paths } from '~/constants';
import { auth } from '~/lib/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
    await auth.api.signOut({
        headers: request.headers
    });

    return redirect(Paths.HOME);
}
