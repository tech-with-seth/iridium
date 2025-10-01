import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const textInputVariants = cva({
    base: 'input',
    variants: {
        variant: {
            ghost: 'input-ghost'
        },
        color: {
            neutral: 'input-neutral',
            primary: 'input-primary',
            secondary: 'input-secondary',
            accent: 'input-accent',
            info: 'input-info',
            success: 'input-success',
            warning: 'input-warning',
            error: 'input-error'
        },
        size: {
            xs: 'input-xs',
            sm: 'input-sm',
            md: 'input-md',
            lg: 'input-lg',
            xl: 'input-xl'
        }
    },
    defaultVariants: {
        size: 'md'
    },
    compoundVariants: []
});

interface TextInputProps
    extends Omit<
            React.InputHTMLAttributes<HTMLInputElement>,
            'size' | 'color'
        >,
        VariantProps<typeof textInputVariants> {
    label?: React.ReactNode;
    error?: string;
    helperText?: string;
}

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
    ...props
}: TextInputProps) {
    return (
        <div className="form-control w-full">
            {label && (
                <label className="label">
                    <span className="label-text">
                        {label}
                        {required && <span className="text-error ml-1">*</span>}
                    </span>
                </label>
            )}

            <input
                disabled={disabled}
                required={required}
                className={cx(
                    textInputVariants({
                        size,
                        color: error ? 'error' : color,
                        variant
                    }),
                    className
                )}
                {...props}
            />

            {(error || helperText) && (
                <label className="label">
                    <span
                        className={cx(
                            'label-text-alt',
                            error ? 'text-error' : 'text-base-content/70'
                        )}
                    >
                        {error || helperText}
                    </span>
                </label>
            )}
        </div>
    );
}
