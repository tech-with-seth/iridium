/**
 * Element reference persistence utilities for dev-browser skill.
 *
 * Stores element references in window.__devBrowserRefs to survive
 * across Playwright reconnections.
 */

import type { Page, ElementHandle } from 'playwright';

/**
 * Store element references in browser context for later retrieval.
 * Refs survive across Playwright reconnections.
 *
 * @example
 * ```typescript
 * // First script - persist refs
 * await page.goto('http://localhost:5173');
 * await persistRefs(page, {
 *   loginButton: await page.locator('button:has-text("Sign In")'),
 *   emailInput: await page.locator('input[type="email"]')
 * });
 *
 * // Later script - retrieve refs
 * const loginButton = await selectRef(page, 'loginButton');
 * await loginButton.click();
 * ```
 */
export async function persistRefs(
    page: Page,
    refs: Record<string, ElementHandle>,
): Promise<void> {
    await page.evaluate((refNames: string[]) => {
        // Initialize storage if needed
        if (!window.__devBrowserRefs) {
            window.__devBrowserRefs = {};
        }

        // Mark these ref names as valid (elements stored separately)
        for (const name of refNames) {
            window.__devBrowserRefs[name] = null; // Placeholder
        }
    }, Object.keys(refs));

    // Store actual element handles in page context
    for (const [name, handle] of Object.entries(refs)) {
        await page.evaluate(
            ({ name, element }) => {
                // Cast to Element since Playwright ElementHandle becomes Node in evaluate context
                window.__devBrowserRefs[name] = element as unknown as Element;
            },
            { name, element: handle },
        );
    }
}

/**
 * Retrieve a previously stored element reference by name.
 * Returns null if ref not found.
 *
 * @example
 * ```typescript
 * const button = await selectRef(page, 'loginButton');
 * if (button) {
 *   await button.click();
 * } else {
 *   console.error('Ref not found');
 * }
 * ```
 */
export async function selectRef(
    page: Page,
    refName: string,
): Promise<ElementHandle | null> {
    const elementHandle = await page.evaluateHandle((name: string) => {
        const refs = window.__devBrowserRefs;
        if (!refs) {
            throw new Error('No refs found. Call persistRefs first.');
        }
        const element = refs[name];
        if (!element) {
            throw new Error(
                `Ref "${name}" not found. Available refs: ${Object.keys(refs).join(', ')}`,
            );
        }
        return element;
    }, refName);

    const element = elementHandle.asElement();
    if (!element) {
        await elementHandle.dispose();
        return null;
    }

    return element;
}

/**
 * List all stored ref names.
 *
 * @example
 * ```typescript
 * const refs = await listRefs(page);
 * console.log('Available refs:', refs);
 * // Output: ['loginButton', 'emailInput', 'submitForm']
 * ```
 */
export async function listRefs(page: Page): Promise<string[]> {
    return page.evaluate(() => {
        const refs = window.__devBrowserRefs;
        if (!refs) return [];
        return Object.keys(refs);
    });
}

/**
 * Clear all stored refs.
 *
 * @example
 * ```typescript
 * await clearRefs(page);
 * ```
 */
export async function clearRefs(page: Page): Promise<void> {
    await page.evaluate(() => {
        window.__devBrowserRefs = {};
    });
}

// Type augmentation for window.__devBrowserRefs
declare global {
    interface Window {
        __devBrowserRefs: Record<string, Element | null>;
    }
}
