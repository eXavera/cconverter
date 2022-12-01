import type { NextApiRequest, NextApiResponse } from 'next'
import { object, string, number } from 'yup'

import { ConversionResult, Currency } from '../../../../Common/types'
import { handleErrorsOf } from '../../../../ErrorHandling/ApiErrorHandler'
import * as ExchangeRateApi from '../../../../ExchangeRateApi'
import * as Stats from '../../../../Stats/Repository'

const requestParamsSchema = object({
  sourceCurrency: string().required().length(3).uppercase(),
  targetCurrency: string().required().length(3).uppercase(),
  amount: number().required()
})

const requestHandler = handleErrorsOf(async function (httpReq: NextApiRequest, httpResp: NextApiResponse<ConversionResult>) {
  const reqParams = await requestParamsSchema.validate({
    sourceCurrency: httpReq.query['source'],
    targetCurrency: httpReq.query['target'],
    amount: httpReq.query['amount']
  })
  
  const convertedAmount: number = await ExchangeRateApi.convert(reqParams.sourceCurrency, reqParams.targetCurrency, reqParams.amount)

  // this is not essential, don't waint for the completion
  Stats.recordConversion(
    { currency: reqParams.sourceCurrency, value: reqParams.amount },
    { currency: reqParams.targetCurrency, value: convertedAmount })

  httpResp.status(200).json({
    value: convertedAmount
  })
})

export default requestHandler
