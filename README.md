# Iridium

A full-stack starter kit for shipping AI-powered products. Clone the repo, configure your environment, and have a working application with authentication, AI chat, and agent tools in minutes.

## Features

- **Authentication** — Email/password sign-up and sign-in via Better Auth with secure HTTP-only sessions and automatic refresh
- **Role-based access control** — USER, EDITOR, and ADMIN roles baked into the schema and session helpers
- **AI chat** — Conversational interface powered by VoltAgent and the Vercel AI SDK. Messages persist to PostgreSQL and are organized into threads
- **Agent tools** — The AI assistant can create, list, and search notes on behalf of the user, with tool invocations rendered inline in the chat
- **Generative UI** — The `render_card` tool lets the agent produce rich visual cards (info, steps, pros/cons) inline in the chat, demonstrating VoltAgent's tool-driven approach to generative UI
- **Notes** — A browsable notes page at `/notes` showing all notes saved by the agent, demonstrating the full tool-to-UI vertical slice
- **Working memory** — VoltAgent remembers user preferences and context across conversations via PostgreSQL-backed working memory
- **Form validation** — Client and server-side validation using Zod and React Hook Form with a working example
- **Type-safe end to end** — Prisma generates types from the schema, Zod validates runtime data, React Router 7 types routes and loaders, CVA ensures type-safe component variants

## Tech Stack

