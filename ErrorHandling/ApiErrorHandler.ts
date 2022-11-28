import { EOL } from 'os'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ValidationError } from 'yup'

type RequestHandler<TResp> = (req: NextApiRequest, res: NextApiResponse<TResp>) => Promise<void>

type ErrorText = string
export function handleErrorsOf<TResp>(apiReqHandler: RequestHandler<TResp>): RequestHandler<TResp | ErrorText> {
	return (async (req: NextApiRequest, res: NextApiResponse<TResp | ErrorText>) => {
		try {
			await apiReqHandler(req, res)
		}
		catch (error: any) {
			if (error instanceof ValidationError) {
				res.status(400).send(error.errors.join(EOL))
			}
			else {
				res.status(500).send(error.toString())
			}
		}
	})
}