# LLM Analytics with PostHog

Comprehensive guide to tracking, monitoring, and optimizing AI/LLM features using PostHog's LLM analytics integration with the Vercel AI SDK.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Basic Usage](#basic-usage)
- [Event Properties](#event-properties)
- [Advanced Features](#advanced-features)
- [Real-World Examples](#real-world-examples)
- [Cost Monitoring](#cost-monitoring)
- [Privacy & Security](#privacy--security)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Overview

PostHog's LLM analytics integration automatically captures detailed metrics about every AI generation in your application. This enables you to:

- Track token usage and costs across features, users, and organizations
- Monitor response latency and optimize performance
- Analyze conversation patterns and user behavior
- Debug issues with session replay integration
- A/B test different models and prompts
- Set up cost alerts and budgets
- Measure ROI of AI features

## Setup

### Prerequisites

The following packages are already installed in Iridium:

```json
{
    "@posthog/ai": "^7.1.0",
    "posthog-node": "^5.9.5",
    "@ai-sdk/openai": "^2.0.58",
    "ai": "^5.0.82"
}
```

### Environment Variables

Add these to your `.env` file:

```bash
# Server-side PostHog (for LLM analytics)
POSTHOG_API_KEY="phc_your-posthog-project-api-key"
POSTHOG_HOST="https://us.i.posthog.com"  # or "https://eu.i.posthog.com"

# OpenAI (required for AI features)
OPENAI_API_KEY="sk-proj-your-openai-api-key"

# Client-side PostHog (optional - for web analytics)
VITE_POSTHOG_API_KEY="phc_your-client-api-key"
VITE_POSTHOG_HOST="https://us.i.posthog.com"
```

**Important**: `POSTHOG_API_KEY` (server-side) is different from `VITE_POSTHOG_API_KEY` (client-side).

### Server-Side Client

The PostHog Node client is configured as a singleton in `app/lib/posthog.ts`:

```typescript
import { PostHog } from 'posthog-node';

export const postHogClient = new PostHog(process.env.POSTHOG_API_KEY!, {
    host: process.env.POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
});
```

## Basic Usage

Wrap your Vercel AI SDK model with PostHog's `withTracing()` function:

```typescript
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';
import { withTracing } from '@posthog/ai';
import { postHogClient } from '~/lib/posthog';
import { requireUser } from '~/lib/session.server';

export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    const { messages } = await request.json();

    const openAIClient = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
    });

    const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
        posthogDistinctId: user.id,
    });

    const result = streamText({
        model,
        messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
}
```

This automatically captures an `$ai_generation` event for every LLM call.

## Event Properties

Each `$ai_generation` event includes rich metadata:

| Property | Description | Example |
|----------|-------------|---------|
| `$ai_model` | Model identifier | `"gpt-4o"`, `"gpt-4o-mini"` |
| `$ai_latency` | Response time in seconds | `1.234` |
| `$ai_input_tokens` | Prompt token count | `150` |
| `$ai_output_tokens` | Completion token count | `450` |
| `$ai_total_cost_usd` | Estimated cost | `0.0234` |
| `$ai_tools` | Available tools/functions | `["weather", "calculate"]` |
| `$ai_input` | Prompt messages (array) | `[{role: "user", content: "..."}]` |
| `$ai_output_choices` | Response choices (array) | `[{message: {...}}]` |

## Advanced Features

### Enriching Events

Add custom properties to make analytics more useful:

```typescript
const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
    posthogDistinctId: user.id,
    posthogTraceId: `conversation-${conversationId}`,
    posthogProperties: {
        conversationId,
        feature: 'customer-support',
        userPlan: user.plan,
        intent: 'troubleshooting',
        department: user.department,
        sessionId: request.headers.get('x-request-id'),
    },
    posthogGroups: {
        company: user.organizationId,
    },
});
```

**Best practices for custom properties:**

- **Feature name**: Identify which feature generated the event
- **User context**: Plan tier, role, department
- **Business context**: Intent, category, priority
- **Technical context**: Session ID, request ID, trace ID

### Trace-Level Analytics

Group multiple LLM calls into conversation traces:

```typescript
// Generate trace ID for the conversation
const traceId = `chat-${conversationId}`;

// All calls with the same traceId are grouped together
const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
    posthogDistinctId: user.id,
    posthogTraceId: traceId,
    posthogProperties: {
        messageIndex: 1,
        conversationId,
    },
});
```

View conversation-level metrics in PostHog's **Traces** tab:

- Total conversation cost
- Average latency per message
- Total tokens used across messages
- Tool usage patterns
- Conversation duration

### Privacy Mode

Exclude sensitive prompt and response data while keeping metrics:

```typescript
const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
    posthogDistinctId: user.id,
    posthogPrivacyMode: true,
});
```

**What privacy mode does:**

- ✅ Captures: tokens, latency, cost, model name, tools
- ❌ Excludes: `$ai_input` and `$ai_output_choices`

**When to use privacy mode:**

- Medical/health applications
- Legal document processing
- Financial advice
- Personal identifiable information (PII)
- Compliance requirements (HIPAA, GDPR)

### Anonymous Tracking

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

Use cases:

- Public demo pages
- Unauthenticated features
- Beta testing before launch
- Privacy-focused features

### Feature Flag Integration

Use PostHog feature flags to control AI models dynamically:

```typescript
import { postHogClient } from '~/lib/posthog';

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
```

**Use cases:**

- Gradual rollout of expensive models
- A/B testing model performance
- Cost optimization by user plan
- Regional model selection
- Emergency cost controls (kill switch)

## Real-World Examples

### Customer Support Chat

```typescript
export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    const { messages, ticketId } = await request.json();

    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
    });

    const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
        posthogDistinctId: user.id,
        posthogTraceId: `support-ticket-${ticketId}`,
        posthogProperties: {
            feature: 'customer-support',
            ticketId,
            ticketPriority: ticket.priority,
            ticketCategory: ticket.category,
            agentAssigned: ticket.agentId || 'ai-only',
            firstResponse: messages.length === 1,
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

### Code Generation

```typescript
export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    const { prompt, language, complexity } = await request.json();

    // Use advanced model for complex tasks
    const modelName = complexity === 'advanced' ? 'gpt-4o' : 'gpt-4o-mini';

    const model = withTracing(openAIClient(modelName), postHogClient, {
        posthogDistinctId: user.id,
        posthogTraceId: `codegen-${Date.now()}-${user.id}`,
        posthogProperties: {
            feature: 'code-generation',
            language,
            framework: 'react',
            complexity,
            modelUsed: modelName,
            promptLength: prompt.length,
        },
    });

    const result = await generateText({
        model,
        prompt,
        system: `You are an expert ${language} developer.`,
    });

    return data({ code: result.text });
}
```

### Content Generation with Privacy Mode

```typescript
export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    const { topic, tone, contentType } = await request.json();

    // Enable privacy mode for user-generated content
    const model = withTracing(openAIClient('gpt-4o-mini'), postHogClient, {
        posthogDistinctId: user.id,
        posthogPrivacyMode: true,
        posthogProperties: {
            feature: 'content-generation',
            contentType,
            tone,
            targetLength: 1000,
            userPlan: user.plan,
        },
    });

    const result = await generateText({
        model,
        prompt: `Write a ${contentType} about ${topic} in a ${tone} tone.`,
    });

    return data({ content: result.text });
}
```

### Multi-Tool Conversation

```typescript
export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    const { messages, conversationId } = await request.json();

    const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
        posthogDistinctId: user.id,
        posthogTraceId: `conversation-${conversationId}`,
        posthogProperties: {
            feature: 'ai-assistant',
            conversationId,
            messageCount: messages.length,
            hasTools: true,
        },
    });

    const result = streamText({
        model,
        messages: convertToModelMessages(messages),
        stopWhen: stepCountIs(5),
        tools: {
            searchDatabase: tool({
                description: 'Search the knowledge base',
                inputSchema: z.object({
                    query: z.string(),
                }),
                execute: async ({ query }) => {
                    const results = await searchKnowledgeBase(query);
                    return { results };
                },
            }),
            createTicket: tool({
                description: 'Create a support ticket',
                inputSchema: z.object({
                    title: z.string(),
                    description: z.string(),
                }),
                execute: async ({ title, description }) => {
                    const ticket = await prisma.ticket.create({
                        data: { title, description, userId: user.id },
                    });
                    return { ticketId: ticket.id };
                },
            }),
        },
    });

    return result.toUIMessageStreamResponse();
}
```

## Cost Monitoring

### Dashboard Metrics

Create PostHog insights to track:

1. **Total AI spend**

   ```sql
   SELECT sum($ai_total_cost_usd) as total_cost
   FROM $ai_generation
   WHERE timestamp > now() - interval '30 days'
   ```

2. **Cost by feature**

   ```sql
   SELECT 
     properties.feature as feature,
     sum($ai_total_cost_usd) as cost,
     count(*) as calls
   FROM $ai_generation
   WHERE timestamp > now() - interval '7 days'
   GROUP BY feature
   ORDER BY cost DESC
   ```

3. **Cost by user plan**

   ```sql
   SELECT 
     properties.userPlan as plan,
     sum($ai_total_cost_usd) as total_cost,
     avg($ai_total_cost_usd) as avg_cost_per_call
   FROM $ai_generation
   WHERE timestamp > now() - interval '30 days'
   GROUP BY plan
   ```

4. **Most expensive users**

   ```sql
   SELECT 
     distinct_id,
     sum($ai_total_cost_usd) as total_cost,
     count(*) as call_count
   FROM $ai_generation
   WHERE timestamp > now() - interval '30 days'
   GROUP BY distinct_id
   ORDER BY total_cost DESC
   LIMIT 10
   ```

### Setting Up Alerts

Create PostHog alerts for:

1. **Daily spend threshold**
   - Trigger: Daily AI cost > $100
   - Action: Notify team Slack channel

2. **High latency**
   - Trigger: Average latency > 5 seconds
   - Action: Page on-call engineer

3. **Failed calls**
   - Trigger: Error rate > 5%
   - Action: Create incident ticket

4. **Unusual usage spike**
   - Trigger: Hourly calls > 1000 (2x normal)
   - Action: Alert engineering team

### Cost Optimization Strategies

#### 1. Model Selection by Complexity

```typescript
const getModelForTask = (task: Task) => {
    const estimatedComplexity = calculateComplexity(task);
    
    if (estimatedComplexity < 0.3) {
        return 'gpt-4o-mini';  // ~$0.15 per 1M tokens
    } else if (estimatedComplexity < 0.7) {
        return 'gpt-4o-mini';  // Still cost-effective
    } else {
        return 'gpt-4o';       // ~$2.50 per 1M tokens
    }
};
```

#### 2. Response Caching

```typescript
import { cache } from '~/lib/cache.server';
import { getUserScopedKey } from '~/lib/cache';