| Layer      | Technology                                  |
| ---------- | ------------------------------------------- |
| Framework  | React Router v7 (SSR, config-based routing) |
| UI         | React 19, Tailwind CSS v4, DaisyUI v5       |
| Database   | PostgreSQL via Prisma ORM                   |
| Auth       | Better Auth                                 |
| AI         | VoltAgent, Vercel AI SDK, Anthropic Claude  |
| Validation | Zod, React Hook Form                        |
| Runtime    | Bun (dev), Node 20 Alpine (production)      |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- [Docker](https://docs.docker.com/get-docker/) installed (for local PostgreSQL)
- Anthropic API key

### Installation

```bash
bun install
```

### Environment

Copy `.env.example` to `.env` and fill in:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/iridium"
VOLTAGENT_DATABASE_URL="postgresql://postgres:postgres@localhost:5433/voltagent"
BETTER_AUTH_SECRET="<openssl rand -base64 32>"
BETTER_AUTH_BASE_URL="http://localhost:5173"
VITE_BETTER_AUTH_BASE_URL="http://localhost:5173"
ANTHROPIC_API_KEY="sk-ant-..."
```

### Two-Database Setup

The app runs two PostgreSQL instances via `docker-compose.dev.yml`:

| Database    | Port | Env Var                  | Purpose                          |
| ----------- | ---- | ------------------------ | -------------------------------- |
| `iridium`   | 5432 | `DATABASE_URL`           | Prisma (app data, auth, threads) |
| `voltagent` | 5433 | `VOLTAGENT_DATABASE_URL` | VoltAgent memory and state       |

VoltAgent creates its own tables automatically on first connection -- no migration needed.

| Command               | Purpose                            |
| --------------------- | ---------------------------------- |
| `bun run docker:up`   | Start both Postgres containers     |
| `bun run docker:down` | Stop containers (data preserved)   |
| `bun run docker:nuke` | Stop containers and delete volumes |

### Database

```bash
bun run docker:up              # Start both Postgres containers
bun run db:migrate              # Apply migrations
bun run db:seed                 # Seed with demo users
```

### Development

```bash
bun run dev
```

The app will be available at `http://localhost:5173`.

## Project Structure

```
app/
├── components/          # Shared UI components
├── generated/prisma/    # Generated Prisma client
├── lib/                 # Prisma client, auth config
├── middleware/           # Auth middleware
├── models/              # Server-side data access (thread, note, session)
├── routes/              # React Router route modules
├── voltagent/           # Agent definition and tools
│   ├── agents.ts        # Agent config, tool definitions
│   └── index.ts         # Agent export
└── root.tsx             # App shell, navigation, layout
prisma/
├── schema.prisma        # Database schema
├── migrations/          # Migration history
└── seed.ts              # Database seeder
```

## Agent Tools

The AI assistant (defined in `app/voltagent/agents.ts`) has four tools:

| Tool           | Description                                                            |
| -------------- | ---------------------------------------------------------------------- |
| `create_note`  | Saves a note with a title and content for the user                     |
| `list_notes`   | Lists all of the user's saved notes                                    |
| `search_notes` | Searches notes by keyword across titles and content                    |
| `render_card`  | Renders a rich visual card inline in the chat (info, steps, pros/cons) |

Note tools are rendered via `NoteToolPart`; card tools are rendered via `CardToolPart`. Notes are browsable at `/notes`.

### Generative UI (Tool-Driven)

VoltAgent does not support true generative UI (the model streaming arbitrary React components at runtime). Instead, it uses a tool-driven pattern: the agent calls a tool with structured data, and a predefined React component renders it.

The `render_card` tool demonstrates this pattern with three card variants:

- **info** -- key facts or summaries with optional bullet points
- **steps** -- numbered step-by-step guides
- **pros_cons** -- side-by-side comparison with pros and cons

Try these prompts to trigger card rendering:

- "Compare React and Vue as a pros and cons card"
- "Give me a step-by-step guide to deploying on Railway"
- "Summarize what VoltAgent is as an info card"

The pattern is extensible: define a new variant in the Zod schema (`app/voltagent/tools/cards.ts`), add a rendering branch in `CardToolPart` (`app/components/CardToolPart.tsx`), and the agent will use it when appropriate.

### Adding a Custom Tool

1. **Define the server-side tool** in `app/voltagent/tools/` using `createTool()` with a Zod schema for parameters and an `execute` function. Access the user ID via `options?.userId`.

```ts
// app/voltagent/tools/my-tool.ts
import { createTool } from '@voltagent/core';
import { z } from 'zod';
import invariant from 'tiny-invariant';

export const myTool = createTool({
    name: 'my_tool',
    description:
        'What the tool does — the LLM reads this to decide when to call it.',
    parameters: z.object({
        input: z.string().describe('What to pass in'),
    }),
    execute: async (args, options) => {
        const userId = options?.userId;
        invariant(userId, 'User not authenticated');
        // ... your logic here
        return { result: 'done' };
    },
});
```

1. **Register it** in the agent's `tools` array in `app/voltagent/agents.ts`:

```ts
import { myTool } from './tools/my-tool';

export const agent = new Agent({
    // ...
    tools: [createNoteTool, listNotesTool, searchNotesTool, myTool],
});
```

1. **Create a UI component** for the tool part (see `app/components/NoteToolPart.tsx` for reference). The component receives `toolName`, `state` (`'input-available'`, `'input-streaming'`, or `'output-available'`), and `output`.

2. **Render it in the chat** by adding your tool name to the rendering logic in `app/routes/thread.tsx`. Add a check alongside the existing `NOTE_TOOLS` set, or expand it if appropriate.

## Troubleshooting

- Chat/tool-calling duplicate provider item IDs (`fc_*`): see [docs/chat-tool-calling.md](docs/chat-tool-calling.md)

## Building for Production

```bash
bun run build
```

### Docker

```bash
docker build -t iridium .
docker run -p 3000:3000 iridium
```

Deployable to Railway, Fly.io, AWS ECS, Google Cloud Run, or any Docker-compatible platform.

## Routes

| Route          | Description                              |
| -------------- | ---------------------------------------- |
| `/`            | Home — overview of what Iridium includes |
| `/login`       | Sign in or create an account             |
| `/chat`        | AI chat with thread sidebar              |
| `/notes`       | Browse saved notes                       |
| `/profile`     | User profile and role                    |
| `/form`        | Form validation example                  |
| `/api/chat`    | Chat API endpoint                        |
| `/api/auth/*`  | Auth API endpoints                       |
| `/healthcheck` | Health status                            |
