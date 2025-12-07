import { CustomerPortal } from '@polar-sh/remix';
import { getUserFromSession } from '~/lib/session.server';
import { getPostHogClient } from '~/lib/posthog';
import { getCustomerByExternalId } from '~/models/polar.server';
import { PostHogEventNames } from '~/constants';

export const loader = CustomerPortal({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    getCustomerId: async (request) => {
        const postHogClient = getPostHogClient();

        try {
            const user = await getUserFromSession(request);

            if (!user) {
                postHogClient?.capture({
                    distinctId: 'anonymous',
                    event: PostHogEventNames.POLAR_PORTAL_ACCESS_UNAUTHORIZED,
                    properties: {
                        reason: 'no_user_session',
                    },
                });

                throw new Response('Unauthorized', { status: 401 });
            }

            const customers = await getCustomerByExternalId(user.id);

            if (!customers.result || customers.result.items.length === 0) {
                postHogClient?.capture({
                    distinctId: user.id,
                    event: PostHogEventNames.POLAR_PORTAL_CUSTOMER_NOT_FOUND,
                    properties: {
                        userEmail: user.email,
                    },
                });
                throw new Response('Customer not found', { status: 404 });
            }

            const polarCustomerId = customers.result.items[0].id;

            postHogClient?.capture({
                distinctId: user.id,
                event: PostHogEventNames.POLAR_PORTAL_ACCESS_SUCCESS,
                properties: {
                    polarCustomerId,
                },
            });

            // Return the Polar customer ID (not the user ID)
            return polarCustomerId;
        } catch (error) {
            // Handle Response errors (401, 404) by re-throwing them
            if (error instanceof Response) {
                throw error;
            }

            // Log unexpected errors to PostHog
            postHogClient?.captureException(error as Error, 'system', {
                context: 'customer_portal_access',
            });

            // Re-throw as a generic error response
            throw new Response('Failed to access customer portal', {
                status: 500,
            });
        }
    },
    returnUrl: process.env.POLAR_RETURN_URL,
    server: process.env.POLAR_SERVER,
});
