import { Alert } from '~/components/Alert';
import { Container } from '~/components/Container';
import { cx } from '~/cva.config';
import { useRootData } from '~/hooks/useRootData';

export default function Home() {
    const data = useRootData();

    const homePageHeroActive = data?.flagsMap['home_page_hero_image'];
    const heroImage = homePageHeroActive
        ? `bg-[url(https://res.cloudinary.com/setholito/image/upload/v1762273336/unsplash/uve-sanchez-9DRX_cW48RQ-unsplash.jpg)] bg-center`
        : `bg-[url(https://res.cloudinary.com/setholito/image/upload/v1762273334/unsplash/possessed-photography-M7V9rglHaFE-unsplash.jpg)] bg-[50%_75%]`;

    return (
        <>
            <title>Iridium</title>
            <meta
                name="description"
                content="Modern full-stack boilerplate with authentication, billing, and AI"
            />
            <Container className="px-4">
                {data?.flagsMap['alert-experiment'] && (
                    <Alert status="warning" className="mb-4">
                        You are in the experiment
                    </Alert>
                )}
                <div
                    className={cx(
                        `bg-cover rounded-xl h-[30rem] border border-black mb-8`,
                        heroImage,
                    )}
                ></div>
                <h1 className="text-5xl font-bold mb-8">Iridium</h1>
                <div className="mb-12">
                    {data?.flagsMap['home_page_intro_copy'] ? (
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
