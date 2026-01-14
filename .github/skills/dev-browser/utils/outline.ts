/**
 * Token-efficient content extraction utilities for dev-browser skill.
 *
 * These functions provide structured, concise output that uses far fewer tokens
 * than screenshots or full ARIA snapshots.
 */

import type { Page } from 'playwright';

/**
 * Options for getOutline
 */
export interface OutlineOptions {
    /** CSS selector for the root element (default: "body") */
    selector?: string;
    /** Maximum depth to traverse (default: 6) */
    maxDepth?: number;
}

/**
 * Get a token-efficient tree outline of page elements.
 * Shows tag names, IDs, classes, and relevant attributes.
 * Collapses repeated siblings and limits depth for efficiency.
 *
 * @example
 * ```typescript
 * const outline = await getOutline(page, { maxDepth: 4 });
 * console.log(outline);
 * // Output:
 * // body
 * //   header#main-header
 * //     nav [role=navigation]
 * //       a "Home" [href=/]
 * //       a "Products" [href=/products]
 * //   main
 * //     div.product-list ... (24)
 * ```
 */
export async function getOutline(
    page: Page,
    options: OutlineOptions = {},
): Promise<string> {
    const selector = options.selector ?? 'body';
    const maxDepth = options.maxDepth ?? 6;

    const result = await page.evaluate(
        ({ selector, maxDepth }) => {
            const SKIP_TAGS = new Set([
                'SCRIPT',
                'STYLE',
                'NOSCRIPT',
                'SVG',
                'PATH',
                'BR',
                'HR',
                'META',
                'LINK',
            ]);

            function truncate(text: string, maxLen: number): string {
                text = text.trim().replace(/\s+/g, ' ');
                return text.length > maxLen
                    ? text.slice(0, maxLen) + '...'
                    : text;
            }

            function getAttributes(
                el: Element,
                getText: (el: Element) => string,
            ): string {
                const attrs: string[] = [];
                const tag = el.tagName;
                const text = getText(el);
                if (text) attrs.push('"' + text + '"');

                if (tag === 'A') {
                    const href = el.getAttribute('href');
                    if (href) attrs.push('[href=' + href.slice(0, 50) + ']');
                }
                if (tag === 'IMG') {
                    const alt = el.getAttribute('alt');
                    attrs.push(
                        alt ? '[alt="' + alt.slice(0, 30) + '"]' : '[img]',
                    );
                }
                if (tag === 'INPUT') {
                    const inputEl = el as HTMLInputElement;
                    attrs.push(
                        '[type=' +
                            (inputEl.getAttribute('type') || 'text') +
                            ']',
                    );
                    const placeholder = inputEl.getAttribute('placeholder');
                    if (placeholder)
                        attrs.push('[placeholder="' + placeholder + '"]');
                }
                if (tag === 'TEXTAREA') {
                    const placeholder = el.getAttribute('placeholder');
                    if (placeholder)
                        attrs.push('[placeholder="' + placeholder + '"]');
                }
                if (tag === 'SELECT') {
                    const selectEl = el as HTMLSelectElement;
                    attrs.push('(' + selectEl.options.length + ' options)');
                }

                const role = el.getAttribute('role');
                if (role) attrs.push('[role=' + role + ']');
                const ariaLabel = el.getAttribute('aria-label');
                if (ariaLabel)
                    attrs.push('[aria-label="' + ariaLabel.slice(0, 30) + '"]');
                const elName = el.getAttribute('name');
                if (elName) attrs.push('[name=' + elName + ']');

                return attrs.join(' ');
            }

            function formatLine(
                el: Element,
                getId: (el: Element) => string,
                getText: (el: Element) => string,
                indent: string,
            ): string {
                const attrs = getAttributes(el, getText);
                return indent + getId(el) + (attrs ? ' ' + attrs : '');
            }

            const root = document.querySelector(selector);
            if (!root) throw new Error('Element not found: ' + selector);

            function getId(el: Element): string {
                let id = el.tagName.toLowerCase();
                if (el.id) id += '#' + el.id;
                else if (el.className && typeof el.className === 'string') {
                    const cls = el.className
                        .trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .join('.');
                    if (cls) id += '.' + cls;
                }
                return id;
            }

            function getText(el: Element): string {
                let text = '';
                for (const child of el.childNodes) {
                    if (child.nodeType === Node.TEXT_NODE) {
                        text += child.textContent;
                    }
                }
                return truncate(text, 50);
            }

            function getSignature(el: Element): string {
                return getId(el) + ' ' + getText(el);
            }

            function findRepeatedGroups(
                children: Element[],
            ): Array<{ start: number; count: number }> {
                const groups: Array<{ start: number; count: number }> = [];
                let i = 0;
                while (i < children.length) {
                    const sig = getSignature(children[i]!);
                    let count = 1;
                    while (
                        i + count < children.length &&
                        getSignature(children[i + count]!) === sig
                    ) {
                        count++;
                    }
                    groups.push({ start: i, count });
                    i += count;
                }
                return groups;
            }

            function walk(el: Element, depth: number): string {
                if (SKIP_TAGS.has(el.tagName)) return '';

                const indent = '  '.repeat(depth);
                let line = formatLine(el, getId, getText, indent);

                const children = Array.from(el.children).filter(
                    (c) => !SKIP_TAGS.has(c.tagName),
                );

                if (depth >= maxDepth && children.length > 0) {
                    line += ' ... (' + children.length + ')';
                }
                line += '\n';

                if (depth >= maxDepth || children.length === 0) return line;

                for (const { start, count } of findRepeatedGroups(children)) {
                    if (count > 2) {
                        const childOutput = walk(children[start]!, depth + 1);
                        const firstLine = childOutput.split('\n')[0];
                        line += firstLine + ' (×' + count + ')\n';
                        const rest = childOutput
                            .split('\n')
                            .slice(1)
                            .join('\n');
                        if (rest.trim()) line += rest;
                    } else {
                        for (let j = 0; j < count; j++) {
                            line += walk(children[start + j]!, depth + 1);
                        }
                    }
                }

                return line;
            }

            return walk(root, 0);
        },
        { selector, maxDepth },
    );

    return result.trimEnd();
}

