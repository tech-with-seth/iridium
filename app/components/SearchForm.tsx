import type { PropsWithChildren } from 'react';
import { Form } from 'react-router';
import { SearchIcon } from 'lucide-react';
import { cx } from 'cva.config';

type Props = PropsWithChildren<{
    /** Current ?q= value; rendered as the input's defaultValue. */
    query: string;
    placeholder: string;
    /** Accessible name for the search input. */
    inputLabel: string;
    inputSize?: 'sm' | 'md';
    /** Omit for an icon-only input that submits on Enter. */
    submitLabel?: string;
    /** Classes for the input + button join group. */
    groupClassName?: string;
    className?: string;
}>;

/**
 * GET search form for ?q= filtering. Extra filter controls (selects, etc.)
 * can be passed as children; they submit with the same form.
 */
export function SearchForm({
    query,
    placeholder,
    inputLabel,
    inputSize = 'md',
    submitLabel,
    groupClassName,
    className,
    children,
}: Props) {
    const input = (
        <label
            className={cx(
                'input flex grow items-center gap-2',
                inputSize === 'sm' && 'input-sm',
                submitLabel ? 'join-item' : 'w-full',
            )}
        >
            <SearchIcon aria-hidden="true" className="h-4 w-4 opacity-60" />
            <input
                type="search"
                name="q"
                placeholder={placeholder}
                defaultValue={query}
                aria-label={inputLabel}
            />
        </label>
    );

    return (
        <Form method="GET" role="search" className={className}>
            {submitLabel ? (
                <div className={cx('join', groupClassName)}>
                    {input}
                    <button type="submit" className="btn join-item">
                        {submitLabel}
                    </button>
                </div>
            ) : (
                input
            )}
            {children}
        </Form>
    );
}
