# PostHog Analytics Integration

## Overview

This project includes PostHog integration for analytics, session recordings, feature flags, and more. PostHog is initialized client-side after hydration to prevent SSR issues.

## Environment Variables

Add these to your `.env` file:

```bash
# PostHog (optional - for analytics and feature flags)
VITE_POSTHOG_API_KEY="phc_your-posthog-api-key"
VITE_POSTHOG_HOST="https://us.i.posthog.com"  # or "https://eu.i.posthog.com" or self-hosted URL
```

**Note**: Environment variables prefixed with `VITE_` are exposed to the client-side code.

## Configuration

### 1. Vite Configuration

PostHog packages are configured as SSR externals in `vite.config.ts`:

```typescript
export default defineConfig({
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    ssr: {
        noExternal: ['posthog-js', 'posthog-js/react'],
    },
});
```

### 2. PostHog Provider

The `PHProvider` component in `app/lib/posthog-provider.tsx` initializes PostHog after hydration:

```typescript
import { PHProvider } from '~/lib/posthog-provider';

// PostHog only initializes if environment variables are set
// This prevents errors in development when PostHog is not configured
```

### 3. Root Layout Integration

PostHog provider wraps the entire app in `app/root.tsx`:

```tsx
<body className="min-h-screen flex flex-col">
    <PHProvider>
        <Header />
        <main className="flex-grow">{mainContent}</main>
        <Footer />
        {hasAccessPermissions && <DrawerTrigger />}
        <ScrollRestoration />
        <Scripts />
    </PHProvider>
</body>
```

## Usage

### Automatic Features

Once configured, PostHog automatically captures:

- **Pageviews** - Every route navigation
- **Page leaves** - When users navigate away
- **Session recordings** - User interactions (configurable)

### Using PostHog Hook

Import the `usePostHog` hook in any component:

```tsx
import { usePostHog } from 'posthog-js/react';

export default function MyComponent() {
    const posthog = usePostHog();

    const handleAction = () => {
        // Track custom event
        posthog?.capture('button_clicked', {
            button_name: 'Submit',
            page: 'Dashboard',
        });
    };

    return <button onClick={handleAction}>Submit</button>;
}
```

### Custom Event Tracking

```tsx
import { usePostHog } from 'posthog-js/react';

export default function SignUpForm() {
    const posthog = usePostHog();

    const handleSubmit = async (data: SignUpData) => {
        try {
            await createAccount(data);

            // Track successful sign up
            posthog?.capture('user_signed_up', {
                method: 'email',
                plan: data.plan,
            });
        } catch (error) {
            // Track errors
            posthog?.capture('signup_error', {
                error: error.message,
            });
        }
    };

    return <form onSubmit={handleSubmit}>...</form>;
}
```

### Identify Users

Identify authenticated users for better analytics:

```tsx
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';
import { useAuthenticatedContext } from '~/hooks/useAuthenticatedContext';

export default function Dashboard() {
    const posthog = usePostHog();
    const { user } = useAuthenticatedContext();

    useEffect(() => {
        if (user && posthog) {
            // Identify user with their ID
            posthog.identify(user.id, {
                email: user.email,
                name: user.name,
                // Add any other user properties
            });
        }
    }, [user, posthog]);

    return <div>Dashboard content</div>;
}
```

### Feature Flags

PostHog feature flags enable you to toggle features for cohorts or individuals, perform gradual rollouts, and test impact before releasing to everyone.

#### Basic Feature Flag Usage

```tsx
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';

export default function ExperimentalFeature() {
    const posthog = usePostHog();
    const [showFeature, setShowFeature] = useState(false);

    useEffect(() => {
        if (posthog) {
            const isEnabled = posthog.isFeatureEnabled('new-dashboard');
            setShowFeature(isEnabled);
        }
    }, [posthog]);

    if (!showFeature) {
        return <div>Standard dashboard</div>;
    }

    return <div>New experimental dashboard</div>;
}
```

#### Feature Flag with Payload

Feature flags can carry arbitrary data (strings, numbers, objects, arrays):

```tsx
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';

export default function AnnouncementBanner() {
    const posthog = usePostHog();
    const [bannerConfig, setBannerConfig] = useState<any>(null);

    useEffect(() => {
        if (posthog) {
            const payload = posthog.getFeatureFlagPayload(
                'announcement-banner',
            );
            if (payload) {
                setBannerConfig(payload);
            }
        }
    }, [posthog]);

    if (!bannerConfig) return null;

    return (
        <div className={`alert alert-${bannerConfig.type}`}>
            <h3>{bannerConfig.title}</h3>
            <p>{bannerConfig.message}</p>
            {bannerConfig.ctaUrl && (
                <a href={bannerConfig.ctaUrl}>{bannerConfig.ctaText}</a>
            )}
        </div>
    );
}
```

