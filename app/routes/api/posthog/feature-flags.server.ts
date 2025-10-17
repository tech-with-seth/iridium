import { data } from 'react-router';
import posthog from 'posthog-js';
import type { Route } from './+types/feature-flags.server';
import { deleteCachedData } from '~/lib/cache';

// Cache configuration
const CACHE_KEY = 'posthog:feature-flags';

// Resource route for feature flag operations
// This is a server-only API endpoint - no client exports needed

// GET - Fetch all feature flags
export async function loader() {
    try {
        const featureFlagsResponse = await fetch(
            `https://us.posthog.com/api/projects/${process.env.POSTHOG_PROJECT_ID}/feature_flags/`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`
                }
            }
        );

        const featureFlags = await featureFlagsResponse.json();

        return data(featureFlags);
    } catch (error) {
        posthog.captureException(error, {
            context: 'feature_flags_fetch',
            timestamp: new Date().toISOString()
        });

        return data({ error: String(error) }, { status: 500 });
    }
}

// PATCH - Update feature flag mutations
export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const intent = formData.get('intent');

    if (request.method === 'PATCH') {
        if (intent === 'toggleFeatureFlag') {
            const flagId = String(formData.get('flagId'));
            const active = formData.get('active') === 'true';

            try {
                const response = await fetch(
                    `https://us.posthog.com/api/projects/${process.env.POSTHOG_PROJECT_ID}/feature_flags/${flagId}/`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`
                        },
                        body: JSON.stringify({
                            active
                        })
                    }
                );

                const responseData = await response.json();

                if (!response.ok) {
                    return data(
                        {
                            success: false,
                            error: responseData,
                            status: response.status
                        },
                        { status: response.status }
                    );
                }

                // Invalidate server-side cache so root loader gets fresh data
                deleteCachedData(CACHE_KEY);

                return data({ success: true, data: responseData });
            } catch (error) {
                console.error('Error toggling feature flag:', error);

                // Track error with PostHog
                posthog.captureException(error, {
                    context: 'feature_flag_toggle',
                    flagId,
                    active,
                    timestamp: new Date().toISOString()
                });

                return data(
                    { success: false, error: String(error) },
                    { status: 500 }
                );
            }
        }
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}
