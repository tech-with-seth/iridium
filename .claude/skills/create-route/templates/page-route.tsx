/**
 * Template: Page Route with Loader, Action, and Component
 *
 * Replace placeholders:
 * - my-page → Your route file name (kebab-case)
 * - MyPage → Your component name (PascalCase)
 * - Page Title → Your page title
 *
 * After creating:
 * 1. Add to app/routes.ts
 * 2. Run npm run typecheck
 */

import type { Route } from './+types/my-page';
import { data, redirect } from 'react-router';
import { Container } from '~/components/layout/Container';
import { requireUser } from '~/lib/session.server';

/**
 * Server-side data loading (handles GET requests)
 */
export async function loader({ request, params }: Route.LoaderArgs) {
    // Authentication (if needed)
    const user = await requireUser(request);

    // Fetch data using model layer
    // const items = await getItems(user.id);

    return {
        user,
        // items,
    };
}

/**
 * Form handling (handles POST, PUT, DELETE requests)
 */
export async function action({ request, params }: Route.ActionArgs) {
    const user = await requireUser(request);
    const formData = await request.formData();

    if (request.method === 'POST') {
        // Handle create
        // const result = await createItem(formData);
        return redirect('/success');
    }

    if (request.method === 'PUT') {
        // Handle update
        // await updateItem(formData);
        return data({ success: true });
    }

    if (request.method === 'DELETE') {
        // Handle delete
        // await deleteItem(formData.get('id') as string);
        return data({ success: true });
    }

    return null;
}

/**
 * Page component - access data via loaderData prop
 */
export default function MyPage({ loaderData }: Route.ComponentProps) {
    const { user } = loaderData;

    return (
        <>
            {/* React 19 meta tags */}
            <title>Page Title | Iridium</title>
            <meta name="description" content="Page description goes here" />

            <Container>
                <h1 className="text-2xl font-bold mb-4">Page Title</h1>
                <p>Welcome, {user.email}</p>

                {/* Page content */}
            </Container>
        </>
    );
}
