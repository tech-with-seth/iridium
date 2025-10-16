import { data } from 'react-router';
import type { FlagsResponse } from 'posthog-js';
import posthog from 'posthog-js';
import type { Route } from './+types/feature-flags.server';

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
        // Track error with PostHog
        posthog.captureException(error, {
            context: 'feature_flags_fetch',
            timestamp: new Date().toISOString()
        });

        return data({ error: String(error) });
    }
}

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
                    return data({
                        success: false,
                        error: responseData,
                        status: response.status
                    });
                }

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

                return data({ success: false, error: String(error) });
            }
        }
    }
}
