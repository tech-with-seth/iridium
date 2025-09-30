import { forwardRef, useId } from 'react';
import { cn } from '~/lib/utils';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectProps
    extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    /** Select variant style */
    variant?: 'default' | 'ghost';
    /** Select color theme */
    color?:
        | 'neutral'
        | 'primary'
        | 'secondary'
        | 'accent'
        | 'info'
        | 'success'
        | 'warning'
        | 'error';
    /** Select size */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Label text */
    label?: string;
    /** Helper text or error message */
    helperText?: string;
    /** Whether the select is in an error state */
    error?: boolean;
    /** Container class for wrapper */
    containerClassName?: string;
    /** Label class name */
    labelClassName?: string;
    /** Helper text class name */
    helperClassName?: string;
    /** Options array for the select */
    options?: SelectOption[];
    /** Placeholder text */
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            className,
            containerClassName,
            labelClassName,
            helperClassName,
            variant = 'default',
            color,
            size = 'md',
            label,
            helperText,
            error,
            options = [],
            placeholder,
            children,
            id,
            ...props
        },
        ref
    ) => {
        const generatedId = useId();
        const selectId = id || generatedId;
        const helperTextId = helperText ? `${selectId}-helper` : undefined;

        // Build select classes based on DaisyUI patterns
        const selectClasses = cn(
            'select',
            // Variant styles
            {
                'select-ghost': variant === 'ghost'
            },
            // Color themes
            {
                'select-neutral': color === 'neutral',
                'select-primary': color === 'primary',
                'select-secondary': color === 'secondary',
                'select-accent': color === 'accent',
                'select-info': color === 'info',
                'select-success': color === 'success',
                'select-warning': color === 'warning',
                'select-error': color === 'error' || error
            },
            // Sizes
            {
                'select-xs': size === 'xs',
                'select-sm': size === 'sm',
                'select-md': size === 'md',
                'select-lg': size === 'lg',
                'select-xl': size === 'xl'
            },
            className
        );

        const containerClasses = cn('w-full', containerClassName);

        const labelClasses = cn(
            'label',
            'text-sm font-medium',
            {
                'text-error': error
            },
            labelClassName
        );

        const helperClasses = cn(
            'label',
            'text-xs mt-1',
            {
                'text-error': error,
                'text-base-content/70': !error
            },
            helperClassName
        );

        return (
            <div className={containerClasses}>
                {label && (
                    <label className={labelClasses} htmlFor={selectId}>
                        <span>{label}</span>
                    </label>
                )}

                <select
                    id={selectId}
                    className={selectClasses}
                    ref={ref}
                    aria-describedby={helperTextId}
                    aria-invalid={error ? 'true' : undefined}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}

                    {options.length > 0
                        ? options.map((option) => (
                              <option
                                  key={option.value}
                                  value={option.value}
                                  disabled={option.disabled}
                              >
                                  {option.label}
                              </option>
                          ))
                        : children}
                </select>

                {helperText && (
                    <div className={helperClasses} id={helperTextId}>
                        <span>{helperText}</span>
                    </div>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
