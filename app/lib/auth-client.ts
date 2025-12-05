import { adminClient, organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { polarClient } from '@polar-sh/better-auth';

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_BETTER_AUTH_BASE_URL,
    plugins: [adminClient(), organizationClient(), polarClient()],
});
