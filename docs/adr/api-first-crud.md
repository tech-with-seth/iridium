# API-First CRUD Pattern

**Status**: Accepted

**Date**: 2025-01-15

## Context

When building features that require Create, Read, Update, Delete (CRUD) operations, there are several architectural patterns:

1. **Inline Pattern**: Put all logic directly in UI route loaders/actions
2. **RPC Pattern**: Each operation gets its own endpoint
3. **API-First Pattern**: Build RESTful API endpoints, UI consumes them
4. **GraphQL**: Use GraphQL for all data operations

In React Router 7, both UI routes and API routes can have loaders/actions, creating two options:
- Handle CRUD directly in UI route actions
- Create separate API endpoints and call them from UI

## Decision

Use an **API-First Pattern** where CRUD operations are implemented as API endpoints in `app/routes/api/[resource].ts`, and UI routes consume these APIs via `useFetcher()`.

Structure:
```
app/models/[entity].server.ts        # Model layer (database)
  ↳ CRUD functions (getUserProfile, updateUser, deleteUser)

app/routes/api/[resource].ts         # API endpoint (business logic)
  ↳ loader()  - GET (read)
  ↳ action()  - POST (create), PUT (update), DELETE (delete)
  ↳ requireUser() for auth
  ↳ getValidatedFormData() for validation
  ↳ Call model functions

app/routes/[resource].tsx            # UI route (presentation)
  ↳ loader()   - Fetch initial data
  ↳ Component  - useFetcher() to call API
  ↳ Form validation and UX
```

## Decision

Follow the API-first pattern established by the authentication endpoint (`/api/auth/authenticate`).

## Consequences

### Positive

- **RESTful**: Standard HTTP methods map to CRUD operations
- **Reusable**: API can be called from anywhere (UI, CLI, webhooks, etc.)
- **Separation of Concerns**: API logic separate from UI rendering
- **Testable**: Can test API endpoints independently
- **Programmatic Access**: Enables future integrations, mobile apps, etc.
- **Consistent Pattern**: Follows established `/api/auth` endpoint pattern
- **Type Safety**: Separate concerns allow better type boundaries

### Negative

- **More Files**: Three files per feature (model, API route, UI route)
- **Network Call**: UI makes additional request to API (though same server)
- **Boilerplate**: More code than inline actions
- **Learning Curve**: Team must understand model → API → UI flow

### Neutral

- **Not Pure REST**: Still uses React Router conventions (loader/action)
- **Same Server**: API and UI on same server (not microservices)
- **No API Versioning**: Not needed for internal APIs
