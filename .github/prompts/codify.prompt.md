---
agent: 'agent'
tools: ['vscode', 'execute', 'read', 'edit', 'search', 'web', 'agent', 'todo']
description: 'Create or update project documentation to canonize architectural patterns and conventions discussed'
---

# Codify Command

**Purpose**: Document and canonize architectural patterns, conventions, or implementation details discussed in the current conversation into the project's formal documentation.

## Execution Steps

1. **Identify Core Concepts**: Extract the key patterns, decisions, or conventions from the conversation
2. **Determine Scope**: Assess which documentation files require updates based on the topic's nature, including high-level summaries (`README.md`), reference manuals (`docs/`), and decision records (`docs/decisions/`)
3. **Verify Existing Documentation**: Check current state of relevant documentation files
4. **Update Documentation**: Add or modify content to reflect the new canonical patterns
5. **Ensure Consistency**: Verify documentation alignment across all files

> Not every change belongs everywhere. Choose the location that best matches the audience and permanence of the decision so documentation stays focused and meaningful.

## Documentation Hierarchy

### AGENTS.md

- **Audience**: AI coding agents (comprehensive reference)
- **Content**: Complete architectural patterns, workflows, troubleshooting, code examples
- **Update when**: New patterns, component architectures, or agent-specific guidance emerges

### .github/copilot-instructions.md

- **Audience**: GitHub Copilot (quick reference)
- **Content**: Concise patterns, import conventions, critical rules with examples
- **Update when**: Core patterns or critical rules change

### .github/instructions/\*.instructions.md

- **Audience**: Both AI agents and developers (focused guides)
- **Content**: Framework/library-specific patterns and conventions
- **Structure**: One file per major framework/concern
- **Update when**: Framework-specific patterns or best practices are established

### README.md (project root)

- **Audience**: New contributors and stakeholders seeking the big-picture overview
- **Content**: High-level product description, feature list, architecture summary, setup steps
- **Update when**: Top-level messaging, onboarding instructions, or flagship capabilities change

### docs/

- **Audience**: Developers looking for in-depth walkthroughs, workflows, and operational guides
- **Content**: Topic-specific manuals (authentication, routing, testing, deployment), living documentation for day-to-day development
- **Update when**: Detailed processes or platform behaviors evolve beyond quick references

### docs/decisions/

- **Audience**: Engineers and product leaders reviewing historical context for architectural choices
- **Content**: Architecture Decision Records (ADRs) capturing the “why” behind significant decisions
- **Update when**: A new decision is made or a previous decision is superseded; include rationale, consequences, and alternatives considered

## Documentation Categories

- **Routing**: `react-router.instructions.md`
- **Authentication**: `better-auth.instructions.md`
- **Database**: `prisma.instructions.md`
- **Validation**: `zod.instructions.md`, `form-validation.instructions.md`, `react-hook-form.instructions.md`
- **UI Components**: `component-patterns.instructions.md`, `daisyui.instructions.md`, `cva.instructions.md`
- **API Design**: `api-endpoints.instructions.md`, `crud-pattern.instructions.md`
- **Architecture**: `vertical-slice.instructions.md`, `error-boundaries.instructions.md`
- **Performance**: `caching-pattern.instructions.md`
- **Integrations**: `polar.instructions.md`, `posthog.instructions.md`
- **Configuration**: `env.instructions.md`

## Output Requirements

- Provide summary of files updated with key changes
- Maintain consistent formatting and structure within each file
- Include code examples where applicable
- Preserve existing cross-references between documentation files
- Use clear, imperative language for instructions
- Avoid redundancy across files (link instead of duplicating)
