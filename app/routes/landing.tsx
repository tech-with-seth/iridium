import { Alert } from '~/components/feedback/Alert';
import { ArrowRightIcon, OctagonXIcon } from 'lucide-react';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { useMemo, type ReactNode } from 'react';
import type { ProductPriceFixed } from '@polar-sh/sdk/models/components/productpricefixed.js';

import { Container } from '~/components/layout/Container';
import { cx } from '~/cva.config';
import { useRootData } from '~/hooks/useRootData';
import { isActive } from '~/lib/flags';
import { formatToCurrency } from '~/lib/formatters';

function ContentBlock({
    heading,
    children,
}: {
    heading: string;
    children: ReactNode;
}) {
    return (
        <>
            <h3 className="text-xl font-semibold mb-4 text-base-content">
                {heading}
            </h3>
            <p>{children}</p>
        </>
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
                <div className="grid grid-cols-12 gap-4 rounded-box overflow-hidden mb-8 bg-base-100">
                    <div className="col-span-12 md:col-span-6 p-8">
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
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-center p-8">
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
                                to={`/checkout?products=${data?.product.id}`}
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
                <div className="grid grid-cols-12 gap-4 rounded-box overflow-hidden mb-8 bg-base-100 p-8">
                    <div className="col-span-12">
                        <h2 className="text-3xl font-semibold mb-4 text-base-content">
                            Who is this for?
                        </h2>
                    </div>
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-center">
                        <ContentBlock heading="Solo Creators & Indie Hackers">
                            You have a great idea for a creator business but
                            don't want to spend months building authentication,
                            user dashboards, and database architecture. Iridium
                            gives you a production-ready foundation so you can
                            focus on your unique offering instead of reinventing
                            the wheel.
                        </ContentBlock>
                    </div>
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-center">
                        <ContentBlock heading="Technical Founders">
                            You know how to code but want to ship fast without
                            cutting corners. Iridium provides battle-tested
                            patterns for React Router 7, type-safe database
                            operations, and secure authentication. Clean,
                            well-documented code that you can confidently build
                            on.
                        </ContentBlock>
                    </div>
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-center">
                        <ContentBlock heading="Digital Product Creators">
                            You want to sell courses, templates, guides, or
                            access to exclusive content. Iridium gives you user
                            authentication, role-based access control, and a
                            dashboard where your customers can manage their
                            accounts. Add your payment integration and start
                            selling.
                        </ContentBlock>
                    </div>
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-center">
                        <ContentBlock heading="Community Builders">
                            You're building a membership site, private
                            repository access, or exclusive community platform.
                            Iridium handles user management, secure
                            authentication, and provides the foundation for
                            gating content based on membership levels or
                            permissions.
                        </ContentBlock>
                    </div>
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-center">
                        <ContentBlock heading="AI-Powered Creators">
                            You want to build intelligent tools or AI-enhanced
                            experiences for your audience. Iridium includes
                            OpenAI integration with streaming chat out of the
                            box, plus user context and message persistence. Add
                            AI features without starting from scratch.
                        </ContentBlock>
                    </div>
                </div>
            </Container>
            <Container className="px-4">
                <div className="grid grid-cols-12 gap-4 rounded-box overflow-hidden mb-8 bg-base-100 p-8">
                    <div className="col-span-12">
                        <h2 className="text-3xl font-semibold mb-4 text-base-content">
                            Tech stack
                        </h2>
                    </div>
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-center">
                        <ContentBlock heading="Built for Developers">
                            Iridium is designed with developers in mind. The
                            codebase is clean, modular, and easy to understand,
                            making it simple to customize and extend. With
                            comprehensive documentation and a focus on best
                            practices, Iridium helps you build your SaaS product
                            with confidence.
                        </ContentBlock>
                    </div>
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-center">
                        <ContentBlock heading="Modern Tech Stack">
                            Built on React Router 7 with TypeScript for
                            type-safe, full-stack development. Config-based
                            routing, middleware patterns, and a model layer
                            architecture provide a solid foundation. DaisyUI
                            components with CVA give you a beautiful,
                            customizable design system out of the box.
                        </ContentBlock>
                    </div>
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-center">
                        <ContentBlock heading="Authentication & Billing">
                            User authentication powered by BetterAuth with
                            email/password and social login support.
                            Subscription billing integrated via Polar.sh with
                            webhook handling and customer management. Role-based
                            access control keeps your application secure from
                            day one.
                        </ContentBlock>
                    </div>
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-center">
                        <ContentBlock heading="AI-Ready">
                            OpenAI integration with Vercel AI SDK provides
                            streaming chat capabilities and AI-powered features.
                            Pre-built chat UI components and message persistence
                            let you add intelligent features to your product
                            without starting from scratch.
                        </ContentBlock>
                    </div>
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-center">
                        <ContentBlock heading="Production-Ready">
                            PostgreSQL with Prisma for robust data management.
                            PostHog analytics and feature flags for data-driven
                            decisions. Resend for transactional emails. Vitest
                            and Playwright testing suites ensure your code works
                            as expected before deployment.
                        </ContentBlock>
                    </div>
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
