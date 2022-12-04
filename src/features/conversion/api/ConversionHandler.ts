import { object, string, number } from 'yup'
import { Money } from '../../../common/types/Money'
import * as ExchangeRateApiClient from '../../../services/exchange-rate-api-client'
import * as StatsDbClient from '../../../services/stats-db-client'
import { ConversionResponse } from './ConversionResponse'

const requestParamsSchema = object({
    sourceCurrency: string().required().length(3).uppercase(),
    targetCurrency: string().required().length(3).uppercase(),
    amount: number().required()
})

const conversionHandler = async (requestParams: Record<string, any>): Promise<ConversionResponse> => {
    const validParams = await requestParamsSchema.validate({
        sourceCurrency: requestParams['source'],
        targetCurrency: requestParams['target'],
        amount: requestParams['amount']
    })

    const sourceAmount: Money = { value: validParams.amount, currency: validParams.sourceCurrency }
    const convertedAmount: number = await ExchangeRateApiClient.convert(sourceAmount, validParams.targetCurrency)

    // this is not essential, don't waint for the completion
    StatsDbClient.recordConversion(
        sourceAmount,
        { currency: validParams.targetCurrency, value: convertedAmount })

    return {
        value: convertedAmount
    }
}

export default conversionHandler