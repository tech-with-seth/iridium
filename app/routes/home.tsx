import { Container } from '~/components/Container';
import { BetterAuthLogo } from '~/components/logos/BetterAuthLogo';
import { CloudinaryLogo } from '~/components/logos/CloudinaryLogo';
import { PolarLogo } from '~/components/logos/PolarLogo';
import { PostgresLogo } from '~/components/logos/PostgresLogo';
import { PrismaLogo } from '~/components/logos/PrismaLogo';
import { RailwayLogo } from '~/components/logos/RailwayLogo';
import { ReactLogo } from '~/components/logos/ReactLogo';
import { ReactRouterLogo } from '~/components/logos/ReactRouterLogo';
import { TailwindLogo } from '~/components/logos/TailwindLogo';
import { TypescriptLogo } from '~/components/logos/TypescriptLogo';
import { VibeCodeLogo } from '~/components/logos/VibeCodeLogo';

export default function Home() {
    const logoProps = {
        className: 'h-20 w-20'
    };

    return (
        <>
            <title>TWS Foundations</title>
            <meta
                name="description"
                content="Modern full-stack boilerplate with authentication, billing, and AI"
            />
            <Container>
                <div className="bg-[url(possessed-photography-M7V9rglHaFE-unsplash.jpg)] bg-cover rounded-xl h-[40rem] bg-bottom border-1 border-black mb-8"></div>
                <h1 className="text-5xl font-bold mb-8">TWS Foundations</h1>
                <p>
                    Modern full-stack boilerplate with authentication, billing,
                    and AI
                </p>
                <div className="flex justify-between py-12">
                    <TypescriptLogo {...logoProps} />
                    <ReactRouterLogo {...logoProps} />
                    <ReactLogo {...logoProps} />
                    <TailwindLogo {...logoProps} />
                    <PrismaLogo {...logoProps} />
                    <PostgresLogo {...logoProps} />
                    <BetterAuthLogo {...logoProps} />
                    <PolarLogo {...logoProps} />
                    <CloudinaryLogo {...logoProps} />
                    <RailwayLogo {...logoProps} />
                    <VibeCodeLogo {...logoProps} />
                </div>
            </Container>
        </>
    );
}
