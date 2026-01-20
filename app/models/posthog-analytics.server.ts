import { getPostHogClient } from '~/lib/posthog';

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

    const postHogClient = getPostHogClient();

    try {
        const response = await fetch(`${host}/api/projects/${projectId}/query/`, {
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
        });

        if (!response.ok) {
            const errorText = await response.text();
            postHogClient?.captureException(
                new Error(`PostHog HogQL query failed: ${response.status} ${errorText}`),
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
