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
    compoundVariants: [],
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
    defaultVariants: {},
    compoundVariants: [],
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
        >,
        VariantProps<typeof tabVariants> {
    label: string;
    inputClassName?: string;
}

export function TabRadio({
    label,
    active,
    disabled,
    inputClassName,
    ...props
}: TabRadioProps) {
    return (
        <input
            type="radio"
            role="tab"
            className={cx(
                tabVariants({
                    active,
                    disabled,
                }),
                inputClassName,
            )}
            aria-label={label}
            disabled={disabled}
            {...props}
        />
    );
}

interface TabContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TabContent({ children, className, ...props }: TabContentProps) {
    // Ensure tab panels are visible by default when tabs are controlled
    // programmatically (DaisyUI's `tab-content` can hide panels when used
    // with native radio inputs). Adding `block` prevents it from being
    // collapsed in our controlled usage.
    return (
        <div className={cx('tab-content block', className)} {...props}>
            {children}
        </div>
    );
}
