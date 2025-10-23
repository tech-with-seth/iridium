import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const tableVariants = cva({
    base: 'table',
    variants: {
        size: {
            xs: 'table-xs',
            sm: 'table-sm',
            md: 'table-md',
            lg: 'table-lg',
            xl: 'table-xl',
        },
        zebra: {
            true: 'table-zebra',
        },
        pinRows: {
            true: 'table-pin-rows',
        },
        pinCols: {
            true: 'table-pin-cols',
        },
    },
    defaultVariants: {
        size: 'md',
    },
    compoundVariants: [],
});

interface TableProps
    extends React.TableHTMLAttributes<HTMLTableElement>,
        VariantProps<typeof tableVariants> {
    scrollable?: boolean;
}

export function Table({
    children,
    size,
    zebra,
    pinRows,
    pinCols,
    scrollable = false,
    className,
    ...props
}: TableProps) {
    const table = (
        <table
            className={cx(
                tableVariants({
                    size,
                    zebra,
                    pinRows,
                    pinCols,
                }),
                className,
            )}
            {...props}
        >
            {children}
        </table>
    );

    if (scrollable) {
        return <div className="overflow-x-auto">{table}</div>;
    }

    return table;
}

interface TableHeadProps
    extends React.HTMLAttributes<HTMLTableSectionElement> {}

export function TableHead({ children, className, ...props }: TableHeadProps) {
    return (
        <thead className={className} {...props}>
            {children}
        </thead>
    );
}

interface TableBodyProps
    extends React.HTMLAttributes<HTMLTableSectionElement> {}

export function TableBody({ children, className, ...props }: TableBodyProps) {
    return (
        <tbody className={className} {...props}>
            {children}
        </tbody>
    );
}

interface TableFootProps
    extends React.HTMLAttributes<HTMLTableSectionElement> {}

export function TableFoot({ children, className, ...props }: TableFootProps) {
    return (
        <tfoot className={className} {...props}>
            {children}
        </tfoot>
    );
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    hover?: boolean;
    active?: boolean;
}

export function TableRow({
    children,
    hover,
    active,
    className,
    ...props
}: TableRowProps) {
    return (
        <tr
            className={cx(hover && 'hover', active && 'active', className)}
            {...props}
        >
            {children}
        </tr>
    );
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export function TableCell({ children, className, ...props }: TableCellProps) {
    return (
        <td className={className} {...props}>
            {children}
        </td>
    );
}

interface TableHeaderCellProps
    extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export function TableHeaderCell({
    children,
    className,
    ...props
}: TableHeaderCellProps) {
    return (
        <th className={className} {...props}>
            {children}
        </th>
    );
}
