import { authMiddleware } from '~/middleware/auth';
import type { Route } from './+types/dashboard';
import { Container } from '~/components/Container';

export async function loader() {}

export async function action() {}

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export default function DashboardRoute() {
    return (
        <>
            <Container className="px-4">{'Hello Dashboard!'}</Container>
        </>
    );
}