export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    const { prompt } = await request.json();

    // Generate cache key
    const cacheKey = getUserScopedKey(user.id, `ai-${hash(prompt)}`);
    const cached = cache.getKey(cacheKey);

    if (cached) {
        postHogClient.capture({
            distinctId: user.id,
            event: 'ai_cache_hit',
            properties: { feature: 'chat' },
        });
        return data({ text: cached });
    }

    // Cache miss - call LLM
    const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
        posthogDistinctId: user.id,
        posthogProperties: { cacheHit: false },
    });

    const result = await generateText({ model, prompt });

    // Cache for 1 hour
    cache.setKey(cacheKey, result.text, 3600);

    return data({ text: result.text });
}
```

#### 3. Plan-Based Model Access

```typescript
const getModelForPlan = (userPlan: string) => {
    switch (userPlan) {
        case 'free':
            return 'gpt-4o-mini';
        case 'pro':
            return 'gpt-4o-mini';
        case 'enterprise':
            return 'gpt-4o';
        default:
            return 'gpt-4o-mini';
    }
};

const model = withTracing(
    openAIClient(getModelForPlan(user.plan)),
    postHogClient,
    {
        posthogDistinctId: user.id,
        posthogProperties: {
            userPlan: user.plan,
            modelUsed: getModelForPlan(user.plan),
        },
    },
);
```

## Privacy & Security

### GDPR Compliance

For GDPR compliance, enable privacy mode and implement data retention policies:

```typescript
const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
    posthogDistinctId: user.id,
    posthogPrivacyMode: true,  // Don't log sensitive content
    posthogProperties: {
        dataProcessingRegion: 'EU',
        gdprCompliant: true,
    },
});
```

In PostHog dashboard:

1. Set data retention to 30 days for LLM events
2. Enable automatic PII scrubbing
3. Configure data export for user deletion requests

### HIPAA Compliance

For healthcare applications:

```typescript
const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
    posthogDistinctId: hashUserId(user.id),  // Pseudonymize
    posthogPrivacyMode: true,
    posthogProperties: {
        feature: 'health-advisor',
        hipaaCompliant: true,
        dataClassification: 'PHI',
    },
});
```

**Additional requirements:**

- Sign BAA (Business Associate Agreement) with PostHog
- Use PostHog EU hosting
- Enable audit logs
- Implement access controls

### PCI Compliance

For financial applications:

```typescript
const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
    posthogDistinctId: user.id,
    posthogPrivacyMode: true,
    posthogProperties: {
        feature: 'financial-advisor',
        pciScope: false,  // No card data in prompts
        dataClassification: 'confidential',
    },
});
```

## Performance Optimization

### Latency Tracking

Monitor and optimize response times:

```typescript
const startTime = Date.now();

