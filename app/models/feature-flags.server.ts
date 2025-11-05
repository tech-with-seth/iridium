import { posthog } from 'posthog-js';
import type { FeatureFlagsResponse } from '~/types/posthog';

export async function getFeatureFlags() {
    try {
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

        if (!featureFlagsResponse.ok) {
            const notOkError = new Error(
                `Error fetching feature flags: ${featureFlagsResponse.status} ${featureFlagsResponse.statusText}`,
            );

            posthog.captureException(notOkError.message, {
                timestamp: new Date().toISOString(),
            });
        }

        const data: FeatureFlagsResponse = await featureFlagsResponse.json();

        return data;
    } catch (error) {
        posthog.captureException(error, {
            timestamp: new Date().toISOString(),
        });

        return { results: [] };
    }
}

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
