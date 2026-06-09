import { env } from '~/lib/env.server';

export async function loader() {
    const body = [
        'User-agent: *',
        'Allow: /',
        'Disallow: /api/',
        '',
        `Sitemap: ${env.BETTER_AUTH_BASE_URL}/sitemap.xml`,
        '',
    ].join('\n');

    return new Response(body, {
        headers: { 'Content-Type': 'text/plain' },
    });
}
