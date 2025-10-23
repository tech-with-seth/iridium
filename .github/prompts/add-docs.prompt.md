---
mode: 'agent'
tools:
    [
        'extensions',
        'usages',
        'vscodeAPI',
        'problems',
        'changes',
        'testFailure',
        'openSimpleBrowser',
        'fetch',
        'githubRepo',
        'todos',
        'runTests',
        'runCommands',
        'runTasks',
        'edit',
        'runNotebooks',
        'search',
        'new',
    ]
description: 'Update documentation to reflect recent code changes'
---

Make sure that all relevant documentation is updated to reflect recent code changes. Follow this comprehensive process:

## 1. Analyze Recent Changes

- Review git history for the last 30 days to identify architectural, API, or pattern changes
- Identify new files, deleted files, and significantly modified files
- Look for changes in:
    - Route definitions and structure
    - Component patterns and APIs
    - Authentication/authorization logic
    - Database schema modifications
    - Environment variables and configuration
    - Build/deployment processes
    - Third-party integrations

## 2. Documentation Files to Update

### Primary Documentation

- `.github/copilot-instructions.md` - Main instructions for GitHub Copilot
- `AGENTS.md` - Comprehensive guide for AI coding agents
- `README.md` - Project overview and getting started

### Framework-Specific Instructions (`.github/instructions/`)

- `react-router.instructions.md` - Routing patterns
- `better-auth.instructions.md` - Authentication patterns
- `component-patterns.instructions.md` - UI component standards
- `form-validation.instructions.md` - Form handling patterns
- `polar.instructions.md` - Billing integration
- `prisma.instructions.md` - Database patterns
- `cva.instructions.md` - Component variants
- `daisyui.instructions.md` - UI library usage
- `zod.instructions.md` - Validation schemas
- `react-hook-form.instructions.md` - Form management

### Additional Documentation

- API documentation files
- Architecture decision records (ADRs)
- Deployment guides
- Contributing guidelines

## 3. Update Checklist

For each documentation file, ensure:

### Accuracy

- [ ] All code examples compile and follow current patterns
- [ ] Import statements use correct paths (especially Prisma custom output)
- [ ] Route examples match config-based routing in `app/routes.ts`
- [ ] Component examples follow CVA + DaisyUI pattern
- [ ] Environment variables are up-to-date

### Completeness

- [ ] New features are documented with examples
- [ ] Deprecated patterns are marked or removed
- [ ] Breaking changes are clearly called out
- [ ] Common workflows reflect current best practices
- [ ] Troubleshooting section covers new issues

### Consistency

- [ ] Terminology is consistent across all docs
- [ ] Code style matches project conventions
- [ ] File paths are accurate
- [ ] Cross-references between docs are valid

### Developer Experience

- [ ] Quick start guides are current
- [ ] Setup commands are tested and accurate
- [ ] Examples are copy-paste ready
- [ ] Common pitfalls are documented
- [ ] Links to external resources are valid
