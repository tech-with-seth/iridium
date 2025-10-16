# Codify Command

**Purpose**: Document and canonize architectural patterns, conventions, or implementation details discussed in the current conversation into the project's formal documentation.

## Execution Steps

1. **Identify Core Concepts**: Extract the key patterns, decisions, or conventions from the conversation
2. **Determine Scope**: Assess which documentation files require updates based on the topic's nature
3. **Verify Existing Documentation**: Check current state of relevant documentation files
4. **Update Documentation**: Add or modify content to reflect the new canonical patterns
5. **Ensure Consistency**: Verify documentation alignment across all files

## Documentation Hierarchy

### AGENTS.md

- **Audience**: AI coding agents (comprehensive reference)
- **Content**: Complete architectural patterns, workflows, troubleshooting, code examples
- **Update when**: New patterns, component architectures, or agent-specific guidance emerges

### CLAUDE.md (deprecated/redirect)

- **Status**: May redirect to AGENTS.md or serve as Claude-specific guidance
- **Update when**: Claude-specific considerations arise

### .github/copilot-instructions.md

- **Audience**: GitHub Copilot (quick reference)
- **Content**: Concise patterns, import conventions, critical rules with examples
- **Update when**: Core patterns or critical rules change

### .github/instructions/\*.instructions.md

- **Audience**: Both AI agents and developers (focused guides)
- **Content**: Framework/library-specific patterns and conventions
- **Structure**: One file per major framework/concern
- **Update when**: Framework-specific patterns or best practices are established

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
