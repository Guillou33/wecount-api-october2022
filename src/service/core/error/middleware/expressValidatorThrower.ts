import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import ExpressRequestValidationError from '@deep/responseError/ExpressRequestValidationError';

export default (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ExpressRequestValidationError(errors.array());
  }

  next();
};
