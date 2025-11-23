import { useMemo } from 'react';
import { Alert } from '~/components/Alert';
import { Container } from '~/components/Container';
import { cx } from '~/cva.config';
import { useRootData } from '~/hooks/useRootData';

export default function Home() {
    const data = useRootData();

    const homePageHeroActive = useMemo(() => {
        return data?.allFlags.find(
            (flag) => flag.key === 'home_page_hero_image',
        )?.active;
    }, [data?.allFlags]);

    const alertExperimentActive = useMemo(() => {
        return data?.allFlags.find((flag) => flag.key === 'alert-experiment')
            ?.active;
    }, [data?.allFlags]);

    const homePageIntroCopyExperimentActive = useMemo(() => {
        return data?.allFlags.find(
            (flag) => flag.key === 'home_page_intro_copy',
        )?.active;
    }, [data?.allFlags]);

    return (
        <>
            <title>Home | Iridium</title>
            <meta
                name="description"
                content="Modern full-stack boilerplate with authentication, billing, and AI"
            />
            <Container className="px-4">
                {alertExperimentActive && (
                    <Alert status="warning" className="mb-4">
                        You are in the experiment
                    </Alert>
                )}
                <div
                    className={cx(
                        `bg-bottom bg-cover rounded-box h-120 border border-black mb-8`,
                        homePageHeroActive &&
                            `bg-[url(https://res.cloudinary.com/setholito/image/upload/v1762886753/iridium/iridium-hero-1.png)]`,
                        !homePageHeroActive &&
                            `bg-[url(https://res.cloudinary.com/setholito/image/upload/v1762886753/iridium/iridium-hero-2.png)]`,
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
