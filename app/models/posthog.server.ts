import { PostHogEventNames } from '~/constants';
import { getPostHogClient } from '~/lib/posthog';
import { getUserFromSession } from '~/lib/session.server';
import type { FeatureFlagsResponse } from '~/types/posthog';

const postHogClient = getPostHogClient();

// ============================================================================
// Types
// ============================================================================

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

interface HogQLQueryResult {
    results: unknown[][];
    columns: string[];
    types: string[];
}

interface PostHogAnalyticsData {
    totalEvents: number;
    uniqueUsers: number;
    pageviews: number;
    topEvents: Array<{ event: string; count: number }>;
    trend: Array<{ date: string; events: number; pageviews: number }>;
}

// ============================================================================
// User Feature Flag Helpers (per-user flag evaluation)
// ============================================================================

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

// ============================================================================
// Admin Feature Flags (list all flags via Admin API)
// ============================================================================

export async function getFeatureFlags() {
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const personalApiKey = process.env.POSTHOG_PERSONAL_API_KEY;

    if (!projectId || !personalApiKey) {
        return { results: [] };
    }

    try {
        const featureFlagsResponse = await fetch(
            `https://us.posthog.com/api/projects/${projectId}/feature_flags/`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${personalApiKey}`,
                },
            },
        );

        if (!featureFlagsResponse.ok) {
            const notOkError = new Error(
                `Error fetching feature flags: ${featureFlagsResponse.status} ${featureFlagsResponse.statusText}`,
            );

            postHogClient?.captureException(notOkError, 'system', {
                context: PostHogEventNames.FEATURE_FLAGS_FETCH,
            });
        }

        const data: FeatureFlagsResponse = await featureFlagsResponse.json();

        return data;
    } catch (error) {
        postHogClient?.captureException(error as Error, 'system', {
            context: PostHogEventNames.FEATURE_FLAGS_FETCH_ERROR,
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

// ============================================================================
// HogQL Analytics Queries
// ============================================================================

/**
 * Execute a HogQL query against the PostHog API
 */
async function queryPostHog(query: string): Promise<HogQLQueryResult | null> {
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const personalApiKey = process.env.POSTHOG_PERSONAL_API_KEY;
    const host = process.env.POSTHOG_HOST || 'https://us.posthog.com';

    if (!projectId || !personalApiKey) {
        return null;
    }

    try {
        const response = await fetch(
            `${host}/api/projects/${projectId}/query/`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${personalApiKey}`,
                },
                body: JSON.stringify({
                    query: {
                        kind: 'HogQLQuery',
                        query,
                    },
                }),
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            postHogClient?.captureException(
                new Error(
                    `PostHog HogQL query failed: ${response.status} ${errorText}`,
                ),
                'system',
                { context: 'posthog_analytics_query' },
            );
            return null;
        }

        return await response.json();
    } catch (error) {
        postHogClient?.captureException(error as Error, 'system', {
            context: 'posthog_analytics_query_error',
        });
        return null;
    }
}

/**
 * Get PostHog analytics summary for a date range
 */
export async function getPostHogAnalyticsSummary({
    startDate,
    endDate,
}: {
    startDate: string;
    endDate: string;
}): Promise<PostHogAnalyticsData> {
    // Default empty response
    const emptyResponse: PostHogAnalyticsData = {
        totalEvents: 0,
        uniqueUsers: 0,
        pageviews: 0,
        topEvents: [],
        trend: [],
    };

    // Query total events
    const totalEventsResult = await queryPostHog(`
        SELECT count() as total
        FROM events
        WHERE timestamp >= toDateTime('${startDate}')
          AND timestamp <= toDateTime('${endDate} 23:59:59')
    `);

    // Query unique users
    const uniqueUsersResult = await queryPostHog(`
        SELECT count(DISTINCT distinct_id) as total
        FROM events
        WHERE timestamp >= toDateTime('${startDate}')
          AND timestamp <= toDateTime('${endDate} 23:59:59')
    `);

    // Query pageviews
    const pageviewsResult = await queryPostHog(`
        SELECT count() as total
        FROM events
        WHERE event = '$pageview'
          AND timestamp >= toDateTime('${startDate}')
          AND timestamp <= toDateTime('${endDate} 23:59:59')
    `);

    // Query top events
    const topEventsResult = await queryPostHog(`
        SELECT event, count() as count
        FROM events
        WHERE timestamp >= toDateTime('${startDate}')
          AND timestamp <= toDateTime('${endDate} 23:59:59')
        GROUP BY event
        ORDER BY count DESC
        LIMIT 10
    `);

    // Query daily trend
    const trendResult = await queryPostHog(`
        SELECT
            toDate(timestamp) AS date,
            count() AS events,
            countIf(event = '$pageview') AS pageviews
        FROM events
        WHERE timestamp >= toDateTime('${startDate}')
          AND timestamp <= toDateTime('${endDate} 23:59:59')
        GROUP BY date
        ORDER BY date ASC
    `);

    // Parse results
    const totalEvents =
        totalEventsResult?.results?.[0]?.[0] != null
            ? Number(totalEventsResult.results[0][0])
            : 0;

    const uniqueUsers =
        uniqueUsersResult?.results?.[0]?.[0] != null
            ? Number(uniqueUsersResult.results[0][0])
            : 0;

    const pageviews =
        pageviewsResult?.results?.[0]?.[0] != null
            ? Number(pageviewsResult.results[0][0])
            : 0;

    const topEvents: Array<{ event: string; count: number }> =
        topEventsResult?.results?.map((row) => ({
            event: String(row[0]),
            count: Number(row[1]),
        })) ?? [];

    const trend: Array<{ date: string; events: number; pageviews: number }> =
        trendResult?.results?.map((row) => ({
            date: String(row[0]),
            events: Number(row[1]),
            pageviews: Number(row[2]),
        })) ?? [];

    return {
        totalEvents,
        uniqueUsers,
        pageviews,
        topEvents,
        trend,
    };
}
