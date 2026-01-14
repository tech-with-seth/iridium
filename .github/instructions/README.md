# VS Code Copilot Instructions

This directory contains **auto-applied coding guidelines** that VS Code Copilot loads based on file patterns.

## How It Works

1. Each `.instructions.md` file has YAML frontmatter with `applyTo` glob patterns
2. When you edit a file matching those patterns, the instructions auto-apply
3. Copilot uses these guidelines to generate contextually appropriate code

**You don't manually reference these files** - they're applied automatically.

## File Format

```yaml
---
applyTo: 'app/routes/**/*.tsx,app/routes.ts'
---

# Instruction Title

Content here...
```

### Frontmatter Options

| Field | Purpose | Example |
|-------|---------|---------|
| `applyTo` | Glob patterns for file matching | `'app/routes/**/*.tsx'` |
| `alwaysApply` | Apply to all files regardless of pattern | `true` |
| `description` | Brief description (optional) | `'React Router 7 patterns'` |

## Available Instructions

### Core Patterns (Always Apply)

| File | Purpose |
|------|---------|
| `git-workflow.instructions.md` | Git branching and merge strategy |
| `vertical-slice.instructions.md` | Vertical slice architecture |
| `horizontal-slice.instructions.md` | Horizontal slice architecture |
| `pure-functions.instructions.md` | Pure function patterns |
| `voice.instructions.md` | Voice and tone guidelines |

### Framework-Specific

| File | Applies To | Purpose |
|------|------------|---------|
| `react-router.instructions.md` | `app/routes/**/*` | React Router 7 patterns |
| `prisma.instructions.md` | `prisma/**/*`, `app/models/**/*` | Prisma ORM patterns |
| `better-auth.instructions.md` | `app/lib/auth*`, `app/lib/session*` | Authentication patterns |
| `cva.instructions.md` | `app/components/**/*` | CVA component variants |
| `daisyui.instructions.md` | `**` (always) | DaisyUI 5 components |
| `zod.instructions.md` | `app/lib/validations*` | Zod validation patterns |
| `react-hook-form.instructions.md` | `app/lib/form*` | Form handling patterns |

### Pattern-Specific

| File | Applies To | Purpose |
|------|------------|---------|
| `form-validation.instructions.md` | `app/lib/validations*`, `app/lib/form*` | Hybrid form validation |
| `crud-pattern.instructions.md` | `app/routes/api/**/*`, `app/models/**/*` | CRUD operations |
| `component-patterns.instructions.md` | `app/components/**/*` | UI component patterns |
| `error-boundaries.instructions.md` | `app/routes/**/*.tsx` | Error handling |
| `role-based-access-control.instructions.md` | `app/lib/session*`, `app/middleware/**/*` | RBAC patterns |
| `seo.instructions.md` | `app/routes/**/*.tsx` | SEO meta tags |

### Integration-Specific

| File | Applies To | Purpose |
|------|------------|---------|
| `posthog.instructions.md` | `app/lib/posthog*`, `app/models/analytics*` | Analytics integration |
| `feature-flags.instructions.md` | `app/models/feature-flags*` | Feature flag patterns |
| `resend.instructions.md` | `app/emails/**/*`, `app/models/email*` | Email integration |
| `polar.instructions.md` | `app/models/polar*`, `app/routes/api/webhooks/**/*` | Billing integration |
| `ai-tool-calling.instructions.md` | `app/lib/ai*`, `app/routes/api/chat*` | AI tool calling |
| `charting.instructions.md` | `app/components/charts/**/*` | Data visualization |
| `client-side-caching.instructions.md` | `app/lib/cache*` | Caching strategies |

### Testing

| File | Applies To | Purpose |
|------|------------|---------|
| `unit-testing.instructions.md` | `**/*.test.ts`, `**/*.test.tsx` | Vitest unit tests |
| `playwright.instructions.md` | `e2e/**/*`, `playwright.config.ts` | E2E testing |

### Infrastructure

| File | Applies To | Purpose |
|------|------------|---------|
| `railway-deployment.instructions.md` | `railway.json`, `Dockerfile` | Deployment patterns |
| `env.instructions.md` | `.env*`, `vite.config.ts` | Environment variables |
| `error-tracking.instructions.md` | `app/lib/error*` | Error monitoring |

### Special

| File | Applies To | Purpose |
|------|------------|---------|
| `ralph.instructions.md` | `plans/**/*` | Ralph automation (Claude CLI) |

## Instructions vs Skills vs Prompts

| System | Purpose | Trigger |
|--------|---------|---------|
| **Instructions** | Complete reference documentation | Auto-applied based on `applyTo` file patterns |
| **Skills** | Quick-start guides with templates | Auto-triggered when task matches description |
| **Prompts** | Multi-step workflows | User-invoked via `@workspace /promptName` |

**Hierarchy:**
- **Instructions** are the source of truth (comprehensive documentation)
- **Skills** reference instructions for quick guidance
- **Prompts** orchestrate multiple instructions into workflows

## Creating New Instructions

1. Create file: `.github/instructions/[topic].instructions.md`
2. Add frontmatter with `applyTo` patterns
3. Write comprehensive documentation
4. Update this README

**Guidelines:**
- Instructions are reference docs, not step-by-step tutorials
- Include examples, anti-patterns, and troubleshooting
- Use descriptive headings for easy navigation
- Link to related instructions where relevant

## Related Files

- **Skills**: `.github/skills/*/SKILL.md` - Auto-triggered quick references
- **Prompts**: `.github/prompts/*.prompt.md` - User-invoked workflows
- **CLAUDE.md**: High-level architecture documentation

## Documentation

- [VS Code Custom Instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)
- [VS Code Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- [VS Code Prompt Files](https://code.visualstudio.com/docs/copilot/customization/prompt-files)
