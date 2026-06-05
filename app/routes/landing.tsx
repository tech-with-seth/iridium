import { Container } from '~/components/Container';

export default function LandingPage() {
    return (
        <>
            <title>Home | Iridium</title>
            <meta
                name="description"
                content="Iridium is a full-stack React starter kit with authentication, AI chat, agent tools, and production-ready patterns."
            />
            <Container className="p-4">
                <h1 className="mb-4 text-4xl font-bold">Iridium</h1>
                <p className="mb-8 text-lg">
                    A full-stack starter kit built for shipping AI-powered
                    products. Clone the repo, configure your environment, and
                    have a working application with authentication, AI chat, and
                    agent tools in minutes.
                </p>
            </Container>
        </>
    );
}
