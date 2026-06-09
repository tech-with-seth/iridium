import {
    type RouteConfig,
    index,
    layout,
    prefix,
    route,
} from '@react-router/dev/routes';

export default [
    layout('routes/layouts/marketing.tsx', [index('routes/landing.tsx')]),
    layout('routes/layouts/auth.tsx', [route('/login', 'routes/login.tsx')]),
    route('/logout', 'routes/logout.tsx'),
    layout('routes/layouts/app.tsx', [
        route('/dashboard', 'routes/dashboard.tsx'),
        route('/chat', 'routes/chat.tsx', [
            index('routes/chat-index.tsx'),
            route(':threadId', 'routes/thread.tsx'),
        ]),
    ]),
    route('/healthcheck', 'routes/healthcheck.ts'),
    ...prefix('/api', [
        route('/auth/*', 'routes/api-auth.ts'),
        route('/chat', 'routes/api-chat.ts'),
        route('/theme', 'routes/api-theme.ts'),
    ]),
] satisfies RouteConfig;
