import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const codeVariants = cva({
    base: 'mockup-code',
    variants: {},
    defaultVariants: {},
    compoundVariants: [],
});

interface CodeLine {
    prefix?: string;
    content: string;
    highlight?: boolean;
}

interface CodeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof codeVariants> {
    lines: CodeLine[];
}

export function Code({ lines, className, ...props }: CodeProps) {
    return (
        <div className={cx(codeVariants({}), className)} {...props}>
            {lines.map((line, index) => (
                <pre
                    key={index}
                    data-prefix={line.prefix || ''}
                    className={
                        line.highlight ? 'bg-warning text-warning-content' : ''
                    }
                >
                    <code>{line.content}</code>
                </pre>
            ))}
        </div>
    );
}

interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
    return (
        <div className={cx('mockup-code', className)} {...props}>
            {children}
        </div>
    );
}

interface CodeLineProps extends React.HTMLAttributes<HTMLPreElement> {
    prefix?: string;
    highlight?: boolean;
}

export function CodeLine({
    children,
    prefix,
    highlight,
    className,
    ...props
}: CodeLineProps) {
    return (
        <pre
            data-prefix={prefix || ''}
            className={cx(
                highlight && 'bg-warning text-warning-content',
                className,
            )}
            {...props}
        >
            <code>{children}</code>
        </pre>
    );
}
