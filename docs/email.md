# Email

TWS Foundations uses [Resend](https://resend.com/) for transactional email delivery, integrated with [React Email](https://react.email/) for building professional HTML email templates.

## Overview

Resend provides a developer-friendly email API with excellent deliverability, while React Email allows building email templates using React components. The integration includes automatic email sending for authentication flows via BetterAuth and a centralized API endpoint for sending emails from anywhere in the application.

## Setup

### Installation

```bash
npm install resend react-email @react-email/components
```

### Environment Variables

Add these to your `.env` file:

```bash
# Required
RESEND_API_KEY="re_your-api-key-here"

# Optional (defaults to onboarding@resend.dev)
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

Get your API key from: https://resend.com/api-keys

### Server Configuration

The Resend client is configured in `app/lib/resend.server.ts`:

```typescript
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const DEFAULT_FROM_EMAIL =
    process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
```

## Sending Emails

### Method 1: Using the API Endpoint (Recommended)

The `/api/email` endpoint allows sending emails from anywhere in your application.

#### From a Client Component

```typescript
import { useFetcher } from 'react-router';

function NotificationButton() {
  const fetcher = useFetcher();

  function sendEmail() {
    const formData = new FormData();
    formData.append('to', 'user@example.com');
    formData.append('subject', 'Important Update');
    formData.append('html', '<p>Your account has been updated.</p>');

    fetcher.submit(formData, {
      method: 'POST',
      action: '/api/email'
    });
  }

  return (
    <button onClick={sendEmail} disabled={fetcher.state !== 'idle'}>
      {fetcher.state === 'submitting' ? 'Sending...' : 'Send Email'}
    </button>
  );
}
```

#### From a Server-Side Loader/Action

```typescript
import type { Route } from './+types/example';

export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);

    // Send email via API endpoint
    const emailFormData = new FormData();
    emailFormData.append('to', user.email);
    emailFormData.append('subject', 'Order Confirmation');
    emailFormData.append('html', '<h1>Thank you for your order!</h1>');

    const response = await fetch('http://localhost:5173/api/email', {
        method: 'POST',
        headers: request.headers,
        body: emailFormData,
    });

    return { emailSent: response.ok };
}
```

### Method 2: Template-Based Emails

Send emails using predefined React Email templates:

```typescript
function sendWelcomeEmail() {
    const formData = new FormData();
    formData.append('templateName', 'welcome');
    formData.append('to', 'newuser@example.com');
    formData.append(
        'props',
        JSON.stringify({
            userName: 'John Doe',
            dashboardUrl: 'https://yourdomain.com/dashboard',
        }),
    );

    fetcher.submit(formData, {
        method: 'POST',
        action: '/api/email?template=true',
    });
}
```

Available templates:

- `verification` - Email verification (requires `verificationUrl`)
- `password-reset` - Password reset (requires `resetUrl`)
- `welcome` - Welcome new users (requires `userName`, `dashboardUrl`)
- `transactional` - Generic notifications (requires `heading`, `previewText`, `message`)

### Method 3: Direct Model Layer (Server-Only)

For server-side code, import model functions directly:

```typescript
import { sendWelcomeEmail } from '~/models/email.server';

export async function action({ request }: Route.ActionArgs) {
    const user = await createUser(data);

    // Send welcome email after signup
    await sendWelcomeEmail({
        to: user.email,
        userName: user.name,
        dashboardUrl: 'https://yourdomain.com/dashboard',
    });

    return { success: true };
}
```

## Email Templates

Templates are located in `app/emails/` and built with React Email components.

### Available Templates

#### Verification Email

```typescript
await sendVerificationEmail({
    to: 'user@example.com',
    verificationUrl: 'https://yourapp.com/verify?token=abc123',
});
```

#### Password Reset Email

```typescript
await sendPasswordResetEmail({
    to: 'user@example.com',
    resetUrl: 'https://yourapp.com/reset-password?token=abc123',
});
```

#### Welcome Email

```typescript
await sendWelcomeEmail({
    to: 'user@example.com',
    userName: 'John Doe',
    dashboardUrl: 'https://yourapp.com/dashboard',
});
```

#### Transactional Email

```typescript
await sendTransactionalEmail({
    to: 'user@example.com',
    heading: 'Account Approved!',
    previewText: 'Your account has been approved',
    message: 'Hi John, your account has been approved...',
    buttonText: 'Get Started',
    buttonUrl: 'https://yourapp.com/dashboard',
});
```

### Creating Custom Templates

Create a new React Email template in `app/emails/`:

```tsx
// app/emails/order-confirmation.tsx
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Text,
} from '@react-email/components';

