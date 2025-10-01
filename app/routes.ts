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
    route(Paths.SIGN_IN, 'routes/sign-in.tsx'),
    route(Paths.SIGN_OUT, 'routes/sign-out.tsx'),
    route(Paths.SIGN_UP, 'routes/sign-up.tsx'),
    layout('routes/authenticated.tsx', [
        route(Paths.DASHBOARD, 'routes/dashboard.tsx'),
        route(Paths.PROFILE, 'routes/profile.tsx'),
        ...prefix('admin', [route('/design', 'routes/admin/design.tsx')])
    ]),
    ...prefix('api', [route('auth/*', 'routes/api/auth/better-auth.ts')])
] satisfies RouteConfig;
