---
applyTo: 'app/lib/posthog*.ts,app/models/posthog*.ts,app/models/analytics*.ts'
---

# PostHog Analytics Integration

## Environment Variables

```bash
# Client-side analytics (VITE_ prefix = exposed to browser)
VITE_POSTHOG_API_KEY="phc_your-posthog-api-key"
VITE_POSTHOG_API_HOST="https://us.i.posthog.com"
VITE_POSTHOG_UI_HOST="https://us.posthog.com"
VITE_POSTHOG_HOST="https://us.i.posthog.com"
VITE_POSTHOG_PROJECT_ID="12345"

# Server-side analytics + feature flags (no VITE_ prefix)
POSTHOG_API_KEY="phc_your-posthog-project-api-key"
POSTHOG_HOST="https://us.i.posthog.com"
POSTHOG_PROJECT_ID="12345"
POSTHOG_PERSONAL_API_KEY="phx_..."  # Admin API (feature flag list, HogQL)
```

## Architecture

### Client-Side (`posthog-js`)

- PHProvider in `app/components/providers/PostHogProvider.tsx` initializes after hydration
- Wraps entire app in `app/root.tsx`
- Automatically captures pageviews, page leaves, session recordings
- Import hook: `import { usePostHog } from 'posthog-js/react'`

### Server-Side (`posthog-node`)

- Lazy singleton: `import { getPostHogClient, isPostHogEnabled } from '~/lib/posthog'`
- Returns `PostHog | null` — gracefully no-ops when unconfigured
- Two analytics models:
  - `app/models/posthog.server.ts` — queries PostHog via HogQL Admin API
  - `app/models/analytics.server.ts` — queries local Prisma DB for user/engagement metrics

## Client-Side Usage

```tsx
import { usePostHog } from 'posthog-js/react';

const posthog = usePostHog();

// Always optional-chain (null when unconfigured)
posthog?.capture('event_name', { property: 'value' });
posthog?.identify(user.id, { email: user.email, name: user.name });
```

### Feature Flags (Client)

```tsx
const isEnabled = posthog?.isFeatureEnabled('new-dashboard');
const payload = posthog?.getFeatureFlagPayload('announcement-banner');
```

## Server-Side Feature Flags

```typescript
import { isFeatureEnabled, getFeatureFlags } from '~/models/posthog.server';

const enabled = await isFeatureEnabled('feature-name', userId);
const flags = await getFeatureFlags(userId);
```

Feature flags are cached in `app/models/feature-flags.server.ts`.

## LLM Analytics (`@posthog/ai`)

Wrap Vercel AI SDK models with `withTracing()` to capture LLM metrics automatically:

```typescript
import { createOpenAI } from '@ai-sdk/openai';
import { withTracing } from '@posthog/ai';
import { getPostHogClient } from '~/lib/posthog';

const openAIClient = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const baseModel = openAIClient('gpt-5-mini');
const postHogClient = getPostHogClient();

const model = postHogClient
    ? withTracing(baseModel, postHogClient, {
          posthogDistinctId: user.id,
          posthogTraceId: `chat-${conversationId}`,  // Group related calls
          posthogProperties: { feature: 'ai-assistant', userPlan: user.plan },
          posthogPrivacyMode: false,  // true = exclude prompt/response data
      })
    : baseModel;
```

**Captured per `$ai_generation` event:** `$ai_model`, `$ai_latency`, `$ai_input_tokens`, `$ai_output_tokens`, `$ai_total_cost_usd`, `$ai_tools`, custom properties.

**Privacy mode** still captures tokens, latency, cost, model name — only excludes `$ai_input` and `$ai_output_choices`.

## Error Tracking (Server)

```typescript
import { captureException } from '~/models/posthog.server';

await captureException(error, { context: 'additional-info' });
```

## Conventions

- **Event names:** snake_case (`user_signed_up`, not `userSignedUp`)
- **Always optional-chain** client-side: `posthog?.capture()`
- **Never track sensitive data:** No credit card numbers, SSNs, passwords
- **Use `*-content` colors** for contrast against associated daisyUI colors
- **Clean up old flags** after full rollout
