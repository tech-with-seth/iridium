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
        bordered: {
            true: 'bg-base-100 border border-base-300',
            false: '',
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
    bordered,
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
                    bordered,
                }),
                className,
            )}
            {...props}
        >
            <input type="radio" name={name} defaultChecked={defaultOpen} />
            <div className="collapse-title font-semibold">{title}</div>
            <div className="collapse-content">{children}</div>
        </div>
    );
}
