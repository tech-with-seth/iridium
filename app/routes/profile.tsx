import { authMiddleware } from '~/middleware/auth';
import type { Route } from './+types/dashboard';
import { userContext } from '~/context';

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
    return { user: context.get(userContext) };
}

export default function Profile({ loaderData }: Route.ComponentProps) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Hey {loaderData.user?.name || loaderData.user?.email}!
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    This is your profile page.
                </p>
            </div>
        </div>
    );
}
