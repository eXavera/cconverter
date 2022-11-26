import type { NextApiRequest, NextApiResponse } from 'next'
import { ValidationError } from 'yup'

export type ErrorResponse = {
	error: string
}

type Handler<TResp> = {
	(req: NextApiRequest, res: NextApiResponse<TResp>): Promise<void>
}

export function handleErrors<TResp>(handler: Handler<TResp>
): Handler<TResp | ErrorResponse> {
	
	return (async (req: NextApiRequest, res: NextApiResponse<TResp | ErrorResponse>) => {
		try{
			await handler(req, res)
		}
		catch (error: any) {
			if (error instanceof ValidationError) {
			  res.status(400).send({
				error: error.errors[0]
			  })
			}
			else {
			  res.status(500).send({
				error: error.toString()
			  })
			}
		  }
	})
}