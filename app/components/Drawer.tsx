import { cx } from '~/cva.config';
import { Link } from 'react-router';

interface DrawerProps {
    id: string;
    children: React.ReactNode;
    sidebar: React.ReactNode;
    open?: boolean;
    onToggle?: (open: boolean) => void;
    placement?: 'start' | 'end';
    openOnLarge?: boolean;
    className?: string;
    sidebarClassName?: string;
    contentClassName?: string;
}

export function Drawer({
    id,
    children,
    sidebar,
    open = false,
    onToggle,
    placement = 'start',
    openOnLarge = false,
    className,
    sidebarClassName,
    contentClassName,
    ...rest
}: DrawerProps) {
    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        onToggle?.(e.target.checked);
    };

    return (
        <div
            className={cx(
                'drawer',
                placement === 'end' && 'drawer-end',
                openOnLarge && 'lg:drawer-open',
                className
            )}
            {...rest}
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
                <div
                    className={cx(
                        'p-4 w-80 min-h-full bg-base-100 text-base-content',
                        sidebarClassName
                    )}
                >
                    {sidebar}
                </div>
            </div>
        </div>
    );
}

interface DrawerToggleProps {
    drawerId: string;
    children?: React.ReactNode;
    className?: string;
    variant?: 'button' | 'hamburger';
}

export function DrawerToggle({
    drawerId,
    children,
    className,
    variant = 'button',
    ...rest
}: DrawerToggleProps) {
    if (variant === 'hamburger') {
        return (
            <label
                htmlFor={drawerId}
                className={cx(
                    'btn btn-square btn-ghost drawer-button',
                    className
                )}
                {...rest}
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
            className={cx('btn drawer-button', className)}
            {...rest}
        >
            {children || 'Open drawer'}
        </label>
    );
}

interface DrawerMenuProps {
    children: React.ReactNode;
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    horizontal?: boolean;
}

export function DrawerMenu({
    children,
    className,
    size = 'md',
    horizontal = false,
    ...rest
}: DrawerMenuProps) {
    return (
        <ul
            className={cx(
                'menu',
                size !== 'md' && `menu-${size}`,
                horizontal && 'menu-horizontal',
                className
            )}
            {...rest}
        >
            {children}
        </ul>
    );
}

interface DrawerMenuItemProps {
    children: React.ReactNode;
    to?: string;
    href?: string;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
    className?: string;
}

export function DrawerMenuItem({
    children,
    to,
    href,
    onClick,
    active = false,
    disabled = false,
    className,
    ...rest
}: DrawerMenuItemProps) {
    if (disabled) {
        return (
            <li className="disabled">
                <span className={className} {...rest}>
                    {children}
                </span>
            </li>
        );
    }

    if (to) {
        return (
            <li>
                <Link
                    to={to}
                    className={cx(active && 'active', className)}
                    {...rest}
                >
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
                    className={cx(active && 'active', className)}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...rest}
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
                    className={cx(active && 'active', className)}
                    {...rest}
                >
                    {children}
                </button>
            </li>
        );
    }

    return (
        <li>
            <span className={className} {...rest}>
                {children}
            </span>
        </li>
    );
}