#### Canary Releases (Gradual Rollout)

Use feature flags for gradual feature rollouts to a percentage of users:

```tsx
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';

export default function NewCheckoutFlow() {
    const posthog = usePostHog();
    const [useNewFlow, setUseNewFlow] = useState(false);

    useEffect(() => {
        if (posthog) {
            // Flag set to 10% rollout in PostHog dashboard
            const isEnabled = posthog.isFeatureEnabled('new-checkout-flow');
            setUseNewFlow(isEnabled);

            // Track which version user sees
            posthog.capture('checkout_version_shown', {
                version: isEnabled ? 'new' : 'old',
            });
        }
    }, [posthog]);

    return useNewFlow ? <NewCheckout /> : <LegacyCheckout />;
}
```

#### One-Time Feature Flags

Show content or popups only once per user:

```tsx
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';

export default function WelcomeModal() {
    const posthog = usePostHog();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (posthog) {
            const hasSeenWelcome = localStorage.getItem('seen-welcome-modal');
            const featureEnabled = posthog.isFeatureEnabled('welcome-modal');

            if (featureEnabled && !hasSeenWelcome) {
                setShowModal(true);
            }
        }
    }, [posthog]);

    const handleClose = () => {
        localStorage.setItem('seen-welcome-modal', 'true');
        setShowModal(false);
        posthog?.capture('welcome_modal_closed');
    };

    if (!showModal) return null;

    return (
        <Modal open={showModal} onClose={handleClose}>
            <h2>Welcome to our app!</h2>
            <p>Here's what's new...</p>
        </Modal>
    );
}
```

#### Server-Side Feature Flags

For API routes or server-side rendering, use PostHog Node SDK (requires additional setup):

```typescript
// Note: Requires installing posthog-node separately
import type { Route } from './+types/api-endpoint';
import { requireUser } from '~/lib/session.server';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);

    // Server-side feature flag evaluation would require PostHog Node SDK
    // For now, prefer client-side feature flags with usePostHog hook

    return data({ data: 'response' });
}
```

### Group Analytics

Track user cohorts or product lines:

```tsx
import { usePostHog } from 'posthog-js/react';

export default function ProductPage() {
    const posthog = usePostHog();

    useEffect(() => {
        if (posthog) {
            // Associate user with product or cohort
            posthog.group('product', 'premium-course', {
                name: 'Premium Course',
                type: 'digital-product',
            });
        }
    }, [posthog]);

    return <div>Product content</div>;
}
```

## A/B Testing & Experiments

PostHog experiments allow you to test different variations of your product and measure statistical significance of results.

### Creating an Experiment

1. Create a feature flag in PostHog dashboard
2. Set up variants (control, test-a, test-b, etc.)
3. Define success metrics (conversions, revenue, custom events)
4. Launch the experiment

### Basic Experiment Implementation

```tsx
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';

export default function PricingPage() {
    const posthog = usePostHog();
    const [variant, setVariant] = useState<string>('control');

    useEffect(() => {
        if (posthog) {
            // Get experiment variant
            const experimentVariant =
                posthog.getFeatureFlag('pricing-experiment');
            setVariant(experimentVariant as string);

            // Track exposure (user saw this variant)
            posthog.capture('$feature_flag_called', {
                $feature_flag: 'pricing-experiment',
                $feature_flag_response: experimentVariant,
            });
        }
    }, [posthog]);

    return (
        <Container>
            {variant === 'control' && <StandardPricing />}
            {variant === 'test-a' && <SimplifiedPricing />}
            {variant === 'test-b' && <ValueBasedPricing />}
        </Container>
    );
}
```

### Tracking Conversion Events

```tsx
import { usePostHog } from 'posthog-js/react';

export default function CheckoutButton() {
    const posthog = usePostHog();

    const handleCheckout = () => {
        // Track the conversion event for experiment analysis
        posthog?.capture('checkout_initiated', {
            price: 99.99,
            plan: 'pro',
        });

        // Proceed with checkout
        window.location.href = '/checkout';
    };

    return <Button onClick={handleCheckout}>Start Checkout</Button>;
}
```

### Experiment on New Users Only

Test changes to onboarding flows without affecting existing users:

```tsx
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';

export default function OnboardingFlow() {
    const posthog = usePostHog();
    const [showNewOnboarding, setShowNewOnboarding] = useState(false);

    useEffect(() => {
        if (posthog) {
            // Check if user is new (e.g., created within last 24 hours)
            const userCreatedAt = new Date(user.createdAt);
            const isNewUser = Date.now() - userCreatedAt.getTime() < 86400000;

            if (isNewUser) {
                const variant = posthog.getFeatureFlag('onboarding-experiment');
                setShowNewOnboarding(variant === 'new-flow');
            }
        }
    }, [posthog]);

    return showNewOnboarding ? <NewOnboarding /> : <StandardOnboarding />;
}
```

