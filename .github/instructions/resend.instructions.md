# Resend Integration

## Overview

Resend is a modern email API service for developers that enables sending transactional emails with a clean, developer-friendly interface. This project integrates Resend with BetterAuth for automated authentication emails and provides a centralized API endpoint for sending emails from anywhere in the application.

## React Router 7 Compatibility

This integration is built specifically for React Router 7 using config-based routing and follows the project's established patterns for API endpoints, model layer abstraction, and type safety.

## Installation

```bash
npm install resend react-email @react-email/components
```

## Project Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Required
RESEND_API_KEY="re_your-resend-api-key-here"

# Optional (defaults to onboarding@resend.dev)
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

**Get your API key:** https://resend.com/api-keys

### TypeScript Types

Environment types are automatically configured in `app/env.d.ts`:

```typescript
declare namespace NodeJS {
    interface ProcessEnv {
        RESEND_API_KEY: string;
        RESEND_FROM_EMAIL?: string;
    }
}
```

## Architecture

### 🏗️ Three-Layer Architecture

```
Client/Server Code
    ↓
API Endpoint (app/routes/api/email.server.ts)
    ↓
Model Layer (app/models/email.server.ts)
    ↓
Resend SDK (app/lib/resend.server.ts)
```

**Key principle:** Never call Resend SDK directly in routes. Always use model layer functions.

## Core Files

### 1. Resend SDK Client (`app/lib/resend.server.ts`)

```typescript
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const DEFAULT_FROM_EMAIL =
    process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
```

### 2. Email Model Layer (`app/models/email.server.ts`)

Functions for sending emails:

- `sendEmail(options)` - Send raw HTML/text email
- `sendVerificationEmail({ to, verificationUrl })` - BetterAuth verification
- `sendPasswordResetEmail({ to, resetUrl })` - BetterAuth password reset
- `sendWelcomeEmail({ to, userName, dashboardUrl })` - Onboarding
- `sendTransactionalEmail({ to, heading, message, ... })` - Generic notifications
- `sendBatchEmails(emails)` - Bulk sending

### 3. Email API Endpoint (`app/routes/api/email.server.ts`)

Central endpoint for sending emails from anywhere in the app:

```
POST /api/email           - Send custom email
POST /api/email?template=true  - Send template-based email
```

### 4. React Email Templates (`app/emails/`)

Pre-built email templates using React Email:

- `verification-email.tsx` - Email verification
- `password-reset-email.tsx` - Password reset
- `welcome-email.tsx` - Welcome new users
- `transactional-email.tsx` - Generic transactional emails

## BetterAuth Integration

### Configuration

Email sending is automatically configured in `app/lib/auth.server.ts`:

```typescript
import { sendVerificationEmail, sendPasswordResetEmail } from '~/models/email.server';

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Set to true to require verification
        sendResetPassword: async ({ user, url }) => {
            await sendPasswordResetEmail({
                to: user.email,
                resetUrl: url
            });
        }
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            await sendVerificationEmail({
                to: user.email,
                verificationUrl: url
            });
        },
        sendOnSignUp: true // Auto-send verification on signup
    },
    // ... rest of config
});
```

### Enable Email Verification

To require email verification before users can sign in:

1. Set `emailAndPassword.requireEmailVerification: true`
2. Ensure `emailVerification.sendOnSignUp: true`
3. Users will receive verification email automatically on signup

### Password Reset Flow

Password reset emails are sent automatically when users request a password reset via BetterAuth's built-in flow.

## Sending Emails

### Method 1: Using the API Endpoint (Recommended)

The `/api/email` endpoint allows sending emails from anywhere:

#### From a Client Component

```typescript
import { useFetcher } from 'react-router';

function NotificationButton() {
    const fetcher = useFetcher();

    function sendNotification() {
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
        <button onClick={sendNotification} disabled={fetcher.state !== 'idle'}>
            {fetcher.state === 'submitting' ? 'Sending...' : 'Send Email'}
        </button>
    );
}
```

#### From a Server-Side Loader/Action

```typescript
import type { Route } from './+types/example';

export async function action({ request }: Route.ActionArgs) {
    // Send email by calling the API endpoint
    const emailFormData = new FormData();
    emailFormData.append('to', 'user@example.com');
    emailFormData.append('subject', 'Order Confirmation');
    emailFormData.append('html', '<h1>Thank you for your order!</h1>');

    const response = await fetch('http://localhost:5173/api/email', {
        method: 'POST',
        headers: request.headers, // Pass through auth headers
        body: emailFormData
    });

    const result = await response.json();
    return { emailSent: result.success };
}
```

### Method 2: Using Template-Based Emails

Send emails using predefined React Email templates:

