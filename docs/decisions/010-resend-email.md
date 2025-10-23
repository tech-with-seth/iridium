# 010: Resend Email Service

## Status

Accepted

## Context

We needed an email service solution that:

- Sends transactional emails (verification, password reset, notifications)
- Integrates with BetterAuth for authentication flows
- Supports HTML email templates
- Works with React components for template development
- Provides good developer experience
- Has reasonable pricing
- Offers reliable delivery
- Can be called from anywhere in the application (client/server)

Email is critical infrastructure for user authentication, notifications, and communication. We need a service that is reliable, developer-friendly, and integrates seamlessly with our tech stack.

## Decision

We chose Resend for email delivery, integrated with React Email for template development.

Resend is a modern email API built for developers, with first-class support for React Email templates and a clean, simple API.

### Key Features

**Simple API**:

```typescript
await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'user@example.com',
    subject: 'Welcome!',
    html: '<h1>Hello World</h1>',
});
```

**React Email Integration**:

```typescript
import { render } from '@react-email/components';
import WelcomeEmail from '~/emails/welcome-email';

const html = await render(WelcomeEmail({ userName: 'John' }));
await sendEmail({ to, subject, html });
```

**BetterAuth Integration**:

```typescript
export const auth = betterAuth({
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            await sendVerificationEmail({
                to: user.email,
                verificationUrl: url,
            });
        },
    },
});
```

**Centralized API Endpoint**: Send emails from anywhere via `/api/email`

## Consequences

### Positive

- **Developer Experience**: Clean, simple API that's easy to use
- **React Email**: Build emails with React components
- **BetterAuth Integration**: Seamless integration for auth emails
- **Flexible**: Can be called from client or server via API endpoint
- **Type-Safe**: Full TypeScript support
- **Fast Setup**: Quick to implement and configure
- **Good Deliverability**: High delivery rates
- **Generous Free Tier**: 100 emails/day, 3,000 emails/month free
- **Professional Templates**: React Email provides production-ready components
- **Testing**: Easy to test with development domain

### Negative

- **Newer Platform**: Less mature than established providers
- **Cost at Scale**: Can get expensive with high volume (beyond free tier)
- **Email Limits**: Free tier has daily/monthly limits
- **Domain Verification**: Requires DNS setup for custom domains
- **Limited Features**: Some advanced features missing compared to SendGrid

### Neutral

- **Domain Required**: Need verified domain for production
- **API Key Management**: Single API key for authentication
- **Rate Limits**: Standard rate limiting applies

## Alternatives Considered

### SendGrid

**Pros:**

- Industry standard
- Comprehensive features
- Proven at scale
- Marketing email support
- Advanced analytics
- Many integrations

**Cons:**

- Complex API
- More setup required
- Expensive pricing
- Complicated configuration
- No React Email integration
- Harder to use

**Why not chosen:** More complex than needed. Resend provides simpler API and better developer experience.

### AWS SES (Simple Email Service)

**Pros:**

- Very cheap at scale
- Highly scalable
- AWS integration
- Reliable delivery

**Cons:**

- Complex setup
- Requires AWS account
- No template system
- Poor developer experience
- Manual SMTP configuration
- Bounce handling required

**Why not chosen:** Too complex for our needs. Resend offers better DX.

### Mailgun

**Pros:**

- Popular service
- Good API
- Reliable delivery
- Good documentation

**Cons:**

- Complex pricing
- No React Email support
- More setup required
- API not as clean

**Why not chosen:** Resend has simpler API and React Email integration.

### Postmark

**Pros:**

- Great deliverability
- Clean API
- Developer-friendly
- Good documentation

**Cons:**

- More expensive
- No React Email integration
- Limited free tier

**Why not chosen:** Similar to Resend but more expensive and no React Email.

### Custom SMTP Solution

**Pros:**

- Full control
- No API dependency
- Potentially cheaper

**Cons:**

- Complex setup
- Bounce handling required
- Delivery issues
- No templates
- More code to maintain
- Security concerns

**Why not chosen:** Too much complexity. Resend handles all infrastructure.

## Implementation Details

### SDK Setup

```typescript
// app/lib/resend.server.ts
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const DEFAULT_FROM_EMAIL =
    process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
```

### Model Layer

```typescript
// app/models/email.server.ts
import { render } from '@react-email/components';
import { resend, DEFAULT_FROM_EMAIL } from '~/lib/resend.server';
import WelcomeEmail from '~/emails/welcome-email';

export async function sendWelcomeEmail({
    to,
    userName,
    dashboardUrl,
}: {
    to: string;
    userName: string;
    dashboardUrl: string;
}) {
    const html = await render(WelcomeEmail({ userName, dashboardUrl }));

    return resend.emails.send({
        from: DEFAULT_FROM_EMAIL,
        to,
        subject: 'Welcome to TWS Foundations!',
        html,
    });
}
```

### API Endpoint

```typescript
// app/routes/api/email.server.ts
import { requireUser } from '~/lib/session.server';
import { sendEmail } from '~/models/email.server';

export async function action({ request }: Route.ActionArgs) {
    await requireUser(request); // Require authentication

    const formData = await request.formData();
    const { data, errors } = await validateFormData(formData, sendEmailSchema);

    if (errors) {
        return data({ errors }, { status: 400 });
    }

    await sendEmail(data);
    return data({ success: true });
}
```

### React Email Template

