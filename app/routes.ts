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
    route(Paths.SHOP, 'routes/shop/list.tsx'),
    route(`${Paths.SHOP}/:productId`, 'routes/shop/detail.tsx'),
    route(`${Paths.SHOP}/checkout`, 'routes/shop/checkout.tsx'),
];

// AUTHENTICATED ROUTES ==========

const adminRoutes = prefix(Paths.ADMIN, [
    route(Paths.DESIGN, 'routes/admin/design.tsx'),
    route(Paths.CHAT, 'routes/admin/chat.tsx'),
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

const chatRoutes = [route('chat', 'routes/api/chat.ts')];

const postHogRoutes = prefix(Paths.POSTHOG, [
    route('feature-flags', 'routes/api/posthog/feature-flags.ts'),
]);

const apiRoutes = prefix(Paths.API, [
    route(Paths.AUTHENTICATE, 'routes/api/auth/authenticate.ts'),
    route(Paths.CLOUDINARY, 'routes/api/cloudinary.ts'),
    route(`${Paths.AUTH}/*`, 'routes/api/auth/better-auth.ts'),
    route(Paths.PROFILE, 'routes/api/profile.ts'),
    route('email', 'routes/api/email.ts'),
    ...chatRoutes,
    ...postHogRoutes,
]);

// ==========

export default [
    ...publicRoutes,
    ...authenticatedRoutes,
    ...apiRoutes,
] satisfies RouteConfig;
