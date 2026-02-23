import { Container } from '~/components/Container';

export default function Home() {
    return (
        <>
            <title>Home | Iridium</title>
            <meta
                name="description"
                content="Iridium is a full-stack React starter kit with authentication, AI chat, and production-ready patterns."
            />
            <Container className="p-4">
                <h1 className="mb-4 text-4xl font-bold">Iridium</h1>
                <p className="mb-8 text-lg">
                    A full-stack starter kit built for shipping AI-powered
                    products. Clone the repo, configure your environment, and
                    have a working application with authentication and chat in
                    minutes.
                </p>

                <h2 className="mb-3 text-2xl font-semibold">
                    What is included
                </h2>
                <p className="mb-4">
                    Iridium ships with a complete authentication system, an AI
                    chat interface with message persistence, and a set of
                    production-ready patterns for forms, error handling, and
                    role-based access control.
                </p>
                <ul className="mb-8 list-inside list-disc space-y-2">
                    <li>
                        Sign in and sign up with email and password via Better
                        Auth. Sessions are secure, HTTP-only, and automatically
                        refreshed.
                    </li>
                    <li>
                        Role-based access control with USER, EDITOR, and ADMIN
                        roles baked into the database schema and session
                        helpers.
                    </li>
                    <li>
                        AI chat powered by the Vercel AI SDK and OpenAI
                        (gpt-4o-mini). Messages persist to PostgreSQL and are
                        organized into threads so conversations are never lost.
                    </li>
                    <li>
                        Client and server-side form validation using Zod and
                        React Hook Form, with a working example in the Form
                        route.
                    </li>
                </ul>

                <h2 className="mb-3 text-2xl font-semibold">The stack</h2>
                <p className="mb-4">
                    Every technology was chosen to keep the codebase type-safe
                    from database to UI. Prisma generates types from the schema,
                    Zod validates runtime data, React Router 7 types routes and
                    loaders, and CVA ensures type-safe component variants.
                </p>
                <ul className="mb-8 list-inside list-disc space-y-2">
                    <li>React Router v7 with SSR and config-based routing</li>
                    <li>
                        PostgreSQL via Prisma, schema at prisma/schema.prisma
                    </li>
                    <li>Tailwind CSS v4 and DaisyUI v5 for styling</li>
                    <li>
                        Bun for local development, Node 20 Alpine for production
                    </li>
                </ul>

                <h2 className="mb-3 text-2xl font-semibold">Getting started</h2>
                <p>
                    Install dependencies with <code>bun install</code>, run
                    migrations, seed the database with <code>bun run seed</code>
                    , and start the dev server with <code>bun run dev</code>.
                    The app will be available at{' '}
                    <code>http://localhost:5173</code>.
                </p>
            </Container>
        </>
    );
}
