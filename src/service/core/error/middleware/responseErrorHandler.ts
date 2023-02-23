import { Request, Response, NextFunction } from 'express';
import { ResponseError } from '@deep/responseError/ResponseError';

export default (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ResponseError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  throw err;
};
