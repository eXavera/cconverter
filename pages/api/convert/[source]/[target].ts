import type { NextApiRequest, NextApiResponse } from 'next'
import { object, string, number } from 'yup'

import { ConversionResult } from '../../../../Common/types'
import { handleErrorsOf } from '../../../../ErrorHandling/ApiErrorHandler'
import * as ExchangeRateApi from '../../../../ExchangeRateApi'

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
  httpResp.status(200).json({
    amount: convertedAmount
  })
})

export default requestHandler
