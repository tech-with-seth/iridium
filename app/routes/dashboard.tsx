import { authMiddleware } from '~/middleware/auth';
import type { Route } from './+types/dashboard';
import { Container } from '~/components/Container';
import { Card } from '~/components/Card';

export async function loader() {}

export async function action() {}

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export default function DashboardRoute() {
    return (
        <>
            <title>Dashboard | Iridium</title>
            <Container className="px-4">
                <h1 className="mb-8 text-4xl font-bold">Dashboard</h1>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card title="Card 1">
                        <p>This is the content of card 1.</p>
                    </Card>
                    <Card title="Card 2">
                        <p>This is the content of card 2.</p>
                    </Card>
                    <Card title="Card 3">
                        <p>This is the content of card 3.</p>
                    </Card>
                </div>
            </Container>
        </>
    );
}
