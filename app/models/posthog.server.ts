import { getPostHogClient } from '~/lib/posthog';
import { getUserFromSession } from '../lib/session.server';

const postHogClient = getPostHogClient();

export type ServerSideEventType =
    | 'request_id'
    | 'user_login'
    | 'user_logout'
    | 'email_sent'
    | 'sign_up_success'
    | 'sign_up_error'
    | 'sign_in_success'
    | 'sign_in_error'
    | 'auth_mode_toggle'
    | 'portal_access_unauthorized'
    | 'portal_customer_not_found'
    | 'portal_access_success';

export async function isFeatureEnabled(flagName: string, request: Request) {
    const user = await getUserFromSession(request);

    if (!user) {
        return false;
    }

    try {
        if (!postHogClient) {
            return false;
        }

        const isEnabled = await postHogClient.isFeatureEnabled(
            flagName,
            user?.id,
        );

        return isEnabled;
    } catch (error) {
        postHogClient?.captureException(error);

        return false;
    }
}

export async function getAllFeatureFlags(request: Request) {
    const user = await getUserFromSession(request);

    if (!user) {
        return {};
    }

    try {
        if (!postHogClient) {
            return {};
        }

        const featureFlags = await postHogClient.getAllFlags(user?.id);
        return featureFlags;
    } catch (error) {
        postHogClient?.captureException(error);
        console.error('Error fetching feature flags:', error);
        return {};
    }
}

export async function getFeatureFlagsForUser(request: Request) {
    const user = await getUserFromSession(request);

    if (!user) {
        return {};
    }

    try {
        if (!postHogClient) {
            return {};
        }

        const featureFlags = await postHogClient.getAllFlags(user?.id);
        return featureFlags;
    } catch (error) {
        postHogClient?.captureException(error);
        console.error('Error fetching feature flags:', error);
        return {};
    }
}

export async function isExperimentEnabled(
    request: Request,
    experimentName: string,
) {
    const user = await getUserFromSession(request);

    if (!user) {
        return false;
    }

    try {
        if (!postHogClient) {
            return false;
        }

        const isEnabled = await postHogClient.getFeatureFlag(
            experimentName,
            user?.id,
        );

        return isEnabled;
    } catch (error) {
        postHogClient?.captureException(error);

        return false;
    }
}
