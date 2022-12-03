import type { NextApiRequest, NextApiResponse } from 'next'
import { handleErrorsOf } from '../../../../common/ApiErrorHandler'

import { ConversionResponse } from '../../../../features/conversion/api/ConversionResponse'
import apiHandler from '../../../../features/conversion/api/Handler'

const requestHandler = handleErrorsOf(async function (httpReq: NextApiRequest, httpResp: NextApiResponse<ConversionResponse>) {
  const resp = await apiHandler(httpReq.query)
  httpResp.status(200).json(resp)
})

export default requestHandler
