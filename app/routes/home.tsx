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
                <div className="bg-[url(possessed-photography-M7V9rglHaFE-unsplash.jpg)] bg-cover rounded-xl h-[40rem] bg-bottom border-1 border-black mb-8"></div>
                <h1 className="text-5xl font-bold mb-8">TWS Foundations</h1>
            </Container>
        </>
    );
}
