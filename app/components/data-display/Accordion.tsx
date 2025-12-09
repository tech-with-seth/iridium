import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const accordionItemVariants = cva({
    base: 'collapse',
    variants: {
        variant: {
            arrow: 'collapse-arrow',
            plus: 'collapse-plus',
        },
        state: {
            open: 'collapse-open',
            close: 'collapse-close',
        },
    },
});

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
    name: string;
}

export function Accordion({
    children,
    name,
    className,
    ...props
}: AccordionProps) {
    return (
        <div className={cx('space-y-2', className)} {...props}>
            {children}
        </div>
    );
}

interface AccordionItemProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
        VariantProps<typeof accordionItemVariants> {
    title: React.ReactNode;
    name: string;
    defaultOpen?: boolean;
}

export function AccordionItem({
    children,
    title,
    name,
    variant,
    state,
    defaultOpen = false,
    className,
    ...props
}: AccordionItemProps) {
    return (
        <div
            className={cx(
                accordionItemVariants({
                    variant,
                    state,
                }),
                className,
            )}
            {...props}
        >
            <input type="radio" name={name} defaultChecked={defaultOpen} />
            <div className="collapse-title">{title}</div>
            <div className="collapse-content">{children}</div>
        </div>
    );
}
