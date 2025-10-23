import { withCache } from '~/lib/cache';
import type { FeatureFlagsResponse } from '~/types/posthog';

// Cache configuration
const CACHE_KEY = 'posthog:feature-flags';
const CACHE_TTL = 600; // 10 minutes

/**
 * Fetches feature flags from PostHog API with caching
 * Used by root.tsx loader for server-side rendering
 */
export const getFeatureFlags = withCache<FeatureFlagsResponse>(
    async () => {
        const featureFlagsResponse = await fetch(
            `https://us.posthog.com/api/projects/${process.env.POSTHOG_PROJECT_ID}/feature_flags/`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
                },
            },
        );

        return featureFlagsResponse.json();
    },
    CACHE_KEY,
    CACHE_TTL,
    {
        // Fallback value on error
        count: 0,
        next: null,
        previous: null,
        results: [],
    },
);

/**
 * Helper function to convert feature flags array to active flags object
 */
export function getActiveFlags(
    data: FeatureFlagsResponse,
): Record<string, boolean> {
    if (!data.results) return {};

    return data.results.reduce(
        (acc: Record<string, boolean>, flag) => {
            acc[flag.key] = flag.active;
            return acc;
        },
        {} as Record<string, boolean>,
    );
}