interface OrderConfirmationProps {
    customerName: string;
    orderNumber: string;
    orderUrl: string;
}

export default function OrderConfirmation({
    customerName,
    orderNumber,
    orderUrl,
}: OrderConfirmationProps) {
    return (
        <Html>
            <Head />
            <Preview>Your order #{orderNumber} has been confirmed</Preview>
            <Body style={main}>
                <Container>
                    <Heading>Order Confirmed!</Heading>
                    <Text>Hi {customerName},</Text>
                    <Text>
                        Your order #{orderNumber} has been confirmed and is
                        being processed.
                    </Text>
                    <Button href={orderUrl}>View Order</Button>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};
```

Add a model function to send it:

```typescript
// app/models/email.server.ts
import OrderConfirmation from '~/emails/order-confirmation';
import { render } from '@react-email/components';

export async function sendOrderConfirmation({
    to,
    customerName,
    orderNumber,
    orderUrl,
}: {
    to: string;
    customerName: string;
    orderNumber: string;
    orderUrl: string;
}) {
    const html = await render(
        OrderConfirmation({ customerName, orderNumber, orderUrl }),
    );

    return sendEmail({
        to,
        subject: `Order Confirmation #${orderNumber}`,
        html,
    });
}
```

## BetterAuth Integration

Email verification and password reset emails are automatically handled by BetterAuth:

```typescript
// app/lib/auth.server.ts
import {
    sendVerificationEmail,
    sendPasswordResetEmail,
} from '~/models/email.server';

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Set to true to require verification
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
        sendOnSignUp: true, // Auto-send verification on signup
    },
});
```

### Enable Email Verification

To require users to verify their email before signing in:

1. Set `emailAndPassword.requireEmailVerification: true`
2. Set `emailVerification.sendOnSignUp: true`
3. Users will automatically receive a verification email when they sign up

## Testing Emails

### Preview Templates Locally

Use React Email's preview server to view and test templates:

```bash
npx react-email dev
```

This opens a local server at `http://localhost:3000` where you can preview all your email templates.

### Development Mode

Use Resend's test domain for development:

```bash
RESEND_FROM_EMAIL="onboarding@resend.dev"
```

Emails sent from this domain will be delivered but marked as test emails.

### Production Setup

1. Add your domain to Resend: https://resend.com/domains
2. Verify DNS records (SPF, DKIM, DMARC)
3. Update `RESEND_FROM_EMAIL` to use your verified domain:
    ```bash
    RESEND_FROM_EMAIL="noreply@yourdomain.com"
    ```

## API Reference

### POST /api/email

Send a custom email with raw HTML or text.

**Authentication:** Required (user must be signed in)

**Request Body (FormData):**

```typescript
{
  to: string | string[],      // Required
  subject: string,             // Required
  html?: string,               // Required if no text
  text?: string,               // Required if no html
  from?: string,               // Optional (uses DEFAULT_FROM_EMAIL)
  replyTo?: string,            // Optional
  cc?: string | string[],      // Optional
  bcc?: string | string[]      // Optional
}
```

**Response:**

```typescript
{
  success: true,
  message: "Email sent successfully",
  data: { id: "email-id" }
}
```

### POST /api/email?template=true

Send an email using a predefined template.

**Request Body (FormData):**

```typescript
{
  templateName: "verification" | "password-reset" | "welcome" | "transactional",
  to: string,
  props: string // JSON-stringified object with template-specific props
}
```

## Model Layer Functions

All email operations should go through the model layer (`app/models/email.server.ts`):

```typescript
// Send raw email
await sendEmail({ to, subject, html })

// Send verification email
await sendVerificationEmail({ to, verificationUrl })

// Send password reset email
await sendPasswordResetEmail({ to, resetUrl })

// Send welcome email
await sendWelcomeEmail({ to, userName, dashboardUrl })

// Send transactional email
await sendTransactionalEmail({ to, heading, message, ... })

// Send batch emails
await sendBatchEmails([email1, email2, email3])
```

