/// <reference types="vite/client" />

interface ImportMetaEnv {
    // Public variables (exposed to client)
    readonly VITE_BETTER_AUTH_BASE_URL: string;
    readonly VITE_POSTHOG_API_KEY?: string;
    readonly VITE_POSTHOG_API_HOST?: string;
    readonly VITE_POSTHOG_UI_HOST?: string;
    readonly VITE_POSTHOG_HOST?: string;
    readonly VITE_POSTHOG_PROJECT_ID?: string;

    // Built-in Vite constants
    readonly MODE: string;
    readonly BASE_URL: string;
    readonly PROD: boolean;
    readonly DEV: boolean;
    readonly SSR: boolean;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// Server-side environment types (for .server.ts files)
declare namespace NodeJS {
    interface ProcessEnv {
        // Database
        DATABASE_URL: string;

        // Authentication (BetterAuth)
        BETTER_AUTH_SECRET: string;
        BETTER_AUTH_URL: string;
        GITHUB_CLIENT_ID?: string;
        GITHUB_CLIENT_SECRET?: string;
        GOOGLE_CLIENT_ID?: string;
        GOOGLE_CLIENT_SECRET?: string;
        VITE_BETTER_AUTH_BASE_URL?: string;

        // OpenAI
        OPENAI_API_KEY?: string;

        // PostHog
        VITE_POSTHOG_API_KEY?: string;
        VITE_POSTHOG_API_HOST?: string;
        VITE_POSTHOG_UI_HOST?: string;
        VITE_POSTHOG_HOST?: string;
        VITE_POSTHOG_PROJECT_ID?: string;
        POSTHOG_API_KEY?: string;
        POSTHOG_HOST?: string;
        POSTHOG_PROJECT_ID?: string;
        POSTHOG_PERSONAL_API_KEY?: string;

        // Polar (optional)
        POLAR_ACCESS_TOKEN?: string;
        POLAR_SERVER?: 'sandbox' | 'production';
        POLAR_ORGANIZATION_ID?: string;
        POLAR_PRODUCT_ID?: string;
        POLAR_RETURN_URL?: string;
        POLAR_WEBHOOK_SECRET?: string;
        POLAR_SUCCESS_URL?: string;

        // Resend (email)
        RESEND_API_KEY?: string;
        RESEND_FROM_EMAIL?: string;

        // Misc
        ADMIN_EMAIL?: string;
        DEFAULT_THEME?: string;

        // Node.js standard
        NODE_ENV: 'development' | 'production' | 'test';
        MODE?: string;
    }
}
