import { PostHog } from 'posthog-node';
import { getUserFromSession } from './session.server';

export default function PostHogClient() {
    const postHogClient = new PostHog(process.env.VITE_POSTHOG_API_KEY!, {
        host: process.env.VITE_POSTHOG_HOST,
        flushAt: 1,
        flushInterval: 0,
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
    properties,
}: ServerSideLogProps) {
    const posthog = PostHogClient();
    posthog.capture({
        distinctId,
        event,
        properties,
    });
    await posthog.shutdown();
}

export async function isFeatureEnabled(flagName: string, request: Request) {
    const user = await getUserFromSession(request);

    if (!user) {
        return false;
    }

    const posthog = PostHogClient();
    const isEnabled = await posthog.isFeatureEnabled(flagName, user?.id);
    await posthog.shutdown();

    return isEnabled;
}