### Holdout Groups

Create control groups that never see a feature to measure long-term impact:

```tsx
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';

export default function RecommendationEngine() {
    const posthog = usePostHog();
    const [showRecommendations, setShowRecommendations] = useState(true);

    useEffect(() => {
        if (posthog) {
            // 95% see recommendations, 5% holdout group doesn't
            const isInHoldout =
                posthog.getFeatureFlag('recommendations-holdout') === 'holdout';
            setShowRecommendations(!isInHoldout);

            posthog.capture('recommendations_exposure', {
                group: isInHoldout ? 'holdout' : 'treatment',
            });
        }
    }, [posthog]);

    return (
        <div>
            <h2>For You</h2>
            {showRecommendations ? <RecommendedItems /> : <TrendingItems />}
        </div>
    );
}
```

## Error Tracking

PostHog automatically captures exceptions and errors, providing context through session replays and user data.

### Automatic Exception Capture

PostHog automatically captures unhandled errors when configured:

```typescript
// In app/lib/posthog-provider.tsx
posthog.init(apiKey, {
    api_host: host,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    // Enable automatic exception capture
    autocapture: {
        capture_exceptions: true, // Captures unhandled exceptions
    },
});
```

### Manual Error Tracking

Capture handled errors with additional context:

```tsx
import { usePostHog } from 'posthog-js/react';

export default function DataFetchingComponent() {
    const posthog = usePostHog();

    const fetchData = async () => {
        try {
            const response = await fetch('/api/data');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            // Manually capture the error with context
            posthog?.captureException(error, {
                context: 'data_fetching',
                endpoint: '/api/data',
                userId: user?.id,
                timestamp: new Date().toISOString(),
            });

            // Show user-friendly error
            toast.error('Failed to load data');
        }
    };

    return <button onClick={fetchData}>Load Data</button>;
}
```

### Error Boundaries with PostHog

Integrate PostHog with React Error Boundaries:

```tsx
import { Component, ReactNode } from 'react';
import posthog from 'posthog-js';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Send error to PostHog
        posthog.captureException(error, {
            errorInfo: errorInfo.componentStack,
            errorBoundary: true,
            timestamp: new Date().toISOString(),
        });

        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="alert alert-error">
                        <h2>Something went wrong</h2>
                        <p>We've been notified and are looking into it.</p>
                        <Button
                            onClick={() => this.setState({ hasError: false })}
                        >
                            Try Again
                        </Button>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}

// Usage in routes
export default function Dashboard() {
    return (
        <ErrorBoundary>
            <DashboardContent />
        </ErrorBoundary>
    );
}
```

### Form Validation Errors

Track validation errors to identify problematic form fields:

```tsx
import { usePostHog } from 'posthog-js/react';
import { useValidatedForm } from '~/lib/form-hooks';

export default function SignUpForm() {
    const posthog = usePostHog();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useValidatedForm({
        resolver: signUpSchema,
    });

    // Track validation errors
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            posthog?.capture('form_validation_error', {
                form: 'sign_up',
                fields: Object.keys(errors),
                errorCount: Object.keys(errors).length,
            });
        }
    }, [errors, posthog]);

    return <form onSubmit={handleSubmit}>...</form>;
}
```

### API Error Tracking

Monitor API failures and response times:

```tsx
import { usePostHog } from 'posthog-js/react';

export async function apiCall(endpoint: string, options?: RequestInit) {
    const posthog = usePostHog();
    const startTime = Date.now();

    try {
        const response = await fetch(endpoint, options);
        const duration = Date.now() - startTime;

        if (!response.ok) {
            posthog?.captureException(
                new Error(`API Error: ${response.status}`),
                {
                    endpoint,
                    status: response.status,
                    duration,
                    method: options?.method || 'GET',
                },
            );
        }

        // Track successful API calls with timing
        posthog?.capture('api_call_completed', {
            endpoint,
            status: response.status,
            duration,
            success: response.ok,
        });

        return response;
    } catch (error) {
        const duration = Date.now() - startTime;

        posthog?.captureException(error, {
            endpoint,
            duration,
            type: 'network_error',
        });

        throw error;
    }
}
```

### Viewing Errors in PostHog

1. Navigate to "Error Tracking" in PostHog dashboard
2. View exceptions grouped by fingerprint (stack trace)
3. See associated session replays to reproduce issues
4. Track error trends over time
5. Create alerts for critical errors

## LLM Analytics

PostHog provides comprehensive analytics for AI/LLM features through the `@posthog/ai` package. This integration automatically captures detailed metrics about every AI generation.

### Setup

The LLM analytics integration is already configured in Iridium:

