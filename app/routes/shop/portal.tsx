import { CustomerPortal } from '@polar-sh/remix';
import { polarClient } from '~/lib/polar.server';
import { getUserFromSession } from '~/lib/session.server';
import { logEvent, logException } from '~/lib/posthog';

export const loader = CustomerPortal({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    getCustomerId: async (request) => {
        try {
            const user = await getUserFromSession(request);

            if (!user) {
                logEvent('portal_access_unauthorized', {
                    reason: 'no_user_session',
                });
                throw new Response('Unauthorized', { status: 401 });
            }

            // Search for the Polar customer by external_id (user.id)
            const customers = await polarClient.customers.list({
                query: user.id, // The query parameter searches by external_id
                limit: 1,
            });

            if (!customers.result || customers.result.items.length === 0) {
                logEvent('portal_customer_not_found', {
                    userId: user.id,
                    userEmail: user.email,
                });
                throw new Response('Customer not found', { status: 404 });
            }

            const polarCustomerId = customers.result.items[0].id;

            logEvent('portal_access_success', {
                userId: user.id,
                polarCustomerId,
            });

            // Return the Polar customer ID (not the user ID)
            return polarCustomerId;
        } catch (error) {
            // Handle Response errors (401, 404) by re-throwing them
            if (error instanceof Response) {
                throw error;
            }

            // Log unexpected errors to PostHog
            logException(error as Error, {
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
