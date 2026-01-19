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
    layout('routes/site-layout.tsx', [
        index('routes/landing.tsx'),
        index('routes/success.tsx'),
        // ========================
        // PROTECTED ROUTES
        // ========================
        layout('routes/authenticated.tsx', [
            route(Paths.DASHBOARD, 'routes/dashboard.tsx', [
                index('routes/dashboard-index.tsx'),
                route(Paths.THREAD, 'routes/thread.tsx'),
            ]),
            route(Paths.DESIGN, 'routes/design.tsx'),
            route(Paths.FILE_BROWSER, 'routes/file-browser.tsx', [
                index('routes/file-browser-index.tsx'),
                route('view/*', 'routes/file-browser-view.tsx'),
            ]),
            route(Paths.FORMS, 'routes/forms.tsx'),
            route(Paths.PORTAL, 'routes/portal.tsx'),
        ]),
    ]),
    route(Paths.CHECKOUT, 'routes/checkout.tsx'),
    // ========================
    // API ROUTES
    // ========================
    ...prefix(Paths.API, [
        route(Paths.AUTHENTICATE, 'routes/api/auth/authenticate.ts'),
        route(Paths.BETTER_AUTH, 'routes/api/auth/better-auth.ts'),
        route(Paths.EMAIL, 'routes/api/email.ts'),
        route(Paths.CHAT, 'routes/api/chat.ts'),
        route(Paths.INTEREST, 'routes/api/interest.ts'),
        ...prefix(Paths.WEBHOOKS, [
            route(Paths.POLAR, 'routes/api/webhooks/polar.ts'),
        ]),
        ...prefix(Paths.POSTHOG, [
            route(Paths.FEATURE_FLAGS, 'routes/api/posthog/feature-flags.ts'),
        ]),
    ]),
] satisfies RouteConfig;
