import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const tabsVariants = cva({
    base: 'tabs',
    variants: {
        variant: {
            box: 'tabs-box',
            border: 'tabs-border',
            lift: 'tabs-lift',
        },
        size: {
            xs: 'tabs-xs',
            sm: 'tabs-sm',
            md: 'tabs-md',
            lg: 'tabs-lg',
            xl: 'tabs-xl',
        },
        placement: {
            top: 'tabs-top',
            bottom: 'tabs-bottom',
        },
    },
    defaultVariants: {
        size: 'md',
        placement: 'top',
    },
});

export const tabVariants = cva({
    base: 'tab',
    variants: {
        active: {
            true: 'tab-active',
        },
        disabled: {
            true: 'tab-disabled',
        },
    },
});

interface TabsProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof tabsVariants> {}

export function Tabs({
    children,
    variant,
    size,
    placement,
    className,
    ...props
}: TabsProps) {
    return (
        <div
            role="tablist"
            className={cx(
                tabsVariants({
                    variant,
                    size,
                    placement,
                }),
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

interface TabProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>,
        VariantProps<typeof tabVariants> {}

export function Tab({
    children,
    active,
    disabled,
    className,
    ...props
}: TabProps) {
    return (
        <button
            role="tab"
            type="button"
            className={cx(
                tabVariants({
                    active,
                    disabled,
                }),
                className,
            )}
            disabled={disabled}
            aria-selected={active}
            {...props}
        >
            {children}
        </button>
    );
}

interface TabRadioProps
    extends Omit<
            React.InputHTMLAttributes<HTMLInputElement>,
            'type' | 'className'
        > {
    label: string;
    inputClassName?: string;
}

export function TabRadio({
    label,
    disabled,
    inputClassName,
    ...props
}: TabRadioProps) {
    return (
        <input
            type="radio"
            role="tab"
            className={cx('tab', inputClassName)}
            aria-label={label}
            disabled={disabled}
            {...props}
        />
    );
}

interface TabContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TabContent({ children, className, ...props }: TabContentProps) {
    return (
        <div role="tabpanel" className={cx('tab-content', className)} {...props}>
            {children}
        </div>
    );
}
