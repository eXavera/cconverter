export type Currency = string

export type ConversionResult = {
    amount: number
}

export interface CurrencyPairStats {
    source: Currency,
    target: Currency,
    count: number,
    totalTargetAmount: number
}