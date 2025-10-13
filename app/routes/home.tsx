import { Container } from '~/components/Container';
import { Tooltip } from '~/components/Tooltip';
import { BetterAuthLogo } from '~/components/logos/BetterAuthLogo';
import { CloudinaryLogo } from '~/components/logos/CloudinaryLogo';
import { PolarLogo } from '~/components/logos/PolarLogo';
import { PostgresLogo } from '~/components/logos/PostgresLogo';
import { PostHogLogo } from '~/components/logos/PostHogLogo';
import { PrismaLogo } from '~/components/logos/PrismaLogo';
import { RailwayLogo } from '~/components/logos/RailwayLogo';
import { ReactLogo } from '~/components/logos/ReactLogo';
import { ReactRouterLogo } from '~/components/logos/ReactRouterLogo';
import { TailwindLogo } from '~/components/logos/TailwindLogo';
import { TypescriptLogo } from '~/components/logos/TypescriptLogo';
import { VibeCodeLogo } from '~/components/logos/VibeCodeLogo';
import { cx } from '~/cva.config';
import { useRootData } from '~/hooks/useRootData';
import { MCPLogo } from '~/components/logos/MCPLogo';

export default function Home() {
    const data = useRootData();

    const logoProps = {
        className: 'h-10 w-10 md:h-14 md:w-14 lg:h-20 lg:w-20 basis-1/6'
    };

    return (
        <>
            <title>TWS Foundations</title>
            <meta
                name="description"
                content="Modern full-stack boilerplate with authentication, billing, and AI"
            />
            <Container className="p-4">
                <div
                    className={cx(
                        `bg-cover rounded-xl h-[30rem] border-1 border-black mb-8`,
                        !data?.activeFlags['home_page_hero_image'] &&
                            'bg-[url(possessed-photography-M7V9rglHaFE-unsplash.jpg)] bg-[50%_75%]',
                        data?.activeFlags['home_page_hero_image'] &&
                            'bg-[url(uve-sanchez-9DRX_cW48RQ-unsplash.jpg)] bg-center'
                    )}
                ></div>
                <h1 className="text-5xl font-bold mb-8">TWS Foundations</h1>
                {data?.activeFlags['home_page_intro_copy'] ? (
                    <p className="leading-relaxed">
                        Hi-ho! Kermit the Frog here, and let me tell you about
                        TWS Foundations. It's not easy being green, and it's not
                        easy building a SaaS app from scratch either! But with
                        this production-ready boilerplate, you don't have to.
                        It's got everything you need - React Router 7,
                        TypeScript, BetterAuth for authentication, Polar.sh for
                        billing, and PostgreSQL with Prisma. There's even OpenAI
                        integration, PostHog analytics, and DaisyUI components
                        that are almost as colorful as my friends on Sesame
                        Street! Whether you're a solo founder or working with a
                        team, TWS Foundations helps you hop from idea to launch
                        faster than a frog on a lily pad. Yaaaaay!
                    </p>
                ) : (
                    <p>
                        TWS Foundations is a production-ready SaaS boilerplate
                        that gets you from idea to launch faster. Built on
                        modern React Router 7 with TypeScript, it includes
                        authentication via BetterAuth, subscription billing
                        through Polar.sh, and PostgreSQL + Prisma for your
                        database. Features like AI integration with OpenAI,
                        analytics with PostHog, and a beautiful DaisyUI
                        component library mean you can focus on building your
                        unique features instead of reinventing the wheel.
                        Whether you're a solo founder or a development team, TWS
                        Foundations provides the solid foundation you need to
                        ship faster.
                    </p>
                )}
                <div className="flex flex-wrap lg:flex-nowrap justify-evenly lg:justify-between gap-8 lg:gap-4 py-12">
                    <Tooltip tip="TypeScript">
                        <a
                            href="https://www.typescriptlang.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <TypescriptLogo {...logoProps} />
                        </a>
                    </Tooltip>
                    <Tooltip tip="React Router">
                        <a
                            href="https://reactrouter.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ReactRouterLogo {...logoProps} />
                        </a>
                    </Tooltip>
                    <Tooltip tip="React">
                        <a
                            href="https://react.dev/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ReactLogo {...logoProps} />
                        </a>
                    </Tooltip>
                    <Tooltip tip="Tailwind CSS">
                        <a
                            href="https://tailwindcss.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <TailwindLogo {...logoProps} />
                        </a>
                    </Tooltip>
                    <Tooltip tip="Prisma">
                        <a
                            href="https://www.prisma.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <PrismaLogo {...logoProps} />
                        </a>
                    </Tooltip>
                    <Tooltip tip="PostgreSQL">
                        <a
                            href="https://www.postgresql.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <PostgresLogo {...logoProps} />
                        </a>
                    </Tooltip>
                    <Tooltip tip="Better Auth">
                        <a
                            href="https://www.better-auth.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <BetterAuthLogo {...logoProps} />
                        </a>
                    </Tooltip>
                    <Tooltip tip="Model Context Protocol">
                        <a
                            href="https://modelcontextprotocol.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <MCPLogo {...logoProps} />
                        </a>
                    </Tooltip>
                    <Tooltip tip="Polar.sh">
                        <a
                            href="https://polar.sh/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <PolarLogo {...logoProps} />
                        </a>
                    </Tooltip>
                    <Tooltip tip="PostHog">
                        <a
                            href="https://posthog.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <PostHogLogo {...logoProps} />
                        </a>
                    </Tooltip>
                    <Tooltip tip="Cloudinary">
                        <a
                            href="https://cloudinary.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <CloudinaryLogo {...logoProps} />
                        </a>
                    </Tooltip>
                    <Tooltip tip="Railway">
                        <a
                            href="https://railway.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <RailwayLogo {...logoProps} />
                        </a>
                    </Tooltip>
                    <Tooltip tip="Vibe Coding">
                        <a
                            href="https://en.wikipedia.org/wiki/Vibe_coding"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <VibeCodeLogo {...logoProps} />
                        </a>
                    </Tooltip>
                </div>
            </Container>
        </>
    );
}
