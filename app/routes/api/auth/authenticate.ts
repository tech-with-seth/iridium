import { data, redirect } from 'react-router';
import type { Route } from './+types/authenticate';
import { auth } from '~/lib/auth.server';
import { Paths } from '~/constants';

export async function action({ request }: Route.ActionArgs) {
    // Handle Sign Out
    if (request.method === 'DELETE') {
        try {
            await auth.api.signOut({
                headers: request.headers
            });

            return redirect(Paths.HOME);
        } catch (error) {
            return data(
                {
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Sign out failed. Please try again.'
                },
                { status: 500 }
            );
        }
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}
