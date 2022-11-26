import { ConversionResponse } from '../../../../api-interface/convert'
import type { NextApiRequest, NextApiResponse } from 'next'
import { setTimeout } from 'timers/promises'

type Currency = string

interface IApiResponse {
  rates: Record<Currency, number>
}

const getUsdRate = async function(targetCurrency: Currency) : Promise<number> {
  const apiParams = new URLSearchParams([
    ['app_id', '19e5783e6cd041899952b9a962164469'],
    ['base', 'USD'],
    ['symbols', targetCurrency]
  ])

  const apiHttpResp = await fetch('https://openexchangerates.org/api/latest.json?' + apiParams.toString())
  const apiResponse = <IApiResponse>(await apiHttpResp.json())

  return apiResponse.rates[targetCurrency]
}

const convert = async function(sourceCurrency: Currency, targetCurrency: Currency, amount: number) : Promise<number> {
  if (sourceCurrency === 'USD') {
    return amount * await getUsdRate(targetCurrency)
  }
  else if(targetCurrency === 'USD') {
    return amount / await getUsdRate(sourceCurrency)
  }
  return -1; // report error
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConversionResponse>
) {
  const sourceCurrency = <Currency>req.query['source']
  const targetCurrency = <Currency>req.query['target']
  const amount: number = parseInt(<string>req.query['amount'], 10)

  if (sourceCurrency === targetCurrency) {
    await setTimeout(1500)

    res.status(200).json({
      result: amount
    })
    return
  }

  if (amount === 0) {
    res.status(200).json({
      result: amount
    })
    return
  }

  res.status(200).json({
    result: Math.round(await convert(sourceCurrency, targetCurrency, amount))
  })
}
