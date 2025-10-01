import { cx } from '~/cva.config';

interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface SelectProps {
    label?: string;
    placeholder?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    disabled?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    color?:
        | 'neutral'
        | 'primary'
        | 'secondary'
        | 'accent'
        | 'info'
        | 'success'
        | 'warning'
        | 'error';
    id?: string;
    name?: string;
    value?: string;
    options: SelectOption[];
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    className?: string;
}

export function Select({
    label,
    placeholder = 'Choose an option',
    error,
    helperText,
    required = false,
    disabled = false,
    size = 'md',
    color,
    id,
    name,
    value,
    options,
    onChange,
    className,
    ...rest
}: SelectProps) {
    const selectId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="form-control w-full">
            {label && (
                <label className="label" htmlFor={selectId}>
                    <span className="label-text">
                        {label}
                        {required && <span className="text-error ml-1">*</span>}
                    </span>
                </label>
            )}

            <select
                id={selectId}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className={cx(
                    'select w-full',
                    size !== 'md' && `select-${size}`,
                    error ? 'select-error' : color && `select-${color}`,
                    className
                )}
                {...rest}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </option>
                ))}
            </select>

            {(error || helperText) && (
                <label className="label">
                    <span
                        className={cx(
                            'label-text-alt',
                            error ? 'text-error' : 'text-base-content/70'
                        )}
                    >
                        {error || helperText}
                    </span>
                </label>
            )}
        </div>
    );
}
