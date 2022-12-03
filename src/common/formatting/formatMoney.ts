import { Money } from "../types/Money";

export function formatMoney(amount: Money, decimals: number = 2): string {
    // hardcoded en-US for now because of SSR issues https://github.com/vercel/next.js/discussions/19409
    const currencyFormatter: Intl.NumberFormat = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    return currencyFormatter.format(amount.value) + ' ' + amount.currency
}