1. **Dependencies installed**: `@posthog/ai` and `posthog-node` packages
2. **Server-side client**: `~/lib/posthog.ts` provides `postHogClient` singleton
3. **Chat endpoint**: `~/routes/api/chat.ts` wraps OpenAI client with tracing

### Environment Variables

Add server-side PostHog credentials (different from client-side analytics):

```bash
# Server-side PostHog (for LLM analytics)
POSTHOG_API_KEY="phc_your-posthog-project-api-key"
POSTHOG_HOST="https://us.i.posthog.com"  # or "https://eu.i.posthog.com"

# OpenAI (required for AI features)
OPENAI_API_KEY="sk-proj-your-openai-api-key"
```

Note: `POSTHOG_API_KEY` (server-side) is different from `VITE_POSTHOG_API_KEY` (client-side).

### Basic Usage

Wrap your Vercel AI SDK model with PostHog tracing:

```typescript
import { createOpenAI } from '@ai-sdk/openai';
import { withTracing } from '@posthog/ai';
import { postHogClient } from '~/lib/posthog';

const openAIClient = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
    posthogDistinctId: user.id,
});

// Use model with streamText or generateText
const result = streamText({
    model,
    messages: convertToModelMessages(messages),
});
```

### Captured Events

Each LLM call automatically generates an `$ai_generation` event with:

```typescript
{
    $ai_model: 'gpt-4o',           // Model used
    $ai_latency: 1.234,            // Response time in seconds
    $ai_input_tokens: 150,          // Prompt tokens
    $ai_output_tokens: 450,         // Completion tokens
    $ai_total_cost_usd: 0.0234,    // Estimated cost
    $ai_tools: [...],              // Available tools/functions
    $ai_input: [...],              // Prompt messages
    $ai_output_choices: [...],     // Response choices
    // Plus any custom properties
}
```

### Enriching Events

Add custom properties for better analytics:

```typescript
const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
    posthogDistinctId: user.id,
    posthogTraceId: `conversation-${conversationId}`, // Group related calls
    posthogProperties: {
        conversationId,
        feature: 'ai-assistant',
        userPlan: user.plan,
        intent: 'content-generation',
        sessionId: request.headers.get('x-request-id'),
    },
});
```

### Privacy Mode

Exclude sensitive prompt/response data while keeping metrics:

```typescript
const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
    posthogDistinctId: user.id,
    posthogPrivacyMode: true, // Excludes $ai_input and $ai_output_choices
});
```

Privacy mode still captures:

- Token counts
- Latency
- Cost
- Model name
- Tools used
- Custom properties

### Trace-Level Analytics

Group multiple LLM calls into conversation traces:

```typescript
// Generate trace ID for the conversation
const traceId = `chat-${conversationId}`;

// First message
const model1 = withTracing(openAIClient('gpt-4o'), postHogClient, {
    posthogDistinctId: user.id,
    posthogTraceId: traceId,
    posthogProperties: { messageIndex: 1 },
});

// Follow-up message (same trace)
const model2 = withTracing(openAIClient('gpt-4o'), postHogClient, {
    posthogDistinctId: user.id,
    posthogTraceId: traceId,
    posthogProperties: { messageIndex: 2 },
});
```

View conversation-level analytics in PostHog's **Traces** tab:

- Total conversation cost
- Average latency per message
- Total tokens used
- Tool usage patterns

### Cost Monitoring

Track AI spending across dimensions:

```typescript
// Add cost-tracking properties
const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
    posthogDistinctId: user.id,
    posthogProperties: {
        feature: 'content-generation',
        userPlan: user.plan, // Track cost by plan tier
        productId: user.currentProduct, // Track cost by product
    },
});
```

Create PostHog insights to monitor:

- Total cost by user, feature, or product
- Cost trends over time
- Most expensive models or features
- Token usage patterns

### Anonymous LLM Tracking

Track LLM calls without identifying users:

```typescript
const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
    // Omit posthogDistinctId for anonymous tracking
    posthogProperties: {
        feature: 'public-demo',
        source: 'landing-page',
    },
});
```

### Integration with Feature Flags

Use PostHog feature flags to control AI models:

```typescript
import { requireUser } from '~/lib/session.server';
import { postHogClient } from '~/lib/posthog';

export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);

    // Check feature flag for model selection
    const advancedModel = await postHogClient.isFeatureEnabled(
        'advanced-ai-model',
        user.id,
    );

    const modelName = advancedModel ? 'gpt-4o' : 'gpt-4o-mini';

    const model = withTracing(openAIClient(modelName), postHogClient, {
        posthogDistinctId: user.id,
        posthogProperties: {
            model: modelName,
            featureFlag: 'advanced-ai-model',
            flagEnabled: advancedModel,
        },
    });

    // Use model...
}
```

### Real-World Examples

#### Customer Support Chat

