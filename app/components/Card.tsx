import type { PropsWithChildren, ReactNode } from 'react';

interface CardProps {
    action?: ReactNode;
    title?: string;
}

export function Card({
    action,
    children,
    title
}: PropsWithChildren<CardProps>) {
    return (
        <div className="card card-border bg-base-100 w-96">
            <div className="card-body">
                {title && <h2 className="card-title">{title}</h2>}
                {children}
                {action && (
                    <div className="card-actions justify-end mt-4">{action}</div>
                )}
            </div>
        </div>
    );
}
