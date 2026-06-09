import { z } from 'zod';

export const themeSchema = z.enum(['light', 'dark', 'system']);

export type Theme = z.infer<typeof themeSchema>;

/** DaisyUI theme names (declared in app.css) keyed by user preference. */
export const THEME_NAMES: Record<Exclude<Theme, 'system'>, string> = {
    light: 'emerald',
    dark: 'night',
};
