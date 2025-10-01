import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const toggleVariants = cva({
    base: 'toggle',
    variants: {
        color: {
            primary: 'toggle-primary',
            secondary: 'toggle-secondary',
            accent: 'toggle-accent',
            neutral: 'toggle-neutral',
            success: 'toggle-success',
            warning: 'toggle-warning',
            info: 'toggle-info',
            error: 'toggle-error'
        },
        size: {
            xs: 'toggle-xs',
            sm: 'toggle-sm',
            md: 'toggle-md',
            lg: 'toggle-lg',
            xl: 'toggle-xl'
        }
    },
    defaultVariants: {
        size: 'md'
    },
    compoundVariants: []
});

interface ToggleProps
    extends Omit<
            React.InputHTMLAttributes<HTMLInputElement>,
            'size' | 'type' | 'color'
        >,
        VariantProps<typeof toggleVariants> {
    label?: React.ReactNode;
    error?: string;
    helperText?: string;
}

export function Toggle({
    color,
    size,
    label,
    error,
    helperText,
    className,
    disabled,
    required,
    ...props
}: ToggleProps) {
    if (!label && !error && !helperText) {
        return (
            <input
                type="checkbox"
                className={cx(
                    toggleVariants({
                        color,
                        size
                    }),
                    className
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
                        toggleVariants({
                            color: error ? 'error' : color,
                            size
                        }),
                        className
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
