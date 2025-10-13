interface SpinnerProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function Spinner({ size = 'md' }: SpinnerProps) {
    return <span className={`loading loading-spinner loading-${size}`}></span>;
}