/**
 * Get a token-efficient outline showing only interactive elements and landmarks.
 * Best for understanding page structure and available actions.
 *
 * @example
 * ```typescript
 * const interactive = await getInteractiveOutline(page);
 * console.log(interactive);
 * // Output:
 * // header
 * //   a "Home" [href=/]
 * //   a "Products" [href=/products]
 * // main
 * //   button "Add to Cart"
 * //   input [type=text] [placeholder="Search"]
 * // footer
 * //   a "Contact" [href=/contact]
 * ```
 */
export async function getInteractiveOutline(
    page: Page,
    selector = 'body',
): Promise<string> {
    const result = await page.evaluate((selector: string) => {
        const SKIP_TAGS = new Set([
            'SCRIPT',
            'STYLE',
            'NOSCRIPT',
            'SVG',
            'PATH',
            'BR',
            'HR',
            'META',
            'LINK',
        ]);
        const INTERACTIVE = new Set([
            'A',
            'BUTTON',
            'INPUT',
            'SELECT',
            'TEXTAREA',
        ]);
        const LANDMARKS = new Set([
            'HEADER',
            'NAV',
            'MAIN',
            'FOOTER',
            'ASIDE',
            'SECTION',
            'FORM',
            'DIALOG',
        ]);
        const LANDMARK_ROLES = new Set([
            'banner',
            'navigation',
            'main',
            'contentinfo',
            'complementary',
            'region',
            'form',
            'search',
            'dialog',
        ]);

        function truncate(text: string, maxLen: number): string {
            text = text.trim().replace(/\s+/g, ' ');
            return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
        }

        function getAttributes(
            el: Element,
            getText: (el: Element) => string,
        ): string {
            const attrs: string[] = [];
            const tag = el.tagName;
            const text = getText(el);
            if (text) attrs.push('"' + text + '"');

            if (tag === 'A') {
                const href = el.getAttribute('href');
                if (href) attrs.push('[href=' + href.slice(0, 50) + ']');
            }
            if (tag === 'IMG') {
                const alt = el.getAttribute('alt');
                attrs.push(alt ? '[alt="' + alt.slice(0, 30) + '"]' : '[img]');
            }
            if (tag === 'INPUT') {
                const inputEl = el as HTMLInputElement;
                attrs.push(
                    '[type=' + (inputEl.getAttribute('type') || 'text') + ']',
                );
                const placeholder = inputEl.getAttribute('placeholder');
                if (placeholder)
                    attrs.push('[placeholder="' + placeholder + '"]');
            }
            if (tag === 'TEXTAREA') {
                const placeholder = el.getAttribute('placeholder');
                if (placeholder)
                    attrs.push('[placeholder="' + placeholder + '"]');
            }
            if (tag === 'SELECT') {
                const selectEl = el as HTMLSelectElement;
                attrs.push('(' + selectEl.options.length + ' options)');
            }

            const role = el.getAttribute('role');
            if (role) attrs.push('[role=' + role + ']');
            const ariaLabel = el.getAttribute('aria-label');
            if (ariaLabel)
                attrs.push('[aria-label="' + ariaLabel.slice(0, 30) + '"]');
            const elName = el.getAttribute('name');
            if (elName) attrs.push('[name=' + elName + ']');
            if (el.hasAttribute('onclick')) attrs.push('onclick');
            const tabindex = el.getAttribute('tabindex');
            if (tabindex) attrs.push('tabindex=' + tabindex);

            return attrs.join(' ');
        }

        function formatLine(
            el: Element,
            getId: (el: Element) => string,
            getText: (el: Element) => string,
            indent: string,
        ): string {
            const attrs = getAttributes(el, getText);
            return indent + getId(el) + (attrs ? ' ' + attrs : '');
        }

        const root = document.querySelector(selector);
        if (!root) throw new Error('Element not found: ' + selector);

        function isInteractive(el: Element): boolean {
            return (
                INTERACTIVE.has(el.tagName) ||
                el.getAttribute('role') === 'button' ||
                el.hasAttribute('onclick') ||
                el.getAttribute('tabindex') === '0'
            );
        }

        function isLandmark(el: Element): boolean {
            return (
                LANDMARKS.has(el.tagName) ||
                LANDMARK_ROLES.has(el.getAttribute('role') || '')
            );
        }

        function getId(el: Element): string {
            let id = el.tagName.toLowerCase();
            if (el.id) id += '#' + el.id;
            return id;
        }

        function getText(el: Element): string {
            return truncate((el as HTMLElement).innerText || '', 50);
        }

        interface TreeNode {
            el: Element | null;
            children: TreeNode[];
        }

        function buildTree(el: Element): TreeNode | null {
            if (SKIP_TAGS.has(el.tagName)) return null;
            if (isInteractive(el)) return { el, children: [] };

            const childTrees: TreeNode[] = [];
            for (const child of el.children) {
                const tree = buildTree(child);
                if (tree) childTrees.push(tree);
            }

            if (isLandmark(el) && childTrees.length > 0) {
                return { el, children: childTrees };
            }
            if (childTrees.length === 1) return childTrees[0]!;
            if (childTrees.length > 1)
                return { el: null, children: childTrees };
            return null;
        }

        function render(node: TreeNode | null, depth = 0): string {
            if (!node) return '';
            const indent = '  '.repeat(depth);

            if (node.el) {
                let output = formatLine(node.el, getId, getText, indent) + '\n';
                for (const child of node.children) {
                    output += render(child, depth + 1);
                }
                return output;
            }

            let output = '';
            for (const child of node.children) {
                output += render(child, depth);
            }
            return output;
        }

        const tree = buildTree(root);
        return tree ? render(tree) : '';
    }, selector);

    return result.trimEnd();
}
