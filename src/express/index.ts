import * as express from 'express';
import { validateToken } from '../lib/core';
import { WrappedError } from '../errors';

export default function expressLib(config: TConfig) {

  function authenticate(req: express.Request, _: express.Response, next: express.NextFunction) {
    console.log(`${req.method} ${req.path}`);

    let authHeader = req.get('authorization');
    authHeader = authHeader?.replace(/^bearer /i, '');

    if (!authHeader) {
      let err = new Error('Missing or badly formatted authorization header. Expected: "Authorization: Bearer <token>"');
      return next(err);
    }

    validateToken(authHeader, { config })
      .then(() => next())
      .catch((err: any) => {
        let wrappingError = new WrappedError(`The provided token was invalid. Reason: ${err.message}`);
        wrappingError.innerError = err;
        wrappingError.statusCode = 401;
        next(wrappingError);
      });
  }

  return {
    authenticate
  }

}