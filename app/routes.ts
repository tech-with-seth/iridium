import {
    type RouteConfig,
    index,
    layout,
    prefix,
    route
} from '@react-router/dev/routes';

import { Paths } from './constants';

export default [
    index('routes/home.tsx'),
    route(Paths.ABOUT, 'routes/about.tsx'),
    route(Paths.SIGN_IN, 'routes/sign-in.tsx'),
    route(Paths.SIGN_OUT, 'routes/sign-out.tsx'),
    layout('routes/authenticated.tsx', [
        route(Paths.DASHBOARD, 'routes/dashboard.tsx'),
        route(Paths.PROFILE, 'routes/profile.tsx'),
        ...prefix('admin', [route('/design', 'routes/admin/design.tsx')])
    ]),
    ...prefix('api', [
        route('authenticate', 'routes/api/auth/authenticate.ts'),
        route('auth/*', 'routes/api/auth/better-auth.ts'),
        route('profile', 'routes/api/profile.ts')
    ])
] satisfies RouteConfig;
