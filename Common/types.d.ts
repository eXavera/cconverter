export type Currency = string

export interface Money {
    value: number,
    currency: Currency
}

export type ConversionResult = {
    value: number
}

export interface CurrencyPairStats {
    source: Currency,
    target: Currency,
    count: number,
    totalTargetAmount: number
}