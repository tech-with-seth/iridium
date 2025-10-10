import { PostHog } from 'posthog-node';

export default function PostHogClient() {
    const postHogClient = new PostHog(process.env.VITE_POSTHOG_API_KEY!, {
        host: process.env.VITE_POSTHOG_HOST,
        flushAt: 1,
        flushInterval: 0
    });

    return postHogClient;
}

export type ServerSideEventType = 'request_id' | 'user_login' | 'user_logout';

interface ServerSideLogProps {
    distinctId: string;
    event: ServerSideEventType;
    properties: Record<string, any>;
}

export async function serverSideLog({
    distinctId,
    event,
    properties
}: ServerSideLogProps) {
    const posthog = PostHogClient();
    posthog.capture({
        distinctId,
        event,
        properties
    });
    await posthog.shutdown();
}
