# TWS Foundations

A modern full-stack boilerplate built with React Router 7, featuring authentication, billing, AI integration, and everything you need to get started quickly.

## 🚀 Features

- **React Router 7** - Latest version with SSR and config-based routing
- **Authentication** - BetterAuth with Prisma adapter
- **Billing** - Polar.sh integration with credit system
- **AI Integration** - OpenAI with Vercel AI SDK
- **Database** - PostgreSQL with Prisma ORM
- **Styling** - TailwindCSS v4 with dark mode
- **TypeScript** - Strict mode with full type safety
- **Caching** - FlatCache for client-side caching
- **Validation** - Zod schemas for type-safe forms

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19, React Router 7, TailwindCSS v4
- **Backend**: Prisma, PostgreSQL, BetterAuth
- **AI**: OpenAI GPT-4, Vercel AI SDK
- **Billing**: Polar.sh with BetterAuth plugin
- **Caching**: FlatCache
- **Validation**: Zod

### Key Patterns
- **Config-based routing** (not file-based)
- **Layout-based authentication** protection
- **Singleton patterns** for database, auth, and AI clients
- **Credit-based billing** system
- **Type-safe validation** with Zod

## 🛠️ Setup

### Prerequisites
- Node.js 20+
- PostgreSQL database
- OpenAI API key

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <your-repo>
   cd tws-foundations
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your values:
   - `DATABASE_URL` - PostgreSQL connection string
   - `BETTER_AUTH_SECRET` - Random secret for session encryption
   - `OPENAI_API_KEY` - Your OpenAI API key
   - (Optional) Polar.sh credentials for billing

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
app/
├── lib/
│   ├── auth.server.ts      # BetterAuth configuration
│   ├── session.server.ts   # Session helpers
│   ├── ai.ts              # OpenAI client
│   ├── cache.ts           # FlatCache setup
│   ├── utils.ts           # Utility functions
│   └── validations.ts     # Zod schemas
├── routes/
│   ├── api/
│   │   ├── auth.ts        # BetterAuth handler
│   │   └── completion.ts  # AI completion endpoint
│   ├── authenticated.tsx  # Protected layout
│   ├── dashboard.tsx      # User dashboard
│   ├── chat.tsx          # AI chat interface
│   ├── sign-in.tsx       # Sign in page
│   ├── sign-up.tsx       # Sign up page
│   └── sign-out.tsx      # Sign out handler
├── db.server.ts          # Prisma client singleton
└── routes.ts             # Config-based routing
```

## 🔧 Configuration

### Routing
Routes are configured in `app/routes.ts` using React Router 7's config-based approach:

```typescript
export default [
  index("routes/home.tsx"),
  layout("routes/authenticated.tsx", [
    route("dashboard", "routes/dashboard.tsx"),
    route("chat", "routes/chat.tsx"),
  ]),
  ...prefix("api", [
    route("auth/*", "routes/api/auth.ts"),
  ]),
] satisfies RouteConfig;
```

### Authentication
BetterAuth is configured with:
- Email/password authentication
- Prisma adapter for database storage
- 7-day session expiry
- Polar.sh integration for billing

### Database Schema
The Prisma schema includes:
- User model with Polar billing fields
- BetterAuth required models (Account, Session, Verification)
- Credit system for usage tracking

## 🎯 Usage Examples

### Adding a New Protected Route
1. Add route to `app/routes.ts`
2. Create route file in `app/routes/`
3. Use `requireUser()` in loader if needed

### Adding API Endpoints
1. Add route to `api` prefix in `app/routes.ts`
2. Create handler in `app/routes/api/`
3. Use session helpers for authentication

### Using AI Features
```typescript
import { useChat } from "ai/react";

const { messages, input, handleSubmit } = useChat({
  api: "/api/completion",
});
```

### Cache Usage
```typescript
import { getCachedData, setCachedData } from "~/lib/cache";

const data = getCachedData("key");
setCachedData("key", data, 300); // 5 minutes TTL
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
Make sure to set all required environment variables in your production environment.

### Database Migrations
```bash
npx prisma migrate deploy
```

## 📚 Learn More

- [React Router 7 Docs](https://reactrouter.com)
- [BetterAuth Docs](https://better-auth.com)
- [Polar.sh Docs](https://docs.polar.sh)
- [Prisma Docs](https://prisma.io/docs)
- [Vercel AI SDK](https://sdk.vercel.ai)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
