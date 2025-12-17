import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const textInputVariants = cva({
    base: 'input',
    variants: {
        variant: {
            ghost: 'input-ghost',
        },
        color: {
            neutral: 'input-neutral',
            primary: 'input-primary',
            secondary: 'input-secondary',
            accent: 'input-accent',
            info: 'input-info',
            success: 'input-success',
            warning: 'input-warning',
            error: 'input-error',
        },
        size: {
            xs: 'input-xs',
            sm: 'input-sm',
            md: 'input-md',
            lg: 'input-lg',
            xl: 'input-xl',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

interface TextInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'color'>,
        VariantProps<typeof textInputVariants> {
    label?: React.ReactNode;
    labelClassName?: string;
    error?: string;
    helperText?: string;
}

/**
 * Text input field with label, error states, and helper text support.
 *
 * @example
 * ```tsx
 * <TextInput
 *   label="Email"
 *   type="email"
 *   placeholder="user@example.com"
 *   required
 * />
 * <TextInput
 *   label="Username"
 *   error="Username is already taken"
 *   helperText="3-20 characters"
 * />
 * ```
 *
 * @see {@link https://daisyui.com/components/input/ DaisyUI Input Documentation}
 */
export function TextInput({
    label,
    error,
    helperText,
    required,
    disabled,
    size,
    color,
    variant,
    className,
    labelClassName,
    ...props
}: TextInputProps) {
    return (
        <label className={cx('flex flex-col gap-1', labelClassName)}>
            {label && (
                <span className="text-sm font-medium">
                    {label}
                    {required && <span className="text-error ml-1">*</span>}
                </span>
            )}

            <input
                disabled={disabled}
                required={required}
                className={cx(
                    textInputVariants({
                        size,
                        color: error ? 'error' : color,
                        variant,
                    }),
                    className,
                )}
                {...props}
            />

            {(error || helperText) && (
                <span
                    className={cx(
                        'text-xs',
                        error ? 'text-error' : 'text-base-content/70',
                    )}
                >
                    {error || helperText}
                </span>
            )}
        </label>
    );
}
