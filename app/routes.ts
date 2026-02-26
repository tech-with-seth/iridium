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
    route('/chat', 'routes/chat.tsx', [
        index('routes/chat-index.tsx'),
        route(':threadId', 'routes/thread.tsx'),
    ]),
    route('/form', 'routes/form.tsx'),
    route('/notes', 'routes/notes.tsx'),
    route('/profile', 'routes/profile.tsx'),
    route('/healthcheck', 'routes/healthcheck.ts'),
    ...prefix('/api', [
        route('/auth/*', 'routes/api-auth.ts'),
        route('/chat', 'routes/api-chat.ts'),
    ]),
] satisfies RouteConfig;
