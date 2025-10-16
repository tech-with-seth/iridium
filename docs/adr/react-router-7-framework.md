# React Router 7 Framework

**Status**: Accepted

**Date**: 2025-01-15

## Context

We needed a modern full-stack React framework for building a SaaS boilerplate. The main contenders were:
- Next.js (App Router)
- Remix
- React Router 7
- Vite + React (client-side only)

Key requirements:
- Server-side rendering (SSR)
- Type-safe routing
- Fast development experience
- Modern tooling (Vite)
- Fine-grained control over routing patterns

## Decision

Use React Router 7 as the foundation framework.

React Router 7 is the evolution of Remix, built on modern web standards with Vite integration. It provides:
- Config-based routing via `routes.ts`
- Type-safe route modules with `./+types/[route]`
- Excellent DX with Vite's fast HMR
- Loaders and actions for data handling
- Built-in support for progressive enhancement

## Consequences

### Positive

- **Fast Development**: Vite provides instant HMR and build times
- **Type Safety**: Route types are auto-generated from config
- **Flexibility**: Config-based routing allows complex routing patterns (layouts, prefixes, etc.)
- **Modern Standards**: Built on Web Fetch API, Response, Request
- **Small Bundle**: No framework overhead compared to Next.js
- **Full Control**: Not opinionated about data fetching or state management

### Negative

- **Smaller Ecosystem**: Fewer third-party integrations than Next.js
- **More Manual Setup**: No built-in image optimization, i18n, etc.
- **Learning Curve**: Different patterns from Next.js (loaders vs. RSC)
- **Documentation**: Less mature than Next.js docs

### Neutral

- **SSR Approach**: Uses traditional loaders instead of React Server Components
- **Deployment**: Requires Node.js server (not static export like some Next.js patterns)
- **Community Size**: Smaller but growing community
