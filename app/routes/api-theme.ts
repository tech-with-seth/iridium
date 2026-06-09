import { data } from 'react-router';
import { serializeTheme } from '~/lib/theme.server';
import { themeSchema } from '~/lib/theme';
import type { Route } from './+types/api-theme';

export async function action({ request }: Route.ActionArgs) {
    if (request.method !== 'POST') {
        return data({ error: 'Method not allowed' }, { status: 405 });
    }

    const form = await request.formData();
    const parsed = themeSchema.safeParse(form.get('theme'));

    if (!parsed.success) {
        return data({ error: 'Invalid theme' }, { status: 400 });
    }

    return data(
        { ok: true },
        { headers: { 'Set-Cookie': await serializeTheme(parsed.data) } },
    );
}