```typescript
export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    const { messages, ticketId } = await request.json();

    const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
        posthogDistinctId: user.id,
        posthogTraceId: `support-ticket-${ticketId}`,
        posthogProperties: {
            feature: 'customer-support',
            ticketId,
            ticketPriority: ticket.priority,
            ticketCategory: ticket.category,
            agentAssigned: ticket.agentId || 'ai-only',
        },
        posthogGroups: {
            company: user.organizationId,
        },
    });

    const result = streamText({
        model,
        messages: convertToModelMessages(messages),
        system: 'You are a helpful customer support assistant.',
    });

    return result.toUIMessageStreamResponse();
}
```

#### Code Generation with Model Selection

```typescript
export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    const { prompt, complexity } = await request.json();

    // Use advanced model for complex tasks
    const modelName = complexity === 'advanced' ? 'gpt-4o' : 'gpt-4o-mini';

    const model = withTracing(openAIClient(modelName), postHogClient, {
        posthogDistinctId: user.id,
        posthogTraceId: `codegen-${Date.now()}`,
        posthogProperties: {
            feature: 'code-generation',
            language: 'typescript',
            framework: 'react',
            complexity,
            modelUsed: modelName,
        },
    });

    const result = await generateText({
        model,
        prompt,
        system: 'You are an expert TypeScript and React developer.',
    });

    return data({ code: result.text });
}
```

#### Content Generation with Privacy Mode

```typescript
export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    const { topic, tone } = await request.json();

    // Enable privacy mode for user-generated content
    const model = withTracing(openAIClient('gpt-4o-mini'), postHogClient, {
        posthogDistinctId: user.id,
        posthogPrivacyMode: true, // Don't log sensitive content
        posthogProperties: {
            feature: 'content-generation',
            contentType: 'blog-post',
            tone,
            targetLength: 1000,
        },
    });

    const result = await generateText({
        model,
        prompt: `Write a blog post about ${topic} in a ${tone} tone.`,
    });

    return data({ content: result.text });
}
```

### Viewing Analytics

1. Navigate to **LLM Analytics** in PostHog dashboard
2. **Generations tab**: Individual LLM calls with full details
3. **Traces tab**: Conversation-level analytics
4. Filter by:
    - User (distinct ID)
    - Model (gpt-4o, gpt-4o-mini, etc.)
    - Cost range
    - Latency
    - Custom properties (feature, plan, etc.)
5. Create insights and dashboards:
    - Total AI spend by feature
    - Average tokens per user
    - Latency trends over time
    - Most expensive conversations

### Setting Up Alerts

Create PostHog alerts for:

1. **High costs**: Alert when daily AI spend exceeds threshold
2. **Slow responses**: Alert when latency > 5 seconds
3. **Errors**: Alert on failed LLM calls
4. **Unusual patterns**: Alert on sudden spikes in usage

### Best Practices

1. **Always pass distinct ID**: Enables user-level tracking and cohort analysis
2. **Use trace IDs**: Group related LLM calls into conversations or sessions
3. **Add meaningful properties**: Include feature, intent, plan, organization for filtering
4. **Enable privacy mode**: For sensitive data (medical, legal, financial, PII)
5. **Monitor costs regularly**: Set up weekly cost review dashboards
6. **Track tool usage**: Identify which tools provide value
7. **Measure user impact**: Correlate LLM usage with user engagement/retention
8. **A/B test models**: Compare GPT-4o vs GPT-4o-mini performance and cost
9. **Set cost budgets**: Use feature flags to limit expensive models to certain users
10. **Document trace IDs**: Use consistent naming conventions for easier filtering

### Performance Optimization

#### Model Selection Strategy

```typescript
// Use cheaper model for simple tasks
const getModelForComplexity = (complexity: string) => {
    switch (complexity) {
        case 'simple':
            return 'gpt-4o-mini'; // ~$0.15 per 1M tokens
        case 'moderate':
            return 'gpt-4o-mini'; // Still cost-effective
        case 'complex':
            return 'gpt-4o'; // ~$2.50 per 1M tokens
        default:
            return 'gpt-4o-mini';
    }
};

const model = withTracing(
    openAIClient(getModelForComplexity(taskComplexity)),
    postHogClient,
    {
        posthogDistinctId: user.id,
        posthogProperties: {
            taskComplexity,
            modelSelected: getModelForComplexity(taskComplexity),
        },
    },
);
```

#### Caching Responses

