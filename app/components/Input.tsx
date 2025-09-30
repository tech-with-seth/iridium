import { forwardRef, useId } from 'react';
import { cn } from '~/lib/utils';

export interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Input variant style */
    variant?: 'default' | 'ghost';
    /** Input color theme */
    color?:
        | 'neutral'
        | 'primary'
        | 'secondary'
        | 'accent'
        | 'info'
        | 'success'
        | 'warning'
        | 'error';
    /** Input size */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Label text */
    label?: string;
    /** Helper text or error message */
    helperText?: string;
    /** Whether the input is in an error state */
    error?: boolean;
    /** Container class for wrapper */
    containerClassName?: string;
    /** Label class name */
    labelClassName?: string;
    /** Helper text class name */
    helperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
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
            type = 'text',
            id,
            ...props
        },
        ref
    ) => {
        const generatedId = useId();
        const inputId = id || generatedId;
        const helperTextId = helperText ? `${inputId}-helper` : undefined;

        // Build input classes based on DaisyUI patterns
        const inputClasses = cn(
            'input',
            // Variant styles
            {
                'input-ghost': variant === 'ghost'
            },
            // Color themes
            {
                'input-neutral': color === 'neutral',
                'input-primary': color === 'primary',
                'input-secondary': color === 'secondary',
                'input-accent': color === 'accent',
                'input-info': color === 'info',
                'input-success': color === 'success',
                'input-warning': color === 'warning',
                'input-error': color === 'error' || error
            },
            // Sizes
            {
                'input-xs': size === 'xs',
                'input-sm': size === 'sm',
                'input-md': size === 'md',
                'input-lg': size === 'lg',
                'input-xl': size === 'xl'
            },
            className
        );

        const containerClasses = cn(
            'w-full flex flex-col gap-2',
            containerClassName
        );

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
                    <label className={labelClasses} htmlFor={inputId}>
                        <span>{label}</span>
                    </label>
                )}

                <input
                    type={type}
                    id={inputId}
                    className={inputClasses}
                    ref={ref}
                    aria-describedby={helperTextId}
                    aria-invalid={error ? 'true' : undefined}
                    {...props}
                />

                {helperText && (
                    <div className={helperClasses} id={helperTextId}>
                        <span>{helperText}</span>
                    </div>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
