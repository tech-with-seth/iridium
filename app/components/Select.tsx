import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const selectVariants = cva({
    base: 'select',
    variants: {
        variant: {
            ghost: 'select-ghost'
        },
        color: {
            neutral: 'select-neutral',
            primary: 'select-primary',
            secondary: 'select-secondary',
            accent: 'select-accent',
            info: 'select-info',
            success: 'select-success',
            warning: 'select-warning',
            error: 'select-error'
        },
        size: {
            xs: 'select-xs',
            sm: 'select-sm',
            md: 'select-md',
            lg: 'select-lg',
            xl: 'select-xl'
        }
    },
    defaultVariants: {
        size: 'md'
    },
    compoundVariants: []
});

interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface SelectProps
    extends Omit<
            React.SelectHTMLAttributes<HTMLSelectElement>,
            'size' | 'color'
        >,
        VariantProps<typeof selectVariants> {
    label?: React.ReactNode;
    placeholder?: string;
    error?: string;
    helperText?: string;
    options: SelectOption[];
}

export function Select({
    label,
    placeholder = 'Choose an option',
    error,
    helperText,
    required,
    disabled,
    size,
    color,
    variant,
    options,
    className,
    ...props
}: SelectProps) {
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

            <select
                disabled={disabled}
                required={required}
                className={cx(
                    selectVariants({
                        size,
                        color: error ? 'error' : color,
                        variant
                    }),
                    className
                )}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </option>
                ))}
            </select>

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
