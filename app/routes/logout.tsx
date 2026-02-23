import { redirect } from 'react-router';
import type { Route } from './+types/logout';
import { auth } from '~/lib/auth.server';

export async function loader({ request }: Route.LoaderArgs) {
    return redirect('/login');
}

export async function action({ request }: Route.ActionArgs) {
    const form = await request.formData();

    if (request.method === 'POST') {
        const intent = form.get('intent');

        if (intent === 'logout') {
            const response = await auth.api.signOut({
                headers: request.headers,
                asResponse: true,
            });

            return redirect('/login', {
                headers: response.headers,
            });
        }
    }

    return null;
}
