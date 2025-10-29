import {
    type RouteConfig,
    index,
    layout,
    prefix,
    route,
} from '@react-router/dev/routes';

import { Paths } from './constants';

const publicRoutes = [
    index('routes/home.tsx'),
    route(Paths.SIGN_IN, 'routes/sign-in.tsx'),
    route(Paths.SIGN_OUT, 'routes/sign-out.tsx'),
];

// AUTHENTICATED ROUTES ==========

const adminRoutes = prefix(Paths.ADMIN, [
    route(Paths.DESIGN, 'routes/admin/design.tsx'),
]);

const profileRoutes = prefix(Paths.PROFILE, [
    index('routes/profile/index.tsx'),
    route('edit', 'routes/profile/edit.tsx'),
]);

const authenticatedRoutes = [
    layout('routes/authenticated.tsx', [
        route(Paths.DASHBOARD, 'routes/dashboard.tsx'),
        ...profileRoutes,
        ...adminRoutes,
    ]),
];

// API ROUTES ==========

const postHogRoutes = prefix(Paths.POSTHOG, [
    route('feature-flags', 'routes/api/posthog/feature-flags.ts'),
]);

const apiRoutes = prefix(Paths.API, [
    route(Paths.AUTHENTICATE, 'routes/api/auth/authenticate.ts'),
    route(`${Paths.AUTH}/*`, 'routes/api/auth/better-auth.ts'),
    route(Paths.PROFILE, 'routes/api/profile.ts'),
    route('email', 'routes/api/email.ts'),
    ...postHogRoutes,
]);

// ==========

export default [
    ...publicRoutes,
    ...authenticatedRoutes,
    ...apiRoutes,
] satisfies RouteConfig;