```typescript
function sendWelcomeEmailToUser() {
    const formData = new FormData();
    formData.append('templateName', 'welcome');
    formData.append('to', 'newuser@example.com');
    formData.append('props', JSON.stringify({
        userName: 'John Doe',
        dashboardUrl: 'https://yourdomain.com/dashboard'
    }));

    fetcher.submit(formData, {
        method: 'POST',
        action: '/api/email?template=true'
    });
}
```

Available templates:

- `verification` - Requires: `verificationUrl`
- `password-reset` - Requires: `resetUrl`
- `welcome` - Requires: `userName`, `dashboardUrl`
- `transactional` - Requires: `heading`, `previewText`, `message`

### Method 3: Direct Model Layer (Server-Only)

For server-side code, you can import model functions directly:

```typescript
import { sendWelcomeEmail } from '~/models/email.server';

export async function action({ request }: Route.ActionArgs) {
    const user = await createUser(data);

    // Send welcome email after signup
    await sendWelcomeEmail({
        to: user.email,
        userName: user.name,
        dashboardUrl: 'https://yourdomain.com/dashboard'
    });

    return { success: true };
}
```

## Creating Custom Email Templates

### Using React Email

React Email provides a component-based approach to building emails:

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
    Text
} from '@react-email/components';

interface OrderConfirmationProps {
    customerName: string;
    orderNumber: string;
    orderUrl: string;
}

