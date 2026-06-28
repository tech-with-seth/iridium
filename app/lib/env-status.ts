/**
 * Client-safe types for the dev-only environment banner. Kept separate from
 * env.server.ts (which is server-only) so the banner component can import the
 * type without pulling server code into the browser bundle.
 */
export type EnvSeverity = 'error' | 'info';

export type EnvWarning = {
    /** The environment variable name, e.g. ANTHROPIC_API_KEY. */
    key: string;
    /** Plain-language consequence of the variable being unset/placeholdered. */
    effect: string;
    /**
     * `error` — a required infra var is missing and running on a dev
     * placeholder (the feature genuinely won't work). `info` — an optional
     * feature key is unset and the app is degrading gracefully.
     */
    severity: EnvSeverity;
};
