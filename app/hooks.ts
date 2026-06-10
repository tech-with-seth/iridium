import { useCallback, useEffect, useState, type RefObject } from 'react';
import { useNavigation } from 'react-router';

/**
 * Imperative <dialog> helper: open/close plus an optional "pending target"
 * (the row a confirm dialog is acting on). Takes the dialog's ref rather
 * than owning it so the ref itself stays a plain useRef at the call site
 * (returning a ref inside an object trips react-hooks/refs).
 *
 * Wire `clearTarget` to the dialog's onClose so the target resets however
 * the dialog closes (Cancel, Esc, backdrop, form submit).
 */
export function useDialog<T = void>(
    ref: RefObject<HTMLDialogElement | null>,
    options?: {
        /**
         * Reopens the dialog when this becomes truthy, e.g. a server
         * validation error returned by the action after the submit closed
         * the dialog.
         */
        reopenOnError?: unknown;
    },
) {
    const [target, setTarget] = useState<T | null>(null);

    const reopenOnError = options?.reopenOnError;

    useEffect(() => {
        if (reopenOnError) ref.current?.showModal();
    }, [reopenOnError, ref]);

    const open = useCallback(
        (next?: T) => {
            if (next !== undefined) setTarget(next);
            ref.current?.showModal();
        },
        [ref],
    );

    const close = useCallback(() => {
        ref.current?.close();
    }, [ref]);

    const clearTarget = useCallback(() => setTarget(null), []);

    return { target, open, close, clearTarget };
}

/**
 * The `intent` field of the in-flight form submission, or null when idle.
 * Pairs with the `<input type="hidden" name="intent">` action convention.
 */
export function usePendingIntent() {
    const navigation = useNavigation();

    return navigation.state !== 'idle'
        ? (navigation.formData?.get('intent')?.toString() ?? null)
        : null;
}

/** True while any form submission or loader navigation is in flight. */
export function useIsSubmitting() {
    const navigation = useNavigation();
    return navigation.state !== 'idle';
}
