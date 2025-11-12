# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for Iridium. ADRs document significant architectural decisions made during the development of the project.

## What is an ADR?

An Architecture Decision Record (ADR) captures an important architectural decision made along with its context and consequences. ADRs help teams:

- Understand why decisions were made
- Onboard new team members
- Evaluate future changes
- Maintain consistency
- Document trade-offs

## Format

Each ADR follows this structure:

- **Status**: Current state (Accepted, Superseded, Deprecated)
- **Context**: The situation and forces at play
- **Decision**: The change being proposed or decided
- **Consequences**: The positive and negative outcomes

## Current ADRs

### Infrastructure

- [001: React Router 7](./001-react-router-7.md) - Full-stack React framework
- [003: PostgreSQL and Prisma](./003-postgresql-prisma.md) - Database and ORM

### Authentication and Authorization

- [002: Better Auth](./002-better-auth.md) - Authentication solution

### User Interface

- [004: DaisyUI](./004-daisyui.md) - Component library
- [005: CVA (Class Variance Authority)](./005-cva.md) - Component variants

### Validation

- [006: Zod Validation](./006-zod-validation.md) - Schema validation

### Performance

- [007: Flat-Cache](./007-flat-cache.md) - Server-side caching

### Testing and CI/CD

- [007: Simplified CI Testing](./007-simplified-ci-testing.md) - Testing strategy and CI/CD approach

### Analytics and Billing

- [008: PostHog Analytics](./008-posthog.md) - Product analytics
- [009: Polar Billing](./009-polar-billing.md) - Subscription management

### Email and Communication

- [010: Resend Email](./010-resend-email.md) - Transactional email service

## Creating a New ADR

When making a significant architectural decision:

1. Copy the ADR template
2. Number it sequentially (e.g., `010-decision-name.md`)
3. Fill out all sections
4. Get review from team
5. Merge when consensus is reached

### ADR Template

```markdown
# [Number]: [Title]

## Status

Accepted | Proposed | Superseded | Deprecated

## Context

What is the issue that we're seeing that is motivating this decision or change?

## Decision

What is the change that we're proposing and/or doing?

## Consequences

What becomes easier or more difficult to do because of this change?

### Positive

- Benefit 1
- Benefit 2

### Negative

- Trade-off 1
- Trade-off 2

### Neutral

- Impact 1

## Alternatives Considered

What other options did we consider?

### Alternative 1

Description and why it was not chosen.

### Alternative 2

Description and why it was not chosen.

## References

- [Link to relevant documentation]
- [Link to discussions or RFCs]
```

## When to Create an ADR

Create an ADR when:

- Adopting a new framework or library
- Changing database technology
- Modifying authentication approach
- Restructuring the application
- Making trade-offs between options
- Establishing new patterns or conventions

## When Not to Create an ADR

Do not create an ADR for:

- Implementation details
- Bug fixes
- Refactoring without architectural impact
- Dependency updates
- Documentation improvements

## Updating ADRs

ADRs are immutable once accepted. To change a decision:

1. Create a new ADR
2. Reference the old ADR
3. Mark the old ADR as "Superseded"
4. Document why the change is needed

## Further Reading

- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR GitHub Organization](https://adr.github.io/)
- [When to Use ADRs](https://www.thoughtworks.com/en-us/radar/techniques/lightweight-architecture-decision-records)
