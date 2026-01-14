import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { waitForPageLoad } from '../wait';

describe('wait utilities', () => {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
        browser = await chromium.launch();
        page = await browser.newPage();
    });

    afterAll(async () => {
        await browser.close();
    });

    describe('waitForPageLoad', () => {
        it('detects when page is loaded', async () => {
            await page.setContent(`
        <html>
          <body>
            <h1>Page loaded</h1>
          </body>
        </html>
      `);

            const result = await waitForPageLoad(page, { timeout: 5000 });

            expect(result.success).toBe(true);
            expect(result.readyState).toBe('complete');
            expect(result.timedOut).toBe(false);
        });

        it('returns timeout when page never loads', async () => {
            await page.setContent(`
        <html>
          <body>
            <h1>Loading...</h1>
            <script>
              // Simulate hanging script
              document.addEventListener('DOMContentLoaded', () => {
                // Never complete
              });
            </script>
          </body>
        </html>
      `);

            const result = await waitForPageLoad(page, { timeout: 100 });

            expect(result.timedOut).toBe(true);
            expect(result.waitTimeMs).toBeGreaterThanOrEqual(100);
        });

        it('waits minimum time even if page appears ready', async () => {
            await page.setContent('<html><body>Ready</body></html>');

            const start = Date.now();
            const result = await waitForPageLoad(page, {
                minimumWait: 200,
                timeout: 5000,
            });
            const elapsed = Date.now() - start;

            expect(result.success).toBe(true);
            expect(elapsed).toBeGreaterThanOrEqual(200);
        });

        it('filters out ads and tracking from pending requests', async () => {
            await page.setContent(`
        <html>
          <body>
            <h1>Testing</h1>
            <img src="https://doubleclick.net/ad.gif" />
            <script src="https://google-analytics.com/analytics.js"></script>
          </body>
        </html>
      `);

            const result = await waitForPageLoad(page, { timeout: 2000 });

            // Should not wait for ad/tracking resources
            expect(result.success).toBe(true);
            expect(result.pendingRequests).toBe(0);
        });
    });
});
