import { env } from '~/lib/env.server';

// Public routes only: authenticated app surfaces don't belong in a sitemap.
const PUBLIC_PATHS = ['/', '/login', '/forgot-password'];

export async function loader() {
    const urls = PUBLIC_PATHS.map(
        (path) =>
            `    <url><loc>${env.BETTER_AUTH_BASE_URL}${path}</loc></url>`,
    ).join('\n');

    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

    return new Response(body, {
        headers: { 'Content-Type': 'application/xml' },
    });
}
