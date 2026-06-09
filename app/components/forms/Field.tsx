import type { ReactNode } from 'react';
import { cx } from 'cva.config';

export type FieldControlProps = {
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
};

type Props = {
    label: string;
    /** Used to derive the error element id for aria-describedby wiring. */
    name: string;
    error?: string;
    disabled?: boolean;
    className?: string;
    children: ReactNode | ((controlProps: FieldControlProps) => ReactNode);
};

export function Field({
    label,
    name,
    error,
    disabled,
    className,
    children,
}: Props) {
    const errorId = `${name}-error`;
    const controlProps: FieldControlProps = {
        'aria-describedby': error ? errorId : undefined,
        'aria-invalid': error ? true : undefined,
    };

    return (
        <fieldset className={cx('fieldset', className)} disabled={disabled}>
            <legend className="fieldset-legend">{label}</legend>
            {typeof children === 'function' ? children(controlProps) : children}
            {error && (
                <p id={errorId} className="text-error text-sm">
                    {error}
                </p>
            )}
        </fieldset>
    );
}
