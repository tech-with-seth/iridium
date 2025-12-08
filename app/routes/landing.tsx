import { ArrowRightIcon } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { Alert } from '~/components/Alert';

import { Container } from '~/components/Container';
import { cx } from '~/cva.config';
import { useRootData } from '~/hooks/useRootData';
import { isActive } from '~/lib/flags';

function ContentBlock({
    heading,
    children,
}: {
    heading: string;
    children: ReactNode;
}) {
    return (
        <>
            <h2 className="text-3xl font-semibold mb-4 text-base-content">
                {heading}
            </h2>
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
                            {homePageIntroCopyExperimentActive ? (
                                <p className="leading-relaxed text-lg">
                                    Ship features with confidence using
                                    data-driven experimentation. Iridium
                                    integrates PostHog feature flags so you can
                                    test different messaging, UI variations, and
                                    user flows in production. See what resonates
                                    with your audience before committing to a
                                    single approach. This paragraph itself is an
                                    A/B test—50% of visitors see this version
                                    while others see alternative copy below.
                                    Make decisions based on real user behavior,
                                    not hunches.
                                </p>
                            ) : (
                                <p className="text-lg">
                                    Stop building the same boilerplate for every
                                    project. Iridium is a production-ready SaaS
                                    starter that includes everything you need to
                                    launch: authentication, subscription
                                    billing, database management, AI
                                    integration, analytics, and a beautiful UI
                                    component library. Focus on building your
                                    unique value proposition instead of
                                    reinventing user login for the hundredth
                                    time. Ship faster, iterate smarter, and get
                                    to revenue sooner.
                                </p>
                            )}
                            <a href="/" className="btn btn-secondary mt-8">
                                Buy my SaaS Boilerplate{' '}
                                <ArrowRightIcon className="ml-2" />
                            </a>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-center p-8">
                        <ContentBlock heading="Built for Developers">
                            Iridium is designed with developers in mind. The
                            codebase is clean, modular, and easy to understand,
                            making it simple to customize and extend. With
                            comprehensive documentation and a focus on best
                            practices, Iridium helps you build your SaaS product
                            with confidence.
                        </ContentBlock>
                    </div>
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-center p-8">
                        <ContentBlock heading="Modern Tech Stack">
                            Built on React Router 7 with TypeScript for
                            type-safe, full-stack development. Config-based
                            routing, middleware patterns, and a model layer
                            architecture provide a solid foundation. DaisyUI
                            components with CVA give you a beautiful,
                            customizable design system out of the box.
                        </ContentBlock>
                    </div>
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-center p-8">
                        <ContentBlock heading="Authentication & Billing">
                            User authentication powered by BetterAuth with
                            email/password and social login support.
                            Subscription billing integrated via Polar.sh with
                            webhook handling and customer management. Role-based
                            access control keeps your application secure from
                            day one.
                        </ContentBlock>
                    </div>
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-center p-8">
                        <ContentBlock heading="AI-Ready">
                            OpenAI integration with Vercel AI SDK provides
                            streaming chat capabilities and AI-powered features.
                            Pre-built chat UI components and message persistence
                            let you add intelligent features to your product
                            without starting from scratch.
                        </ContentBlock>
                    </div>
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-center p-8">
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
