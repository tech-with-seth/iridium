# PRD: PostHog Analytics Hardening

## 1. Introduction/Overview

The current PostHog integration in Iridium lacks robustness around initialization, error handling, and observability. This PRD addresses hardening the analytics implementation to improve performance, reliability, and visibility into tracking behavior without impacting user experience when analytics fails.

## 2. Goals

- Improve PostHog initialization performance and reliability
- Implement comprehensive error boundaries around all analytics calls
- Provide clear visibility into what events and properties are being tracked
- Ensure graceful degradation when PostHog is unavailable or fails
- Add proper error logging without impacting user experience
- Optimize bundle size and loading strategy for PostHog client

## 3. User Stories

### US-001: Error Boundary Wrapper for PostHog Client

**Description:** As a developer, I want all PostHog calls wrapped in error handlers so that analytics failures never crash the app or impact user experience.

**Acceptance Criteria:**

- [ ] Create `app/lib/posthog-client.ts` wrapper with try-catch around all PostHog methods
- [ ] Wrapper logs errors to console in development, silently fails in production
- [ ] All existing PostHog calls updated to use the wrapper
- [ ] Typecheck passes
- [ ] Unit tests verify error handling doesn't throw

### US-002: Server-Side PostHog Error Handling

**Description:** As a developer, I want server-side PostHog calls (feature flags, LLM analytics) to handle failures gracefully so that backend operations continue when analytics is down.

**Acceptance Criteria:**

- [ ] Wrap `getPostHogClient()` with error handling that returns null on failure
- [ ] Update `app/models/posthog.server.ts` functions to handle null client gracefully
- [ ] Update LLM analytics wrapper in `app/routes/api/chat.ts` to work without PostHog
- [ ] Typecheck passes
- [ ] Unit tests verify null client handling

### US-003: PostHog Initialization Performance

**Description:** As a user, I want PostHog to load asynchronously so that it doesn't block page rendering or impact initial load performance.

**Acceptance Criteria:**

- [ ] PostHog initialized with `async: true` in `app/root.tsx`
- [ ] Add loading state tracking to prevent premature event calls
- [ ] Queue events during initialization and flush when ready
- [ ] Typecheck passes
- [ ] Verify in browser that page renders before PostHog loads using dev-browser skill

### US-004: Analytics Event Catalog

**Description:** As a developer, I want a centralized catalog of all analytics events so that I can understand what data we're tracking and maintain consistency.

**Acceptance Criteria:**

- [ ] Create `app/lib/analytics-events.ts` with typed event definitions
- [ ] Document each event with purpose, properties, and example usage
- [ ] Export typed helper functions for common events (page views, clicks, errors)
- [ ] Update existing tracking calls to use typed helpers
- [ ] Typecheck passes

### US-005: Feature Flag Error Handling

**Description:** As a developer, I want feature flag checks to return sensible defaults when PostHog fails so that features continue working with fallback behavior.

**Acceptance Criteria:**

- [ ] Update `app/models/feature-flags.server.ts` to return default values on error
- [ ] Add error logging for feature flag failures
- [ ] Document default behavior in JSDoc comments
- [ ] Typecheck passes
- [ ] Unit tests verify default returns on PostHog failure

### US-006: PostHog Environment Configuration

**Description:** As a developer, I want PostHog behavior to differ by environment so that production gets full tracking while other environments are properly isolated.

**Acceptance Criteria:**

- [ ] Add environment detection in PostHog initialization
- [ ] Production: full tracking with error boundaries
- [ ] Development: console logging of events instead of sending
- [ ] Add `POSTHOG_ENABLED` env var to explicitly disable if needed
- [ ] Typecheck passes
- [ ] Verify in browser that development logs events to console using dev-browser skill

### US-007: LLM Analytics Error Resilience

**Description:** As a developer, I want LLM analytics tracking to fail silently so that AI chat features work even when PostHog tracking fails.

**Acceptance Criteria:**

- [ ] Update `withTracing()` wrapper in chat endpoint to handle PostHog client being null
- [ ] Add try-catch around LLM analytics property tracking
- [ ] Log errors in development, silent in production
- [ ] Typecheck passes
- [ ] Unit tests verify chat works without PostHog

### US-008: PostHog Performance Monitoring

**Description:** As a developer, I want to monitor PostHog's impact on app performance so that I can detect and resolve performance regressions.

**Acceptance Criteria:**

- [ ] Add performance marks around PostHog initialization
- [ ] Log initialization time in development
- [ ] Add bundle size check for PostHog in build process
- [ ] Document expected performance baseline in comments
- [ ] Typecheck passes

## 4. Functional Requirements

- **FR-1:** All client-side PostHog method calls must be wrapped in try-catch blocks
- **FR-2:** All server-side PostHog calls must handle null client gracefully
- **FR-3:** PostHog initialization must be asynchronous and non-blocking
- **FR-4:** Events triggered before initialization must be queued and sent when ready
- **FR-5:** Feature flag checks must return documented default values on failure
- **FR-6:** Error logs must be output in development but silent in production
- **FR-7:** Analytics events must be defined with TypeScript types in centralized catalog
- **FR-8:** Environment-specific behavior must be configurable via environment variables
- **FR-9:** LLM analytics must continue working when PostHog client unavailable
- **FR-10:** Performance impact of PostHog must be measurable and documented

## 5. Non-Goals (Out of Scope)

- GDPR compliance or cookie consent management
- PII scrubbing or data anonymization
- Custom retry mechanisms with exponential backoff
- Analytics data deletion or user opt-out features
- A/B testing or experiment framework
- Custom analytics dashboard or reporting UI
- Multi-region or data residency requirements
- Analytics event versioning or schema evolution
- Real-time analytics streaming or webhooks

## 6. Design Considerations

### Client-Side Wrapper Pattern

```typescript
// app/lib/posthog-client.ts
export const safePostHog = {
  capture: (event: string, properties?: Record<string, any>) => {
    try {
      posthog?.capture(event, properties);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('PostHog capture failed:', error);
      }
    }
  },
  // ... other methods
};
```

### Event Catalog Pattern

```typescript
// app/lib/analytics-events.ts
export const AnalyticsEvents = {
  USER_SIGNED_IN: 'user_signed_in',
  THREAD_CREATED: 'thread_created',
  // ... other events
} as const;

export function trackUserSignIn(userId: string, method: string) {
  safePostHog.capture(AnalyticsEvents.USER_SIGNED_IN, { userId, method });
}
```

## 7. Technical Considerations

### Dependencies

- Existing PostHog client libraries (@posthog/node, posthog-js, @posthog/ai)
- No additional dependencies required

### Performance Constraints

- PostHog initialization should not block page load
- Bundle size impact should be measured and documented
- Event queuing during initialization should have reasonable memory limits

### Error Logging Strategy

- Development: Console logs with full error details
- Production: Silent failures to avoid exposing internals

### Testing Strategy

- Unit tests for all error handling paths
- Mock PostHog client in tests to simulate failures
- Browser verification for async initialization behavior

## 8. Success Metrics

- Zero user-facing errors caused by PostHog failures
- PostHog initialization completes asynchronously without blocking render
- All analytics calls documented in centralized event catalog
- Error handling test coverage >90% for PostHog-related code
- Bundle size impact documented and within acceptable limits (<50KB gzipped)
- Development logs clearly show analytics events being tracked

## 9. Open Questions

- Should we implement a circuit breaker pattern if PostHog repeatedly fails?
- What's the acceptable queue size for events during initialization?
- Should we add performance budgets for PostHog initialization time?
- Do we need separate PostHog projects for staging vs production?
- Should we track analytics errors themselves as a metric?
