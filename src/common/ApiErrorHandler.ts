import { EOL } from 'os'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ValidationError } from 'yup'
import { createLogger, Logger } from '../common/logging'

const log: Logger = createLogger('API error handler')

type RequestHandler<TResp> = (req: NextApiRequest, res: NextApiResponse<TResp>) => Promise<void>

type ErrorText = string
export const handleErrorsOf = function<TResp>(apiReqHandler: RequestHandler<TResp>): RequestHandler<TResp | ErrorText> {
	return (async (req: NextApiRequest, res: NextApiResponse<TResp | ErrorText>) => {
		try {
			await apiReqHandler(req, res)
		}
		catch (error: any) {
			if (error instanceof ValidationError) {
				log.warn('failed to validate params of API call %s', req.url, error.errors)
				res.status(400).send(error.errors.join(EOL))
			}
			else {
				log.error('failed to process API call %s', req.url, error)
				res.status(500).send(error.toString())
			}
		}
	})
}