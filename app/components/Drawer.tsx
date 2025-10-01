import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';
import { Link } from 'react-router';

export const drawerVariants = cva({
    base: 'drawer',
    variants: {
        placement: {
            end: 'drawer-end'
        },
        open: {
            true: 'drawer-open'
        }
    },
    defaultVariants: {},
    compoundVariants: []
});

interface DrawerProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'open'>,
        VariantProps<typeof drawerVariants> {
    id: string;
    sidebar: React.ReactNode;
    open?: boolean;
    onToggle?: (open: boolean) => void;
    sidebarClassName?: string;
    contentClassName?: string;
}

export function Drawer({
    id,
    children,
    sidebar,
    open = false,
    onToggle,
    placement,
    className,
    sidebarClassName,
    contentClassName,
    ...props
}: DrawerProps) {
    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        onToggle?.(e.target.checked);
    };

    return (
        <div
            className={cx(
                drawerVariants({
                    placement,
                    open
                }),
                className
            )}
            {...props}
        >
            <input
                id={id}
                type="checkbox"
                className="drawer-toggle"
                checked={open}
                onChange={handleToggle}
            />

            <div className={cx('drawer-content', contentClassName)}>
                {children}
            </div>

            <div className="drawer-side">
                <label
                    htmlFor={id}
                    className="drawer-overlay"
                    aria-label="Close drawer"
                />
                <div className={cx('menu p-4 w-80 min-h-full bg-base-100 text-base-content', sidebarClassName)}>
                    {sidebar}
                </div>
            </div>
        </div>
    );
}

export const drawerToggleVariants = cva({
    base: 'drawer-button',
    variants: {
        variant: {
            hamburger: 'btn btn-square btn-ghost'
        }
    },
    defaultVariants: {},
    compoundVariants: []
});

interface DrawerToggleProps
    extends React.LabelHTMLAttributes<HTMLLabelElement>,
        VariantProps<typeof drawerToggleVariants> {
    drawerId: string;
}

export function DrawerToggle({
    drawerId,
    children,
    className,
    variant,
    ...props
}: DrawerToggleProps) {
    if (variant === 'hamburger') {
        return (
            <label
                htmlFor={drawerId}
                className={cx(
                    drawerToggleVariants({ variant }),
                    className
                )}
                {...props}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block w-5 h-5 stroke-current"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                    />
                </svg>
            </label>
        );
    }

    return (
        <label
            htmlFor={drawerId}
            className={cx(drawerToggleVariants({ variant }), 'btn', className)}
            {...props}
        >
            {children || 'Open drawer'}
        </label>
    );
}

export const drawerMenuVariants = cva({
    base: 'menu',
    variants: {
        size: {
            xs: 'menu-xs',
            sm: 'menu-sm',
            md: 'menu-md',
            lg: 'menu-lg',
            xl: 'menu-xl'
        },
        direction: {
            horizontal: 'menu-horizontal',
            vertical: 'menu-vertical'
        }
    },
    defaultVariants: {
        size: 'md',
        direction: 'vertical'
    },
    compoundVariants: []
});

interface DrawerMenuProps
    extends React.HTMLAttributes<HTMLUListElement>,
        VariantProps<typeof drawerMenuVariants> {}

export function DrawerMenu({
    children,
    className,
    size,
    direction,
    ...props
}: DrawerMenuProps) {
    return (
        <ul
            className={cx(
                drawerMenuVariants({
                    size,
                    direction
                }),
                className
            )}
            {...props}
        >
            {children}
        </ul>
    );
}

export const drawerMenuItemVariants = cva({
    base: '',
    variants: {
        active: {
            true: 'active'
        },
        disabled: {
            true: 'disabled'
        }
    },
    defaultVariants: {},
    compoundVariants: []
});

interface DrawerMenuItemProps extends VariantProps<typeof drawerMenuItemVariants> {
    children: React.ReactNode;
    to?: string;
    href?: string;
    onClick?: () => void;
    className?: string;
}

export function DrawerMenuItem({
    children,
    to,
    href,
    onClick,
    active,
    disabled,
    className,
    ...props
}: DrawerMenuItemProps) {
    const itemClassName = cx(
        drawerMenuItemVariants({ active, disabled }),
        className
    );

    if (disabled) {
        return (
            <li className={drawerMenuItemVariants({ disabled })}>
                <span className={className} {...props}>
                    {children}
                </span>
            </li>
        );
    }

    if (to) {
        return (
            <li>
                <Link to={to} className={itemClassName} {...props}>
                    {children}
                </Link>
            </li>
        );
    }

    if (href) {
        return (
            <li>
                <a
                    href={href}
                    className={itemClassName}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                >
                    {children}
                </a>
            </li>
        );
    }

    if (onClick) {
        return (
            <li>
                <button
                    type="button"
                    onClick={onClick}
                    className={itemClassName}
                    {...props}
                >
                    {children}
                </button>
            </li>
        );
    }

    return (
        <li>
            <span className={className} {...props}>
                {children}
            </span>
        </li>
    );
}
