import { Turnstile } from '~/components/Turnstile';

export default function LoginRoute() {
    return (
        <>
            <title>Login</title>
            <meta
                name="description"
                content="Login or sign up to access your account"
            />
            <Turnstile />
        </>
    );
}
