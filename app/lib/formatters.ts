export const formatToCurrency = (
    locale: string = 'en-US',
    currencyType: Intl.NumberFormatOptions['currency'] = 'USD',
    digits: number = 2,
    n: number,
) => {
    const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyType,
        minimumFractionDigits: digits,
    });

    // Polar returns prices in cents, convert to dollars
    return formatter.format(n / 100);
};

export const formatToPercent = (amount: number) => {
    return `${(amount * 100).toFixed(1)}%`;
};
