import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const checkboxVariants = cva({
    base: 'checkbox',
    variants: {
        color: {
            primary: 'checkbox-primary',
            secondary: 'checkbox-secondary',
            accent: 'checkbox-accent',
            neutral: 'checkbox-neutral',
            success: 'checkbox-success',
            warning: 'checkbox-warning',
            info: 'checkbox-info',
            error: 'checkbox-error',
        },
        size: {
            xs: 'checkbox-xs',
            sm: 'checkbox-sm',
            md: 'checkbox-md',
            lg: 'checkbox-lg',
            xl: 'checkbox-xl',
        },
    },
    defaultVariants: {
        size: 'md',
    },
    compoundVariants: [],
});

interface CheckboxProps
    extends Omit<
            React.InputHTMLAttributes<HTMLInputElement>,
            'size' | 'type' | 'color'
        >,
        VariantProps<typeof checkboxVariants> {
    label?: React.ReactNode;
    error?: string;
    helperText?: string;
}

export function Checkbox({
    color,
    size,
    label,
    error,
    helperText,
    className,
    disabled,
    required,
    ...props
}: CheckboxProps) {
    if (!label && !error && !helperText) {
        return (
            <input
                type="checkbox"
                className={cx(
                    checkboxVariants({
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
                    type="checkbox"
                    className={cx(
                        checkboxVariants({
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