export default function OrderConfirmation({
    customerName,
    orderNumber,
    orderUrl
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
                        Your order #{orderNumber} has been confirmed and is being processed.
                    </Text>
                    <Button href={orderUrl}>View Order</Button>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'
};
```

### Add Model Layer Function

```typescript
// app/models/email.server.ts
import OrderConfirmation from '~/emails/order-confirmation';
import { render } from '@react-email/components';

export async function sendOrderConfirmation({
    to,
    customerName,
    orderNumber,
    orderUrl
}: {
    to: string;
    customerName: string;
    orderNumber: string;
    orderUrl: string;
}) {
    const html = await render(
        OrderConfirmation({
            customerName,
            orderNumber,
            orderUrl
        })
    );

    return sendEmail({
        to,
        subject: `Order Confirmation #${orderNumber}`,
        html
    });
}
```

### Use in Your Application

```typescript
import { sendOrderConfirmation } from '~/models/email.server';

await sendOrderConfirmation({
    to: 'customer@example.com',
    customerName: 'John Doe',
    orderNumber: '12345',
    orderUrl: 'https://yourdomain.com/orders/12345'
});
```

## Testing Emails

### Development Mode

Resend provides a test domain for development:

```bash
RESEND_FROM_EMAIL="onboarding@resend.dev"
```

Emails sent from this domain will be delivered but marked as test emails.

### Preview Templates Locally

Use React Email's preview server (optional):

```bash
npx react-email dev
```

This opens a local preview server at http://localhost:3000 where you can view and test your email templates.

### Testing in Production

1. Add your domain to Resend: https://resend.com/domains
2. Verify DNS records
3. Update `RESEND_FROM_EMAIL` to use your domain

## API Endpoint Reference

### POST /api/email

Send a custom email with raw HTML or text.

**Headers:**
- Authentication required (user must be signed in)

**Body (FormData):**
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

**Body (FormData):**
```typescript
{
    templateName: "verification" | "password-reset" | "welcome" | "transactional",
    to: string,
    props: string // JSON-stringified object with template-specific props
}
```

## Validation

All email sending is validated using Zod schemas:

### `sendEmailSchema`

Validates custom email payloads:

```typescript
{
    to: string | string[], // Must be valid email(s)
    subject: string,       // 1-200 characters
    html?: string,
    text?: string,         // At least one required
    from?: string,         // Valid email
    replyTo?: string,      // Valid email
    cc?: string | string[], // Valid email(s)
    bcc?: string | string[] // Valid email(s)
}
```

### `emailTemplateSchema`

Validates template-based emails:

```typescript
{
    templateName: "verification" | "password-reset" | "welcome" | "transactional",
    to: string, // Valid email
    props: Record<string, any>
}
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
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Failed to send email` | Invalid API key | Check `RESEND_API_KEY` in `.env` |
| `Invalid sender` | Unverified domain | Verify domain in Resend dashboard |
| `Rate limit exceeded` | Too many emails | Implement rate limiting or upgrade plan |
| `Invalid recipient` | Malformed email | Validate email addresses |

## Rate Limiting

Resend has rate limits based on your plan:

- **Free:** 100 emails/day
- **Pro:** Higher limits (check your plan)

Consider implementing rate limiting:

```typescript
import { sendEmail } from '~/models/email.server';

// Simple in-memory rate limit (use Redis in production)
const emailsSent = new Map<string, number>();

function checkEmailRateLimit(userId: string, maxPerHour = 10) {
    const key = `${userId}:${Date.now() / (1000 * 60 * 60)}`;
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

### ✅ Do This

1. **Always use model layer functions** - Never call Resend SDK directly in routes
2. **Validate all inputs** - Use Zod schemas for type safety and validation
3. **Use templates** - React Email templates for consistent, professional emails
4. **Test in development** - Use `onboarding@resend.dev` for testing
5. **Handle errors gracefully** - Wrap email calls in try-catch
6. **Track email events** - Use PostHog to track email delivery
7. **Verify your domain** - For production, use a verified custom domain
8. **Rate limit** - Protect against abuse and stay within Resend limits

### ❌ Don't Do This

1. **Don't call Resend SDK directly in routes**
   ```typescript
   // ❌ BAD
   export async function action() {
       await resend.emails.send({ ... });
   }

   // ✅ GOOD
   export async function action() {
       await sendEmail({ ... });
   }
   ```

2. **Don't send emails without authentication**
   ```typescript
   // ❌ BAD
   export async function action({ request }) {
       await sendEmail({ ... });
   }

   // ✅ GOOD
   export async function action({ request }) {
       await requireUser(request); // Authenticate first
       await sendEmail({ ... });
   }
   ```

3. **Don't expose API keys to client**
   ```bash
   # ❌ BAD
   VITE_RESEND_API_KEY="re_xxx"

   # ✅ GOOD (no VITE_ prefix)
   RESEND_API_KEY="re_xxx"
   ```

4. **Don't send unvalidated input**
   ```typescript
   // ❌ BAD
   await sendEmail({
       to: request.formData().get('email'), // Not validated
       subject: 'Test'
   });

   // ✅ GOOD
   const { data, errors } = await validateFormData(
       formData,
       zodResolver(sendEmailSchema)
   );
   ```

## Advanced Features

### Batch Emails

Send multiple emails at once:

```typescript
import { sendBatchEmails } from '~/models/email.server';

const emails = users.map(user => ({
    to: user.email,
    subject: 'Newsletter',
    html: '<h1>Monthly Update</h1>'
}));

const result = await sendBatchEmails(emails);
// { success: true, total: 100, successful: 98, failed: 2 }
```

### Dynamic Templates

Pass dynamic data to templates:

```typescript
await sendTransactionalEmail({
    to: user.email,
    heading: 'Account Approved!',
    previewText: 'Your account has been approved',
    message: `Hi ${user.name}, your account has been approved and you can now access all features.`,
    buttonText: 'Get Started',
    buttonUrl: 'https://yourdomain.com/dashboard'
});
```

### Email with Attachments

Resend supports attachments (see Resend docs for details):

```typescript
await resend.emails.send({
    from: DEFAULT_FROM_EMAIL,
    to: 'user@example.com',
    subject: 'Invoice',
    html: '<p>Please find attached invoice</p>',
    attachments: [
        {
            filename: 'invoice.pdf',
            content: pdfBuffer
        }
    ]
});
```

## Monitoring & Analytics

Email events are tracked with PostHog:

```typescript
// Successful send
posthog.capture('email_sent', {
    userId: user.id,
    templateName: 'welcome',
    recipient: user.email
});

// Failed send
posthog.captureException(error, {
    userId: user.id,
    context: 'email_api'
});
```

View email metrics in PostHog dashboard:
- Total emails sent
- Success/failure rates
- Template usage
- User engagement

## Troubleshooting

### Email Not Sending

1. **Check API key:** Verify `RESEND_API_KEY` is correct
2. **Check logs:** Look for errors in console
3. **Verify domain:** Ensure sender domain is verified in Resend
4. **Check rate limits:** May have exceeded plan limits

### Email in Spam

1. **Verify domain:** Add SPF, DKIM, DMARC records
2. **Use verified domain:** Don't use `onboarding@resend.dev` in production
3. **Warm up domain:** Gradually increase sending volume
4. **Good content:** Avoid spam trigger words, include unsubscribe link

### Templates Not Rendering

1. **Check imports:** Ensure `@react-email/components` is installed
2. **Check props:** Verify all required props are passed
3. **Test locally:** Use `npx react-email dev` to preview
4. **Check render:** Ensure `render()` is awaited

## Related Documentation

- [Resend Official Docs](https://resend.com/docs)
- [React Email Docs](https://react.email/docs)
- [BetterAuth Email Integration](https://better-auth.com/docs/authentication/email)
- [API Endpoints Pattern](.github/instructions/api-endpoints.instructions.md)
- [Environment Variables](.github/instructions/env.instructions.md)
- [Form Validation](.github/instructions/form-validation.instructions.md)

## Reference Implementation

- **Model Layer:** `app/models/email.server.ts`
- **API Endpoint:** `app/routes/api/email.server.ts`
- **BetterAuth Integration:** `app/lib/auth.server.ts`
- **Templates:** `app/emails/`
