/**
 * Example: TextInput Component with Form Control Pattern
 *
 * Demonstrates the form component pattern with:
 * - Label support with required indicator
 * - Error state handling
 * - Helper text
 * - Accessibility attributes
 */

import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const textInputVariants = cva({
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

interface TextInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'color'>,
        VariantProps<typeof textInputVariants> {
    /** Label text displayed above the input */
    label?: string;
    /** Error message - sets error styling and displays below input */
    error?: string;
    /** Helper text shown below input when no error present */
    helperText?: string;
}

/**
 * Text input component with integrated label, error, and helper text support.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TextInput
 *   label="Email"
 *   type="email"
 *   placeholder="you@example.com"
 * />
 *
 * // With error
 * <TextInput
 *   label="Password"
 *   type="password"
 *   error="Password must be at least 8 characters"
 *   required
 * />
 *
 * // With helper text
 * <TextInput
 *   label="Username"
 *   helperText="This will be visible to other users"
 * />
 * ```
 *
 * @see {@link https://daisyui.com/components/input/ DaisyUI Input Documentation}
 */
export function TextInput({
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
}: TextInputProps) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const descriptionId = `${inputId}-description`;

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
                    textInputVariants({
                        size,
                        color: error ? 'error' : color,
                        ghost,
                        bordered,
                    }),
                    className,
                )}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error || helperText ? descriptionId : undefined}
                required={required}
                {...props}
            />
            {(error || helperText) && (
                <label className="label" id={descriptionId}>
                    <span className={cx('label-text-alt', error && 'text-error')}>
                        {error || helperText}
                    </span>
                </label>
            )}
        </div>
    );
}
