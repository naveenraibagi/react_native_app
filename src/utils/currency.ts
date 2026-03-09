/**
 * Formats a numeric value or string to a currency format (default INR).
 * 
 * @param value - The numerical value to format.
 * @param currencyCode - The currency code (default 'INR').
 * @returns Formatted currency string.
 */
export const formatCurrency = (value: number | string, currencyCode: string = 'INR'): string => {
    const amount = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(amount)) {
        return '₹0.00';
    }

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};
