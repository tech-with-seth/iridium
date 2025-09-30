import {
    type RouteConfig,
    index,
    layout,
    prefix,
    route
} from '@react-router/dev/routes';

export default [
    index('routes/home.tsx'),
    route('sign-in', 'routes/sign-in.tsx'),
    route('sign-out', 'routes/sign-out.tsx'),
    route('sign-up', 'routes/sign-up.tsx'),
    route('dashboard', 'routes/dashboard.tsx'),
    route('profile', 'routes/profile.tsx'),
    ...prefix('api', [route('auth/*', 'routes/api/auth/better-auth.ts')])
] satisfies RouteConfig;
