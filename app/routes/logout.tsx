import { redirect } from 'react-router';
import type { Route } from './+types/logout';
import { auth } from '~/lib/auth.server';

export async function loader() {
    return redirect('/login');
}

export async function action({ request }: Route.ActionArgs) {
    if (request.method !== 'POST') {
        throw new Response('Method not allowed', { status: 405 });
    }

    const response = await auth.api.signOut({
        headers: request.headers,
        asResponse: true,
    });

    return redirect('/login', {
        headers: response.headers,
    });
}
