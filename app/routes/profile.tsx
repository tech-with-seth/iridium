import { Container } from '~/components/Container';
import type { Route } from './+types/profile';
import { authMiddleware } from '~/middleware/auth';
import { requireUserFromContext } from '~/context';

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
    const user = requireUserFromContext(context);
    const role = (user as { role?: string | null }).role ?? 'USER';

    return {
        user: { email: user.email, role },
    };
}

export default function ProfileRoute({ loaderData }: Route.ComponentProps) {
    const isAdmin = loaderData.user.role === 'ADMIN';

    return (
        <>
            <title>Profile | Iridium</title>
            <meta name="description" content="Welcome to your profile page!" />
            <Container className="p-4">
                <h1 className="mb-8 text-4xl font-bold">Profile</h1>
                <ul className="mb-8 space-y-4">
                    <li>
                        <div className="badge badge-neutral">
                            {isAdmin && '⭐️'} {loaderData.user.role}
                        </div>
                    </li>
                    <li>
                        <strong>Email:</strong> {loaderData.user.email}
                    </li>
                </ul>
            </Container>
        </>
    );
}
