import { cn } from "~/lib/utils";

interface TextInputProps {
    label?: string;
    placeholder?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    disabled?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    color?: 'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
    type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
    id?: string;
    name?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

export function TextInput({
    label,
    placeholder,
    error,
    helperText,
    required = false,
    disabled = false,
    size = 'md',
    color,
    type = 'text',
    id,
    name,
    value,
    onChange,
    className,
    ...rest
}: TextInputProps) {
    const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="form-control w-full">
            {label && (
                <label className="label" htmlFor={inputId}>
                    <span className="label-text">
                        {label}
                        {required && <span className="text-error ml-1">*</span>}
                    </span>
                </label>
            )}

            <input
                id={inputId}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className={cn(
                    'input w-full',
                    size !== 'md' && `input-${size}`,
                    error ? 'input-error' : color && `input-${color}`,
                    className
                )}
                {...rest}
            />

            {(error || helperText) && (
                <label className="label">
                    <span className={cn(
                        'label-text-alt',
                        error ? 'text-error' : 'text-base-content/70'
                    )}>
                        {error || helperText}
                    </span>
                </label>
            )}
        </div>
    );
}
