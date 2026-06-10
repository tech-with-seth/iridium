import { forwardRef, type PropsWithChildren, type ReactNode } from 'react';
import { cx } from 'cva.config';

type ModalProps = PropsWithChildren<{
    title: ReactNode;
    /** Fires however the dialog closes (Esc, Cancel, form submit). */
    onClose?: () => void;
    /** Adds a click-outside-to-close backdrop. */
    backdrop?: boolean;
    className?: string;
}>;

/**
 * Native <dialog> chrome: modal wrapper, box, and heading. Open and close
 * imperatively via the ref, typically from useDialog (~/hooks).
 */
export const Modal = forwardRef<HTMLDialogElement, ModalProps>(function Modal(
    { title, onClose, backdrop, className, children },
    ref,
) {
    return (
        <dialog ref={ref} className="modal" onClose={onClose}>
            <div className={cx('modal-box', className)}>
                <h3 className="flex items-center gap-2 text-lg font-bold">
                    {title}
                </h3>
                {children}
            </div>
            {backdrop && (
                <form method="dialog" className="modal-backdrop">
                    <button type="submit">close</button>
                </form>
            )}
        </dialog>
    );
});

Modal.displayName = 'Modal';

export function ModalActions({ children }: PropsWithChildren) {
    return <div className="modal-action">{children}</div>;
}
