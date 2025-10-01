import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const diffVariants = cva({
    base: 'diff',
    variants: {},
    defaultVariants: {},
    compoundVariants: []
});

interface DiffProps
    extends React.HTMLAttributes<HTMLElement>,
        VariantProps<typeof diffVariants> {
    item1: React.ReactNode;
    item2: React.ReactNode;
    aspectRatio?: string;
}

export function Diff({
    item1,
    item2,
    aspectRatio,
    className,
    ...props
}: DiffProps) {
    return (
        <figure
            className={cx(
                diffVariants({}),
                aspectRatio,
                className
            )}
            {...props}
        >
            <div className="diff-item-1">{item1}</div>
            <div className="diff-item-2">{item2}</div>
            <div className="diff-resizer" />
        </figure>
    );
}
