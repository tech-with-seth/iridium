import { Container } from '~/components/Container';
import { cx } from '~/cva.config';
import { useRootData } from '~/hooks/useRootData';

export default function Home() {
    const data = useRootData();

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
                            'bg-[url(uve-sanchez-9DRX_cW48RQ-unsplash.jpg)] bg-center',
                    )}
                ></div>
                <h1 className="text-5xl font-bold mb-8">TWS Foundations</h1>
                <div className="mb-12">
                    {data?.activeFlags['home_page_intro_copy'] ? (
                        <p className="leading-relaxed">
                            Hi-ho! Kermit the Frog here, and let me tell you
                            about TWS Foundations. It's not easy being green,
                            and it's not easy building a SaaS app from scratch
                            either! But with this production-ready boilerplate,
                            you don't have to. It's got everything you need -
                            React Router 7, TypeScript, BetterAuth for
                            authentication, Polar.sh for billing, and PostgreSQL
                            with Prisma. There's even OpenAI integration,
                            PostHog analytics, and DaisyUI components that are
                            almost as colorful as my friends on Sesame Street!
                            Whether you're a solo founder or working with a
                            team, TWS Foundations helps you hop from idea to
                            launch faster than a frog on a lily pad. Yaaaaay!
                        </p>
                    ) : (
                        <p>
                            TWS Foundations is a production-ready SaaS
                            boilerplate that gets you from idea to launch
                            faster. Built on modern React Router 7 with
                            TypeScript, it includes authentication via
                            BetterAuth, subscription billing through Polar.sh,
                            and PostgreSQL + Prisma for your database. Features
                            like AI integration with OpenAI, analytics with
                            PostHog, and a beautiful DaisyUI component library
                            mean you can focus on building your unique features
                            instead of reinventing the wheel. Whether you're a
                            solo founder or a development team, TWS Foundations
                            provides the solid foundation you need to ship
                            faster.
                        </p>
                    )}
                </div>
            </Container>
        </>
    );
}
