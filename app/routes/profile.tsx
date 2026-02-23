import invariant from 'tiny-invariant';
import { Container } from '~/components/Container';
import type { Route } from './+types/profile';
import { getUserFromSession } from '~/models/session.server';
import { authMiddleware } from '~/middleware/auth';

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    invariant(user, 'User could not be found in session');

    return {
        user,
    };
}

export default function ProfileRoute({ loaderData }: Route.ComponentProps) {
    const isAdmin = loaderData.user.role === 'ADMIN';

    return (
        <>
            <title>Profile</title>
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
                {isAdmin && (
                    <>
                        <hr className="my-4" />
                        <p>
                            With great power comes great responsibility. As an
                            admin, you have the ability to manage users, oversee
                            content, and ensure that our community remains a
                            safe and welcoming space for everyone. Please use
                            your powers wisely!
                        </p>
                    </>
                )}
            </Container>
        </>
    );
}
