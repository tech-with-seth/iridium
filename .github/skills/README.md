# VS Code Copilot Agent Skills

This directory contains **auto-triggered skills** that VS Code Copilot loads when relevant tasks are detected.

## How It Works

Agent Skills use "progressive disclosure":
1. Copilot reads skill `name` and `description` from SKILL.md frontmatter
2. When your request matches a skill's description, Copilot loads the full skill
3. The skill provides quick-start guidance and references full documentation

**You don't manually select skills** - they activate automatically based on task relevance.

## Directory Structure

```
.github/skills/
├── create-component/
│   ├── SKILL.md           # Skill definition + quick reference
│   └── templates/         # Code templates (optional)
├── create-route/
│   ├── SKILL.md
│   └── templates/
└── ...
```

## Available Skills

### Core Development

| Skill | Auto-Triggers On | Full Reference |
|-------|------------------|----------------|
| `create-component` | "create button", "add modal" | `component-patterns.instructions.md` |
| `create-route` | "add page", "create route" | `react-router.instructions.md` |
| `create-crud-api` | "create API", "add endpoint" | `crud-pattern.instructions.md` |
| `create-form` | "add form", "create form" | `form-validation.instructions.md` |
| `create-ai-tool` | "add AI tool", "chat tool" | `ai-tool-calling.instructions.md` |

### Development & Debugging

| Skill | Auto-Triggers On | Full Reference |
|-------|------------------|----------------|
| `dev-browser` | "debug", "browse", "check page", "inspect" | N/A (Playwright MCP integration) |

### Database

| Skill | Auto-Triggers On | Full Reference |
|-------|------------------|----------------|
| `create-model` | "add database", "create model" | `prisma.instructions.md` |

### Testing

| Skill | Auto-Triggers On | Full Reference |
|-------|------------------|----------------|
| `create-unit-test` | "add tests", "write test" | `unit-testing.instructions.md` |
| `create-e2e-test` | "add E2E test", "integration test" | `playwright.instructions.md` |

### Error Handling

| Skill | Auto-Triggers On | Full Reference |
|-------|------------------|----------------|
| `add-error-boundary` | "add error handling", "404 page" | `error-boundaries.instructions.md` |

### Integrations

| Skill | Auto-Triggers On | Full Reference |
|-------|------------------|----------------|
| `create-email` | "send email", "email template" | `resend.instructions.md` |
| `add-feature-flag` | "feature flag", "A/B test" | `feature-flags.instructions.md` |
| `add-billing` | "add billing", "checkout" | `polar.instructions.md` |
| `add-chart` | "add chart", "visualize data" | `charting.instructions.md` |
| `add-caching` | "add caching", "improve performance" | `client-side-caching.instructions.md` |
| `add-seo` | "add SEO", "meta tags" | `seo.instructions.md` |

### Special

| Skill | Auto-Triggers On | Full Reference |
|-------|------------------|----------------|
| `frontend-design` | "build UI", "design page" | N/A (self-contained) |
| `ship` | "deploy", "ship", "debug deployment" | `railway-deployment.instructions.md` |
| `ralph` | Ralph automation | `ralph.instructions.md` |
| `prd` | PRD generation | N/A |

## SKILL.md Format

```yaml
---
name: skill-name
description: Brief description of what this skill does and when to use it.
---

# Skill Title

## When to Use
- Trigger conditions

## Quick Start
- Essential patterns

## Checklist
- [ ] Step 1
- [ ] Step 2

## Full Reference
See `.github/instructions/[pattern].instructions.md`
```

## Skills vs Instructions vs Prompts

| System | Purpose | Trigger |
|--------|---------|---------|
| **Instructions** | Complete reference documentation | Auto-applied based on `applyTo` file patterns |
| **Skills** | Quick-start guides with templates | Auto-triggered when task matches description |
| **Prompts** | Multi-step workflows | User-invoked via `@workspace /promptName` |

**Hierarchy:**
- Skills reference Instructions (don't duplicate)
- Prompts orchestrate multiple Instructions into workflows
- Instructions are the source of truth

## Creating New Skills

1. Create folder: `.github/skills/[skill-name]/`
2. Add `SKILL.md` with required frontmatter
3. Add `templates/` directory with code templates (optional)
4. Reference corresponding instruction file

**Guidelines:**
- Keep SKILL.md under 300 lines
- Don't duplicate instruction content - link to it
- Include "When to Use", "Quick Start", and "Checklist" sections
- Always point to full instruction file for comprehensive documentation

## Related Files

- **Instructions**: `.github/instructions/*.instructions.md` - Full reference documentation
- **Prompts**: `.github/prompts/*.prompt.md` - User-invoked workflows
- **CLAUDE.md**: High-level architecture documentation

## Documentation

- [VS Code Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- [VS Code Custom Instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)
- [VS Code Prompt Files](https://code.visualstudio.com/docs/copilot/customization/prompt-files)
