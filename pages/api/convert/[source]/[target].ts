import { ConversionResponse } from '../../../../api-interface/convert'
import type { NextApiRequest, NextApiResponse } from 'next'
import { object, string, number } from 'yup'
import { handleErrors as handleErrorsOf } from '../../../../middlewares/api-error-handler'

type APIResponse = {
  rates: Record<string, number>
}

const getUsdRate = async function (targetCurrency: string): Promise<number> {
  const apiParams = new URLSearchParams([
    ['app_id', '19e5783e6cd041899952b9a962164469'],
    ['base', 'USD'],
    ['symbols', targetCurrency]
  ])

  const apiHttpResp = await fetch('https://openexchangerates.org/api/latest.json?' + apiParams.toString())
  const apiResponse = <APIResponse>(await apiHttpResp.json())

  return apiResponse.rates[targetCurrency]
}

const convert = async function (sourceCurrency: string, targetCurrency: string, amount: number): Promise<number> {
  if (sourceCurrency === 'USD') {
    return amount * await getUsdRate(targetCurrency)
  }
  else if (targetCurrency === 'USD') {
    return amount / await getUsdRate(sourceCurrency)
  }
  return -1; // report error
}


const requestParamsSchema = object({
  sourceCurrency: string().required().length(3).uppercase(),
  targetCurrency: string().required().length(3).uppercase(),
  amount: number().required()
})

const handler = handleErrorsOf<ConversionResponse>(async function(
  req: NextApiRequest,
  res: NextApiResponse<ConversionResponse>
) {
  const reqParams = await requestParamsSchema.validate({
    sourceCurrency: req.query['source'],
    targetCurrency: req.query['target'],
    amount: req.query['amount']
  })

  if (reqParams.sourceCurrency === reqParams.targetCurrency) {
    res.status(200).json({
      result: reqParams.amount
    })
    return
  }

  if (reqParams.amount === 0) {
    res.status(200).json({
      result: reqParams.amount
    })
    return
  }


  res.status(200).json({
    result: Math.round(await convert(reqParams.sourceCurrency, reqParams.targetCurrency, reqParams.amount))
  })
})

export default handler
