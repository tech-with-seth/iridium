import type { PropsWithChildren, ReactNode } from 'react';

type Props = PropsWithChildren<{
    title: string;
    /** Right-aligned action, e.g. a primary button or form. */
    action?: ReactNode;
}>;

/**
 * Standard page heading row. Children render under the title (subtitles,
 * descriptions); `action` renders on the trailing edge.
 */
export function PageHeader({ title, action, children }: Props) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div>
                <h1 className="text-4xl font-bold">{title}</h1>
                {children}
            </div>
            {action}
        </div>
    );
}
