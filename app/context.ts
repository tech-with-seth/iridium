import { createContext } from 'react-router';
import type { auth } from '~/lib/auth.server';

/** The user shape returned by Better Auth's `getSession().user`. */
export type SessionUser = NonNullable<
    Awaited<ReturnType<typeof auth.api.getSession>>
>['user'];

export const userContext = createContext<SessionUser | null>(null);
