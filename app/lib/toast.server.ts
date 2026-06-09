import { createCookieSessionStorage, redirect } from 'react-router';
import type { Toast } from '~/components/Toaster';
import { env } from '~/lib/env.server';

const toastStorage = createCookieSessionStorage({
    cookie: {
        name: '__toast',
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secrets: [env.BETTER_AUTH_SECRET],
        secure: env.NODE_ENV === 'production',
        // Flash cookie: only needs to survive the redirect.
        maxAge: 10,
    },
});

/** Redirect and flash a toast that root.tsx renders on the next page. */
export async function redirectWithToast(url: string, toast: Toast) {
    const session = await toastStorage.getSession();
    session.flash('toast', toast);

    return redirect(url, {
        headers: { 'Set-Cookie': await toastStorage.commitSession(session) },
    });
}

/**
 * Read (and consume) the flashed toast. The returned headers must be sent
 * with the response so the flash cookie is cleared.
 */
export async function getToast(request: Request) {
    const session = await toastStorage.getSession(
        request.headers.get('Cookie'),
    );
    const toast = (session.get('toast') as Toast | undefined) ?? null;
    const headers = new Headers();

    if (toast) {
        headers.append('Set-Cookie', await toastStorage.commitSession(session));
    }

    return { toast, headers };
}
