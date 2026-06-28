import { useState } from 'react';
import { TriangleAlertIcon, XIcon } from 'lucide-react';
import type { EnvWarning } from '~/lib/env-status';

/**
 * Dev-only banner listing unset/placeholdered environment variables so a
 * developer can see at a glance what isn't configured. Rendered at the very
 * top of the document by root.tsx. The server only passes warnings when
 * `shouldShowEnvBanner` is true (never in production or E2E runs), so this
 * never appears for end users.
 */
export function EnvBanner({ warnings }: { warnings: EnvWarning[] }) {
    const [dismissed, setDismissed] = useState(false);

    if (warnings.length === 0 || dismissed) return null;

    return (
        <div
            role="status"
            className="bg-warning text-warning-content px-4 py-2 text-sm"
        >
            <div className="mx-auto flex max-w-6xl items-start gap-3">
                <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
                <div className="flex-1">
                    <span className="font-semibold">
                        Missing environment variables
                    </span>{' '}
                    <span className="opacity-80">(dev only)</span>
                    <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        {warnings.map((w) => (
                            <li
                                key={w.key}
                                className="flex items-center gap-1.5"
                            >
                                <span
                                    className={
                                        w.severity === 'error'
                                            ? 'badge badge-error badge-xs'
                                            : 'badge badge-xs'
                                    }
                                >
                                    {w.severity === 'error'
                                        ? 'required'
                                        : 'optional'}
                                </span>
                                <code className="font-mono font-semibold">
                                    {w.key}
                                </code>
                                <span className="opacity-80">— {w.effect}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <button
                    type="button"
                    onClick={() => setDismissed(true)}
                    aria-label="Dismiss environment warning"
                    className="btn btn-ghost btn-xs btn-square focus-visible:ring-warning-content/50 focus-visible:ring-2"
                >
                    <XIcon className="size-4" />
                </button>
            </div>
        </div>
    );
}
