# TWS Foundations Documentation

Welcome to the TWS Foundations documentation. This project is a modern full-stack web application built with React Router 7, Better Auth, and a carefully selected set of technologies designed for developer experience and production reliability.

## Overview

TWS Foundations is a production-ready starter template that includes authentication, database management, billing integration, analytics, and a comprehensive component system. It follows modern best practices and patterns for building scalable web applications.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Seed the database
npm run seed

# Start development server
npm run dev
```

## Documentation Guides

### Core Concepts

- [Authentication](./authentication.md) - Better Auth setup with Polar billing integration
- [Routing](./routing.md) - React Router 7 patterns and conventions
- [Forms](./forms.md) - Form validation with Zod and React Hook Form
- [Components](./components.md) - DaisyUI and CVA component patterns
- [Custom Theming](./custom-theming.md) - Creating and customizing DaisyUI themes

### Development

- [Development Workflow](./development.md) - Day-to-day development practices
- [Testing](./testing.md) - Unit and end-to-end testing with Vitest and Playwright
- [Contributing](./contributing.md) - Guidelines for contributing to the project
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions

### Deployment

- [Deployment Guide](./deployment.md) - Production deployment instructions

## Architecture Decisions

We document significant architectural decisions in the [decisions](./decisions/README.md) directory. These Architecture Decision Records explain the context, options considered, and rationale for key technology choices.

### Key Decisions

- [001: React Router 7](./decisions/001-react-router-7.md)
- [002: Better Auth](./decisions/002-better-auth.md)
- [003: PostgreSQL and Prisma](./decisions/003-postgresql-prisma.md)
- [004: DaisyUI](./decisions/004-daisyui.md)
- [005: CVA (Class Variance Authority)](./decisions/005-cva.md)
- [006: Zod Validation](./decisions/006-zod-validation.md)
- [007: Flat-Cache](./decisions/007-flat-cache.md)
- [008: PostHog Analytics](./decisions/008-posthog.md)
- [009: Polar Billing](./decisions/009-polar-billing.md)

## Technology Stack

### Frontend

- **React 19** - User interface library
- **React Router 7** - Framework and routing
- **DaisyUI** - Component library built on Tailwind CSS
- **CVA** - Component variant management
- **Tailwind CSS** - Utility-first styling

### Backend

- **React Router 7 Server** - Server-side rendering and API routes
- **Better Auth** - Authentication and session management
- **Prisma** - Database ORM and migrations
- **PostgreSQL** - Primary database

### Integrations

- **Polar** - Billing and subscription management
- **PostHog** - Product analytics and feature flags
- **OpenAI** - AI SDK integration

### Testing

- **Vitest** - Unit and integration testing
- **Playwright** - End-to-end testing
- **Testing Library** - React component testing utilities

### Development

- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Zod** - Runtime validation

## Project Structure

```
tws-foundations/
├── app/
│   ├── routes/              # Route components and loaders
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions and configurations
│   ├── models/              # Data models and business logic
│   ├── hooks/               # Custom React hooks
│   ├── middleware/          # Request middleware
│   └── test/                # Test utilities and setup
├── docs/                    # Documentation (you are here)
├── prisma/                  # Database schema and migrations
├── public/                  # Static assets
└── tests/                   # End-to-end tests

```

## Getting Help

If you encounter issues or have questions:

1. Check the [Troubleshooting Guide](./troubleshooting.md)
2. Review the relevant documentation guide
3. Search existing issues in the repository
4. Open a new issue with details about your problem

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](./contributing.md) to get started.

## License

This project is private and proprietary.
