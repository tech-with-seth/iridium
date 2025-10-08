import {
    type RouteConfig,
    index,
    layout,
    prefix,
    route
} from '@react-router/dev/routes';

import { Paths } from './constants';

const publicRoutes = [
    index('routes/home.tsx'),
    route(Paths.SIGN_IN, 'routes/sign-in.tsx'),
    route(Paths.SIGN_OUT, 'routes/sign-out.tsx')
];

const adminRoutes = prefix(Paths.ADMIN, [
    route(Paths.DESIGN, 'routes/admin/design.tsx')
]);

const authenticatedRoutes = [
    layout('routes/authenticated.tsx', [
        route(Paths.DASHBOARD, 'routes/dashboard.tsx'),
        route(Paths.PROFILE, 'routes/profile.tsx'),
        ...adminRoutes
    ])
];

const apiRoutes = prefix(Paths.API, [
    route(Paths.AUTHENTICATE, 'routes/api/auth/authenticate.ts'),
    route(`${Paths.AUTH}/*`, 'routes/api/auth/better-auth.ts'),
    route(Paths.PROFILE, 'routes/api/profile.ts')
]);

export default [
    ...publicRoutes,
    ...authenticatedRoutes,
    ...apiRoutes
] satisfies RouteConfig;
