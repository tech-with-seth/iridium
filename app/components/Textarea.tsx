import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const textareaVariants = cva({
    base: 'textarea',
    variants: {
        variant: {
            ghost: 'textarea-ghost'
        },
        color: {
            neutral: 'textarea-neutral',
            primary: 'textarea-primary',
            secondary: 'textarea-secondary',
            accent: 'textarea-accent',
            info: 'textarea-info',
            success: 'textarea-success',
            warning: 'textarea-warning',
            error: 'textarea-error'
        },
        size: {
            xs: 'textarea-xs',
            sm: 'textarea-sm',
            md: 'textarea-md',
            lg: 'textarea-lg',
            xl: 'textarea-xl'
        }
    },
    defaultVariants: {
        size: 'md'
    },
    compoundVariants: []
});

interface TextareaProps
    extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size' | 'color'>,
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
        <div className="form-control w-full">
            {label && (
                <label className="label">
                    <span className="label-text">
                        {label}
                        {required && <span className="text-error ml-1">*</span>}
                    </span>
                </label>
            )}

            <textarea
                disabled={disabled}
                required={required}
                className={cx(
                    textareaVariants({
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
