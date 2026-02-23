import { Container } from '~/components/Container';

export default function Home() {
    return (
        <>
            <title>Home</title>
            <meta name="description" content="Welcome to the home page!" />
            <Container className="p-4">
                <h1 className="text-4xl font-bold mb-8">Welcome</h1>
                <p>
                    Good bean juice make me go fast
                </p>
            </Container>
        </>
    );
}
