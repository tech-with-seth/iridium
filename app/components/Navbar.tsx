import { cx } from '~/cva.config';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

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
            className="navbar rounded-box shadow-lg bg-base-300 text-base-content"
            {...rest}
        >
            {/* Brand/Logo - typically on the left */}
            {brand && <div className="navbar-start">{brand}</div>}

            {/* Start section - left side content when no brand */}
            {!brand && start && <div className="navbar-start">{start}</div>}

            {/* Center section */}
            {center && (
                <div className="navbar-center hidden lg:flex">{center}</div>
            )}

            {/* End section - right side content */}
            {end && <div className="navbar-end hidden lg:flex">{end}</div>}
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
        return <Link to={href}>{content}</Link>;
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
                'menu gap-2',
                horizontal ? 'menu-horizontal' : 'menu-vertical',
                'px-1',
                className,
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
}: {
    children: ReactNode;
    active?: boolean;
    disabled?: boolean;
    className?: string;
}) {
    return (
        <li
            className={cx(
                active && 'menu-active rounded-field',
                disabled && 'menu-disabled',
                className,
            )}
        >
            {children}
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
                    'menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow',
                    className,
                )}
                {...rest}
            >
                {children}
            </ul>
        </div>
    );
}

export function NavbarHamburger({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cx('dropdown', className)}>
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h8m-8 6h16"
                    />
                </svg>
            </div>
            <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
            >
                {children}
            </ul>
        </div>
    );
}
