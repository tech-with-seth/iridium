/**
 * Template: Basic CVA + DaisyUI Component
 *
 * Replace placeholders:
 * - ComponentName → Your component name (PascalCase)
 * - componentVariants → camelCase version
 * - component → DaisyUI base class (e.g., btn, card, alert)
 * - HTMLElement → Actual HTML element type
 * - element → Actual HTML element (e.g., button, div, input)
 */

import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const componentVariants = cva({
    base: 'component',
    variants: {
        variant: {
            outline: 'component-outline',
            ghost: 'component-ghost',
            soft: 'component-soft',
        },
        status: {
            neutral: 'component-neutral',
            primary: 'component-primary',
            secondary: 'component-secondary',
            accent: 'component-accent',
            info: 'component-info',
            success: 'component-success',
            warning: 'component-warning',
            error: 'component-error',
        },
        size: {
            xs: 'component-xs',
            sm: 'component-sm',
            md: 'component-md',
            lg: 'component-lg',
            xl: 'component-xl',
        },
        // Boolean variants
        wide: { true: 'component-wide' },
        block: { true: 'component-block' },
    },
    defaultVariants: {
        status: 'primary',
        size: 'md',
    },
});

interface ComponentNameProps
    extends React.HTMLAttributes<HTMLElement>,
        VariantProps<typeof componentVariants> {
    // Add custom props here
    loading?: boolean;
}

/**
 * Brief description of what this component does.
 *
 * @example
 * ```tsx
 * <ComponentName variant="outline" status="primary" size="lg">
 *   Content here
 * </ComponentName>
 * ```
 *
 * @see {@link https://daisyui.com/components/component/ DaisyUI Documentation}
 */
export function ComponentName({
    variant,
    status,
    size,
    wide,
    block,
    loading,
    className,
    children,
    ...props
}: ComponentNameProps) {
    return (
        <element
            className={cx(
                componentVariants({
                    variant,
                    status,
                    size,
                    wide,
                    block,
                }),
                className,
            )}
            {...props}
        >
            {loading ? (
                <span className="loading loading-spinner loading-md"></span>
            ) : (
                children
            )}
        </element>
    );
}
