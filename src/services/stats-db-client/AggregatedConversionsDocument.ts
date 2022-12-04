import { Currency } from '../../common/types/Currency'

export interface AggregatedConversionsDocument {
    _id: {
        source: Currency,
        target: Currency
    },
    count: number,
    totalTargetAmount: number
}