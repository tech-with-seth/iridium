import { Outlet } from 'react-router';
import type { Route } from './+types/authenticated';

import { userContext } from '~/middleware/context';
import { authMiddleware } from '~/middleware/auth';
import { loggingMiddleware } from '~/middleware/logging';

export const middleware: Route.MiddlewareFunction[] = [
    authMiddleware,
    loggingMiddleware,
];

export async function loader({ context }: Route.LoaderArgs) {
    return { user: context.get(userContext) };
}

export default function AuthenticatedRoute({
    loaderData,
}: Route.ComponentProps) {
    return (
        <>
            <Outlet context={{ user: loaderData.user }} />
        </>
    );
}
