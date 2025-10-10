import posthog from 'posthog-js';

export type EventNameType = 'request_id';

export function logEvent(eventName: EventNameType, meta: Record<string, any>) {
    posthog.capture(eventName, meta);
}
