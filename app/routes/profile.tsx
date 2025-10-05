import { Container } from '~/components/Container';
import { useAuthenticatedContext } from '~/hooks/useAuthenticatedContext';

export default function Profile() {
    const { user } = useAuthenticatedContext();

    return (
        <>
            <title>Profile - TWS Foundations</title>
            <meta
                name="description"
                content="Manage your personal details and account preferences."
            />
            <Container className="pt-12">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Hey {user?.name || user?.email}!
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    This is your profile page.
                </p>
            </Container>
        </>
    );
}
