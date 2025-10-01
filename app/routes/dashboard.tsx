import { Container } from '~/components/Container';
import { useAuthenticatedContext } from '~/hooks/useAuthenticatedContext';

export default function Dashboard() {
    const { user } = useAuthenticatedContext();

    return (
        <Container className="pt-12">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome, {user?.name || user?.email}!
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                This is your dashboard
            </p>
        </Container>
    );
}
