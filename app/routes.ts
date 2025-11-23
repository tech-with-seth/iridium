import {
    type RouteConfig,
    index,
    layout,
    prefix,
    route,
} from '@react-router/dev/routes';

import { Paths } from './constants';

export default [
    // ========================
    // PUBLIC ROUTES
    // ========================
    index('routes/home.tsx'),
    route(Paths.SIGN_IN, 'routes/sign-in.tsx'),
    route(Paths.SIGN_OUT, 'routes/sign-out.tsx'),
    route(Paths.SHOP, 'routes/shop/list.tsx'),
    route(Paths.PRODUCT_DETAIL, 'routes/shop/detail.tsx'),
    route(Paths.CHECKOUT, 'routes/shop/checkout.tsx'),
    // ========================
    // PROTECTED ROUTES
    // ========================
    layout('routes/authenticated.tsx', [
        route(Paths.DASHBOARD, 'routes/dashboard.tsx'),
        route(Paths.PORTAL, 'routes/shop/portal.tsx'),
        route(Paths.SUCCESS, 'routes/success.tsx'),
        route(Paths.DESIGN, 'routes/design.tsx'),
        route(Paths.CHAT, 'routes/chat/route.tsx', [
            index('routes/chat/index.tsx'),
            route(':threadId', 'routes/chat/thread.tsx'),
        ]),
        ...prefix(Paths.PROFILE, [
            index('routes/profile/index.tsx'),
            route(Paths.PROFILE_EDIT, 'routes/profile/edit.tsx'),
        ]),
    ]),
    // ========================
    // API ROUTES
    // ========================
    ...prefix(Paths.API, [
        route(Paths.AUTHENTICATE, 'routes/api/auth/authenticate.ts'),
        route(Paths.CLOUDINARY, 'routes/api/cloudinary.ts'),
        route(Paths.BETTER_AUTH, 'routes/api/auth/better-auth.ts'),
        route(Paths.PROFILE, 'routes/api/profile.ts'),
        route(Paths.EMAIL, 'routes/api/email.ts'),
        route(Paths.CHAT, 'routes/api/chat.ts'),
        ...prefix(Paths.WEBHOOKS, [
            route(Paths.POLAR, 'routes/api/webhooks/polar.ts'),
        ]),
        ...prefix(Paths.POSTHOG, [
            route(Paths.FEATURE_FLAGS, 'routes/api/posthog/feature-flags.ts'),
        ]),
    ]),
] satisfies RouteConfig;
