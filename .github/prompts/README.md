# VS Code Copilot Prompts

This directory contains **user-invokable prompts** for VS Code Copilot. These are triggered manually in VS Code using `@workspace /promptName`.

## How to Use

In VS Code, type `@workspace /` followed by the prompt name (without `.prompt.md`):

```
@workspace /prd
@workspace /add-component
@workspace /add-route
```

## Available Prompts

- **`prd.prompt.md`** - Generate a Product Requirements Document for a new feature
- **`add-component.prompt.md`** - Create a new UI component following CVA + DaisyUI patterns
- **`add-route.prompt.md`** - Add a new route to the React Router 7 config
- **`add-test.prompt.md`** - Create unit or E2E tests
- **`add-docs.prompt.md`** - Add JSDoc documentation to code
- **`add-feature.prompt.md`** - Implement a complete feature end-to-end
- **`refactor.prompt.md`** - Refactor code for better structure
- **`codify.prompt.md`** - Extract patterns into reusable abstractions
- **`overhaul.prompt.md`** - Major refactoring or restructuring

## Prompt File Format

Each prompt file has YAML frontmatter with metadata:

```yaml
---
name: Prompt Name
description: What this prompt does
tools: [vscode, execute, read, edit, search, web]
---

# Prompt Instructions

Your detailed instructions here...
```

## Related Files

- **`..instructions/*.instructions.md`** - Always-applied instructions (automatic context for all Copilot interactions)
- **`plans/ralph.sh`** - Autonomous coding loop that uses `ralph.instructions.md` (NOT a VS Code prompt)

## Documentation

- [VS Code Copilot Custom Instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)
- [VS Code Copilot Prompt Files](https://code.visualstudio.com/docs/copilot/customization/prompt-files)
