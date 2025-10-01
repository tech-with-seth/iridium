import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const avatarVariants = cva({
    base: 'avatar',
    variants: {
        status: {
            online: 'avatar-online',
            offline: 'avatar-offline'
        },
        placeholder: {
            true: 'avatar-placeholder'
        }
    },
    defaultVariants: {},
    compoundVariants: []
});

export const avatarGroupVariants = cva({
    base: 'avatar-group',
    variants: {},
    defaultVariants: {},
    compoundVariants: []
});

interface AvatarProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof avatarVariants> {
    src?: string;
    alt?: string;
    size?: number | string;
    shape?: 'circle' | 'squircle' | 'hexagon' | 'triangle';
}

export function Avatar({
    src,
    alt,
    size,
    shape,
    status,
    placeholder,
    className,
    children,
    ...props
}: AvatarProps) {
    const sizeClass = size ? (typeof size === 'number' ? `w-${size}` : size) : undefined;
    const shapeClass = shape ? `mask mask-${shape}` : undefined;

    return (
        <div
            className={cx(
                avatarVariants({
                    status,
                    placeholder
                }),
                className
            )}
            {...props}
        >
            <div className={cx(sizeClass, shapeClass)}>
                {src ? (
                    <img src={src} alt={alt || 'Avatar'} />
                ) : (
                    children
                )}
            </div>
        </div>
    );
}

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AvatarGroup({ children, className, ...props }: AvatarGroupProps) {
    return (
        <div
            className={cx(avatarGroupVariants({}), className)}
            {...props}
        >
            {children}
        </div>
    );
}
