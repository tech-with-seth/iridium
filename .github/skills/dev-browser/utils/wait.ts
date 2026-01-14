/**
 * Smart page load detection utilities for dev-browser skill.
 *
 * Based on browser-use's approach:
 * - Check document.readyState for 'complete'
 * - Monitor pending network requests via Performance API
 * - Filter out ads, tracking, and non-critical resources
 * - Graceful timeout handling
 */

import type { Page } from 'playwright';

/**
 * Options for waiting for page load
 */
export interface WaitForPageLoadOptions {
    /** Maximum time to wait in ms (default: 10000) */
    timeout?: number;
    /** How often to check page state in ms (default: 50) */
    pollInterval?: number;
    /** Minimum time to wait even if page appears ready in ms (default: 100) */
    minimumWait?: number;
    /** Wait for network to be idle (no pending requests) (default: true) */
    waitForNetworkIdle?: boolean;
}

/**
 * Result of waiting for page load
 */
export interface WaitForPageLoadResult {
    /** Whether the page is considered loaded */
    success: boolean;
    /** Document ready state when finished */
    readyState: string;
    /** Number of pending network requests when finished */
    pendingRequests: number;
    /** Time spent waiting in ms */
    waitTimeMs: number;
    /** Whether timeout was reached */
    timedOut: boolean;
}

interface PageLoadState {
    documentReadyState: string;
    documentLoading: boolean;
    pendingRequests: PendingRequest[];
}

interface PendingRequest {
    url: string;
    loadingDurationMs: number;
    resourceType: string;
}

/**
 * Wait for a page to finish loading using document.readyState and performance API.
 *
 * @example
 * ```typescript
 * await page.goto('http://localhost:5173');
 * const result = await waitForPageLoad(page);
 * console.log(`Page loaded: ${result.success}, readyState: ${result.readyState}`);
 * ```
 */
export async function waitForPageLoad(
    page: Page,
    options: WaitForPageLoadOptions = {},
): Promise<WaitForPageLoadResult> {
    const {
        timeout = 10000,
        pollInterval = 50,
        minimumWait = 100,
        waitForNetworkIdle = true,
    } = options;

    const startTime = Date.now();
    let lastState: PageLoadState | null = null;

    // Wait minimum time first
    if (minimumWait > 0) {
        await new Promise((resolve) => setTimeout(resolve, minimumWait));
    }

    // Poll until ready or timeout
    while (Date.now() - startTime < timeout) {
        try {
            lastState = await getPageLoadState(page);

            // Check if document is complete
            const documentReady = lastState.documentReadyState === 'complete';

            // Check if network is idle (no pending critical requests)
            const networkIdle =
                !waitForNetworkIdle || lastState.pendingRequests.length === 0;

            if (documentReady && networkIdle) {
                return {
                    success: true,
                    readyState: lastState.documentReadyState,
                    pendingRequests: lastState.pendingRequests.length,
                    waitTimeMs: Date.now() - startTime,
                    timedOut: false,
                };
            }
        } catch {
            // Page may be navigating, continue polling
        }

        await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    // Timeout reached - return current state
    return {
        success: false,
        readyState: lastState?.documentReadyState ?? 'unknown',
        pendingRequests: lastState?.pendingRequests.length ?? 0,
        waitTimeMs: Date.now() - startTime,
        timedOut: true,
    };
}

/**
 * Get the current page load state including document ready state and pending requests.
 * Filters out ads, tracking, and non-critical resources that shouldn't block loading.
 */
async function getPageLoadState(page: Page): Promise<PageLoadState> {
    const result = await page.evaluate(() => {
        const now = performance.now();
        const resources = performance.getEntriesByType(
            'resource',
        ) as PerformanceResourceTiming[];
        const pending: PendingRequest[] = [];

        // Common ad/tracking domains and patterns to filter out
        const adPatterns = [
            'doubleclick.net',
            'googlesyndication.com',
            'googletagmanager.com',
            'google-analytics.com',
            'facebook.net',
            'connect.facebook.net',
            'analytics',
            'ads',
            'tracking',
            'pixel',
            'hotjar.com',
            'clarity.ms',
            'mixpanel.com',
            'segment.com',
            'newrelic.com',
            'nr-data.net',
            '/tracker/',
            '/collector/',
            '/beacon/',
            '/telemetry/',
            '/log/',
            '/events/',
            '/track.',
            '/metrics/',
        ];

        // Non-critical resource types
        const nonCriticalTypes = ['img', 'image', 'icon', 'font'];

        for (const entry of resources) {
            // Resources with responseEnd === 0 are still loading
            if (entry.responseEnd === 0) {
                const url = entry.name;

                // Filter out ads and tracking
                const isAd = adPatterns.some((pattern) =>
                    url.includes(pattern),
                );
                if (isAd) continue;

                // Filter out data: URLs and very long URLs
                if (url.startsWith('data:') || url.length > 500) continue;

                const loadingDuration = now - entry.startTime;

                // Skip requests loading > 10 seconds (likely stuck/polling)
                if (loadingDuration > 10000) continue;

                const resourceType = entry.initiatorType || 'unknown';

                // Filter out non-critical resources loading > 3 seconds
                if (
                    nonCriticalTypes.includes(resourceType) &&
                    loadingDuration > 3000
                )
                    continue;

                // Filter out image URLs even if type is unknown
                const isImageUrl =
                    /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?|$)/i.test(url);
                if (isImageUrl && loadingDuration > 3000) continue;

                pending.push({
                    url,
                    loadingDurationMs: Math.round(loadingDuration),
                    resourceType,
                });
            }
        }

        return {
            documentReadyState: document.readyState,
            documentLoading: document.readyState !== 'complete',
            pendingRequests: pending,
        };
    });

    return result;
}
