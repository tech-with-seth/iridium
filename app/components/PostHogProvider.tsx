import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

export function PHProvider({ children }: { children: React.ReactNode }) {
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        // Only initialize PostHog if environment variables are set
        const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
        const host = import.meta.env.VITE_POSTHOG_HOST;

        if (apiKey && host) {
            posthog.init(apiKey, {
                api_host: host,
                person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
                capture_pageview: true, // Automatically capture pageviews
                capture_pageleave: true, // Automatically capture page leaves
                capture_exceptions: true,
                autocapture: {
                    capture_copied_text: true,
                },
            });
        }

        setHydrated(true);
    }, []);

    // Don't render provider until after hydration to prevent SSR issues
    if (!hydrated) return <>{children}</>;

    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
