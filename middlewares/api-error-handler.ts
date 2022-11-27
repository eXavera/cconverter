import type { NextApiRequest, NextApiResponse } from 'next'
import { ValidationError } from 'yup'

type Handler<TResp> = {
	(req: NextApiRequest, res: NextApiResponse<TResp>): Promise<void>
}

type ErrorText = string

export function handleErrorsOf<TResp>(handler: Handler<TResp>
): Handler<TResp | ErrorText> {
	
	return (async (req: NextApiRequest, res: NextApiResponse<TResp | ErrorText>) => {
		try{
			await handler(req, res)
		}
		catch (error: any) {
			if (error instanceof ValidationError) {
			  res.status(400).send(error.errors.join('\n'))
			}
			else {
			  res.status(500).send(error.toString())
			}
		  }
	})
}