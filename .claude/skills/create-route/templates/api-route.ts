/**
 * Template: API Route (Resource Route - no UI)
 *
 * Replace placeholders:
 * - my-api → Your route file name (kebab-case)
 *
 * After creating:
 * 1. Add to app/routes.ts under API prefix
 * 2. Run npm run typecheck
 */

import type { Route } from './+types/my-api';
import { data } from 'react-router';
import { requireUser } from '~/lib/session.server';

/**
 * Handle GET requests
 */
export async function loader({ request, params }: Route.LoaderArgs) {
    const user = await requireUser(request);

    // Fetch data using model layer
    // const items = await getItems(user.id);

    return data({
        // items,
        message: 'GET request successful',
    });
}

/**
 * Handle POST, PUT, PATCH, DELETE requests
 */
export async function action({ request, params }: Route.ActionArgs) {
    const user = await requireUser(request);

    if (request.method === 'POST') {
        const body = await request.json();
        // const result = await createItem(body);
        return data({
            success: true,
            // result,
        });
    }

    if (request.method === 'PUT') {
        const body = await request.json();
        // const result = await updateItem(body);
        return data({
            success: true,
            // result,
        });
    }

    if (request.method === 'PATCH') {
        const body = await request.json();
        // const result = await patchItem(body);
        return data({
            success: true,
            // result,
        });
    }

    if (request.method === 'DELETE') {
        const body = await request.json();
        // await deleteItem(body.id);
        return data({
            success: true,
        });
    }

    return data(
        { error: 'Method not allowed' },
        { status: 405 }
    );
}
