import type { Route } from './+types/login';
import { Turnstile } from '~/components/Turnstile';
import { requireAnonymous } from '~/models/session.server';

export async function loader({ request }: Route.LoaderArgs) {
    await requireAnonymous(request);
    return null;
}

export default function LoginRoute() {
    return (
        <>
            <title>Login | Iridium</title>
            <meta
                name="description"
                content="Login or sign up to access your account"
            />
            <Turnstile />
        </>
    );
}
