import { getPostHogClient } from '~/lib/posthog';
import { requestIdContext } from './context';
import { getUserFromSession } from '~/lib/session.server';
import { PostHogEventNames } from '~/constants';

export const loggingMiddleware = async (
    { request, context }: { request: Request; context: any },
    next: () => Promise<Response>,
) => {
    const user = await getUserFromSession(request);

    const requestId = crypto.randomUUID();
    context.set(requestIdContext, requestId);

    const start = performance.now();
    const response = await next();
    const duration = performance.now() - start;

    const postHogClient = getPostHogClient();
    postHogClient?.capture({
        distinctId: user?.id || 'unknown',
        event: PostHogEventNames.REQUEST_ID,
        properties: {
            method: request.method,
            url: request.url,
            status: response.status,
            duration,
            requestId,
        },
    });

    return response;
};
