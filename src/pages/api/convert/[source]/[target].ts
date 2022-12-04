import type { NextApiRequest, NextApiResponse } from 'next'
import { handleErrorsOf } from '../../../../common/ApiErrorHandler'

import { ConversionResponse } from '../../../../features/conversion/api/ConversionResponse'
import handleConversion from '../../../../features/conversion/api/ConversionHandler'

const requestHandler = handleErrorsOf(async (httpReq: NextApiRequest, httpResp: NextApiResponse<ConversionResponse>): Promise<void> => {
  const resp: ConversionResponse = await handleConversion(httpReq.query)
  httpResp.status(200).json(resp)
})

export default requestHandler
