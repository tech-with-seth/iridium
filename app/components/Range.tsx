import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const rangeVariants = cva({
    base: 'range',
    variants: {
        color: {
            primary: 'range-primary',
            secondary: 'range-secondary',
            accent: 'range-accent',
            neutral: 'range-neutral',
            success: 'range-success',
            warning: 'range-warning',
            info: 'range-info',
            error: 'range-error',
        },
        size: {
            xs: 'range-xs',
            sm: 'range-sm',
            md: 'range-md',
            lg: 'range-lg',
            xl: 'range-xl',
        },
    },
    defaultVariants: {
        size: 'md',
    },
    compoundVariants: [],
});

interface RangeProps
    extends Omit<
            React.InputHTMLAttributes<HTMLInputElement>,
            'size' | 'type' | 'color'
        >,
        VariantProps<typeof rangeVariants> {
    label?: React.ReactNode;
    error?: string;
    helperText?: string;
    showSteps?: boolean;
}

export function Range({
    color,
    size,
    label,
    error,
    helperText,
    className,
    disabled,
    required,
    min = 0,
    max = 100,
    step,
    showSteps = false,
    ...props
}: RangeProps) {
    const minNum = typeof min === 'string' ? parseFloat(min) : min;
    const maxNum = typeof max === 'string' ? parseFloat(max) : max;
    const stepNum = typeof step === 'string' ? parseFloat(step) : step;

    const steps =
        showSteps && stepNum
            ? Array.from(
                  { length: Math.floor((maxNum - minNum) / stepNum) + 1 },
                  (_, i) => minNum + i * stepNum,
              )
            : [];

    return (
        <label className="w-full flex flex-col gap-1">
            {label && (
                <span className="text-sm font-medium">
                    {label}
                    {required && <span className="text-error ml-1">*</span>}
                </span>
            )}

            <input
                type="range"
                min={min}
                max={max}
                step={step}
                className={cx(
                    rangeVariants({
                        color: error ? 'error' : color,
                        size,
                    }),
                    className,
                )}
                disabled={disabled}
                {...props}
            />

            {showSteps && steps.length > 0 && (
                <div className="flex w-full justify-between px-2 text-xs">
                    {steps.map((s) => (
                        <span key={s}>|</span>
                    ))}
                </div>
            )}

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
