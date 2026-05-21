import {
    type RouteConfig,
    index,
    prefix,
    route,
} from '@react-router/dev/routes';

export default [
    index('routes/home.tsx'),
    route('/login', 'routes/login.tsx'),
    route('/logout', 'routes/logout.tsx'),
    route('/dashboard', 'routes/dashboard.tsx'),
    route('/chat', 'routes/chat.tsx', [
        index('routes/chat-index.tsx'),
        route(':threadId', 'routes/thread.tsx'),
    ]),
    route('/healthcheck', 'routes/healthcheck.ts'),
    ...prefix('/api', [
        route('/auth/*', 'routes/api-auth.ts'),
        route('/chat', 'routes/api-chat.ts'),
    ]),
] satisfies RouteConfig;
