---
applyTo: 'app/emails/**/*,app/models/email.server.ts'
---

# Resend Integration

## Architecture

```
Client/Server Code
    → Model Layer (app/models/email.server.ts)
        → Resend SDK (app/lib/resend.ts)
```

**Never call Resend SDK directly in routes. Always use model layer functions.**

## Environment Variables

```bash
RESEND_API_KEY="re_your-resend-api-key-here"      # Required
RESEND_FROM_EMAIL="noreply@yourdomain.com"         # Optional (defaults to onboarding@resend.dev)
```

## Client Setup

Lazy singleton in `app/lib/resend.ts`:
- `getResendClient()` returns `Resend | null` — gracefully no-ops when unconfigured
- `isResendEnabled()` for conditional checks

## Model Layer Functions (`app/models/email.server.ts`)

- `sendEmail(options)` — send raw HTML/text email
- `sendVerificationEmail({ to, verificationUrl })` — BetterAuth verification
- `sendPasswordResetEmail({ to, resetUrl })` — BetterAuth password reset
- `sendWelcomeEmail({ to, userName, dashboardUrl })` — onboarding
- `sendTransactionalEmail({ to, heading, message, ... })` — generic notifications
- `sendBatchEmails(emails)` — bulk sending

## BetterAuth Integration

Configured in `app/lib/auth.server.ts`:

```typescript
export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        sendResetPassword: async ({ user, url }) => {
            await sendPasswordResetEmail({ to: user.email, resetUrl: url });
        },
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            await sendVerificationEmail({ to: user.email, verificationUrl: url });
        },
        sendOnSignUp: true,
    },
});
```

## Email Templates

React Email templates live in `app/emails/`:
- `verification-email.tsx`, `password-reset-email.tsx`
- `welcome-email.tsx`, `transactional-email.tsx`
- `account-deletion-email.tsx`, `user-ban-email.tsx`
- `admin-interest-list-notification.tsx`, `interest-list-confirmation-email.tsx`

### Creating a Custom Template

```tsx
// app/emails/order-confirmation.tsx
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components';

interface OrderConfirmationProps {
    customerName: string;
    orderNumber: string;
    orderUrl: string;
}

export default function OrderConfirmation({ customerName, orderNumber, orderUrl }: OrderConfirmationProps) {
    return (
        <Html>
            <Head />
            <Preview>Your order #{orderNumber} has been confirmed</Preview>
            <Body style={{ backgroundColor: '#f6f9fc', fontFamily: '-apple-system,sans-serif' }}>
                <Container>
                    <Heading>Order Confirmed!</Heading>
                    <Text>Hi {customerName},</Text>
                    <Text>Your order #{orderNumber} has been confirmed.</Text>
                    <Button href={orderUrl}>View Order</Button>
                </Container>
            </Body>
        </Html>
    );
}
```

### Add Model Layer Function

```typescript
// app/models/email.server.ts
import OrderConfirmation from '~/emails/order-confirmation';
import { render } from '@react-email/components';

export async function sendOrderConfirmation({ to, customerName, orderNumber, orderUrl }: { ... }) {
    const html = await render(OrderConfirmation({ customerName, orderNumber, orderUrl }));
    return sendEmail({ to, subject: `Order Confirmation #${orderNumber}`, html });
}
```

## Rules

- **Always use model layer** — never `resend.emails.send()` in routes
- **Always authenticate** — call `requireUser(request)` before sending
- **Never expose API key** — no `VITE_` prefix on `RESEND_API_KEY`
- **Always validate input** — use Zod schemas for email payloads
- **Verify domain for production** — `onboarding@resend.dev` is for dev only
