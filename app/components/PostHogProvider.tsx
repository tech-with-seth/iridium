import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

export function PHProvider({ children }: { children: React.ReactNode }) {
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        // Only initialize PostHog if environment variables are set and not in dev/test mode
        const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
        const api_host = import.meta.env.VITE_POSTHOG_API_HOST;
        const ui_host = import.meta.env.VITE_POSTHOG_UI_HOST;

        console.log(
            '\n\n',
            '===== posthog LOG =====',
            import.meta.env,
            '\n\n',
        )

        // Skip initialization in development or with test keys to avoid rate limiting
        if (apiKey && api_host && ui_host) {
            posthog.init(apiKey, {
                api_host,
                ui_host,
                capture_exceptions: true,
                capture_pageleave: true, // Automatically capture page leaves
                capture_pageview: true, // Automatically capture pageviews
                person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
                autocapture: {
                    capture_copied_text: true,
                },
                defaults: '2025-05-24',
            });
        }

        setHydrated(true);
    }, []);

    // Don't render provider until after hydration to prevent SSR issues
    if (!hydrated) return <>{children}</>;

    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
