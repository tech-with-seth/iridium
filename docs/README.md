# Iridium Documentation

Welcome to the Iridium documentation. This project is a modern full-stack web application built with React Router 7, Better Auth, and a carefully selected set of technologies designed for developer experience and production reliability.

## Overview

Iridium is a production-ready starter template that includes authentication, database management, billing integration, analytics, and a comprehensive component system. It follows modern best practices and patterns for building scalable web applications.

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

- **[Getting Started](./GETTING_STARTED.md)** - Quick start guide with setup steps and common commands
- [Authentication](./authentication.md) - Better Auth setup with Polar billing integration
- [Email](./email.md) - Resend email service with React Email templates
- [Routing](./routing.md) - React Router 7 patterns and conventions
- [Form Building](./form-building.md) - Comprehensive form patterns with Zod and React Hook Form
- [Components](./components.md) - DaisyUI and CVA component patterns
- [Custom Theming](./custom-theming.md) - Creating and customizing DaisyUI themes
- [AI Chat Integration](./ai.md) - Vercel AI SDK endpoint and streaming chat workflow
- [LLM Analytics](./llm-analytics.md) - PostHog LLM analytics with Vercel AI SDK integration
- [Image Handling](./image-handling.md) - Cloudinary integration for image uploads and transformations

### Development

- **[Build Your First Feature](./build-your-first-feature.md)** - Step-by-step guide for building features
- **[Ralph: Autonomous PRD Execution](./ralph.md)** - AI agent loop for implementing PRDs automatically
- [Development Workflow](./development.md) - Day-to-day development practices
- [Testing](./testing.md) - Unit and end-to-end testing with Vitest and Playwright
- [Contributing](./contributing.md) - Guidelines for contributing to the project
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions

### Deployment

- **[Deployment Quick Start](./deployment-quick-start.md)** - ⚡ Fast 5-minute Railway deployment
- [Deployment Guide](./deployment.md) - Production deployment instructions for all platforms

## Architecture Decisions

We document significant architectural decisions in the [decisions](./decisions/README.md) directory. These Architecture Decision Records explain the context, options considered, and rationale for key technology choices.

### Key Decisions

- [001: React Router 7](./decisions/001-react-router-7.md)
- [002: Better Auth](./decisions/002-better-auth.md)
- [003: PostgreSQL and Prisma](./decisions/003-postgresql-prisma.md)
- [004: DaisyUI](./decisions/004-daisyui.md)
- [005: CVA (Class Variance Authority)](./decisions/005-cva.md)
- [006: Zod Validation](./decisions/006-zod-validation.md)
- [007: Client-Side Caching](./decisions/007-client-side-caching.md)
- [007: Simplified CI/CD Testing](./decisions/007-simplified-ci-testing.md)
- [008: PostHog Analytics](./decisions/008-posthog.md)
- [009: Polar Billing](./decisions/009-polar-billing.md)
- [010: Resend Email](./decisions/010-resend-email.md)

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
- **Resend** - Transactional email service
- **React Email** - Email template development
- **OpenAI** - AI SDK integration
- **Cloudinary** - Image upload and transformation service

### Testing

- **Vitest** - Unit and integration testing
- **Playwright** - End-to-end testing
- **Testing Library** - React component testing utilities

### Development

- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Zod** - Runtime validation

## Project Structure

```text
iridium/
├── app/
│   ├── routes/              # Route components and loaders
│   ├── components/          # Reusable UI components
│   ├── emails/              # React Email templates
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
