import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const selectVariants = cva({
    base: 'select select-bordered',
    variants: {
        variant: {
            ghost: 'select-ghost',
        },
        status: {
            neutral: 'select-neutral',
            primary: 'select-primary',
            secondary: 'select-secondary',
            accent: 'select-accent',
            info: 'select-info',
            success: 'select-success',
            warning: 'select-warning',
            error: 'select-error',
        },
        size: {
            xs: 'select-xs',
            sm: 'select-sm',
            md: 'select-md',
            lg: 'select-lg',
            xl: 'select-xl',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface SelectProps
    extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
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
    status,
    variant,
    options,
    className,
    ...props
}: SelectProps) {
    return (
        <label className="w-full flex flex-col gap-1">
            {label && (
                <span className="text-sm font-medium">
                    {label}
                    {required && <span className="text-error ml-1">*</span>}
                </span>
            )}

            <select
                disabled={disabled}
                required={required}
                className={cx(
                    selectVariants({
                        size,
                        status: error ? 'error' : status,
                        variant,
                    }),
                    className,
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
