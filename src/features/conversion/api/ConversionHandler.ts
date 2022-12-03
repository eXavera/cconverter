import { object, string, number } from 'yup'
import * as ExchangeRateApiClient from '../../../services/ExchangeRateApiClient'
import * as StatsDbClient from '../../../services/StatsDbClient'
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

    const convertedAmount: number = await ExchangeRateApiClient.convert(validParams.sourceCurrency, validParams.targetCurrency, validParams.amount)

    // this is not essential, don't waint for the completion
    StatsDbClient.recordConversion(
        { currency: validParams.sourceCurrency, value: validParams.amount },
        { currency: validParams.targetCurrency, value: convertedAmount })

    return {
        value: convertedAmount
    }
}

export default conversionHandler