## Error Handling

All email operations include comprehensive error handling:

```typescript
try {
    await sendEmail({ to, subject, html });
} catch (error) {
    // Errors are logged to console
    // PostHog tracking captures failures
    // API returns 500 with error message
    console.error('Failed to send email:', error);
}
```

### Common Errors

| Error               | Cause                      | Solution                                |
| ------------------- | -------------------------- | --------------------------------------- |
| Invalid API key     | Incorrect `RESEND_API_KEY` | Check API key in `.env`                 |
| Invalid sender      | Unverified domain          | Verify domain in Resend dashboard       |
| Rate limit exceeded | Too many emails            | Implement rate limiting or upgrade plan |
| Invalid recipient   | Malformed email address    | Validate email addresses with Zod       |

## Rate Limiting

Resend has rate limits based on your plan:

- **Free:** 100 emails/day, 3,000 emails/month
- **Pro:** 50,000 emails/month ($20)
- **Scale:** 100,000 emails/month ($80)

Consider implementing application-level rate limiting:

```typescript
import { sendEmail } from '~/models/email.server';

const emailsSent = new Map<string, number>();

function checkEmailRateLimit(userId: string, maxPerHour = 10) {
  const key = `${userId}:${Math.floor(Date.now() / (1000 * 60 * 60))}`;
  const count = emailsSent.get(key) || 0;

  if (count >= maxPerHour) {
    throw new Error('Email rate limit exceeded');
  }

  emailsSent.set(key, count + 1);
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);

  checkEmailRateLimit(user.id);

  await sendEmail({ ... });
}
```

## Best Practices

### Do This ✅

1. **Use Model Layer** - Always call functions from `app/models/email.server.ts`
2. **Validate Inputs** - Use Zod schemas for all email data
3. **Require Auth** - All email endpoints require authentication
4. **Use Templates** - React Email for consistent, professional emails
5. **Handle Errors** - Wrap email calls in try-catch blocks
6. **Track Events** - Use PostHog to monitor email delivery
7. **Verify Domain** - Use verified custom domain in production
8. **Test Templates** - Preview with `npx react-email dev`

### Don't Do This ❌

1. **Don't Call SDK Directly** - Never use `resend.emails.send()` in routes
2. **Don't Skip Auth** - Always require user authentication
3. **Don't Expose API Keys** - Never use `VITE_` prefix for Resend keys
4. **Don't Skip Validation** - Always validate email data with Zod
5. **Don't Hardcode Emails** - Use environment variables for sender addresses

## Monitoring

Email events are tracked with PostHog:

```typescript
posthog.capture('email_sent', {
    userId: user.id,
    templateName: 'welcome',
    recipient: user.email,
    timestamp: new Date().toISOString(),
});
```

Monitor in PostHog dashboard:

- Total emails sent
- Success/failure rates
- Template usage
- Delivery times
- Error rates

## Security

- **Authentication Required** - All email endpoints require valid user session
- **Input Validation** - Zod schemas validate all email payloads
- **API Key Security** - Server-only, never exposed to client
- **Rate Limiting** - Protect against abuse
- **Domain Verification** - Production requires verified domain

## Troubleshooting

### Email Not Sending

1. Verify `RESEND_API_KEY` is set correctly
2. Check console for errors
3. Ensure sender domain is verified (production only)
4. Check if rate limits are exceeded

### Email in Spam

1. Verify your domain with SPF, DKIM, DMARC records
2. Use a verified domain (not `onboarding@resend.dev` in production)
3. Warm up your domain gradually
4. Avoid spam trigger words
5. Include unsubscribe link for marketing emails

### Templates Not Rendering

1. Ensure `@react-email/components` is installed
2. Verify all required props are passed
3. Test locally with `npx react-email dev`
4. Check that `render()` is awaited

## Related Documentation

- [Authentication](./authentication.md) - BetterAuth integration
- [Forms](./forms.md) - Form handling and validation
- [API Endpoints](./.github/instructions/api-endpoints.instructions.md) - API patterns
- [Resend ADR](./decisions/010-resend-email.md) - Decision record

## External Resources

- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email/docs)
- [BetterAuth Email Docs](https://better-auth.com/docs/authentication/email)
- [React Email Components](https://react.email/docs/components/html)
