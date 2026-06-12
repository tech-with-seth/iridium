import { useEffect, useState } from 'react';
import { cx } from 'cva.config';

export type Toast = {
    type: 'success' | 'error' | 'info';
    message: string;
};

const ALERT_CLASS: Record<Toast['type'], string> = {
    success: 'alert-success',
    error: 'alert-error',
    info: 'alert-info',
};

const AUTO_DISMISS_MS = 5_000;

export function Toaster({ toast }: { toast: Toast | null }) {
    // Track which toast was dismissed (by identity) instead of a visible
    // flag so the effect never sets state synchronously.
    const [dismissed, setDismissed] = useState<Toast | null>(null);

    useEffect(() => {
        if (!toast) return;

        const timer = setTimeout(() => setDismissed(toast), AUTO_DISMISS_MS);

        return () => clearTimeout(timer);
    }, [toast]);

    if (!toast || dismissed === toast) return null;

    return (
        <div className="toast toast-end z-50">
            <div role="status" className={cx('alert', ALERT_CLASS[toast.type])}>
                <span>{toast.message}</span>
                <button
                    type="button"
                    aria-label="Dismiss notification"
                    className="btn btn-ghost btn-xs pointer-coarse:btn-sm"
                    onClick={() => setDismissed(toast)}
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
