/**
 * Template: CRUD API Endpoint
 *
 * Replace placeholders:
 * - [feature] → Your feature name (kebab-case)
 * - [Feature] → Your feature name (PascalCase)
 * - Item → Your model name
 *
 * After creating:
 * 1. Add to app/routes.ts under API prefix
 * 2. Run npm run typecheck
 */

import type { Route } from './+types/[feature]';
import { data } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { requireUser } from '~/lib/session.server';
import { validateFormData } from '~/lib/form-validation.server';
import {
    create[Feature]Schema,
    update[Feature]Schema,
    type Create[Feature]Data,
    type Update[Feature]Data,
} from '~/lib/validations';
import {
    getItem,
    getItemsByUser,
    createItem,
    updateItem,
    deleteItem,
} from '~/models/[feature].server';

/**
 * GET - Read operation
 * Fetches item(s) for the authenticated user
 */
export async function loader({ request, params }: Route.LoaderArgs) {
    const user = await requireUser(request);

    // If params.id exists, fetch single item
    if (params.id) {
        const item = await getItem(params.id);

        if (!item) {
            throw new Response('Not Found', { status: 404 });
        }

        // Authorization check
        if (item.userId !== user.id) {
            throw new Response('Forbidden', { status: 403 });
        }

        return data({ item });
    }

    // Otherwise, fetch all items for user
    const items = await getItemsByUser(user.id);
    return data({ items });
}

/**
 * POST/PUT/DELETE - Create, Update, Delete operations
 */
export async function action({ request, params }: Route.ActionArgs) {
    const user = await requireUser(request);

    // CREATE
    if (request.method === 'POST') {
        const formData = await request.formData();
        const { data: validated, errors } = await validateFormData<Create[Feature]Data>(
            formData,
            zodResolver(create[Feature]Schema)
        );

        if (errors) {
            return data({ errors }, { status: 400 });
        }

        try {
            const item = await createItem(user.id, validated!);
            return data({ success: true, item }, { status: 201 });
        } catch (error) {
            return data({ error: 'Failed to create item' }, { status: 500 });
        }
    }

    // UPDATE
    if (request.method === 'PUT') {
        if (!params.id) {
            return data({ error: 'Item ID required' }, { status: 400 });
        }

        const formData = await request.formData();
        const { data: validated, errors } = await validateFormData<Update[Feature]Data>(
            formData,
            zodResolver(update[Feature]Schema)
        );

        if (errors) {
            return data({ errors }, { status: 400 });
        }

        // Authorization check
        const existing = await getItem(params.id);
        if (!existing) {
            throw new Response('Not Found', { status: 404 });
        }
        if (existing.userId !== user.id) {
            throw new Response('Forbidden', { status: 403 });
        }

        try {
            const item = await updateItem(params.id, validated!);
            return data({ success: true, item });
        } catch (error) {
            return data({ error: 'Failed to update item' }, { status: 500 });
        }
    }

    // DELETE
    if (request.method === 'DELETE') {
        if (!params.id) {
            return data({ error: 'Item ID required' }, { status: 400 });
        }

        // Authorization check
        const existing = await getItem(params.id);
        if (!existing) {
            throw new Response('Not Found', { status: 404 });
        }
        if (existing.userId !== user.id) {
            throw new Response('Forbidden', { status: 403 });
        }

        try {
            await deleteItem(params.id);
            return data({ success: true });
        } catch (error) {
            return data({ error: 'Failed to delete item' }, { status: 500 });
        }
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}
