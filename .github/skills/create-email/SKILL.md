---
name: create-email
description: Create email templates with React Email and Resend integration. Use when building transactional emails, notification templates, or integrating email sending functionality.
---

# Create Email

Creates email templates using React Email and sends them via Resend, following Iridium's three-layer architecture.

## When to Use

- Creating transactional email templates (welcome, password reset, notifications)
- Adding email sending functionality to routes
- Integrating email with webhooks or actions
- User asks to "send email", "create email template", or "add notifications"

## Architecture

```
Client/Server Code
    ↓
Model Layer (app/models/email.server.ts)
    ↓
Resend SDK (app/lib/resend.server.ts)
```

**Never call Resend SDK directly in routes. Always use model layer functions.**

## Step 1: Create Email Template

**Location:** `app/emails/[template-name].tsx`

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
                <Container style={container}>
                    <Heading style={heading}>Order Confirmed!</Heading>
                    <Text style={text}>Hi {customerName},</Text>
                    <Text style={text}>
                        Your order #{orderNumber} has been confirmed.
                    </Text>
                    <Button href={orderUrl} style={button}>
                        View Order
                    </Button>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '40px',
    borderRadius: '4px',
};

const heading = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
};

const text = {
    fontSize: '16px',
    lineHeight: '24px',
    marginBottom: '16px',
};

const button = {
    backgroundColor: '#5046e5',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '16px',
    textDecoration: 'none',
    padding: '12px 24px',
    display: 'inline-block',
};
```

## Step 2: Add Model Layer Function

**Location:** `app/models/email.server.ts`

```typescript
import { render } from '@react-email/components';
import OrderConfirmation from '~/emails/order-confirmation';
import { sendEmail } from './email.server';

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
        OrderConfirmation({
            customerName,
            orderNumber,
            orderUrl,
        }),
    );

    return sendEmail({
        to,
        subject: `Order Confirmation #${orderNumber}`,
        html,
    });
}
```

## Step 3: Use in Routes

```typescript
import type { Route } from './+types/order';
import { sendOrderConfirmation } from '~/models/email.server';

export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    const order = await createOrder(data);

    // Send confirmation email
    await sendOrderConfirmation({
        to: user.email,
        customerName: user.name,
        orderNumber: order.id,
        orderUrl: `${process.env.BETTER_AUTH_URL}/orders/${order.id}`,
    });

    return data({ success: true });
}
```

## Existing Model Layer Functions

Available in `app/models/email.server.ts`:

| Function | Purpose |
|----------|---------|
| `sendEmail(options)` | Send raw HTML/text email |
| `sendVerificationEmail({ to, verificationUrl })` | BetterAuth verification |
| `sendPasswordResetEmail({ to, resetUrl })` | BetterAuth password reset |
| `sendWelcomeEmail({ to, userName, dashboardUrl })` | Onboarding |
| `sendTransactionalEmail({ to, heading, message })` | Generic notifications |
| `sendBatchEmails(emails)` | Bulk sending |

## Environment Variables

```bash
RESEND_API_KEY="re_your-resend-api-key-here"
RESEND_FROM_EMAIL="noreply@yourdomain.com"  # Optional
```

## Testing Locally

```bash
# Preview templates
npx react-email dev
```

Use `onboarding@resend.dev` as sender during development.

## Anti-Patterns

- Calling `resend.emails.send()` directly in routes
- Sending emails without user authentication
- Exposing API keys with `VITE_` prefix
- Sending unvalidated recipient addresses
- Missing error handling for email failures

## Full Reference

See `.github/instructions/resend.instructions.md` for comprehensive documentation.