```tsx
// app/emails/welcome-email.tsx
import {
    Body,
    Button,
    Container,
    Heading,
    Html,
    Text,
} from '@react-email/components';

interface WelcomeEmailProps {
    userName: string;
    dashboardUrl: string;
}

export default function WelcomeEmail({
    userName,
    dashboardUrl,
}: WelcomeEmailProps) {
    return (
        <Html>
            <Body>
                <Container>
                    <Heading>Welcome {userName}!</Heading>
                    <Text>Thanks for joining TWS Foundations.</Text>
                    <Button href={dashboardUrl}>Get Started</Button>
                </Container>
            </Body>
        </Html>
    );
}
```

### BetterAuth Integration

```typescript
// app/lib/auth.server.ts
import {
    sendVerificationEmail,
    sendPasswordResetEmail,
} from '~/models/email.server';

export const auth = betterAuth({
    emailAndPassword: {
        sendResetPassword: async ({ user, url }) => {
            await sendPasswordResetEmail({
                to: user.email,
                resetUrl: url,
            });
        },
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            await sendVerificationEmail({
                to: user.email,
                verificationUrl: url,
            });
        },
        sendOnSignUp: true,
    },
});
```

## Template Organization

Templates are organized in `app/emails/`:

- `verification-email.tsx` - Email verification for BetterAuth
- `password-reset-email.tsx` - Password reset for BetterAuth
- `welcome-email.tsx` - Welcome new users after signup
- `transactional-email.tsx` - Generic template for notifications

Each template:

- Uses React Email components
- Has typed props interface
- Includes inline styles
- Renders to production-ready HTML

## API Endpoint Pattern

The `/api/email` endpoint provides flexibility:

**From Client Components:**

```typescript
const fetcher = useFetcher();
fetcher.submit(formData, { method: 'POST', action: '/api/email' });
```

**From Server Loaders/Actions:**

```typescript
await fetch('/api/email', { method: 'POST', body: formData });
```

**Direct Model Layer (Server Only):**

```typescript
import { sendWelcomeEmail } from '~/models/email.server';
await sendWelcomeEmail({ to, userName, dashboardUrl });
```

This pattern allows email sending from anywhere in the application while maintaining centralized authentication and validation.

## Security Considerations

- **Authentication Required**: All email endpoints require user authentication
- **Validation**: Zod schemas validate all email payloads
- **Rate Limiting**: Protect against abuse (implement as needed)
- **API Key Security**: Server-only, never exposed to client
- **Domain Verification**: Production requires verified domain
- **Content Validation**: Validate recipient addresses and content

## Development vs Production

### Development

```bash
RESEND_FROM_EMAIL="onboarding@resend.dev"
```

- Use Resend's test domain
- Emails delivered but marked as test
- No domain verification needed

### Production

```bash
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

- Verify your domain in Resend dashboard
- Add DNS records (SPF, DKIM, DMARC)
- Use professional from address
- Monitor delivery rates

## Testing Strategy

**Unit Tests:**

```typescript
test('sends welcome email', async () => {
    const result = await sendWelcomeEmail({
        to: 'test@example.com',
        userName: 'Test User',
        dashboardUrl: 'https://app.com/dashboard',
    });

    expect(result.success).toBe(true);
});
```

**Preview Templates:**

```bash
npx react-email dev
```

**Integration Tests:**

```typescript
test('POST /api/email sends email', async () => {
    const response = await fetch('/api/email', {
        method: 'POST',
        body: formData,
    });

    expect(response.status).toBe(200);
});
```

## Monitoring and Analytics

Track email events with PostHog:

```typescript
posthog.capture('email_sent', {
    userId: user.id,
    templateName: 'welcome',
    recipient: user.email,
});
```

Monitor:

- Total emails sent
- Success/failure rates
- Template usage
- Delivery times
- Error rates

## Cost Management

**Free Tier:**

- 100 emails/day
- 3,000 emails/month

**Paid Plans:**

- $20/month for 50,000 emails
- $80/month for 100,000 emails

**Optimization:**

- Cache templates where possible
- Batch similar emails
- Monitor usage via dashboard
- Alert on approaching limits

## Best Practices

1. **Model Layer Only**: Never call Resend SDK directly in routes
2. **Use Templates**: React Email for consistent, professional emails
3. **Validate Inputs**: Use Zod schemas for type safety
4. **Require Auth**: All email endpoints require authentication
5. **Handle Errors**: Comprehensive try-catch blocks
6. **Track Events**: Log all email sends with PostHog
7. **Test Templates**: Preview with `npx react-email dev`
8. **Verify Domain**: Use verified domain in production
9. **Rate Limit**: Protect against abuse
10. **Monitor Delivery**: Track success rates

## Migration Path

If migrating from another provider:

1. **Install Dependencies:**

    ```bash
    npm install resend react-email @react-email/components
    ```

2. **Create Templates:**
    - Convert existing email HTML to React Email components
    - Test templates with preview server

3. **Set Up Model Layer:**
    - Create `app/models/email.server.ts`
    - Implement email sending functions

4. **Update BetterAuth:**
    - Configure email verification
    - Configure password reset

5. **Create API Endpoint:**
    - Add `/api/email` route
    - Implement validation and auth

6. **Test Thoroughly:**
    - Unit tests for model functions
    - Integration tests for API endpoint
    - Manual testing in development

7. **Deploy:**
    - Verify domain in Resend
    - Update environment variables
    - Monitor initial sends

## References

- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email/docs)
- [BetterAuth Email Integration](https://better-auth.com/docs/authentication/email)
- [Resend React Email Integration](https://resend.com/docs/send-with-react)
- [BetterAuth Decision](./002-better-auth.md)
- [PostHog Decision](./008-posthog.md)
