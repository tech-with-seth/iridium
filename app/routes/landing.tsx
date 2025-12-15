import { Alert } from '~/components/feedback/Alert';
import { Accordion, AccordionItem } from '~/components/data-display/Accordion';
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
    Code,
    Lock,
    Users,
    Briefcase,
    HelpCircle,
    Zap,
    Cpu,
    Activity,
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

const GRID_GAP = `gap-4 md:gap-8`;

function ContentSection({
    children,
    heading,
}: PropsWithChildren<{ heading: string }>) {
    return (
        <Container className="px-4">
            <div
                className={`grid grid-cols-12 ${GRID_GAP} rounded-box overflow-hidden mb-8 bg-base-100 p-8`}
            >
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
                <div
                    className={`grid grid-cols-12 ${GRID_GAP} rounded-box overflow-hidden mb-8 bg-base-100`}
                >
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
                <div
                    className={`grid grid-cols-3 lg:grid-cols-12 ${GRID_GAP} rounded-box overflow-hidden mb-8 bg-base-100 p-8 place-items-center`}
                >
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
            <Container className="px-4">
                <div
                    className={`grid grid-cols-12 ${GRID_GAP} rounded-box overflow-hidden mb-8 bg-base-100 p-8`}
                >
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
            <Container className="px-4">
                <div
                    className={`grid grid-cols-12 ${GRID_GAP} rounded-box overflow-hidden mb-8 bg-base-100 p-8`}
                >
                    <div className="col-span-12">
                        <h2 className="text-3xl font-semibold text-base-content mb-4">
                            AI That Actually Works: Tool Calling Included
                        </h2>
                    </div>
                    <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
                        <div className="rounded-box overflow-hidden bg-base-300 shadow-lg">
                            <img
                                src="https://res.cloudinary.com/setholito/image/upload/c_crop,g_center,h_600,w_1200/v1765822328/iridium/iridium-tool-calling-1.png"
                                alt="AI tool calling request - user asks about analytics and AI extracts function parameters"
                                className="w-full"
                            />
                        </div>
                        <ContentBlock
                            heading="Function Calling Made Simple"
                            icon={Cpu}
                        >
                            The AI doesn't just chat—it executes real functions.
                            Define tools with Zod schemas, and the Vercel AI SDK
                            automatically extracts parameters from natural
                            language, validates them, and executes your
                            functions. See the screenshots: a user asks a
                            question, the AI determines which tool to call,
                            extracts the parameters, and returns structured,
                            type-safe results.
                        </ContentBlock>
                    </div>
                    <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
                        <div className="rounded-box overflow-hidden bg-base-300 shadow-lg">
                            <img
                                src="https://res.cloudinary.com/setholito/image/upload/c_crop,g_center,h_600,w_1200/v1765822328/iridium/iridium-tool-calling-2.png"
                                alt="AI tool calling response - function executes and returns structured data with visualization"
                                className="w-full"
                            />
                        </div>
                        <ContentBlock
                            heading="Built-In Examples You Can Copy"
                            icon={Code}
                        >
                            Iridium includes working tool definitions for user
                            analytics, data fetching, and content generation.
                            Each tool is tracked by PostHog for cost and
                            performance monitoring. Copy the pattern, adapt it
                            to your domain, and ship AI features with
                            confidence.
                        </ContentBlock>
                    </div>
                </div>
            </Container>
            <Container className="px-4">
                <div
                    className={`grid grid-cols-12 ${GRID_GAP} rounded-box overflow-hidden mb-8 bg-base-100 p-8`}
                >
                    <div className="col-span-12">
                        <h2 className="text-3xl font-semibold mb-4 text-base-content">
                            Developer-Friendly Admin Panel
                        </h2>
                    </div>
                    <div className="col-span-12 lg:col-span-6">
                        <ContentBlock
                            heading="Feature Flag Management"
                            icon={Sparkles}
                        >
                            Toggle features on and off without deployments. The
                            admin panel integrates with PostHog for real-time
                            feature flag control, A/B testing, and gradual
                            rollouts. Test new features with a subset of users,
                            roll back instantly if needed, and iterate faster
                            with confidence.
                        </ContentBlock>
                        <ContentBlock
                            heading="Built-In Developer Tools"
                            icon={Code}
                        >
                            Quick access to theme switching, form demos, and
                            component galleries. The admin panel serves as a
                            central hub for developers to test UI variations,
                            preview components, and manage application settings
                            without touching code. Links to external services
                            like Polar.sh keep everything in one place.
                        </ContentBlock>
                        <ContentBlock
                            heading="Design System Playground"
                            icon={Layout}
                        >
                            Test every component variant in isolation with the
                            built-in design system preview. See all button
                            styles, form states, and UI patterns at once.
                            Perfect for validating design decisions, testing
                            accessibility, and ensuring consistency across your
                            application without hunting through routes.
                        </ContentBlock>
                    </div>
                    <div className="col-span-12 lg:col-span-6">
                        <div className="rounded-box overflow-hidden bg-base-300 shadow-lg">
                            <img
                                src="https://res.cloudinary.com/setholito/image/upload/v1765823837/iridium/iridium-admin-panel.png"
                                alt="Iridium Admin Panel - feature flags, theme switching, and developer tools"
                            />
                        </div>
                    </div>
                </div>
            </Container>
            <Container className="px-4">
                <div
                    className={`grid grid-cols-12 ${GRID_GAP} rounded-box overflow-hidden mb-8 bg-base-100 p-8`}
                >
                    <div className="col-span-12">
                        <h2 className="text-3xl font-semibold mb-4 text-base-content">
                            Powered by PostHog: Analytics That Actually Help You
                            Build
                        </h2>
                    </div>
                    <div className="col-span-12 lg:col-span-6">
                        <div className="rounded-box overflow-hidden bg-base-300 shadow-lg">
                            <img
                                src="https://res.cloudinary.com/setholito/image/upload/v1765824201/iridium/iridium-and-posthog.png"
                                alt="PostHog Integration - Real-time analytics, feature flags, and LLM tracking"
                            />
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-6">
                        <ContentBlock
                            heading="Event Tracking Built Into Your Code"
                            icon={BarChart}
                        >
                            Every meaningful action—sign-ups, thread creation,
                            message sends, tool calls—automatically tracked. No
                            guessing about user behavior. PostHog events are
                            instrumented throughout the codebase, so you can see
                            patterns like which features drive retention and
                            where users get stuck.
                        </ContentBlock>
                        <ContentBlock
                            heading="Feature Flags for Confident Releases"
                            icon={Sparkles}
                        >
                            Toggle features on and off without deploying. Run
                            A/B tests to validate product decisions before
                            committing. This landing page uses feature flags
                            right now—different hero images and copy variants
                            served to different users, measured in real-time.
                        </ContentBlock>
                        <ContentBlock
                            heading="LLM Analytics: Track AI Costs Automatically"
                            icon={Cpu}
                        >
                            The @posthog/ai wrapper captures every AI
                            interaction: model used, tokens consumed, estimated
                            cost, latency. See which prompts work, which tools
                            get called, and how much your AI features actually
                            cost—without manual logging.
                        </ContentBlock>
                        <ContentBlock
                            heading="Session Replay & Error Tracking"
                            icon={Activity}
                        >
                            Watch user sessions to understand confusion and
                            bugs. Automatic exception capture with stack traces
                            means you know about issues before users report
                            them. Debug with context instead of guessing from
                            error messages.
                        </ContentBlock>
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
            <Container className="px-4">
                <div
                    className={`grid grid-cols-12 ${GRID_GAP} rounded-box overflow-hidden mb-8 bg-base-100 p-8`}
                >
                    <div className="col-span-12 lg:col-span-6 flex flex-col justify-center">
                        <div className="flex items-start gap-3 mb-4">
                            <Zap className="w-8 h-8 text-primary mt-1" />
                            <h2 className="text-3xl font-semibold text-base-content">
                                Try It Free with Railway
                            </h2>
                        </div>
                        <p className="text-lg mb-4 text-base-content/80">
                            Deploy a working instance instantly with automatic
                            database provisioning and environment setup. Perfect
                            for testing the architecture and seeing Iridium in
                            action.
                        </p>
                        <div className="mb-4">
                            <a
                                href="https://railway.com/deploy/UVmPwx?referralCode=YZe1VE&utm_medium=integration&utm_source=template&utm_campaign=generic"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    src="https://railway.com/button.svg"
                                    alt="Deploy on Railway"
                                    className="h-10"
                                />
                            </a>
                        </div>
                        <p className="text-sm text-base-content/70 mb-6">
                            Don't have a Railway account?{' '}
                            <a
                                href="https://railway.com?referralCode=YZe1VE"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link link-primary"
                            >
                                Sign up here
                            </a>{' '}
                            to get started with $5 in free credits.
                        </p>
                        <div className="alert alert-soft alert-info">
                            <p className="text-sm">
                                <strong>Free template includes:</strong> Running
                                app with auth, database, and UI.{' '}
                                <strong>Full repo access adds:</strong> Complete
                                source code, 30+ pattern guides, all
                                documentation, git history, and future updates.
                            </p>
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-6 flex items-center">
                        <img
                            src="https://railway.com/brand/logotype-light.png"
                            alt="Railway"
                            className="w-full rounded-box"
                        />
                    </div>
                </div>
            </Container>
            <Container className="px-4">
                <div className="rounded-box overflow-hidden mb-8 bg-base-100 p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <HelpCircle className="w-8 h-8 text-primary" />
                        <h2 className="text-3xl font-semibold text-base-content">
                            Frequently Asked Questions
                        </h2>
                    </div>
                    <Accordion name="faq-accordion">
                        <AccordionItem
                            title="What makes Iridium different from other React starters?"
                            name="faq-accordion"
                            variant="plus"
                            bordered
                            defaultOpen
                        >
                            Iridium is deliberately opinionated. Instead of
                            giving you a minimal setup and saying &apos;figure
                            it out,&apos; we&apos;ve made the hard architectural
                            decisions for you: config-based routing over
                            file-based, CVA for component variants, Prisma with
                            a custom output path, model-layer separation, hybrid
                            form validation. You get working examples of AI
                            chat, authentication flows, and analytics
                            integration—not just empty templates. Every pattern
                            is documented in the codebase, so you learn by
                            reading production-quality code.
                        </AccordionItem>
                        <AccordionItem
                            title="How long does it take to get started?"
                            name="faq-accordion"
                            variant="plus"
                            bordered
                        >
                            If you have Node.js and PostgreSQL installed, you
                            can be running locally in under 10 minutes. Clone
                            the repo, copy .env.example to .env, add your
                            database URL and auth secret, run npm install and
                            the database migrations, then npm run dev. The core
                            features (auth, database, routing, components) work
                            immediately. Optional integrations like OpenAI,
                            Resend, and PostHog require API keys but aren&apos;t
                            necessary to start building.
                        </AccordionItem>
                        <AccordionItem
                            title="Do I need to know all these technologies to use Iridium?"
                            name="faq-accordion"
                            variant="plus"
                            bordered
                        >
                            No. If you&apos;re comfortable with React and
                            TypeScript, you can start building immediately. The
                            architecture guides you: routes are in routes.ts,
                            database operations go in app/models/, components
                            follow CVA patterns. You&apos;ll learn React Router
                            7, Prisma, and BetterAuth by working with real
                            implementations. The .github/instructions/ folder
                            has 30+ pattern guides that explain every
                            integration with examples and anti-patterns.
                        </AccordionItem>
                        <AccordionItem
                            title="Can I customize or remove features I don't need?"
                            name="faq-accordion"
                            variant="plus"
                            bordered
                        >
                            Absolutely. The AI chat demo, PostHog analytics,
                            Resend emails, and Polar billing are all optional.
                            Don&apos;t need AI? Delete app/routes/api/chat.ts
                            and the related components. Don&apos;t need
                            analytics? Remove the PostHog provider. The core
                            foundation—routing, auth, database, validation,
                            components—is designed to be extended or simplified
                            based on your product needs. We deliberately kept
                            the scope lean to make this easier.
                        </AccordionItem>
                        <AccordionItem
                            title="Is this production-ready or just a learning project?"
                            name="faq-accordion"
                            variant="plus"
                            bordered
                        >
                            Production-ready. Iridium itself is a real product
                            with authentication, billing, and a database
                            handling actual users. The patterns you
                            see—role-based access control, error tracking,
                            feature flags, secure session management—are the
                            same patterns running in production. We&apos;ve
                            handled edge cases, security considerations, and
                            performance optimizations so you don&apos;t have to
                            discover them the hard way.
                        </AccordionItem>
                        <AccordionItem
                            title="What's the learning curve like?"
                            name="faq-accordion"
                            variant="plus"
                            bordered
                        >
                            If you know React, the curve is gentle. The steepest
                            part is learning React Router 7&apos;s config-based
                            routing and data patterns (no useLoaderData hook,
                            route type imports). But once you&apos;ve built one
                            feature following the existing patterns, the next
                            one is straightforward. The documentation
                            anticipates common mistakes—like route type import
                            paths—and explains the &apos;why&apos; behind each
                            architectural choice.
                        </AccordionItem>
                        <AccordionItem
                            title="What's included without needing external API keys?"
                            name="faq-accordion"
                            variant="plus"
                            bordered
                        >
                            Authentication with email/password, full database
                            access with Prisma, all UI components and variants,
                            form validation, protected routes, role-based access
                            control, and the complete routing and middleware
                            architecture. You can build a full-featured SaaS
                            product before adding a single integration. External
                            services (OpenAI, Resend, PostHog, Polar) are wired
                            up and ready to use with API keys, but they&apos;re
                            optional.
                        </AccordionItem>
                        <AccordionItem
                            title="When should I use Iridium instead of building from scratch?"
                            name="faq-accordion"
                            variant="plus"
                            bordered
                        >
                            Use Iridium when you want to focus on your unique
                            product logic, not infrastructure. If you&apos;ve
                            built authentication, database migrations, form
                            validation, and deployment pipelines before, you
                            know it&apos;s weeks of work that adds zero user
                            value. Iridium handles the undifferentiated heavy
                            lifting with proven patterns so you can ship
                            features on day one. Build from scratch when you
                            have specific architectural requirements that
                            conflict with Iridium&apos;s opinionated choices.
                        </AccordionItem>
                        <AccordionItem
                            title="How do updates work? Will I get locked into an outdated stack?"
                            name="faq-accordion"
                            variant="plus"
                            bordered
                        >
                            You own the code. When you purchase Iridium, you get
                            the entire repository—you&apos;re not dependent on
                            our updates to keep building. That said, we&apos;re
                            using stable, widely-adopted technologies: React 19,
                            React Router 7, Prisma, PostgreSQL, TypeScript.
                            These aren&apos;t experimental. As major versions
                            release, you can update dependencies like any
                            Node.js project. The architectural patterns (model
                            layer, CVA components, config-based routing) remain
                            valid regardless of minor version bumps.
                        </AccordionItem>
                        <AccordionItem
                            title="What kind of support and documentation is included?"
                            name="faq-accordion"
                            variant="plus"
                            bordered
                        >
                            Every integration has a detailed guide in
                            .github/instructions/ with patterns, examples, and
                            troubleshooting. The codebase includes inline JSDoc
                            comments explaining why decisions were made. Common
                            issues—like route type imports, Prisma client paths,
                            form validation conflicts—are documented with
                            solutions. You&apos;re buying both the code and the
                            accumulated knowledge of how to use it correctly.
                            This isn&apos;t a template dump; it&apos;s a curated
                            learning resource that pays for itself in avoided
                            debugging time.
                        </AccordionItem>
                    </Accordion>
                </div>
            </Container>
            <Container className="px-4">
                <div className="rounded-box overflow-hidden mb-8 bg-linear-to-br from-primary/50 to-secondary/50 p-8 md:p-12 text-center">
                    <h2 className="text-4xl font-bold mb-4 text-base-content">
                        Ready to Ship Faster?
                    </h2>
                    <p className="text-lg mb-8 max-w-2xl mx-auto text-base-content/80">
                        Stop rebuilding the same infrastructure. Get immediate
                        access to production-ready code, proven patterns, and
                        comprehensive documentation. Start building your product
                        today.
                    </p>
                    <Link
                        to={`/checkout?products=${data?.product.id}${data?.user?.email ? `&customerEmail=${data.user.email}` : ''}`}
                        className="btn btn-secondary btn-lg"
                    >
                        Get access to the repo for {productPrice}
                        <ArrowRightIcon />
                    </Link>
                </div>
            </Container>
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
