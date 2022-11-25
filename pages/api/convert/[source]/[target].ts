// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  result: number,
  data: any
}

type Currency = string

interface IApiResponse {
  rates: Record<Currency, number>
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const sourceCurrency = <Currency>req.query['source']
  const targetCurrency = <Currency>req.query['target']
  const amount : number = parseInt(<string>req.query['amount'], 10)

  const apiParams = new URLSearchParams([
    ['app_id', '<blbe>'],
    ['base', sourceCurrency],
    ['symbols', targetCurrency]
  ])

  const apiHttpResp = await fetch('https://openexchangerates.org/api/latest.json?' + apiParams.toString())
  const apiResponse = <IApiResponse>(await apiHttpResp.json())

  const rate = apiResponse.rates[targetCurrency]

  res.status(200).json({
    result: Math.round(amount * rate),
    data: {
      query: 'https://openexchangerates.org/api/latest.json?' + apiParams.toString(),
    }
  })
}
