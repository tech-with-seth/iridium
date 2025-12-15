import { Alert } from '~/components/feedback/Alert';
import {
    ArrowRightIcon,
    OctagonXIcon,
    Rocket,
    Layout,
    MessageSquare,
    Shield,
    Sparkles,
    FileCheck,
    Package,
    BarChart,
    Mail,
    Activity,
    Flag,
    Brain,
    Code,
    CheckCircle,
    DollarSign,
    User,
    Users,
    ShoppingBag,
    Heart,
    Terminal,
    Layers,
    Lock,
    Bot,
    Briefcase,
    Plug,
    Database,
    GraduationCap,
} from 'lucide-react';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import {
    Children,
    useId,
    useMemo,
    type PropsWithChildren,
    type ReactNode,
} from 'react';
import type { ProductPriceFixed } from '@polar-sh/sdk/models/components/productpricefixed.js';

import { Container } from '~/components/layout/Container';
import { cx } from '~/cva.config';
import { useRootData } from '~/hooks/useRootData';
import { isActive } from '~/lib/flags';
import { formatToCurrency } from '~/lib/formatters';
import { BetterAuthLogo } from '~/components/logos/BetterAuthLogo';
import { DaisyUILogo } from '~/components/logos/DaisyUILogo';
import { GitHubLogo } from '~/components/logos/GitHubLogo';
import { MCPLogo } from '~/components/logos/MCPLogo';
import { PolarLogo } from '~/components/logos/PolarLogo';
import { PostgresLogo } from '~/components/logos/PostgresLogo';
import { PrismaLogo } from '~/components/logos/PrismaLogo';
import { RailwayLogo } from '~/components/logos/RailwayLogo';
import { ReactLogo } from '~/components/logos/ReactLogo';
import { ReactRouterLogo } from '~/components/logos/ReactRouterLogo';
import { TailwindLogo } from '~/components/logos/TailwindLogo';
import { TypescriptLogo } from '~/components/logos/TypescriptLogo';
import { Tooltip } from '~/components/feedback/Tooltip';

function ContentBlock({
    heading,
    children,
    icon: Icon,
}: {
    heading: string;
    children: ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
}) {
    return (
        <div className="mb-4">
            <div className="flex items-start gap-3 mb-4">
                {Icon && <Icon className="w-6 h-6 text-primary mt-0.5" />}
                <h3 className="text-xl font-semibold text-base-content">
                    {heading}
                </h3>
            </div>
            <p>{children}</p>
        </div>
    );
}

function ContentSection({
    children,
    heading,
}: PropsWithChildren<{ heading: string }>) {
    return (
        <Container className="px-4">
            <div className="grid grid-cols-12 gap-4 rounded-box overflow-hidden mb-8 bg-base-100 p-8">
                <div className="col-span-12">
                    <h2 className="text-3xl font-semibold text-base-content">
                        {heading}
                    </h2>
                </div>
                {Children.map(children, (child) => {
                    return (
                        <div
                            key={useId()}
                            className="col-span-12 md:col-span-6 flex flex-col justify-center"
                        >
                            {child}
                        </div>
                    );
                })}
            </div>
        </Container>
    );
}

