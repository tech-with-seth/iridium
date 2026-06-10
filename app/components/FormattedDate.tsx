type Props = {
    date: Date | string;
    className?: string;
};

/** Locale-formatted date in a semantic <time> element. */
export function FormattedDate({ date, className }: Props) {
    const value = new Date(date);

    return (
        <time dateTime={value.toISOString()} className={className}>
            {value.toLocaleDateString()}
        </time>
    );
}
