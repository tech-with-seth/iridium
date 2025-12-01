import { useMemo } from 'react';

import { Container } from '~/components/Container';
import { cx } from '~/cva.config';
import { useRootData } from '~/hooks/useRootData';
import type { FeatureFlag } from '~/types/posthog';

function isActive(flags: FeatureFlag[] | undefined, flagName: string) {
    if (!flags) {
        return false;
    }

    return flags.find((flag) => flag.key === flagName)?.active;
}

export default function Home() {
    const data = useRootData();

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
            <Container className="px-4">
                <div
                    className={cx(
                        `bg-cover rounded-box h-120 border border-base-300 mb-8`,
                        homePageHeroActive &&
                            `bg-[url(https://res.cloudinary.com/setholito/image/upload/v1762886753/iridium/iridium-2.png)]`,
                        !homePageHeroActive &&
                            `bg-[url(https://res.cloudinary.com/setholito/image/upload/v1762886753/iridium/iridium-1.png)]`,
                    )}
                ></div>
                <h1 className="text-5xl font-bold mb-8">Welcome</h1>
                <div className="mb-12">
                    {homePageIntroCopyExperimentActive ? (
                        <p className="leading-relaxed">
                            Hi-ho! Kermit the Frog here, and let me tell you
                            about Iridium. It's not easy being green, and it's
                            not easy building a SaaS app from scratch either!
                            But with this production-ready boilerplate, you
                            don't have to. It's got everything you need - React
                            Router 7, TypeScript, BetterAuth for authentication,
                            Polar.sh for billing, and PostgreSQL with Prisma.
                            There's even OpenAI integration, PostHog analytics,
                            and DaisyUI components that are almost as colorful
                            as my friends on Sesame Street! Whether you're a
                            solo founder or working with a team, Iridium helps
                            you hop from idea to launch faster than a frog on a
                            lily pad. Yaaaaay!
                        </p>
                    ) : (
                        <p>
                            Iridium is a production-ready SaaS boilerplate that
                            gets you from idea to launch faster. Built on modern
                            React Router 7 with TypeScript, it includes
                            authentication via BetterAuth, subscription billing
                            through Polar.sh, and PostgreSQL + Prisma for your
                            database. Features like AI integration with OpenAI,
                            analytics with PostHog, and a beautiful DaisyUI
                            component library mean you can focus on building
                            your unique features instead of reinventing the
                            wheel. Whether you're a solo founder or a
                            development team, Iridium provides the solid
                            foundation you need to ship faster.
                        </p>
                    )}
                </div>
            </Container>
        </>
    );
}
