# Prisma Custom Output Location

**Status**: Accepted

**Date**: 2025-01-15

## Context

By default, Prisma generates the client to `node_modules/.prisma/client`. In this project, we need tighter control over imports and want the generated client closer to our application code.

Options:
- Default location (`node_modules/.prisma/client`)
- Custom location within `app/` directory
- Custom location in project root

Requirements:
- Consistent imports using `~/generated/prisma/client`
- Easy access to generated types
- Clear separation from node_modules
- Compatible with TypeScript path mapping

## Decision

Configure Prisma to output the client to `app/generated/prisma`.

In `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../app/generated/prisma"
}
```

## Consequences

### Positive

- **Consistent Imports**: All imports use `~/generated/prisma/client`
- **Type Discovery**: Generated types are in app directory for better IDE support
- **Explicit**: Clear that Prisma client is generated code
- **Version Control**: Can optionally gitignore generated files more easily
- **Debugging**: Easier to inspect generated client code

### Negative

- **Non-Standard**: Deviates from Prisma default, may confuse some developers
- **Build Step**: Must run `npx prisma generate` after schema changes
- **Path Mapping**: Requires `~/generated/prisma/client` in TypeScript paths
- **Git Noise**: Generated files in app directory (should be gitignored)

### Neutral

- **BetterAuth Adapter**: Must specify custom output in adapter config
- **Database Singleton**: Still requires singleton pattern to prevent connection pooling issues
