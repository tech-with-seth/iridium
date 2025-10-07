import { Button } from '~/components/Button';
import { Card } from '~/components/Card';
import { Container } from '~/components/Container';

export default function About() {
    return (
        <>
            <title>About - TWS Foundations</title>
            <meta
                name="description"
                content="Learn about TWS Foundations - A modern full-stack SaaS boilerplate with React Router 7, BetterAuth, and AI integration."
            />
            <Container className="pt-12 pb-20">
                <div className="max-w-4xl mx-auto space-y-12">
                    {/* Hero Section */}
                    <div className="text-center space-y-6">
                        <h1 className="text-5xl font-bold">
                            About TWS Foundations
                        </h1>
                        <p className="text-xl max-w-3xl mx-auto">
                            A modern full-stack SaaS boilerplate built with the
                            latest technologies to help developers ship faster
                            with authentication, billing, and AI integration.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card title="⚡ Modern Stack" variant="border">
                            <p className="">
                                Built with React Router 7, TailwindCSS v4, and
                                TypeScript for a fast, type-safe development
                                experience.
                            </p>
                        </Card>

                        <Card title="🔐 Authentication" variant="border">
                            <p className="">
                                Secure authentication powered by BetterAuth with
                                PostgreSQL storage and 7-day session management.
                            </p>
                        </Card>

                        <Card title="💳 Billing Ready" variant="border">
                            <p className="">
                                Integrated billing system using Polar.sh for
                                subscriptions and credit-based usage tracking.
                            </p>
                        </Card>

                        <Card title="🤖 AI Integration" variant="border">
                            <p className="">
                                OpenAI GPT-4 integration with streaming
                                responses using Vercel AI SDK for modern AI
                                features.
                            </p>
                        </Card>

                        <Card title="📊 Database & ORM" variant="border">
                            <p className="">
                                Type-safe database operations with Prisma ORM
                                and PostgreSQL for reliable data management.
                            </p>
                        </Card>

                        <Card title="⚡ Performance" variant="border">
                            <p className="">
                                File-based caching with TTL support, singleton
                                patterns, and optimized build processes.
                            </p>
                        </Card>
                    </div>

                    {/* Architecture Section */}
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-center">
                            Architecture Highlights
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card title="Config-Based Routing" variant="border">
                                <div className="space-y-3">
                                    <p className="">
                                        Uses React Router 7's modern
                                        config-based routing system instead of
                                        file-based routing for better control
                                        and type safety.
                                    </p>
                                </div>
                            </Card>

                            <Card title="Middleware Patterns" variant="border">
                                <div className="space-y-3">
                                    <p className="">
                                        Authentication and logging middleware
                                        protect routes automatically without
                                        boilerplate in each component.
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center space-y-6 pt-8">
                        <h2 className="text-2xl font-semibold">
                            Ready to Get Started?
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" status="primary">
                                <a
                                    href="https://github.com/sethdavis512/tws-foundation"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View on GitHub
                                </a>
                            </Button>
                            <Button size="lg" variant="outline">
                                <a href="/sign-up">Try Demo</a>
                            </Button>
                        </div>
                    </div>
                </div>
            </Container>
        </>
    );
}
