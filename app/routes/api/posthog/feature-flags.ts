import { data } from 'react-router';
import type { Route } from './+types/feature-flags';
import { getPostHogClient } from '~/lib/posthog';

export async function loader() {
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

        const featureFlags = await featureFlagsResponse.json();

        return data(featureFlags);
    } catch (error) {
        const postHogClient = getPostHogClient();

        postHogClient?.captureException(error as Error, 'system', {
            context: 'feature_flags_fetch',
        });

        return data({ error: String(error) }, { status: 500 });
    }
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const intent = formData.get('intent');

    if (request.method === 'PATCH') {
        if (intent === 'toggleFeatureFlag') {
            const flagId = String(formData.get('flagId'));
            const active = String(formData.get('active') === 'true');

            try {
                const response = await fetch(
                    `https://us.posthog.com/api/projects/${process.env.POSTHOG_PROJECT_ID}/feature_flags/${flagId}/`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
                        },
                        body: JSON.stringify({
                            active,
                        }),
                    },
                );

                const responseData = await response.json();

                if (!response.ok) {
                    return data(
                        {
                            success: false,
                            error: responseData,
                            status: response.status,
                        },
                        { status: response.status },
                    );
                }

                return data({ success: true, data: responseData });
            } catch (error) {
                console.error('Error toggling feature flag:', error);

                const postHogClient = getPostHogClient();
                postHogClient?.captureException(error as Error, 'system', {
                    active,
                    context: 'feature_flag_toggle',
                    flagId,
                });

                return data(
                    { success: false, error: String(error) },
                    { status: 500 },
                );
            }
        }
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}
