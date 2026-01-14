/**
 * Optional TypeScript utilities for dev-browser skill.
 * 
 * These utilities provide token-efficient alternatives to inline JavaScript patterns.
 * Use them when:
 * - Saving tokens matters (repeated operations)
 * - Type safety is important (production scripts)
 * - Code reuse across multiple debugging sessions
 * 
 * For learning and first-time exploration, prefer inline patterns from templates.
 */

export { getOutline, getInteractiveOutline } from './outline';
export type { OutlineOptions } from './outline';

export { getVisibleText } from './text';
export type { VisibleTextOptions } from './text';

export { waitForPageLoad } from './wait';
export type { WaitForPageLoadOptions, WaitForPageLoadResult } from './wait';

export { persistRefs, selectRef, listRefs, clearRefs } from './refs';
