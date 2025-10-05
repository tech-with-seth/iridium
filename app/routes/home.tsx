import { Container } from '~/components/Container';

export default function Home() {
    return (
        <>
            <title>TWS Foundations</title>
            <meta
                name="description"
                content="Modern full-stack boilerplate with authentication, billing, and AI"
            />
            <Container className="pt-12">
                <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-8">
                    TWS Foundations
                </h1>
            </Container>
        </>
    );
}