```typescript
import { cache } from '~/lib/cache.server';
import { getUserScopedKey } from '~/lib/cache';

export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    const { prompt } = await request.json();

    // Check cache first
    const cacheKey = getUserScopedKey(user.id, `ai-response-${hash(prompt)}`);
    const cached = cache.getKey(cacheKey);

    if (cached) {
        // Track cache hit
        postHogClient.capture({
            distinctId: user.id,
            event: 'ai_cache_hit',
            properties: { feature: 'chat', prompt: prompt.substring(0, 50) },
        });
        return data({ text: cached });
    }

    // Cache miss - call LLM
    const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
        posthogDistinctId: user.id,
        posthogProperties: { feature: 'chat', cacheHit: false },
    });

    const result = await generateText({ model, prompt });

    // Cache for 1 hour
    cache.setKey(cacheKey, result.text, 3600);

    return data({ text: result.text });
}
```

### Troubleshooting

#### Events not appearing

1. Check `POSTHOG_API_KEY` is set (server-side, no `VITE_` prefix)
2. Verify `POSTHOG_HOST` matches your region (us.i.posthog.com or eu.i.posthog.com)
3. Ensure `postHogClient` is imported from `~/lib/posthog`
4. Check PostHog dashboard after 1-2 minutes (events aren't instant)
5. Look for errors in server logs

#### Missing cost data

- Cost estimation requires token counts from OpenAI API
- Costs are approximate based on published pricing
- Custom fine-tuned models may not have cost data

#### Privacy mode not excluding data

- Verify `posthogPrivacyMode: true` is set in `withTracing()` options
- Privacy mode only affects `$ai_input` and `$ai_output_choices`
- Other properties (tokens, cost, latency) are still captured

#### Trace grouping not working

- Ensure same `posthogTraceId` is used for all calls in a conversation
- Trace IDs must be strings
- Check for typos in trace ID generation

### Additional Resources

- [PostHog LLM Analytics Docs](https://posthog.com/docs/llm-analytics)
- [Vercel AI SDK Integration](https://posthog.com/docs/llm-analytics/installation/vercel-ai)
- [PostHog Node SDK Reference](https://posthog.com/docs/libraries/node)
- [Manual Event Capture Schema](https://posthog.com/docs/llm-analytics/manual-capture)
- [LLM Analytics Best Practices](https://posthog.com/docs/llm-analytics/best-practices)

## Server-Side Events

For server-side event tracking (e.g., API routes):

```typescript
import type { Route } from './+types/api-endpoint';
import { requireUser } from '~/lib/session.server';

export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);

    // Server-side tracking would require PostHog Node SDK
    // For now, prefer client-side tracking with usePostHog hook

    return data({ success: true });
}
```

**Note**: This boilerplate uses client-side PostHog tracking. For server-side tracking, install `posthog-node` and create a server-side singleton similar to other services.

## Advanced Features

### Session Recordings

PostHog automatically records user sessions (if enabled in dashboard):

```tsx
import { usePostHog } from 'posthog-js/react';

export default function SupportTicket() {
    const posthog = usePostHog();

    const handleSubmitTicket = (ticketData: TicketData) => {
        // Include session recording URL in support ticket
        const sessionRecordingUrl = posthog?.get_session_replay_url();

        submitTicket({
            ...ticketData,
            sessionRecordingUrl, // Support team can watch what happened
            posthogPersonId: posthog?.get_distinct_id(),
        });
    };

    return <TicketForm onSubmit={handleSubmitTicket} />;
}
```

### Surveys and Feedback

Show in-app surveys based on user behavior:

```tsx
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';

export default function PostCheckoutPage() {
    const posthog = usePostHog();

    useEffect(() => {
        if (posthog) {
            // Trigger survey after successful checkout
            posthog.capture('checkout_completed');

            // PostHog will show survey if configured in dashboard
            // to users who just completed checkout
        }
    }, [posthog]);

    return <div>Thank you for your purchase!</div>;
}
```

### Multi-Project Setup

If you have multiple environments or projects:

```typescript
// app/lib/posthog-provider.tsx
const getPostHogConfig = () => {
    const env = import.meta.env.MODE;

    switch (env) {
        case 'production':
            return {
                apiKey: import.meta.env.VITE_POSTHOG_API_KEY_PROD,
                host: 'https://us.i.posthog.com',
            };
        case 'staging':
            return {
                apiKey: import.meta.env.VITE_POSTHOG_API_KEY_STAGING,
                host: 'https://us.i.posthog.com',
            };
        default:
            return {
                apiKey: import.meta.env.VITE_POSTHOG_API_KEY_DEV,
                host: 'https://us.i.posthog.com',
            };
    }
};
```

### Sampling High-Volume Events

Use feature flags to sample high-volume events:

```tsx
import { usePostHog } from 'posthog-js/react';

export default function HighVolumeComponent() {
    const posthog = usePostHog();

    const trackEvent = () => {
        // Only track 10% of these events to reduce costs
        const shouldSample =
            posthog?.getFeatureFlag('high-volume-sampling') === 'enabled';

        if (shouldSample && Math.random() < 0.1) {
            posthog?.capture('high_volume_event', {
                sampled: true,
                rate: 0.1,
            });
        }
    };

    return <button onClick={trackEvent}>Action</button>;
}
```

## Best Practices

### 1. Optional Check Pattern

Always check if PostHog is initialized:

```tsx
const posthog = usePostHog();

// Safe - won't throw if PostHog not configured
posthog?.capture('event_name');

// Unsafe - will throw if PostHog not configured
posthog.capture('event_name');
```

### 2. Event Naming Convention

Use snake_case for event names:

```tsx
posthog?.capture('user_signed_in'); // ✅ Good
posthog?.capture('userSignedIn'); // ❌ Avoid
posthog?.capture('User Signed In'); // ❌ Avoid
```

### 3. Meaningful Properties

Include relevant context with events:

```tsx
// ✅ Good - includes context
posthog?.capture('checkout_completed', {
    total_amount: 99.99,
    currency: 'USD',
    items_count: 3,
    payment_method: 'credit_card',
});

// ❌ Bad - no context
posthog?.capture('checkout_completed');
```

### 4. Privacy Considerations

Avoid tracking sensitive information:

```tsx
// ❌ Bad - includes sensitive data
posthog?.capture('payment_made', {
    credit_card_number: '4111111111111111', // Never!
    ssn: '123-45-6789', // Never!
});

// ✅ Good - uses IDs and non-sensitive data
posthog?.capture('payment_made', {
    payment_method_id: 'pm_123',
    amount: 99.99,
});
```

### 5. Feature Flag Best Practices

- **Use descriptive names**: `new-checkout-flow` not `flag-123`
- **Document flags**: Add descriptions in PostHog dashboard
- **Clean up old flags**: Remove flags after full rollout
- **Test locally**: Override flags in development with `posthog.featureFlags.override()`
- **Gradual rollouts**: Start at 5-10%, monitor, then increase

### 6. Experiment Best Practices

- **Define success metrics upfront**: Know what you're measuring
- **Run until statistical significance**: Don't stop experiments early
- **Sample size matters**: Ensure enough users see each variant
- **One variable at a time**: Don't change multiple things simultaneously
- **Document learnings**: Record experiment outcomes for team knowledge

### 7. Error Tracking Best Practices

- **Add context**: Include user ID, route, relevant state
- **Don't track expected errors**: Only track unexpected issues
- **Set up alerts**: Get notified of critical errors immediately
- **Review regularly**: Check error dashboard weekly
- **Fix systematically**: Prioritize high-impact errors

### 8. Performance Optimization

```tsx
// Batch events instead of sending individually
const events: Array<{ event: string; properties: any }> = [];

const batchCapture = (event: string, properties: any) => {
    events.push({ event, properties });

    // Send in batches
    if (events.length >= 10) {
        events.forEach(({ event, properties }) => {
            posthog?.capture(event, properties);
        });
        events.length = 0;
    }
};
```

## Debugging

### Check if PostHog is Initialized

```tsx
import { usePostHog } from 'posthog-js/react';

export default function DebugPostHog() {
    const posthog = usePostHog();

    useEffect(() => {
        if (posthog) {
            console.log('PostHog initialized:', posthog);
            console.log('PostHog distinct ID:', posthog.get_distinct_id());
        } else {
            console.warn(
                'PostHog not initialized - check environment variables',
            );
        }
    }, [posthog]);

    return null;
}
```

### View Events in Browser

1. Open browser DevTools
2. Go to Network tab
3. Filter for requests to your PostHog host
4. Look for `/e/` and `/decide/` endpoints

## Real-World Use Cases

### Location-Based Banners

Show regional announcements based on user location:

```tsx
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';

export default function LocationBanner() {
    const posthog = usePostHog();
    const [banner, setBanner] = useState<any>(null);

    useEffect(() => {
        if (posthog) {
            const userProperties = posthog.getPersonProperties();
            const userCountry = userProperties?.$geoip_country_code;

            // Show country-specific banner via feature flag payload
            const payload = posthog.getFeatureFlagPayload(
                `banner-${userCountry?.toLowerCase()}`,
            );
            if (payload) {
                setBanner(payload);
            }
        }
    }, [posthog]);

    if (!banner) return null;

    return (
        <div className="alert alert-info">
            <p>{banner.message}</p>
        </div>
    );
}
```

### Popup Management

Use feature flags to control popups and modals:

```tsx
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';

export default function DynamicPopup() {
    const posthog = usePostHog();
    const [popupConfig, setPopupConfig] = useState<any>(null);

    useEffect(() => {
        if (posthog) {
            const payload = posthog.getFeatureFlagPayload('marketing-popup');

            if (payload) {
                // Check if user hasn't dismissed this popup version
                const dismissedVersion = localStorage.getItem(
                    'popup-dismissed-version',
                );

                if (dismissedVersion !== payload.version) {
                    setPopupConfig(payload);
                }
            }
        }
    }, [posthog]);

    const handleDismiss = () => {
        localStorage.setItem('popup-dismissed-version', popupConfig.version);
        setPopupConfig(null);

        posthog?.capture('popup_dismissed', {
            version: popupConfig.version,
            title: popupConfig.title,
        });
    };

    if (!popupConfig) return null;

    return (
        <Modal open={!!popupConfig} onClose={handleDismiss}>
            <h2>{popupConfig.title}</h2>
            <p>{popupConfig.message}</p>
            {popupConfig.ctaUrl && (
                <a href={popupConfig.ctaUrl}>{popupConfig.ctaText}</a>
            )}
        </Modal>
    );
}
```

### Beta Feature Access

Gate beta features behind feature flags for specific users:

```tsx
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';
import { useAuthenticatedContext } from '~/hooks/useAuthenticatedContext';

export default function BetaFeatures() {
    const posthog = usePostHog();
    const { user } = useAuthenticatedContext();
    const [hasBetaAccess, setHasBetaAccess] = useState(false);

    useEffect(() => {
        if (posthog && user) {
            // Check if user is in beta program
            const isBetaUser = posthog.isFeatureEnabled('beta-program');
            setHasBetaAccess(isBetaUser);

            if (isBetaUser) {
                posthog.capture('beta_feature_accessed', {
                    feature: 'new-dashboard',
                    userId: user.id,
                });
            }
        }
    }, [posthog, user]);

    return (
        <Container>
            {hasBetaAccess ? (
                <div>
                    <Badge status="accent">Beta</Badge>
                    <NewDashboard />
                </div>
            ) : (
                <StandardDashboard />
            )}
        </Container>
    );
}
```

### Kill Switch Pattern

Quickly disable problematic features in production:

```tsx
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';

export default function NewFeature() {
    const posthog = usePostHog();
    const [isEnabled, setIsEnabled] = useState(true);

    useEffect(() => {
        if (posthog) {
            // Check kill switch flag (default true, set false to disable)
            const featureActive =
                posthog.isFeatureEnabled('new-feature-active') !== false;
            setIsEnabled(featureActive);

            if (!featureActive) {
                posthog.capture('feature_disabled_by_killswitch', {
                    feature: 'new-feature',
                });
            }
        }
    }, [posthog]);

    if (!isEnabled) {
        return <LegacyFeature />;
    }

    return <NewFeatureImplementation />;
}
```

## Integration with Other Tools

### React Hook Form Integration

Track form interactions and completion:

```tsx
import { usePostHog } from 'posthog-js/react';
import { useValidatedForm } from '~/lib/form-hooks';
import { signUpSchema } from '~/lib/validations';

export default function SignUpForm() {
    const posthog = usePostHog();
    const { register, handleSubmit, watch } = useValidatedForm({
        resolver: signUpSchema,
    });

    // Track field interactions
    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            if (type === 'change' && name) {
                posthog?.capture('form_field_changed', {
                    form: 'sign_up',
                    field: name,
                    hasValue: !!value[name],
                });
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, posthog]);

    const onSubmit = async (data: SignUpData) => {
        posthog?.capture('sign_up_form_submitted');
        // Handle submission
    };

    return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

### React Router Integration

Track route changes and navigation patterns:

```tsx
// Add to app/root.tsx
import { useLocation } from 'react-router';
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';

function RouteTracker() {
    const location = useLocation();
    const posthog = usePostHog();

    useEffect(() => {
        if (posthog) {
            posthog.capture('$pageview', {
                $current_url: window.location.href,
                path: location.pathname,
            });
        }
    }, [location, posthog]);

    return null;
}

// Add to Layout component
export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <PHProvider>
                    <RouteTracker />
                    {children}
                </PHProvider>
            </body>
        </html>
    );
}
```

## Additional Resources

- **PostHog Docs**: https://posthog.com/docs
- **React Integration**: https://posthog.com/docs/libraries/react
- **Feature Flags Manual**: https://posthog.com/docs/feature-flags
- **Experiments Guide**: https://posthog.com/docs/experiments
- **Error Tracking**: https://posthog.com/docs/error-tracking
- **Session Recordings**: https://posthog.com/docs/session-replay
- **Best Practices**: https://posthog.com/docs/feature-flags/best-practices

## Common Issues

### PostHog not tracking events

1. Check environment variables are set correctly
2. Verify `VITE_` prefix is present (required for client-side access)
3. Check browser console for errors
4. Verify PostHog API key is valid

### TypeScript errors

Ensure `posthog-js` is installed:

```bash
npm install --save posthog-js
```

### Events not appearing in PostHog dashboard

- Events can take a few minutes to appear
- Check project settings in PostHog dashboard
- Verify API host URL is correct (US vs EU)
