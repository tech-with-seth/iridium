import { requestIdContext } from './context';

export const loggingMiddleware = async (
    { request, context }: { request: Request; context: any },
    next: () => Promise<Response>
) => {
    const requestId = crypto.randomUUID();
    context.set(requestIdContext, requestId);

    console.log(`[${requestId}] ${request.method} ${request.url}`);

    const start = performance.now();
    const response = await next();
    const duration = performance.now() - start;

    console.log(`[${requestId}] Response ${response.status} (${duration}ms)`);

    return response;
};
