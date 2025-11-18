import { PostHog } from 'posthog-node';

let postHogInstance: PostHog | null = null;

const hasPostHogConfig = Boolean(
    process.env.POSTHOG_API_KEY && process.env.VITE_POSTHOG_HOST,
);

export function isPostHogEnabled() {
    return hasPostHogConfig;
}

export function getPostHogClient() {
    if (!hasPostHogConfig) {
        return null;
    }

    if (!postHogInstance) {
        postHogInstance = new PostHog(process.env.POSTHOG_API_KEY!, {
            host: process.env.POSTHOG_HOST,
            flushAt: 1,
            flushInterval: 0,
        });
    }

    return postHogInstance;
}
