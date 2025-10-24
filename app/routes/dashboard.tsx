import { Container } from '~/components/Container';
import { Stats } from '~/components/Stats';
import { useAuthenticatedContext } from '~/hooks/useAuthenticatedContext';

export default function Dashboard() {
    const { user } = useAuthenticatedContext();

    return (
        <>
            <title>Dashboard - Iridium</title>
            <meta
                name="description"
                content="Overview of your Iridium account and activity."
            />
            <Container className="pt-12">
                <h1 className="text-2xl font-bold">
                    Welcome, {user?.name || user?.email}!
                </h1>
                <p className="mt-2">This is your dashboard</p>
                <Stats />
            </Container>
        </>
    );
}
