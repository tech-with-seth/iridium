import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import type { VariantProps } from 'cva';
import { cva, cx } from 'cva.config';

export const textareaVariants = cva({
    base: 'textarea',
    variants: {
        textareaSize: {
            sm: 'textarea-sm',
            md: '',
            lg: 'textarea-lg',
        },
    },
    defaultVariants: {
        textareaSize: 'md',
    },
});

type Props = ComponentPropsWithoutRef<'textarea'> &
    VariantProps<typeof textareaVariants>;

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(
    function Textarea({ className, textareaSize, ...rest }, ref) {
        return (
            <textarea
                ref={ref}
                className={cx(textareaVariants({ textareaSize, className }))}
                {...rest}
            />
        );
    },
);

Textarea.displayName = 'Textarea';
