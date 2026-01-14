# VS Code Copilot Prompts

This directory contains **user-invokable prompts** for multi-step development workflows.

## How to Use

In VS Code Copilot Chat, type `@workspace /` followed by the prompt name:

```
@workspace /add-feature
@workspace /add-route
@workspace /prd
```

## Available Prompts

### Feature Development

| Prompt | Purpose | When to Use |
|--------|---------|-------------|
| `/add-feature` | Complete vertical slice implementation | Adding a new feature that spans database → API → UI |
| `/add-route` | Create React Router 7 route | Adding new pages, API endpoints, or layouts |
| `/add-component` | Create CVA + DaisyUI component | Building reusable UI components |
| `/add-test` | Generate unit or E2E tests | Adding test coverage |

### Documentation & Codification

| Prompt | Purpose | When to Use |
|--------|---------|-------------|
| `/add-docs` | Add JSDoc documentation | Documenting functions and components |
| `/codify` | Extract patterns into reusable abstractions | Identifying and formalizing patterns |

### Refactoring

| Prompt | Purpose | When to Use |
|--------|---------|-------------|
| `/refactor` | Refactor code while preserving behavior | Improving code quality without changing functionality |
| `/overhaul` | Major restructuring | Large-scale architectural changes |

### Ralph Automation

| Prompt | Purpose | When to Use |
|--------|---------|-------------|
| `/prd` | Generate Product Requirements Document | Planning new features for Ralph to implement |
| `/ralph` | Ralph automation instructions | Running the Ralph autonomous loop |

## Prompt File Format

```yaml
---
agent: 'agent'
tools: ['vscode', 'execute', 'read', 'edit', 'search', 'web', 'agent', 'todo']
description: 'Brief description of what this prompt does'
---

# Prompt Title

Step-by-step instructions...
```

### Frontmatter Fields

| Field | Purpose | Example |
|-------|---------|---------|
| `agent` | Enable agent mode | `'agent'` |
| `tools` | Available tools | `['read', 'edit', 'search']` |
| `description` | Brief description | `'Generate a new React Router 7 route'` |

## Prompts vs Instructions vs Skills

| System | Purpose | Trigger |
|--------|---------|---------|
| **Instructions** | Complete reference documentation | Auto-applied based on `applyTo` file patterns |
| **Skills** | Quick-start guides with templates | Auto-triggered when task matches description |
| **Prompts** | Multi-step workflows | User-invoked via `@workspace /promptName` |

**Key Differences:**

- **Instructions**: Reference docs (always active based on file patterns)
- **Skills**: Quick help (auto-triggered when Copilot detects relevant task)
- **Prompts**: Guided workflows (manually invoked for complex multi-step tasks)

**Hierarchy:**
- Prompts orchestrate multiple Instructions into workflows
- Instructions are the source of truth
- Skills provide quick-start guidance

## Creating New Prompts

1. Create file: `.github/prompts/[name].prompt.md`
2. Add frontmatter with `description` and `tools`
3. Write step-by-step workflow instructions
4. Include checklists and validation steps
5. Reference related instruction files

**Guidelines:**
- Prompts are for multi-step workflows, not single operations
- Include clarification questions at the start
- Provide checklists for validation
- Reference instruction files for detailed patterns
- Keep steps actionable and sequential

## Related Files

- **Instructions**: `.github/instructions/*.instructions.md` - Full reference documentation
- **Skills**: `.github/skills/*/SKILL.md` - Auto-triggered quick references
- **CLAUDE.md**: High-level architecture documentation

## Documentation

- [VS Code Prompt Files](https://code.visualstudio.com/docs/copilot/customization/prompt-files)
- [VS Code Custom Instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)
- [VS Code Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
