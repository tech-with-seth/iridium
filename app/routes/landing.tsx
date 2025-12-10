import { Alert } from '~/components/feedback/Alert';
import { ArrowRightIcon, OctagonXIcon } from 'lucide-react';
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
}: {
    heading: string;
    children: ReactNode;
}) {
    return (
        <div className="mb-4">
            <h3 className="text-xl font-semibold mb-4 text-base-content">
                {heading}
            </h3>
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

            <Container className="px-4">
                <div className="grid grid-cols-12 gap-4 rounded-box overflow-hidden mb-8 bg-base-100 p-8">
                    <div className="col-span-12">
                        <h2 className="text-3xl font-semibold mb-4 text-base-content">
                            See It In Action
                        </h2>
                    </div>
                    <div className="col-span-12 lg:col-span-6">
                        <ContentBlock heading="Production-Ready Dashboard">
                            Iridium includes a fully functional dashboard with
                            real metrics, thread management, and a working AI
                            chat interface. Every button click, every message
                            sent, every thread created triggers PostHog events.
                            See exactly how to instrument your features by
                            reading production code that actually works.
                        </ContentBlock>
                        <ContentBlock heading="AI Chat with Tool Calling">
                            Built with Vercel AI SDK and OpenAI, the chat
                            interface demonstrates streaming responses,
                            multi-turn conversations, and tool calling patterns.
                            Messages persist to your database, threads organize
                            conversations, and the @posthog/ai wrapper tracks
                            token usage and costs automatically. Copy the
                            implementation, adapt it to your product, and ship
                            AI features in hours instead of weeks.
                        </ContentBlock>
                        <ContentBlock heading="End-to-End Type Safety">
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
            <ContentSection heading="What is Iridium?">
                <ContentBlock heading="Production-Ready React Router 7 Foundation">
                    Iridium is a carefully architected boilerplate built on
                    React Router 7 with TypeScript throughout. Config-based
                    routing, end-to-end type safety, and clear separation of
                    concerns give you the confidence to build and scale. It's
                    not just another template—it follows proven patterns used in
                    real production applications.
                </ContentBlock>
                <ContentBlock heading="Everything You Need to Ship Fast">
                    Skip months of setup. Iridium includes authentication,
                    database integration, AI capabilities with streaming chat,
                    analytics, email, testing, and deployment configuration.
                    Every integration is documented, every pattern is explained,
                    and every decision is intentional. Build for creators, by
                    creators.
                </ContentBlock>
            </ContentSection>
            <ContentSection heading="What's inside?">
                <ContentBlock heading="Authentication & User Management">
                    Secure authentication powered by BetterAuth with
                    email/password and social login support. Session management,
                    role-based access control, and protected route patterns are
                    ready to use. User profiles, account settings, and secure
                    password reset flows included.
                </ContentBlock>
                <ContentBlock heading="AI Integration">
                    OpenAI integration with streaming chat capabilities using
                    the Vercel AI SDK. Pre-built chat UI components, message
                    persistence with Prisma, and LLM analytics tracking via
                    PostHog. Add AI-powered features to your product in minutes,
                    not weeks.
                </ContentBlock>
                <ContentBlock heading="Form & Validation System">
                    Hybrid client/server form validation using Zod schemas and
                    React Hook Form. Instant client-side feedback with
                    server-side security validation. Pre-built form components
                    with error handling, loading states, and accessibility
                    features built in.
                </ContentBlock>
                <ContentBlock heading="Component Library">
                    DaisyUI 5 components with CVA-powered variants for type-safe
                    styling. Buttons, inputs, modals, alerts, and more—all
                    customizable and accessible. Dark mode support, responsive
                    design, and consistent theming across your entire
                    application.
                </ContentBlock>
                <ContentBlock heading="Analytics & Feature Flags">
                    PostHog integration for user analytics, session replay, and
                    A/B testing. Feature flags let you test variations with real
                    users and roll out features gradually. Built-in LLM
                    analytics tracks AI model usage, costs, and performance.
                </ContentBlock>
                <ContentBlock heading="Email & Transactional Messages">
                    Resend integration with React Email components for
                    beautiful, responsive emails. Pre-built templates for
                    welcome emails, password resets, account notifications, and
                    more. Type-safe email sending with proper error handling.
                </ContentBlock>
            </ContentSection>
            <ContentSection heading="Built-in Analytics & Intelligence">
                <ContentBlock heading="Comprehensive Event Tracking">
                    Every action tracked with PostHog: user behavior patterns,
                    chat interactions, thread management, and LLM usage metrics.
                    Automatic exception capture with full context gives you
                    visibility into errors before users report them. See exactly
                    how your features are being used.
                </ContentBlock>
                <ContentBlock heading="Feature Flags & A/B Testing">
                    Test UI variations with real users instantly using PostHog
                    feature flags. Roll out features gradually to specific user
                    segments. Watch session replays to understand actual user
                    behavior. The landing page you're reading right now uses
                    feature flags for experimentation.
                </ContentBlock>
                <ContentBlock heading="LLM Analytics Built-In">
                    Track AI model usage, token consumption, response times, and
                    costs automatically. Every chat message, every streaming
                    response, every tool call is captured with the @posthog/ai
                    wrapper. See exactly what your AI features cost and how
                    users interact with them.
                </ContentBlock>
                <ContentBlock heading="Real Implementation Examples">
                    The dashboard includes working examples of analytics
                    tracking: button clicks, message streams, thread operations,
                    and error handling. Every event is properly structured with
                    context. Copy the patterns, apply them to your features.
                    Learn by seeing production code.
                </ContentBlock>
            </ContentSection>

            <ContentSection heading="What's the purpose?">
                <ContentBlock heading="Ship Faster, Build Better">
                    Every creator business needs the same foundation: user
                    authentication, payments, email, and a dashboard. Iridium
                    gives you all of this on day one, so you can spend your time
                    building features that make your product unique instead of
                    rebuilding infrastructure everyone else already has.
                </ContentBlock>
                <ContentBlock heading="Code You Can Trust">
                    This isn't just a collection of npm packages thrown
                    together. Iridium follows modern best practices with
                    config-based routing, type-safe operations, middleware
                    patterns, and comprehensive testing. The architecture is
                    designed to scale as your business grows, not hold you back.
                </ContentBlock>
                <ContentBlock heading="Focus on Revenue, Not Boilerplate">
                    Time spent building authentication is time you're not
                    spending talking to customers or building revenue-generating
                    features. Iridium handles the boring infrastructure work so
                    you can focus on the problems only you can solve—the ones
                    your customers will actually pay for.
                </ContentBlock>
                <ContentBlock heading="Built for Real Products">
                    Iridium isn't a toy project or experimental framework. It's
                    built with production-ready patterns, comprehensive error
                    handling, and real-world testing. Security best practices,
                    proper database migrations, and deployment-ready
                    configuration are all included. Start with confidence.
                </ContentBlock>
            </ContentSection>
            <ContentSection heading="Who is this for?">
                <ContentBlock heading="Solo Creators & Indie Hackers">
                    You have a great idea for a creator business but don't want
                    to spend months building authentication, user dashboards,
                    and database architecture. Iridium gives you a
                    production-ready foundation so you can focus on your unique
                    offering instead of reinventing the wheel.
                </ContentBlock>
                <ContentBlock heading="Technical Founders">
                    You know how to code but want to ship fast without cutting
                    corners. Iridium provides battle-tested patterns for React
                    Router 7, type-safe database operations, and secure
                    authentication. Clean, well-documented code that you can
                    confidently build on.
                </ContentBlock>
                <ContentBlock heading="Digital Product Creators">
                    You want to sell courses, templates, guides, or access to
                    exclusive content. Iridium gives you user authentication,
                    role-based access control, and a dashboard where your
                    customers can manage their accounts. Add your payment
                    integration and start selling.
                </ContentBlock>
                <ContentBlock heading="Community Builders">
                    You're building a membership site, private repository
                    access, or exclusive community platform. Iridium handles
                    user management, secure authentication, and provides the
                    foundation for gating content based on membership levels or
                    permissions.
                </ContentBlock>
                <ContentBlock heading="AI-Powered Creators">
                    You want to build intelligent tools or AI-enhanced
                    experiences for your audience. Iridium includes OpenAI
                    integration with streaming chat out of the box, plus user
                    context and message persistence. Add AI features without
                    starting from scratch.
                </ContentBlock>
            </ContentSection>
            <ContentSection heading="Tech stack">
                <ContentBlock heading="Built for Developers">
                    Iridium is designed with developers in mind. The codebase is
                    clean, modular, and easy to understand, making it simple to
                    customize and extend. With comprehensive documentation and a
                    focus on best practices, Iridium helps you build your SaaS
                    product with confidence.
                </ContentBlock>
                <ContentBlock heading="Modern Tech Stack">
                    Built on React Router 7 with TypeScript for type-safe,
                    full-stack development. Config-based routing, middleware
                    patterns, and a model layer architecture provide a solid
                    foundation. DaisyUI components with CVA give you a
                    beautiful, customizable design system out of the box.
                </ContentBlock>
                <ContentBlock heading="Authentication & Billing">
                    User authentication powered by BetterAuth with
                    email/password and social login support. Subscription
                    billing integrated via Polar.sh with webhook handling and
                    customer management. Role-based access control keeps your
                    application secure from day one.
                </ContentBlock>
                <ContentBlock heading="AI-Ready">
                    OpenAI integration with Vercel AI SDK provides streaming
                    chat capabilities and AI-powered features. Pre-built chat UI
                    components and message persistence let you add intelligent
                    features to your product without starting from scratch.
                </ContentBlock>
                <ContentBlock heading="Production-Ready">
                    PostgreSQL with Prisma for robust data management. PostHog
                    analytics and feature flags for data-driven decisions.
                    Resend for transactional emails. Vitest and Playwright
                    testing suites ensure your code works as expected before
                    deployment.
                </ContentBlock>
            </ContentSection>
            <ContentSection heading="Use cases">
                <ContentBlock heading="AI-Powered SaaS Products">
                    Build intelligent tools that use OpenAI's models for content
                    generation, analysis, or chat interfaces. The streaming chat
                    implementation, message persistence, and LLM analytics
                    tracking give you everything needed to create AI products
                    like writing assistants, code generators, or conversational
                    tools.
                </ContentBlock>
                <ContentBlock heading="Membership & Subscription Sites">
                    Create exclusive content platforms with tiered access
                    levels. Use role-based permissions to gate premium content,
                    manage subscriptions, and provide member-only features.
                    Perfect for online courses, premium newsletters, or private
                    communities.
                </ContentBlock>
                <ContentBlock heading="Internal Business Tools">
                    Build dashboards, admin panels, or workflow automation tools
                    for your team. The authentication system handles user
                    management, feature flags let you roll out updates
                    gradually, and the component library provides a professional
                    interface out of the box.
                </ContentBlock>
                <ContentBlock heading="API & Integration Platforms">
                    Create developer tools, API management platforms, or
                    integration services. The type-safe API patterns, middleware
                    architecture, and comprehensive error handling make it easy
                    to build reliable backend services with clean documentation.
                </ContentBlock>
                <ContentBlock heading="Data Collection & Analysis Tools">
                    Build form builders, survey platforms, or analytics
                    dashboards. The validation system handles complex form
                    logic, PostHog integration provides real-time analytics, and
                    the database layer with Prisma makes data management
                    straightforward.
                </ContentBlock>
                <ContentBlock heading="E-Learning & Course Platforms">
                    Launch online course platforms with user progress tracking,
                    content gating, and email notifications. The authentication
                    system manages student accounts, while the component library
                    provides all the UI elements for course content, quizzes,
                    and progress indicators.
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
