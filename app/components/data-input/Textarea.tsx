import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const textareaVariants = cva({
    base: 'textarea',
    variants: {
        variant: {
            ghost: 'textarea-ghost',
        },
        color: {
            neutral: 'textarea-neutral',
            primary: 'textarea-primary',
            secondary: 'textarea-secondary',
            accent: 'textarea-accent',
            info: 'textarea-info',
            success: 'textarea-success',
            warning: 'textarea-warning',
            error: 'textarea-error',
        },
        size: {
            xs: 'textarea-xs',
            sm: 'textarea-sm',
            md: 'textarea-md',
            lg: 'textarea-lg',
            xl: 'textarea-xl',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

interface TextareaProps
    extends Omit<
            React.TextareaHTMLAttributes<HTMLTextAreaElement>,
            'size' | 'color'
        >,
        VariantProps<typeof textareaVariants> {
    label?: React.ReactNode;
    error?: string;
    helperText?: string;
}

export function Textarea({
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
}: TextareaProps) {
    return (
        <label className="w-full flex flex-col gap-1">
            {label && (
                <span className="text-sm font-medium">
                    {label}
                    {required && <span className="text-error ml-1">*</span>}
                </span>
            )}

            <textarea
                disabled={disabled}
                required={required}
                className={cx(
                    textareaVariants({
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