export default function LandingPage() {
    const data = useRootData();

    const alertExperimentActive = useMemo(
        () => isActive(data?.allFlags, 'alert-experiment'),
        [data?.allFlags],
    );

    const homePageHeroActive = useMemo(
        () => isActive(data?.allFlags, 'home_page_hero_image'),
        [data?.allFlags],
    );

    const homePageIntroCopyExperimentActive = useMemo(
        () => isActive(data?.allFlags, 'home_page_intro_copy'),
        [data?.allFlags],
    );

    const productPrice = useMemo(() => {
        return formatToCurrency(
            'en-US',
            'USD',
            2,
            (data?.product.prices.at(0) as ProductPriceFixed).priceAmount,
        );
    }, [data?.product]);

    const introCopyControl = `Your shortcut to a production-ready SaaS. Iridium is a production-ready boilerplate packed with everything you need: secure authentication, subscription billing, a powerful AI toolkit, and a stunning component library. Stop rebuilding boilerplate and start shipping features your users will love. It's the fastest way to go from idea to revenue.`;
    const introCopyVariant = `Build on a foundation you can trust. Iridium is more than a starter kit—it's a curated collection of modern best practices. With config-based routing in React Router 7, end-to-end type-safe validation with Zod, and a CVA-driven component system, you can build with confidence and scale without compromise. Stop fighting with your tools and start building great software.`;

    return (
        <>
            <title>Home | Iridium</title>
            <meta
                name="description"
                content="Modern full-stack boilerplate with authentication, billing, and AI"
            />
            {alertExperimentActive && (
                <div>
                    <Container className="px-4">
                        <Alert status="warning" className="mb-4">
                            <p>
                                This is an experimental variant of this alert
                                message. PostHog feature flags let us test
                                different UI variations with real users to find
                                what works best!
                            </p>
                        </Alert>
                    </Container>
                </div>
            )}
            <Container className="px-4">
                <div className="grid grid-cols-12 gap-0 lg:gap-4 rounded-box overflow-hidden mb-8 bg-base-100">
                    <div className="col-span-12 lg:col-span-6 p-4 md:p-8">
                        <div
                            className={cx(
                                `rounded-box h-120`,
                                homePageHeroActive &&
                                    `bg-[url(https://res.cloudinary.com/setholito/image/upload/v1762886753/iridium/iridium-2.png)] bg-position-[center_top]`,
                                !homePageHeroActive &&
                                    `bg-[url(https://res.cloudinary.com/setholito/image/upload/v1762886753/iridium/iridium-1.png)]`,
                            )}
                        />
                    </div>
                    <div className="col-span-12 lg:col-span-6 flex flex-col justify-center p-8">
                        <div>
                            <h1 className="text-5xl font-bold mb-8 text-base-content">
                                Welcome to Iridium
                            </h1>
                            <p className="text-lg mb-12">
                                {homePageIntroCopyExperimentActive
                                    ? introCopyVariant
                                    : introCopyControl}
                            </p>
                            <Link
                                to={`/checkout?products=${data?.product.id}${data?.user?.email ? `&customerEmail=${data.user.email}` : ''}`}
                                className="btn btn-secondary btn-lg"
                            >
                                Get access to the repo for {productPrice}
                                <ArrowRightIcon />
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
            <Container className="px-4">
                <div className="grid grid-cols-3 lg:grid-cols-12 gap-4 rounded-box overflow-hidden mb-8 bg-base-100 p-8 place-items-center">
                    <Tooltip content="TypeScript">
                        <TypescriptLogo className="w-12 md:w-16 fill-base-content" />
                    </Tooltip>
                    <Tooltip content="React">
                        <ReactLogo className="w-12 md:w-16 fill-base-content" />
                    </Tooltip>
                    <Tooltip content="React Router">
                        <ReactRouterLogo className="w-12 md:w-16 fill-base-content" />
                    </Tooltip>
                    <Tooltip content="Tailwind CSS">
                        <TailwindLogo className="w-12 md:w-16 fill-base-content" />
                    </Tooltip>
                    <Tooltip content="DaisyUI">
                        <DaisyUILogo className="w-12 md:w-16 fill-base-content" />
                    </Tooltip>
                    <Tooltip content="BetterAuth">
                        <BetterAuthLogo className="w-12 md:w-16 fill-base-content" />
                    </Tooltip>
                    <Tooltip content="Polar">
                        <PolarLogo className="w-12 md:w-16 fill-base-content" />
                    </Tooltip>
                    <Tooltip content="Prisma">
                        <PrismaLogo className="w-12 md:w-16 fill-base-content" />
                    </Tooltip>
                    <Tooltip content="Postgres">
                        <PostgresLogo className="w-12 md:w-16 fill-base-content" />
                    </Tooltip>
                    <Tooltip content="GitHub">
                        <GitHubLogo className="w-12 md:w-16 fill-base-content" />
                    </Tooltip>
                    <Tooltip content="Railway">
                        <RailwayLogo className="w-12 md:w-16 fill-base-content" />
                    </Tooltip>
                    <Tooltip content="MCP">
                        <MCPLogo className="w-12 md:w-16 fill-base-content" />
                    </Tooltip>
                </div>
            </Container>
            <ContentSection heading="What is Iridium?">
                <ContentBlock
                    heading="Production-Ready React Router 7 Foundation"
                    icon={Layout}
                >
                    A carefully architected boilerplate built on React Router 7
                    with TypeScript. Config-based routing, end-to-end type
                    safety, and proven patterns used in real production
                    applications.
                </ContentBlock>
                <ContentBlock heading="Ship Fast, Build Better" icon={Rocket}>
                    Authentication, database, AI chat, analytics, email, and
                    deployment—all configured and ready. Every integration
                    documented, every pattern explained. Built for creators who
                    want to focus on their unique product, not infrastructure.
                </ContentBlock>
            </ContentSection>
            <Container className="px-4">
                <div className="grid grid-cols-12 gap-4 rounded-box overflow-hidden mb-8 bg-base-100 p-8">
                    <div className="col-span-12">
                        <h2 className="text-3xl font-semibold mb-4 text-base-content">
                            See It In Action
                        </h2>
                    </div>
                    <div className="col-span-12 lg:col-span-6">
                        <ContentBlock
                            heading="Production-Ready Dashboard"
                            icon={Layout}
                        >
                            Iridium includes a fully functional dashboard with
                            real metrics, thread management, and a working AI
                            chat interface. Every button click, every message
                            sent, every thread created triggers PostHog events.
                            See exactly how to instrument your features by
                            reading production code that actually works.
                        </ContentBlock>
                        <ContentBlock
                            heading="AI Chat with Tool Calling"
                            icon={MessageSquare}
                        >
                            Built with Vercel AI SDK and OpenAI, the chat
                            interface demonstrates streaming responses,
                            multi-turn conversations, and tool calling patterns.
                            Messages persist to your database, threads organize
                            conversations, and the @posthog/ai wrapper tracks
                            token usage and costs automatically. Copy the
                            implementation, adapt it to your product, and ship
                            AI features in hours instead of weeks.
                        </ContentBlock>
                        <ContentBlock
                            heading="End-to-End Type Safety"
                            icon={Shield}
                        >
                            From database schema to API response to UI
                            component, every piece is type-safe. Prisma
                            generates types from your schema, Zod validates
                            runtime data, React Router 7 types your routes, and
                            CVA ensures type-safe component variants. Catch
                            errors at build time, not in production. Refactor
                            with confidence knowing TypeScript has your back
                            across the entire stack.
                        </ContentBlock>
                    </div>
                    <div className="col-span-12 lg:col-span-6">
                        <div className="rounded-box overflow-hidden bg-base-300 shadow-lg">
                            <img
                                src="https://res.cloudinary.com/setholito/image/upload/v1765406867/iridium/iridium-admin-dashboard.png"
                                alt="Iridium Dashboard Preview"
                            />
                        </div>
                    </div>
                </div>
            </Container>
            <ContentSection heading="Core Features">
                <ContentBlock heading="Authentication & Security" icon={Lock}>
                    BetterAuth with email/password and social login. Session
                    management, role-based access control, and protected route
                    patterns. PostgreSQL with Prisma for robust data management.
                </ContentBlock>
                <ContentBlock heading="AI-Powered" icon={Sparkles}>
                    OpenAI integration with streaming chat using Vercel AI SDK.
                    Message persistence, tool calling, and automatic LLM
                    analytics tracking (tokens, costs, latency) via PostHog.
                </ContentBlock>
                <ContentBlock heading="Forms & Validation" icon={FileCheck}>
                    Hybrid client/server validation with Zod and React Hook
                    Form. Type-safe schemas, instant feedback, and comprehensive
                    error handling.
                </ContentBlock>
                <ContentBlock heading="UI Components" icon={Package}>
                    DaisyUI 5 with CVA-powered variants for type-safe styling.
                    Dark mode, responsive design, and accessible components
                    throughout.
                </ContentBlock>
                <ContentBlock heading="Analytics & Testing" icon={BarChart}>
                    PostHog integration for user analytics, session replay, A/B
                    testing, and feature flags. Automatic event tracking and
                    exception capture. The page you're reading uses feature
                    flags right now.
                </ContentBlock>
                <ContentBlock heading="Email & Notifications" icon={Mail}>
                    Resend integration with React Email templates. Pre-built
                    flows for welcome emails, password resets, and account
                    notifications.
                </ContentBlock>
            </ContentSection>
            <ContentSection heading="Perfect For">
                <ContentBlock heading="AI-Powered Products" icon={Sparkles}>
                    Writing assistants, code generators, chat interfaces, and
                    content analysis tools. Streaming responses, tool calling,
                    and automatic cost tracking included.
                </ContentBlock>
                <ContentBlock heading="Membership Platforms" icon={Users}>
                    Online courses, premium communities, gated content, and
                    subscription sites. Role-based access control and user
                    management built-in.
                </ContentBlock>
                <ContentBlock
                    heading="Internal Tools & Dashboards"
                    icon={Briefcase}
                >
                    Admin panels, workflow automation, team dashboards, and
                    business intelligence tools. Feature flags for gradual
                    rollouts.
                </ContentBlock>
                <ContentBlock heading="Developer Tools" icon={Code}>
                    API platforms, integration services, and developer portals.
                    Type-safe patterns, middleware architecture, and
                    comprehensive error handling.
                </ContentBlock>
            </ContentSection>
        </>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        return (
            <Container className="px-4">
                <div className="rounded-box p-8 bg-base-100">
                    <OctagonXIcon className="w-12 h-12 mb-4 text-error" />
                    <h1 className="text-3xl font-bold mb-4">
                        {error.status} {error.statusText}
                    </h1>
                    <p>{error.data}</p>
                </div>
            </Container>
        );
    } else if (error instanceof Error) {
        return (
            <Container className="px-4">
                <div className="rounded-box p-8 bg-base-100">
                    <OctagonXIcon className="w-12 h-12 mb-4 text-error" />
                    <h1 className="text-3xl font-bold mt-8 mb-4">Error</h1>
                    <p>{error.message}</p>
                    <p>The stack trace is:</p>
                    <pre>{error.stack}</pre>
                </div>
            </Container>
        );
    } else {
        return (
            <Container className="px-4">
                <div className="rounded-box p-8 bg-base-100">
                    <h1 className="text-3xl font-bold mt-8 mb-4">
                        Unknown Error
                    </h1>
                </div>
            </Container>
        );
    }
}
