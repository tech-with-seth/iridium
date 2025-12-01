import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const fileInputVariants = cva({
    base: 'file-input',
    variants: {
        variant: {
            ghost: 'file-input-ghost',
        },
        color: {
            neutral: 'file-input-neutral',
            primary: 'file-input-primary',
            secondary: 'file-input-secondary',
            accent: 'file-input-accent',
            info: 'file-input-info',
            success: 'file-input-success',
            warning: 'file-input-warning',
            error: 'file-input-error',
        },
        size: {
            xs: 'file-input-xs',
            sm: 'file-input-sm',
            md: 'file-input-md',
            lg: 'file-input-lg',
            xl: 'file-input-xl',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

interface FileInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'color' | 'type'>,
        VariantProps<typeof fileInputVariants> {
    label?: React.ReactNode;
    error?: string;
    helperText?: string;
}

export function FileInput({
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
}: FileInputProps) {
    return (
        <label className="w-full flex flex-col gap-1">
            {label && (
                <span className="text-sm font-medium">
                    {label}
                    {required && <span className="text-error ml-1">*</span>}
                </span>
            )}

            <input
                type="file"
                disabled={disabled}
                required={required}
                className={cx(
                    fileInputVariants({
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
