import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const heroVariants = cva({
    base: 'hero',
});

interface HeroProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof heroVariants> {
    overlay?: boolean;
    image?: string;
}

export function Hero({
    children,
    overlay = false,
    image,
    className,
    style,
    ...props
}: HeroProps) {
    const combinedStyle = image
        ? {
              ...style,
              backgroundImage: `url(${image})`,
          }
        : style;

    return (
        <div
            className={cx(heroVariants({}), className)}
            style={combinedStyle}
            {...props}
        >
            {overlay && <div className="hero-overlay" />}
            <div className="hero-content">{children}</div>
        </div>
    );
}

interface HeroContentProps extends React.HTMLAttributes<HTMLDivElement> {
    centered?: boolean;
}

export function HeroContent({
    children,
    centered = true,
    className,
    ...props
}: HeroContentProps) {
    return (
        <div
            className={cx('hero-content', centered && 'text-center', className)}
            {...props}
        >
            {children}
        </div>
    );
}
