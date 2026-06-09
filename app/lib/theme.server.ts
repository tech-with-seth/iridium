import { createCookie } from 'react-router';
import { themeSchema, type Theme } from '~/lib/theme';

const themeCookie = createCookie('iridium_theme', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
});

export async function getTheme(request: Request): Promise<Theme> {
    const parsed = themeSchema.safeParse(
        await themeCookie.parse(request.headers.get('Cookie')),
    );

    return parsed.success ? parsed.data : 'system';
}

export function serializeTheme(theme: Theme) {
    return themeCookie.serialize(theme);
}
