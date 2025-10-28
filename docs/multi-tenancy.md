# Multi-Tenancy in Iridium

Iridium includes a comprehensive multi-tenancy implementation that allows users to create and manage multiple organizations, invite team members, and control access through role-based permissions.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Database Schema](#database-schema)
- [Organization Management](#organization-management)
- [Member Management](#member-management)
- [Invitation System](#invitation-system)
- [Role-Based Access Control](#role-based-access-control)
- [API Endpoints](#api-endpoints)
- [UI Components](#ui-components)
- [Usage Patterns](#usage-patterns)

## Architecture Overview

The multi-tenancy system follows Iridium's established architectural patterns:

### Model Layer Pattern

All database operations go through model functions in `app/models/`:

- `organization.server.ts` - Organization CRUD and membership management
- `invitation.server.ts` - Invitation lifecycle management

### API-First CRUD

All mutations happen through RESTful API endpoints:

- `/api/organizations` - Organization management
- `/api/organizations/:slug/members` - Member management
- `/api/organizations/:slug/invitations` - Invitation management
- `/api/invitations/:token/accept` - Accept invitations

### Middleware Architecture

Organization context is loaded via middleware in layout routes:

- `authMiddleware` - Ensures user is authenticated
- `organizationMiddleware` - Loads organization and verifies membership

### Hybrid Validation

All forms use Zod schemas validated on both client and server:

- Client: React Hook Form with `zodResolver`
- Server: `getValidatedFormData()` with same Zod schemas

## Database Schema

### Organization Model

```prisma
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  ownerId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  owner   User                   @relation("OrganizationOwner", fields: [ownerId], references: [id])
  members OrganizationMember[]
  invitations OrganizationInvitation[]
}
```

**Key Fields:**

- `slug` - URL-friendly unique identifier (used in routes)
- `ownerId` - User who created the organization (always has OWNER role)
- `deletedAt` - Soft delete timestamp (null = active)

### OrganizationMember Model

```prisma
model OrganizationMember {
  id             String           @id @default(cuid())
  organizationId String
  userId         String
  role           OrganizationRole @default(MEMBER)
  createdAt      DateTime         @default(now())

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([organizationId, userId])
}
```

**Key Fields:**

- `role` - OrganizationRole enum (OWNER, ADMIN, MEMBER)
- `@@unique([organizationId, userId])` - Prevents duplicate memberships

### OrganizationInvitation Model

```prisma
model OrganizationInvitation {
  id             String           @id @default(cuid())
  organizationId String
  email          String
  role           OrganizationRole @default(MEMBER)
  token          String           @unique
  invitedBy      String
  expiresAt      DateTime
  acceptedAt     DateTime?
  createdAt      DateTime         @default(now())

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  inviter      User         @relation(fields: [invitedBy], references: [id])

  @@unique([organizationId, email])
}
```

**Key Fields:**

- `token` - Secure random token for invitation links
- `expiresAt` - 7-day TTL from creation
- `acceptedAt` - Null until accepted (pending invitations)

### OrganizationRole Enum

```prisma
enum OrganizationRole {
  OWNER   // Full control, cannot be removed, can delete org
  ADMIN   // Manage members, update settings
  MEMBER  // View and use org resources
}
```

## Organization Management

### Creating Organizations

**Signup Flow:**
When users sign up, a personal organization is automatically created:

- Slug: Email prefix (before @) converted to URL-safe format
- Name: User's full name or email prefix
- Role: Creator is automatically assigned OWNER role

**Manual Creation:**
Users can create additional organizations via `/organizations/new`:

```typescript
// API: POST /api/organizations
{
  name: "Acme Corporation",
  slug: "acme-corporation"
}
```

### Updating Organizations

Only ADMIN and OWNER roles can update organization settings:

```typescript
// API: PUT /api/organizations/:slug
{
  name: "New Name",
  slug: "new-slug"
}
```

### Deleting Organizations

Only OWNER can delete (soft delete):

```typescript
// API: DELETE /api/organizations/:slug
```

Soft delete sets `deletedAt` timestamp. Organization and all members/invitations are hidden but preserved in database.

## Member Management

### Adding Members

Members can be added via invitation system (see [Invitation System](#invitation-system)).

### Updating Member Roles

ADMIN and OWNER can update member roles:

```typescript
// API: PUT /api/organizations/:slug/members
{
  userId: "user-id",
  role: "ADMIN"
}
```

**Restrictions:**

- Cannot change OWNER role
- Cannot remove yourself if you're the only OWNER

### Removing Members

ADMIN and OWNER can remove members, or members can remove themselves:

```typescript
// API: DELETE /api/organizations/:slug/members
{
  userId: "user-id"
}
```

**Restrictions:**

- Cannot remove OWNER
- Must have at least one OWNER

## Invitation System

### Creating Invitations

ADMIN and OWNER can invite new members:

```typescript
// API: POST /api/organizations/:slug/invitations
{
  email: "new.member@example.com",
  role: "MEMBER"
}
```

**Process:**

1. Check if user is already a member
2. Check for existing pending invitation
3. Generate secure random token
4. Set expiration to 7 days
5. Send email with invitation link

**Restrictions:**

- Cannot invite existing members
- Cannot create duplicate invitations for same email

### Accepting Invitations

Users accept invitations via link: `/invitations/:token`

```typescript
// API: POST /api/invitations/:token/accept
```

**Process:**

1. Validate token exists and not expired
2. Check email matches authenticated user
3. Create OrganizationMember record
4. Mark invitation as accepted
5. Redirect to organization dashboard

### Revoking Invitations

ADMIN and OWNER can revoke pending invitations:

```typescript
// API: DELETE /api/organizations/:slug/invitations
{
  invitationId: "invitation-id"
}
```

## Role-Based Access Control

### Hierarchical Permissions

Roles have hierarchical permissions:

```
OWNER > ADMIN > MEMBER
```

**OWNER:**

- All ADMIN permissions
- Delete organization
- Cannot be removed by others
- Cannot have role changed

**ADMIN:**

- Invite members
- Remove members (except OWNER)
- Update member roles (except OWNER)
- Update organization settings
- View billing

**MEMBER:**

- View organization
- Use organization resources
- Remove themselves

### Checking Permissions

Use `hasOrganizationRole()` with minimum required role:

```typescript
import { hasOrganizationRole } from '~/models/organization.server';

// Check if user has at least ADMIN role
const isAdmin = await hasOrganizationRole(
  userId,
  organizationId,
  'ADMIN'
);

// Returns true for ADMIN and OWNER
```

## API Endpoints

### Organization Endpoints

#### List Organizations

```
GET /api/organizations
```

Returns all organizations user is a member of.

#### Create Organization

```
POST /api/organizations
Body: { name: string, slug: string }
```

Creates new organization with creator as OWNER.

#### Get Organization

```
GET /api/organizations/:slug
```

Returns organization with members list.

#### Update Organization

```
PUT /api/organizations/:slug
Body: { name?: string, slug?: string }
```

Updates organization (requires ADMIN or OWNER).

#### Delete Organization

```
DELETE /api/organizations/:slug
```

Soft deletes organization (requires OWNER).

### Member Endpoints

#### List Members

```
GET /api/organizations/:slug/members
```

Returns all members with roles.

#### Update Member Role

```
PUT /api/organizations/:slug/members
Body: { userId: string, role: OrganizationRole }
```

Updates member role (requires ADMIN or OWNER).

#### Remove Member

```
DELETE /api/organizations/:slug/members
Body: { userId: string }
```

Removes member (requires ADMIN or OWNER, or self-removal).

### Invitation Endpoints

#### List Invitations

```
GET /api/organizations/:slug/invitations
```

Returns pending invitations.

#### Create Invitation

```
POST /api/organizations/:slug/invitations
Body: { email: string, role: OrganizationRole }
```

Creates and sends invitation email.

#### Revoke Invitation

```
DELETE /api/organizations/:slug/invitations
Body: { invitationId: string }
```

Revokes pending invitation.

#### Accept Invitation

```
POST /api/invitations/:token/accept
```

Accepts invitation and creates membership.

## UI Components

### OrganizationSwitcher

Dropdown component for switching between organizations:

```tsx
import { OrganizationSwitcher } from '~/components/OrganizationSwitcher';

// Typically in header/navbar
<OrganizationSwitcher />
```

Features:

- Lists all user's organizations
- Shows current organization
- Navigate to org dashboard on selection
- "Create New" button

### Organization Layout

Protected layout with organization context:

```tsx
// app/routes/organizations.$orgSlug.tsx
export async function loader(args: Route.LoaderArgs) {
  await authMiddleware(args);
  return organizationMiddleware(args);
}
```

Child routes access context via hook:

```tsx
import { useOrganizationContext } from '~/hooks/useOrganizationContext';

const { organization, membership } = useOrganizationContext();
```

## Usage Patterns

### Creating a New Organization Feature

1. **Add Route** to `app/routes.ts`:

```typescript
layout(':orgSlug', 'routes/organizations.$orgSlug.tsx', [
  route('new-feature', 'routes/organizations.$orgSlug.new-feature.tsx')
])
```

2. **Create Route File** with organization context:

```tsx
import { useOrganizationContext } from '~/hooks/useOrganizationContext';

export default function NewFeature() {
  const { organization, membership } = useOrganizationContext();
  
  return (
    <Container>
      <h1>{organization.name} - New Feature</h1>
      <p>Your role: {membership.role}</p>
    </Container>
  );
}
```

3. **Check Permissions** if needed:

```tsx
export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const org = await getOrganizationBySlug(params.orgSlug!);
  
  // Check minimum role
  const hasAccess = await hasOrganizationRole(
    user.id,
    org.id,
    'ADMIN'
  );
  
  if (!hasAccess) {
    throw redirect('/organizations');
  }
  
  return { org };
}
```

### Scoping Data to Organizations

When storing data that belongs to an organization:

1. **Add organizationId to Model**:

```prisma
model Project {
  id             String   @id @default(cuid())
  organizationId String
  name           String
  
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
}
```

2. **Filter Queries by Organization**:

```typescript
export async function getOrganizationProjects(organizationId: string) {
  return prisma.project.findMany({
    where: { organizationId }
  });
}
```

3. **Verify Access in API Routes**:

```typescript
export async function action({ request, params }: Route.ActionArgs) {
  const user = await requireUser(request);
  const org = await getOrganizationBySlug(params.orgSlug!);
  
  // Verify user is member
  const isMember = await hasOrganizationRole(user.id, org.id, 'MEMBER');
  if (!isMember) {
    return data({ error: 'Unauthorized' }, { status: 403 });
  }
  
  // Create project scoped to organization
  const project = await createProject({
    organizationId: org.id,
    name: 'New Project'
  });
  
  return data({ project });
}
```

### Testing Multi-Tenancy

Seed script creates sample organizations:

```bash
npm run seed
```

Creates:

- Personal org for <admin@example.com> → slug: "admin"
- Personal org for <user@example.com> → slug: "user"
- Team org "Acme Corporation" → slug: "acme-corporation"
- Sample invitation for <newuser@example.com>

Test users:

- <admin@example.com> / password123 (OWNER of personal + team)
- <user@example.com> / password123 (MEMBER of team)

## Security Considerations

### Slug Validation

Organization slugs must be:

- Unique across all organizations
- URL-safe (lowercase letters, numbers, hyphens)
- Between 2-50 characters

Validated by `createOrganizationSchema` and `updateOrganizationSchema`.

### Token Security

Invitation tokens:

- Generated with `crypto.randomBytes(32)` (256-bit entropy)
- Unique constraint in database
- 7-day expiration
- Single-use (marked accepted, not deleted)

### Authorization Checks

All organization mutations require:

1. User authentication (authMiddleware)
2. Organization membership (organizationMiddleware)
3. Role-based permissions (hasOrganizationRole)

### Soft Deletes

Organizations use soft delete (`deletedAt`):

- Preserves audit trail
- Allows data recovery
- Prevents immediate cascade deletions
- Filtered out by default in queries

## Performance Considerations

### Database Indexes

Key indexes on:

- Organization.slug (unique)
- OrganizationMember.[organizationId, userId] (unique)
- OrganizationInvitation.token (unique)
- OrganizationInvitation.[organizationId, email] (unique)

### Caching

Consider caching for frequently accessed data:

- User's organization list
- Organization member counts
- Current user's role in organization

Example:

```typescript
import { cache, getUserScopedKey } from '~/lib/cache';

export async function getUserOrganizationsWithCache(userId: string) {
  const cacheKey = getUserScopedKey(userId, 'organizations');
  
  let orgs = cache.getKey(cacheKey);
  if (!orgs) {
    orgs = await getUserOrganizations(userId);
    cache.setKey(cacheKey, orgs);
  }
  
  return orgs;
}
```

### Query Optimization

Include related data in single queries:

```typescript
// Get org with members and invitations
const org = await prisma.organization.findUnique({
  where: { slug },
  include: {
    members: {
      include: { user: true }
    },
    invitations: {
      where: { acceptedAt: null }
    }
  }
});
```

## Migration Guide

### Adding Multi-Tenancy to Existing App

If adding multi-tenancy to an existing Iridium app:

1. **Run Migration**:

```bash
npx prisma migrate deploy
npx prisma generate
```

2. **Create Organizations for Existing Users**:

```typescript
// One-time script
const users = await prisma.user.findMany();

for (const user of users) {
  const emailPrefix = user.email.split('@')[0];
  const slug = emailPrefix.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  await createOrganization({
    name: user.name || emailPrefix,
    slug,
    ownerId: user.id
  });
}
```

3. **Update Existing Models** to include organizationId:

```prisma
model ExistingModel {
  // Add these fields
  organizationId String
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
}
```

4. **Migrate Existing Data** to assign to organizations:

```typescript
// Associate existing data with user's personal org
const users = await prisma.user.findMany({
  include: { ownedOrganizations: true }
});

for (const user of users) {
  const personalOrg = user.ownedOrganizations[0];
  
  await prisma.existingModel.updateMany({
    where: { userId: user.id },
    data: { organizationId: personalOrg.id }
  });
}
```

## Troubleshooting

### User Has No Organizations

Check auth middleware redirects to `/organizations/select` which shows create button.

### Cannot Access Organization

Verify:

1. User is authenticated
2. User is member of organization
3. Organization is not soft-deleted (`deletedAt` is null)

### Invitation Not Working

Check:

1. Token is valid and not expired (7-day TTL)
2. User email matches invitation email
3. User is not already a member
4. Invitation hasn't been accepted already

### Permission Denied

Verify user has required role:

- Creating/revoking invitations: ADMIN or OWNER
- Updating settings: ADMIN or OWNER
- Deleting organization: OWNER only
- Removing members: ADMIN/OWNER (except OWNER cannot be removed)

## Future Enhancements

Possible additions to multi-tenancy system:

- **Team Plans**: Different tiers with member limits
- **Custom Roles**: Beyond OWNER/ADMIN/MEMBER
- **Organization Settings**: Custom domains, branding, preferences
- **Activity Log**: Track organization changes and member actions
- **Transfer Ownership**: Change organization OWNER
- **Two-Factor Auth**: Require 2FA for organization access
- **SSO Integration**: Enterprise single sign-on
- **Data Export**: Bulk export organization data
- **Webhooks**: Notify external systems of org events

---

For more information, see:

- [Authentication Documentation](./authentication.md)
- [API Endpoints Documentation](./api-endpoints.md)
- [Role-Based Access Control](../.github/instructions/role-based-access-control.instructions.md)
