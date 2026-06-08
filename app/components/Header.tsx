import type { PropsWithChildren } from 'react';

// interface HeaderProps {}

export function Header({ children }: PropsWithChildren) {
    return (
        <header className="navbar bg-neutral text-neutral-content mb-4">
            {children}
        </header>
    );
}
