import { Container } from '~/components/Container';
import { Card } from '~/components/Card';
import { Button } from '~/components/Button';

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
                        <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
                            About TWS Foundations
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                            A modern full-stack SaaS boilerplate built with the
                            latest technologies to help developers ship faster
                            with authentication, billing, and AI integration.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card title="⚡ Modern Stack" variant="border">
                            <p className="text-gray-600 dark:text-gray-400">
                                Built with React Router 7, TailwindCSS v4, and
                                TypeScript for a fast, type-safe development
                                experience.
                            </p>
                        </Card>

                        <Card title="🔐 Authentication" variant="border">
                            <p className="text-gray-600 dark:text-gray-400">
                                Secure authentication powered by BetterAuth with
                                PostgreSQL storage and 7-day session management.
                            </p>
                        </Card>

                        <Card title="💳 Billing Ready" variant="border">
                            <p className="text-gray-600 dark:text-gray-400">
                                Integrated billing system using Polar.sh for
                                subscriptions and credit-based usage tracking.
                            </p>
                        </Card>

                        <Card title="🤖 AI Integration" variant="border">
                            <p className="text-gray-600 dark:text-gray-400">
                                OpenAI GPT-4 integration with streaming
                                responses using Vercel AI SDK for modern AI
                                features.
                            </p>
                        </Card>

                        <Card title="📊 Database & ORM" variant="border">
                            <p className="text-gray-600 dark:text-gray-400">
                                Type-safe database operations with Prisma ORM
                                and PostgreSQL for reliable data management.
                            </p>
                        </Card>

                        <Card title="⚡ Performance" variant="border">
                            <p className="text-gray-600 dark:text-gray-400">
                                File-based caching with TTL support, singleton
                                patterns, and optimized build processes.
                            </p>
                        </Card>
                    </div>

                    {/* Architecture Section */}
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
                            Architecture Highlights
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card title="Config-Based Routing" variant="border">
                                <div className="space-y-3">
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Uses React Router 7's modern
                                        config-based routing system instead of
                                        file-based routing for better control
                                        and type safety.
                                    </p>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                        <code className="text-sm text-gray-800 dark:text-gray-200">
                                            Routes defined in app/routes.ts
                                        </code>
                                    </div>
                                </div>
                            </Card>

                            <Card title="Middleware Patterns" variant="border">
                                <div className="space-y-3">
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Authentication and logging middleware
                                        protect routes automatically without
                                        boilerplate in each component.
                                    </p>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                        <code className="text-sm text-gray-800 dark:text-gray-200">
                                            Layout-based protection
                                        </code>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center space-y-6 pt-8">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
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
