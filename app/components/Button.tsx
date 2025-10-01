import { cn } from "~/lib/utils";
import type { ReactNode } from "react";

interface ButtonProps {
    children: ReactNode;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    color?: 'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
    style?: 'outline' | 'dash' | 'soft' | 'ghost' | 'link';
    modifier?: 'wide' | 'block' | 'square' | 'circle';
    active?: boolean;
    id?: string;
    name?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
}

export function Button({
    children,
    type = 'button',
    disabled = false,
    loading = false,
    size = 'md',
    color,
    style,
    modifier,
    active = false,
    id,
    name,
    onClick,
    className,
    ...rest
}: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <button
            id={id}
            name={name}
            type={type}
            disabled={isDisabled}
            onClick={onClick}
            className={cn(
                'btn',
                size !== 'md' && `btn-${size}`,
                color && `btn-${color}`,
                style && `btn-${style}`,
                modifier && `btn-${modifier}`,
                active && 'btn-active',
                loading && 'loading',
                className
            )}
            {...rest}
        >
            {loading ? (
                <>
                    <span className="loading loading-spinner loading-sm"></span>
                    {children}
                </>
            ) : (
                children
            )}
        </button>
    );
}