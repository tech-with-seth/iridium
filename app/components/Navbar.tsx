import { cx } from '~/cva.config';
import type { ReactNode } from 'react';

interface NavbarProps {
    brand?: ReactNode;
    start?: ReactNode;
    center?: ReactNode;
    end?: ReactNode;
    sticky?: boolean;
    shadow?: boolean;
    backgroundColor?:
        | 'base-100'
        | 'base-200'
        | 'base-300'
        | 'primary'
        | 'secondary'
        | 'accent'
        | 'neutral';
    className?: string;
}

export function Navbar({
    brand,
    start,
    center,
    end,
    sticky = false,
    shadow = false,
    backgroundColor = 'base-300',
    className,
    ...rest
}: NavbarProps) {
    return (
        <div
            className="navbar rounded-full sticky top-0 z-50 shadow-lg bg-neutral text-white"
            {...rest}
        >
            {/* Brand/Logo - typically on the left */}
            {brand && <div className="navbar-start">{brand}</div>}

            {/* Start section - left side content when no brand */}
            {!brand && start && <div className="navbar-start">{start}</div>}

            {/* Center section */}
            {center && <div className="navbar-center">{center}</div>}

            {/* End section - right side content */}
            {end && <div className="navbar-end">{end}</div>}
        </div>
    );
}

// Convenience components for common navbar patterns
export function NavbarBrand({
    children,
    href,
    className,
    ...rest
}: {
    children: ReactNode;
    href?: string;
    className?: string;
}) {
    const content = (
        <span className={cx('btn btn-ghost text-xl', className)} {...rest}>
            {children}
        </span>
    );

    if (href) {
        return <a href={href}>{content}</a>;
    }

    return content;
}

export function NavbarMenu({
    children,
    horizontal = true,
    className,
    ...rest
}: {
    children: ReactNode;
    horizontal?: boolean;
    className?: string;
}) {
    return (
        <ul
            className={cx(
                'menu',
                horizontal ? 'menu-horizontal' : 'menu-vertical',
                'px-1',
                className
            )}
            {...rest}
        >
            {children}
        </ul>
    );
}

export function NavbarMenuItem({
    children,
    active = false,
    disabled = false,
    className,
    ...rest
}: {
    children: ReactNode;
    active?: boolean;
    disabled?: boolean;
    className?: string;
}) {
    return (
        <li
            className={cx(active && 'menu-active', disabled && 'menu-disabled')}
        >
            <span className={cx(className)} {...rest}>
                {children}
            </span>
        </li>
    );
}

export function NavbarDropdown({
    trigger,
    children,
    end = false,
    className,
    ...rest
}: {
    trigger: ReactNode;
    children: ReactNode;
    end?: boolean;
    className?: string;
}) {
    return (
        <div className={cx('dropdown', end && 'dropdown-end')}>
            <div tabIndex={0} role="button" className="btn btn-ghost">
                {trigger}
            </div>
            <ul
                tabIndex={0}
                className={cx(
                    'menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow',
                    className
                )}
                {...rest}
            >
                {children}
            </ul>
        </div>
    );
}
