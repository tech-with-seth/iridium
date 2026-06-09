import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import type { VariantProps } from 'cva';
import { cva, cx } from 'cva.config';

export const selectVariants = cva({
    base: 'select',
    variants: {
        selectSize: {
            sm: 'select-sm',
            md: '',
            lg: 'select-lg',
        },
    },
    defaultVariants: {
        selectSize: 'md',
    },
});

type Props = ComponentPropsWithoutRef<'select'> &
    VariantProps<typeof selectVariants>;

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
    { className, selectSize, children, ...rest },
    ref,
) {
    return (
        <select
            ref={ref}
            className={cx(selectVariants({ selectSize, className }))}
            {...rest}
        >
            {children}
        </select>
    );
});

Select.displayName = 'Select';
