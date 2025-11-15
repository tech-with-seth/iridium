import { PostHog } from 'posthog-node';

export const postHogClient = new PostHog(process.env.POSTHOG_API_KEY!, {
    host: process.env.POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
});
