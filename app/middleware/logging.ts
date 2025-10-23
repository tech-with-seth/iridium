import { serverSideLog } from '~/lib/posthog.server';
import { requestIdContext } from './context';
import { getUserFromSession } from '~/lib/session.server';

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

    serverSideLog({
        distinctId: user?.id || 'unknown',
        event: 'request_id',
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
