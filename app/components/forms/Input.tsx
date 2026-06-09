import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import type { VariantProps } from 'cva';
import { cva, cx } from 'cva.config';

export const inputVariants = cva({
    base: 'input',
    variants: {
        inputSize: {
            sm: 'input-sm',
            md: '',
            lg: 'input-lg',
        },
    },
    defaultVariants: {
        inputSize: 'md',
    },
});

type Props = ComponentPropsWithoutRef<'input'> &
    VariantProps<typeof inputVariants>;

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
    { className, inputSize, ...rest },
    ref,
) {
    return (
        <input
            ref={ref}
            className={cx(inputVariants({ inputSize, className }))}
            {...rest}
        />
    );
});

Input.displayName = 'Input';
