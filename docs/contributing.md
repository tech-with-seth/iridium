# Contributing

Thank you for your interest in contributing to TWS Foundations. This guide will help you get started with contributing to the project.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL database
- Git

### Initial Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd tws-foundations
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start development server:
```bash
npm run dev
```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `dev` - Development branch
- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Documentation: `docs/description`

### Creating a Branch

```bash
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes
2. Write or update tests
3. Run tests: `npm run test`
4. Run type checking: `npm run typecheck`
5. Commit your changes

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add password reset functionality
fix(forms): correct validation error messages
docs(readme): update installation instructions
```

### Pull Requests

1. Push your branch:
```bash
git push origin feature/your-feature-name
```

2. Create a pull request on GitHub
3. Fill out the pull request template
4. Wait for review

#### Pull Request Guidelines

- Provide clear description of changes
- Include screenshots for UI changes
- Link related issues
- Ensure tests pass
- Update documentation if needed
- Keep pull requests focused and small

## Code Standards

### TypeScript

- Use TypeScript for all new code
- Define types for function parameters and return values
- Avoid `any` type unless absolutely necessary
- Use interfaces for object shapes
- Use type aliases for unions and complex types

Example:
```typescript
type User = {
  id: string;
  email: string;
  name: string | null;
};

function getUser(id: string): Promise<User> {
  // Implementation
}
```

### React Components

- Use function components
- Access loader data via props, not hooks
- Avoid `useEffect` when possible
- Keep components focused and small
- Extract reusable logic into custom hooks

Example:
```typescript
import { Route } from "./+types/dashboard";

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
    </div>
  );
}
```

### Styling

- Use Tailwind CSS utility classes
- Use DaisyUI components when available
- Use CVA for component variants
- Keep styles colocated with components
- Avoid inline styles unless necessary

### File Naming

- React components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- Test files: `*.test.ts` or `*.test.tsx`
- Route files: `kebab-case.tsx`

### Project Structure

```
app/
├── routes/              # Route files
├── components/          # Reusable components
├── lib/                 # Utility functions
├── models/              # Data models
├── hooks/               # Custom hooks
├── middleware/          # Request middleware
└── test/                # Test utilities
```

## Testing

### Writing Tests

- Write tests for new features
- Update tests when modifying existing code
- Aim for high coverage of critical paths
- Use descriptive test names

### Running Tests

```bash
# Unit tests
npm run test

# End-to-end tests
npm run e2e

# Coverage
npm run test:coverage
```

### Test Patterns

```typescript
import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Button from "./button";

describe("Button", () => {
  test("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
});
```

## Documentation

### Updating Documentation

- Update relevant documentation when making changes
- Add examples for new features
- Keep documentation clear and concise
- Use code examples to illustrate concepts

### Documentation Location

- User guides: `docs/`
- Architecture decisions: `docs/decisions/`
- Code comments: Inline in source files
- API documentation: JSDoc comments

## Code Review

### As a Contributor

- Respond to feedback promptly
- Be open to suggestions
- Ask questions if unclear
- Update your pull request based on feedback

### As a Reviewer

- Be respectful and constructive
- Focus on code quality and maintainability
- Suggest improvements, not just problems
- Approve when changes meet standards

## Issue Management

### Creating Issues

Include:
- Clear title and description
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Environment details
- Screenshots (if applicable)

### Issue Labels

- `bug`: Something is not working
- `feature`: New feature request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed

## Release Process

1. Create release branch from `dev`
2. Update version in `package.json`
3. Update changelog
4. Create pull request to `main`
5. Tag release after merge
6. Deploy to production

## Getting Help

- Review existing documentation
- Check closed issues and pull requests
- Ask questions in discussions
- Reach out to maintainers

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Give and receive constructive feedback
- Focus on what is best for the project
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing private information
- Other unprofessional conduct

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Recognition

Contributors are recognized in:
- Git commit history
- Pull request acknowledgments
- Release notes

Thank you for contributing to TWS Foundations!