const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
    posthogDistinctId: user.id,
    posthogProperties: {
        requestStartTime: startTime,
    },
});

const result = await generateText({ model, prompt });

const endTime = Date.now();
const totalLatency = (endTime - startTime) / 1000;

// Track end-to-end latency (includes network, parsing, etc.)
postHogClient.capture({
    distinctId: user.id,
    event: 'ai_total_latency',
    properties: {
        totalLatency,
        llmLatency: result.usage.totalTime,  // From SDK
        overhead: totalLatency - result.usage.totalTime,
    },
});
```

### Token Optimization

Track and reduce token usage:

```typescript
const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
    posthogDistinctId: user.id,
    posthogProperties: {
        promptLength: prompt.length,
        estimatedTokens: Math.ceil(prompt.length / 4),  // Rough estimate
    },
});

const result = await generateText({
    model,
    prompt,
    maxTokens: 500,  // Limit output tokens
});

// Track actual vs estimated
postHogClient.capture({
    distinctId: user.id,
    event: 'ai_token_usage',
    properties: {
        estimatedTokens: Math.ceil(prompt.length / 4),
        actualInputTokens: result.usage.promptTokens,
        actualOutputTokens: result.usage.completionTokens,
        estimationAccuracy:
            result.usage.promptTokens / Math.ceil(prompt.length / 4),
    },
});
```

## Troubleshooting

### Events Not Appearing

**Symptoms**: No events in PostHog LLM Analytics dashboard

**Solutions**:

1. Verify environment variables:

   ```bash
   # Check server-side variables
   echo $POSTHOG_API_KEY
   echo $POSTHOG_HOST
   echo $OPENAI_API_KEY
   ```

2. Check PostHog client initialization:

   ```typescript
   import { postHogClient } from '~/lib/posthog';
   console.log('PostHog initialized:', !!postHogClient);
   ```

3. Verify region:
   - US: `https://us.i.posthog.com`
   - EU: `https://eu.i.posthog.com`

