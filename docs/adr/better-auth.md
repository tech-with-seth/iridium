# BetterAuth for Authentication

**Status**: Accepted

**Date**: 2025-01-15

## Context

Authentication is critical for a SaaS boilerplate. Options considered:
- NextAuth.js / Auth.js
- Clerk
- Supabase Auth
- BetterAuth
- Custom auth with Passport.js

Requirements:
- Email/password authentication
- Database session management (not JWT-only)
- Plugin ecosystem for extensions (billing, RBAC, etc.)
- Self-hosted (no third-party services required)
- TypeScript-first
- Integration with billing provider (Polar)

## Decision

Use BetterAuth for authentication with Prisma adapter.

BetterAuth is a modern, TypeScript-first authentication library designed for flexibility and extensibility. It provides:
- Framework-agnostic core with React Router integration
- Database adapters (Prisma, Drizzle, etc.)
- Plugin system for extending functionality
- Built-in social providers
- Session management with secure cookies
- Client SDK with React hooks

## Consequences

### Positive

- **Plugin Ecosystem**: Official plugins for Polar, 2FA, passkeys, etc.
- **TypeScript Native**: Full type safety across server and client
- **Flexibility**: Not tied to specific frameworks or databases
- **Self-Hosted**: Complete control over auth data and logic
- **Modern API**: Clean, intuitive API design
- **Polar Integration**: First-class `@polar-sh/better-auth` plugin
- **Session-Based**: More secure than JWT-only approaches for web apps

### Negative

- **Young Project**: Less battle-tested than Auth.js or Clerk
- **Smaller Community**: Fewer Stack Overflow answers and tutorials
- **Manual UI**: No pre-built auth components (must build forms)
- **Migration Path**: Harder to migrate away from if needed

### Neutral

- **Database Required**: Can't use in serverless-only environments (by design)
- **Cookie-Based**: Requires server-side session storage (more secure for web)
- **Documentation**: Good but still growing
