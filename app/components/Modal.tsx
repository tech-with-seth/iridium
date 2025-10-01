import { cn } from "~/lib/utils";
import { useEffect, useRef } from "react";

interface ModalProps {
    id: string;
    children: React.ReactNode;
    title?: string;
    open?: boolean;
    onClose?: () => void;
    className?: string;
    placement?: 'top' | 'middle' | 'bottom' | 'start' | 'end';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    closeOnBackdropClick?: boolean;
    showCloseButton?: boolean;
}

export function Modal({
    id,
    children,
    title,
    open = false,
    onClose,
    className,
    placement = 'middle',
    size = 'md',
    closeOnBackdropClick = true,
    showCloseButton = true,
    ...rest
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
            id={id}
            className={cn(
                'modal',
                placement !== 'middle' && `modal-${placement}`,
                className
            )}
            onClick={handleBackdropClick}
            onClose={handleClose}
            {...rest}
        >
            <div className={cn(
                'modal-box',
                size !== 'md' && `modal-box-${size}` // Note: DaisyUI doesn't have size variants for modal-box, using custom classes
            )}>
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

            <form method="dialog" className="modal-backdrop" onSubmit={handleFormSubmit}>
                <button type="submit">close</button>
            </form>
        </dialog>
    );
}

export function ModalActions({ children, className, ...rest }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('modal-action', className)} {...rest}>
            {children}
        </div>
    );
}