/**
 * Text extraction utilities for dev-browser skill.
 */

import type { Page } from 'playwright';

/**
 * Options for getVisibleText
 */
export interface VisibleTextOptions {
  /** CSS selector for the root element (default: "body") */
  selector?: string;
  /** Maximum characters to return (default: 10000) */
  limit?: number;
}

/**
 * Get visible text from page, filtering out hidden elements.
 * Uses computed styles to exclude display:none, visibility:hidden, opacity:0.
 * 
 * @example
 * ```typescript
 * const text = await getVisibleText(page, { limit: 5000 });
 * console.log(text);
 * // Output: Only visible text, preserving block structure with newlines
 * ```
 */
export async function getVisibleText(
  page: Page,
  options: VisibleTextOptions = {}
): Promise<string> {
  const selector = options.selector ?? 'body';
  const limit = options.limit ?? 10000;

  const result = await page.evaluate(
    ({ selector, limit }) => {
      const root = document.querySelector(selector);
      if (!root) throw new Error('Element not found: ' + selector);

      const cache = new Map<Element, boolean>();

      function isVisible(el: Element | null): boolean {
        if (!el || el === document.documentElement) return true;
        if (cache.has(el)) return cache.get(el)!;

        const style = window.getComputedStyle(el);
        const visible =
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.visibility !== 'collapse' &&
          parseFloat(style.opacity) !== 0 &&
          isVisible(el.parentElement);

        cache.set(el, visible);
        return visible;
      }

      function isBlock(el: Element): boolean {
        const display = window.getComputedStyle(el).display;
        return (
          display === 'block' ||
          display === 'flex' ||
          display === 'grid' ||
          display === 'list-item' ||
          display === 'table' ||
          display === 'table-row'
        );
      }

      let result = '';
      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT
      );

      while (walker.nextNode()) {
        const node = walker.currentNode;

        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element;
          if (isBlock(el) && result.length > 0 && !result.endsWith('\n')) {
            result += '\n';
          }
        } else if (node.nodeType === Node.TEXT_NODE) {
          const parent = node.parentElement;
          if (parent && isVisible(parent)) {
            const text = (node.textContent || '').trim();
            if (text) result += text + ' ';
          }
        }

        // Early exit if we've exceeded the limit
        if (result.length > limit) break;
      }

      // Trim and truncate
      result = result.trim();
      if (result.length > limit) {
        result = result.slice(0, limit) + '...';
      }

      return result;
    },
    { selector, limit }
  );

  return result;
}
