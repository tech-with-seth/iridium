import { ArrowRightIcon } from 'lucide-react';
import { useMemo } from 'react';
import { Alert } from '~/components/Alert';

import { Container } from '~/components/Container';
import { cx } from '~/cva.config';
import { useRootData } from '~/hooks/useRootData';
import { isActive } from '~/lib/flags';
import type { FeatureFlag } from '~/types/posthog';

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
                            <p>You are in the experiment</p>
                        </Alert>
                    </Container>
                </div>
            )}
            <Container className="px-4">
                <div className="grid grid-cols-12 gap-4 rounded-box overflow-hidden mb-8 bg-base-100 border border-base-300">
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
                                <p className="leading-relaxed">
                                    Hi-ho! Kermit the Frog here, and let me tell
                                    you about Iridium. It's not easy being
                                    green, and it's not easy building a SaaS app
                                    from scratch either! But with this
                                    production-ready boilerplate, you don't have
                                    to. It's got everything you need - React
                                    Router 7, TypeScript, BetterAuth for
                                    authentication, Polar.sh for billing, and
                                    PostgreSQL with Prisma. There's even OpenAI
                                    integration, PostHog analytics, and DaisyUI
                                    components that are almost as colorful as my
                                    friends on Sesame Street! Whether you're a
                                    solo founder or working with a team, Iridium
                                    helps you hop from idea to launch faster
                                    than a frog on a lily pad. Yaaaaay!
                                </p>
                            ) : (
                                <p>
                                    Iridium is a production-ready SaaS
                                    boilerplate that gets you from idea to
                                    launch faster. Built on modern React Router
                                    7 with TypeScript, it includes
                                    authentication via BetterAuth, subscription
                                    billing through Polar.sh, and PostgreSQL +
                                    Prisma for your database. Features like AI
                                    integration with OpenAI, analytics with
                                    PostHog, and a beautiful DaisyUI component
                                    library mean you can focus on building your
                                    unique features instead of reinventing the
                                    wheel. Whether you're a solo founder or a
                                    development team, Iridium provides the solid
                                    foundation you need to ship faster.
                                </p>
                            )}
                            <a href="/" className="btn btn-primary mt-8">
                                Buy my SaaS Boilerplate{' '}
                                <ArrowRightIcon className="ml-2" />
                            </a>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-center p-8">
                        <h2 className="text-3xl font-semibold mb-4 text-base-content">
                            Built for Developers
                        </h2>
                        <p>
                            Iridium is designed with developers in mind. The
                            codebase is clean, modular, and easy to understand,
                            making it simple to customize and extend. With
                            comprehensive documentation and a focus on best
                            practices, Iridium helps you build your SaaS product
                            with confidence.
                        </p>
                    </div>
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-center p-8">
                        <h2 className="text-3xl font-semibold mb-4 text-base-content">
                            Built for Developers
                        </h2>
                        <p>
                            Iridium is designed with developers in mind. The
                            codebase is clean, modular, and easy to understand,
                            making it simple to customize and extend. With
                            comprehensive documentation and a focus on best
                            practices, Iridium helps you build your SaaS product
                            with confidence.
                        </p>
                    </div>
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-center p-8">
                        <h2 className="text-3xl font-semibold mb-4 text-base-content">
                            Built for Developers
                        </h2>
                        <p>
                            Iridium is designed with developers in mind. The
                            codebase is clean, modular, and easy to understand,
                            making it simple to customize and extend. With
                            comprehensive documentation and a focus on best
                            practices, Iridium helps you build your SaaS product
                            with confidence.
                        </p>
                    </div>
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-center p-8">
                        <h2 className="text-3xl font-semibold mb-4 text-base-content">
                            Built for Developers
                        </h2>
                        <p>
                            Iridium is designed with developers in mind. The
                            codebase is clean, modular, and easy to understand,
                            making it simple to customize and extend. With
                            comprehensive documentation and a focus on best
                            practices, Iridium helps you build your SaaS product
                            with confidence.
                        </p>
                    </div>
                </div>
            </Container>
        </>
    );
}
