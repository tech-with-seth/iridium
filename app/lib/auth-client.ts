import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
    baseURL: import.meta.env.BETTER_AUTH_BASE_URL
});
