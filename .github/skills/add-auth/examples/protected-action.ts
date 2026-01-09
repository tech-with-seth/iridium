/**
 * Example: Protected API Action with Ownership Check
 */

import type { Route } from './+types/items';
import { data } from 'react-router';
import { requireUser } from '~/lib/session.server';
import { getItem, updateItem, deleteItem } from '~/models/item.server';

export async function action({ request, params }: Route.ActionArgs) {
    // 1. Require authentication
    const user = await requireUser(request);

    // 2. Get the resource
    const item = await getItem(params.id);
    if (!item) {
        throw new Response('Not Found', { status: 404 });
    }

    // 3. Check ownership (authorization)
    if (item.userId !== user.id) {
        throw new Response('Forbidden', { status: 403 });
    }

    // 4. Handle the action
    if (request.method === 'PUT') {
        const formData = await request.formData();
        const updated = await updateItem(params.id, {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
        });
        return data({ success: true, item: updated });
    }

    if (request.method === 'DELETE') {
        await deleteItem(params.id);
        return data({ success: true });
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}
