import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';
import { useEffect, useRef } from 'react';

export const modalVariants = cva({
    base: 'modal',
    variants: {
        placement: {
            top: 'modal-top',
            middle: 'modal-middle',
            bottom: 'modal-bottom',
        },
        open: {
            true: 'modal-open',
        },
    },
    defaultVariants: {
        placement: 'middle',
    },
});

interface ModalProps
    extends Omit<
            React.DialogHTMLAttributes<HTMLDialogElement>,
            'open' | 'title'
        >,
        VariantProps<typeof modalVariants> {
    open?: boolean;
    onClose?: () => void;
    title?: React.ReactNode;
    closeOnBackdropClick?: boolean;
    showCloseButton?: boolean;
}

export function Modal({
    children,
    title,
    open = false,
    onClose,
    className,
    placement,
    closeOnBackdropClick = true,
    showCloseButton = true,
    ...props
}: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open) {
            dialog.showModal();
        } else {
            dialog.close();
        }
    }, [open]);

    const handleClose = () => {
        onClose?.();
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
            handleClose();
        }
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleClose();
    };

    return (
        <dialog
            ref={dialogRef}
            className={cx(
                modalVariants({
                    placement,
                    open,
                }),
                className,
            )}
            onClick={handleBackdropClick}
            onClose={handleClose}
            {...props}
        >
            <div className="modal-box">
                {title && (
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg">{title}</h3>
                        {showCloseButton && (
                            <button
                                type="button"
                                className="btn btn-sm btn-circle btn-ghost"
                                onClick={handleClose}
                                aria-label="Close modal"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                )}

                {!title && showCloseButton && (
                    <button
                        type="button"
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        onClick={handleClose}
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                )}

                {children}
            </div>

            <form
                method="dialog"
                className="modal-backdrop"
                onSubmit={handleFormSubmit}
            >
                <button type="submit">close</button>
            </form>
        </dialog>
    );
}

interface ModalActionsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ModalActions({
    children,
    className,
    ...props
}: ModalActionsProps) {
    return (
        <div className={cx('modal-action', className)} {...props}>
            {children}
        </div>
    );
}
