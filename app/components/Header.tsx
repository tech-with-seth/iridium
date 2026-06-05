import type { PropsWithChildren } from 'react';

// interface HeaderProps {}

export function Header({ children }: PropsWithChildren) {
    return (
        <header className="navbar bg-black text-neutral-content">
            {children}
        </header>
    );
}
