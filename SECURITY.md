# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in Iridium, please report it responsibly.

### How to Report

1. **Do not** open a public GitHub issue for security vulnerabilities
2. Email the maintainer directly or use GitHub's private vulnerability reporting feature
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

### What to Expect

- Acknowledgment within 48 hours
- Status update within 7 days
- Fix timeline depends on severity

### Scope

This security policy applies to:

- The Iridium codebase in this repository
- Default configurations

This policy does **not** cover:

- Third-party dependencies (report to their maintainers)
- User-deployed instances with custom modifications
- Social engineering attacks

## Security Best Practices for Users

When deploying Iridium:

1. **Environment variables**: Never commit `.env` files. Use your platform's secret management.
2. **BETTER_AUTH_SECRET**: Use a strong, unique secret (32+ characters)
3. **DATABASE_URL**: Use SSL connections in production
4. **Dependencies**: Run `npm audit` regularly and update dependencies
5. **HTTPS**: Always use HTTPS in production

## Known Security Considerations

- Authentication is handled by BetterAuth with secure session management
- CSRF protection is built into React Router form handling
- Input validation uses Zod on both client and server
