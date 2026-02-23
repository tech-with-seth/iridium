import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
    index('routes/home.tsx'),
    route('/chat', 'routes/chat.tsx'),
    route('/form', 'routes/form.tsx'),
    route('/profile', 'routes/profile.tsx'),
    route('/api/auth/*', 'routes/api-auth.ts'),
] satisfies RouteConfig;
