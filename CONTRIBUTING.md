# Contributing to Iridium

Thanks for your interest in contributing to Iridium! This document outlines the process for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/iridium.git
   cd iridium
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Fill in DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
   ```
5. Set up the database:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run seed
   ```
6. Start the dev server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates

### Before Submitting

1. Run type checking:
   ```bash
   npm run typecheck
   ```
2. Run tests:
   ```bash
   npm run test:run
   ```
3. Run e2e tests (optional but appreciated):
   ```bash
   npm run e2e
   ```
4. Format your code:
   ```bash
   npm run format
   ```

## Code Guidelines

### Architecture

- **Model layer**: All database operations go through `app/models/` - never call Prisma directly in routes
- **Config-based routing**: Routes are defined in `app/routes.ts`, not via file-system conventions
- **CVA components**: UI components use Class Variance Authority with DaisyUI

### Patterns to Follow

- Use `cx()` for className merging (not `cn`)
- Import route types as `./+types/[routeName]` (never with `../`)
- Access loader data via `loaderData` prop (not `useLoaderData` hook)
- Use Zod schemas for validation on both client and server
- Use React 19 meta tags directly in components (not `meta()` export)

### What We're Looking For

- Bug fixes
- Documentation improvements
- Performance improvements
- Accessibility improvements
- Test coverage improvements

### What's Out of Scope

To keep Iridium lean, these are intentionally not included:

- Multi-tenancy/organizations
- E-commerce/shop flows
- Additional auth providers (stick with email/password)
- Major new features without prior discussion

## Submitting a Pull Request

1. Create a branch from `dev` (not `main`)
2. Make your changes
3. Run `npm run typecheck` and fix any errors
4. Write a clear PR description explaining:
   - What the change does
   - Why it's needed
   - How to test it
5. Submit your PR against the `dev` branch

## Reporting Issues

- Use the bug report template for bugs
- Use the feature request template for enhancements
- Search existing issues before creating a new one

## Questions?

Open a discussion or issue if you have questions about contributing.
