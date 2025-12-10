import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

export const navbarVariants = cva({
    base: 'navbar',
    variants: {
        variant: {
            'base-100': 'bg-base-100 text-base-content',
            'base-200': 'bg-base-200 text-base-content',
            'base-300': 'bg-base-300 text-base-content',
            primary: 'bg-primary text-primary-content',
            secondary: 'bg-secondary text-secondary-content',
            accent: 'bg-accent text-accent-content',
            neutral: 'bg-neutral text-neutral-content',
        },
        shadow: {
            sm: 'shadow-sm',
            lg: 'shadow-lg',
        },
        rounded: {
            true: 'rounded-box',
        },
    },
    defaultVariants: {
        variant: 'primary',
        rounded: true,
        shadow: 'sm',
    },
});

interface NavbarProps
    extends React.HTMLAttributes<HTMLElement>,
        VariantProps<typeof navbarVariants> {
    brand?: ReactNode;
    start?: ReactNode;
    center?: ReactNode;
    end?: ReactNode;
}

export function Navbar({
    brand,
    start,
    center,
    end,
    variant,
    shadow,
    className,
    ...rest
}: NavbarProps) {
    return (
        <nav
            className={cx(navbarVariants({ variant, shadow }), className)}
            {...rest}
        >
            {/* Brand/Logo - typically on the left */}
            {brand && <div className="navbar-start gap-2">{brand}</div>}

            {/* Start section - left side content when no brand */}
            {!brand && start && (
                <div className="navbar-start gap-2">{start}</div>
            )}

            {/* Center section */}
            {center && (
                <div className="navbar-center hidden lg:flex">{center}</div>
            )}

            {/* End section - right side content */}
            {end && <div className="navbar-end hidden lg:flex">{end}</div>}
        </nav>
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
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return <li className={cx(className)}>{children}</li>;
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
                    'menu menu-sm dropdown-content bg-base-100 rounded-box mt-3 w-52 p-2 shadow',
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
            <div
                tabIndex={0}
                role="button"
                aria-label="Open navigation menu"
                className="btn btn-ghost lg:hidden"
            >
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
                className="menu menu-sm dropdown-content bg-base-100 rounded-box mt-3 w-60 p-3 shadow-lg border border-base-200/80"
            >
                {children}
            </ul>
        </div>
    );
}
