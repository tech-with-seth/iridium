import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const radioVariants = cva({
    base: 'radio',
    variants: {
        color: {
            primary: 'radio-primary',
            secondary: 'radio-secondary',
            accent: 'radio-accent',
            neutral: 'radio-neutral',
            success: 'radio-success',
            warning: 'radio-warning',
            info: 'radio-info',
            error: 'radio-error',
        },
        size: {
            xs: 'radio-xs',
            sm: 'radio-sm',
            md: 'radio-md',
            lg: 'radio-lg',
            xl: 'radio-xl',
        },
    },
    defaultVariants: {
        size: 'md',
    },
    compoundVariants: [],
});

interface RadioProps
    extends Omit<
            React.InputHTMLAttributes<HTMLInputElement>,
            'size' | 'type' | 'color'
        >,
        VariantProps<typeof radioVariants> {
    label?: React.ReactNode;
    error?: string;
    helperText?: string;
}

export function Radio({
    color,
    size,
    label,
    error,
    helperText,
    className,
    disabled,
    required,
    ...props
}: RadioProps) {
    if (!label && !error && !helperText) {
        return (
            <input
                type="radio"
                className={cx(
                    radioVariants({
                        color,
                        size,
                    }),
                    className,
                )}
                disabled={disabled}
                {...props}
            />
        );
    }

    return (
        <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
                <input
                    type="radio"
                    className={cx(
                        radioVariants({
                            color: error ? 'error' : color,
                            size,
                        }),
                        className,
                    )}
                    disabled={disabled}
                    {...props}
                />
                {label && (
                    <span className="label-text">
                        {label}
                        {required && <span className="text-error ml-1">*</span>}
                    </span>
                )}
            </label>
            {(error || helperText) && (
                <label className="label">
                    <span
                        className={cx(
                            'label-text-alt',
                            error ? 'text-error' : 'text-base-content/70',
                        )}
                    >
                        {error || helperText}
                    </span>
                </label>
            )}
        </div>
    );
}
