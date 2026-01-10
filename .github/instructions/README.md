# VS Code Copilot Instructions

This directory contains **always-applied instructions** that provide automatic context to VS Code Copilot for all interactions.

## Purpose

Instructions files are automatically loaded by VS Code Copilot and influence how it responds to your requests. They define patterns, conventions, and best practices specific to this codebase.

## File Organization

- **Framework-specific**: `react-router.instructions.md`, `prisma.instructions.md`, `better-auth.instructions.md`
- **Pattern-specific**: `component-patterns.instructions.md`, `form-validation.instructions.md`, `crud-pattern.instructions.md`
- **Integration-specific**: `posthog.instructions.md`, `resend.instructions.md`, `polar.instructions.md`
- **Special**: `ralph.instructions.md` - Used by the autonomous Ralph agent loop (`plans/ralph.sh`), NOT for VS Code Copilot

## How It Works

VS Code Copilot automatically:

1. Scans `.github/instructions/*.instructions.md` files
2. Loads relevant instructions based on your current work
3. Applies them as context when generating responses

You don't need to manually reference these files—they're always active.

## File Format

Instructions files use Markdown with optional YAML frontmatter:

```yaml
---
description: Brief description
applyTo: '**/*.tsx' # Optional: limit scope
alwaysApply: true   # Optional: force always-on
---

# Your Instructions

Content here...
```

## Special Case: Ralph Agent

**`ralph.instructions.md`** is NOT a VS Code Copilot instruction file despite being in this directory. It's designed to be piped to the Claude CLI via `plans/ralph.sh` for autonomous coding iterations.

To avoid confusion:

- Ralph automation uses: `plans/ralph.sh` → `ralph.instructions.md`
- VS Code Copilot uses: All other `.instructions.md` files

## Related Files

- **`../prompts/*.prompt.md`** - User-invokable prompts (manual trigger with `@workspace /promptName`)
- **`plans/ralph.sh`** - Autonomous coding loop script
- **`CLAUDE.md`** - High-level architecture documentation
- **`AGENTS.md`** - Comprehensive AI agent guide

## Documentation

- [VS Code Copilot Custom Instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)
- [VS Code Copilot Prompt Files](https://code.visualstudio.com/docs/copilot/customization/prompt-files)
