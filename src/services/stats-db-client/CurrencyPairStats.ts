import { Currency } from "../../common/types/Currency";

export interface CurrencyPairStats {
    source: Currency,
    target: Currency,
    count: number,
    totalTargetAmount: number
}