---
agent: 'agent'
tools:
    [
        'vscode',
        'execute',
        'read',
        'edit',
        'search',
        'web',
        'context7/*',
        'agent',
        'todo',
    ]
description: 'Generate a complete vertical slice feature across all application layers'
---

# Add Vertical Slice Feature

You are implementing a **vertical slice** - a complete, production-ready feature that spans all layers of the application stack (database → API → UI).

## Core Workflow

Follow the comprehensive vertical slice pattern documented in:

📚 **`.github/instructions/vertical-slice.instructions.md`**

That instruction file contains:
- Complete 11-step implementation workflow
- Schema → Database → Model → API → UI layers
- Validation patterns with Zod
- Testing checklists
- Common pitfalls and anti-patterns

## Quick Reference

### Step 1: Define the Feature
Ask the user:
- Feature purpose (user story format)
- Scope (Create, Read, Update, Delete?)
- Authentication requirements
- Data model and relations

### Step 2: Plan the Layers
Identify which layers are affected:
- [ ] Schema Layer (Zod validation)
- [ ] Database Layer (Prisma model)
- [ ] Model Layer (Data access functions)
- [ ] API Layer (RESTful endpoint)
- [ ] UI Layer (User interface)
- [ ] Routing (Route registration)

Present plan and confirm before implementing.

### Step 3: Implement Following Vertical Slice Pattern
Execute all steps from `vertical-slice.instructions.md`:
1. Define Zod schemas in `app/lib/validations.ts`
2. Update Prisma schema in `prisma/schema.prisma`
3. Create model functions in `app/models/[feature].server.ts`
4. Create API endpoint in `app/routes/api/[feature].ts`
5. Create UI route in `app/routes/[feature].tsx`
6. Register both routes in `app/routes.ts`
7. Run `npm run typecheck` to generate types
8. Test all CRUD operations manually

### Step 4: Quality Checklist
Validate completeness (see full checklist in instruction file):
- [ ] All layers implemented
- [ ] Validation on client AND server
- [ ] Error handling with try-catch
- [ ] Loading states in UI
- [ ] DaisyUI styling applied
- [ ] Manual testing completed

## Important Reminders

**The vertical-slice instruction file is comprehensive** - use it as your primary reference. This prompt is just a thin orchestrator.

**Anti-Patterns to Avoid:**
- ❌ Only implementing UI without API/database
- ❌ Skipping validation ("I'll add it later")
- ❌ Direct Prisma calls in routes (use model layer)
- ❌ No error handling
- ❌ No loading states

## Reference Implementations

See these files as canonical examples:
- **Validation:** `app/lib/validations.ts` - `profileUpdateSchema`
- **Model Layer:** `app/models/user.server.ts`
- **API Endpoint:** `app/routes/api/profile.ts`
- **UI Route:** `app/routes/profile.tsx`

Execute the vertical slice workflow by following the comprehensive documentation in `vertical-slice.instructions.md`.
