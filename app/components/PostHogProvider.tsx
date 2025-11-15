import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

export function PHProvider({ children }: { children: React.ReactNode }) {
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        console.log(
            '\n\n',
            '===== LOG =====',
            JSON.stringify(import.meta.env, null, 4),
            '\n\n',
        );

        // Only initialize PostHog if environment variables are set and not in dev/test mode
        const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
        const host = import.meta.env.VITE_POSTHOG_HOST;
        // const isDev = import.meta.env.DEV;
        // const isTestKey = apiKey?.includes('test');

        // Skip initialization in development or with test keys to avoid rate limiting
        if (apiKey && host) {
            posthog.init(apiKey, {
                api_host: host,
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
