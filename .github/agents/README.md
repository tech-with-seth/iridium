# VS Code Copilot Custom Agents

This directory contains custom agents for VS Code Copilot that provide specialized AI personas for different development tasks.

## How to Use

In VS Code Copilot Chat, type `@` followed by the agent name:

```
@reviewer Review the changes in app/routes/dashboard.tsx
@planner Plan a comment system feature
@security Audit the authentication flow
```

## Available Agents

| Agent | Purpose | Best For |
|-------|---------|----------|
| `@reviewer` | Code pattern compliance | Pre-commit reviews, PR reviews |
| `@security` | Security vulnerability auditing | Auth flows, input handling, OWASP checks |
| `@database` | Prisma schema & model layer design | Schema changes, query optimization |
| `@planner` | Implementation planning | Complex features, architectural decisions |
| `@tester` | Test generation (Vitest + Playwright) | Unit tests, E2E tests |
| `@deployer` | Railway deployment & debugging | Deployments, environment setup |

## Agent Details

### @reviewer

Reviews code for Iridium pattern compliance:
- Route type imports (`./+types/`)
- Prisma imports (`~/generated/prisma/client`)
- Model layer usage (no direct Prisma in routes)
- Form patterns (`<form>` not `<fetcher.Form>` with React Hook Form)
- CVA class merging (`cx()` not `cn()`)

**Handoffs:** Can hand off to main agent to fix issues.

### @security

Audits for security vulnerabilities:
- OWASP Top 10 checks
- Authentication patterns (BetterAuth)
- Input validation (server-side Zod)
- Access control verification
- XSS/injection prevention

**Handoffs:** Can hand off to main agent to fix vulnerabilities.

### @database

Designs database schemas and model layer:
- Prisma schema design
- Migration planning
- Model layer function patterns
- Query optimization
- Index recommendations

**Tools:** Uses Prisma MCP server for schema introspection.

**Handoffs:** Can hand off to main agent to implement changes.

### @planner

Creates detailed implementation plans:
- Explores codebase for existing patterns
- Lists files to create/modify
- Provides step-by-step implementation
- References relevant instruction files
- Includes testing strategy

**Handoffs:** Can hand off to main agent or reviewer.

### @tester

Generates comprehensive test suites:
- Vitest unit tests for models, validations, components
- Playwright E2E tests for user flows
- Test fixtures and mocks
- Coverage guidance

**Tools:** Uses Playwright MCP server for browser automation.

**Handoffs:** Can hand off to main agent to run tests.

### @deployer

Manages Railway deployments:
- Deployment commands and workflows
- Environment variable setup
- Log analysis and debugging
- Common issue troubleshooting

**Tools:** Uses Railway MCP server for deployment operations.

**Handoffs:** Can hand off to main agent to fix issues.

## Handoffs

Agents can hand off work to other agents. When an agent completes its task, it may offer handoff options like:

- **"Implement Plan"** - Planner hands to main agent
- **"Fix Issues"** - Reviewer hands to main agent
- **"Fix Vulnerabilities"** - Security hands to main agent
- **"Run Tests"** - Tester hands to main agent

## Creating New Agents

1. Create a new `.agent.md` file in this directory
2. Add YAML frontmatter with required fields:
   ```yaml
   ---
   name: agent-name
   description: Brief description
   tools: ['tool1', 'tool2']
   model: Claude Sonnet 4
   handoffs:
     - label: Handoff Label
       agent: target-agent
       prompt: Pre-filled message
       send: false
   ---
   ```
3. Add instructions in markdown body

## Related Files

- **Skills**: `.github/skills/` - Auto-triggered quick-start guides
- **Instructions**: `.github/instructions/` - Full reference documentation
- **MCP Servers**: `.vscode/mcp.json` - Tool server configuration

## Documentation

- [VS Code Custom Agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents)
- [VS Code Agent Overview](https://code.visualstudio.com/docs/copilot/agents/overview)
