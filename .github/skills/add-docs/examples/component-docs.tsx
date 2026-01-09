/**
 * Example: Well-Documented Component
 *
 * Shows proper JSDoc usage for a CVA component with variants.
 */

import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

/**
 * Alert variant styles using CVA
 *
 * Maps semantic status to DaisyUI alert classes.
 * See: https://daisyui.com/components/alert/
 */
export const alertVariants = cva({
    base: 'alert',
    variants: {
        /**
         * Visual style indicating the alert type
         * - info: Neutral information (blue)
         * - success: Positive confirmation (green)
         * - warning: Caution required (yellow)
         * - error: Error or failure (red)
         */
        status: {
            info: 'alert-info',
            success: 'alert-success',
            warning: 'alert-warning',
            error: 'alert-error',
        },
        /**
         * Whether the alert can be dismissed by the user
         * When true, renders a close button
         */
        dismissible: {
            true: '',
            false: '',
        },
    },
    defaultVariants: {
        status: 'info',
        dismissible: false,
    },
});

/**
 * Props for the Alert component
 */
export interface AlertProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof alertVariants> {
    /**
     * Icon to display before the alert content
     * @example <Alert icon={<InfoIcon />}>Message</Alert>
     */
    icon?: React.ReactNode;
    /**
     * Callback fired when dismiss button is clicked
     * Only relevant when dismissible={true}
     */
    onDismiss?: () => void;
}

/**
 * Alert component for displaying important messages
 *
 * Renders contextual feedback messages with semantic colors.
 * Supports optional dismiss button and custom icons.
 *
 * Built with DaisyUI alert classes and CVA variants.
 * See: https://daisyui.com/components/alert/
 *
 * @example
 * // Basic info alert
 * <Alert>Your changes have been saved.</Alert>
 *
 * @example
 * // Success alert with custom icon
 * <Alert status="success" icon={<CheckIcon />}>
 *   Profile updated successfully!
 * </Alert>
 *
 * @example
 * // Dismissible error alert
 * <Alert
 *   status="error"
 *   dismissible
 *   onDismiss={() => setShowError(false)}
 * >
 *   Failed to save changes. Please try again.
 * </Alert>
 *
 * @example
 * // Warning with action button
 * <Alert status="warning">
 *   <span>Your session will expire soon.</span>
 *   <Button size="sm" onClick={extendSession}>Extend</Button>
 * </Alert>
 */
export function Alert({
    status,
    dismissible,
    icon,
    onDismiss,
    className,
    children,
    ...props
}: AlertProps) {
    return (
        <div
            role="alert"
            className={cx(alertVariants({ status, dismissible }), className)}
            {...props}
        >
            {/* Icon container - uses DaisyUI's built-in icon slot */}
            {icon && <span className="shrink-0">{icon}</span>}

            {/* Main content - flex-1 ensures it takes available space */}
            <span className="flex-1">{children}</span>

            {/* Dismiss button - only rendered when dismissible */}
            {dismissible && onDismiss && (
                <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-circle"
                    onClick={onDismiss}
                    aria-label="Dismiss alert"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
}
