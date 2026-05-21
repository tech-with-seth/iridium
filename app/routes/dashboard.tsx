import { authMiddleware } from '~/middleware/auth';
import type { Route } from './+types/dashboard';

export async function loader() {}

export async function action() {}

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export default function DashboardRoute() {
    return <>{'Hello Dashboard!'}</>;
}
