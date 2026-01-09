/**
 * Template: Form Input Component with Label, Error, and Helper Text
 *
 * Replace placeholders:
 * - InputName → Your input name (PascalCase, e.g., TextInput, EmailInput)
 * - inputVariants → camelCase version
 * - input → DaisyUI base class
 * - HTMLInputElement → Actual element type
 */

import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const inputVariants = cva({
    base: 'input w-full',
    variants: {
        size: {
            xs: 'input-xs',
            sm: 'input-sm',
            md: 'input-md',
            lg: 'input-lg',
        },
        color: {
            primary: 'input-primary',
            secondary: 'input-secondary',
            accent: 'input-accent',
            info: 'input-info',
            success: 'input-success',
            warning: 'input-warning',
            error: 'input-error',
        },
        ghost: { true: 'input-ghost' },
        bordered: { true: 'input-bordered' },
    },
    defaultVariants: {
        size: 'md',
        bordered: true,
    },
});

interface InputNameProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'color'>,
        VariantProps<typeof inputVariants> {
    /** Optional label text displayed above the input */
    label?: string;
    /** Error message - automatically sets error styling */
    error?: string;
    /** Helper text displayed below the input when no error */
    helperText?: string;
}

/**
 * Form input component with built-in label, error, and helper text support.
 *
 * @example
 * ```tsx
 * <InputName
 *   label="Email Address"
 *   placeholder="you@example.com"
 *   error={errors.email?.message}
 *   required
 * />
 * ```
 *
 * @see {@link https://daisyui.com/components/input/ DaisyUI Input Documentation}
 */
export function InputName({
    label,
    error,
    helperText,
    size,
    color,
    ghost,
    bordered,
    className,
    required,
    id,
    ...props
}: InputNameProps) {
    // Generate stable ID if not provided
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="form-control w-full">
            {label && (
                <label className="label" htmlFor={inputId}>
                    <span className="label-text">
                        {label}
                        {required && <span className="text-error ml-1">*</span>}
                    </span>
                </label>
            )}
            <input
                id={inputId}
                className={cx(
                    inputVariants({
                        size,
                        color: error ? 'error' : color,
                        ghost,
                        bordered,
                    }),
                    className,
                )}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={
                    error || helperText ? `${inputId}-description` : undefined
                }
                {...props}
            />
            {(error || helperText) && (
                <label className="label" id={`${inputId}-description`}>
                    <span
                        className={cx('label-text-alt', error && 'text-error')}
                    >
                        {error || helperText}
                    </span>
                </label>
            )}
        </div>
    );
}