4. Wait 1-2 minutes for events to appear (not instant)

5. Check server logs for errors

### Missing Cost Data

**Symptoms**: `$ai_total_cost_usd` is null or 0

**Causes**:

- Token counts missing from API response
- Custom/fine-tuned models without pricing data
- API response format changed

**Solutions**:

1. Verify token counts are captured:

   ```typescript
   console.log('Usage:', result.usage);
   // Should have promptTokens and completionTokens
   ```

2. Manually calculate costs if needed:

   ```typescript
   const calculateCost = (
       model: string,
       inputTokens: number,
       outputTokens: number,
   ) => {
       const pricing = {
           'gpt-4o': { input: 2.5, output: 10.0 },  // per 1M tokens
           'gpt-4o-mini': { input: 0.15, output: 0.6 },
       };
       
       const modelPricing = pricing[model] || pricing['gpt-4o-mini'];
       
       return (
           (inputTokens * modelPricing.input) / 1_000_000 +
           (outputTokens * modelPricing.output) / 1_000_000
       );
   };
   ```

### Privacy Mode Not Excluding Data

**Symptoms**: `$ai_input` or `$ai_output_choices` still captured

**Solutions**:

1. Verify privacy mode is enabled:

   ```typescript
   const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
       posthogDistinctId: user.id,
       posthogPrivacyMode: true,  // Must be true
   });
   ```

2. Check PostHog dashboard filters (may be showing old events)

3. Clear cache and wait for new events

### Trace Grouping Not Working

**Symptoms**: Conversations not grouped in Traces tab

**Solutions**:

1. Verify same trace ID used:

   ```typescript
   const traceId = `conversation-${conversationId}`;
   
   // All calls in conversation must use same traceId
   const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
       posthogDistinctId: user.id,
       posthogTraceId: traceId,  // Must be consistent
   });
   ```

2. Check for typos in trace ID generation

3. Ensure trace ID is a string (not number or object)

## Additional Resources

- [PostHog LLM Analytics Docs](https://posthog.com/docs/llm-analytics)
- [Vercel AI SDK Integration](https://posthog.com/docs/llm-analytics/installation/vercel-ai)
- [PostHog Node SDK Reference](https://posthog.com/docs/libraries/node)
- [Manual Event Capture Schema](https://posthog.com/docs/llm-analytics/manual-capture)
- [OpenAI Pricing Calculator](https://openai.com/api/pricing/)
- [Iridium AI Documentation](./ai.md)
- [Iridium PostHog Instructions](../.github/instructions/posthog.instructions.md)
