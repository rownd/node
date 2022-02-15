import * as express from 'express';
import { validateToken, fetchUserInfo } from '../lib/core';
import { WrappedError } from '../errors';
import { JWTPayload } from 'jose';

type AuthenticateOpts = {
  fetchUserInfo?: boolean;
};

type RowndRequest = express.Request & {
  tokenObj: JWTPayload;
  user?: {
    [key: string]: any;
  };
};

export default function expressLib(config: TConfig) {
  function authenticate(opts: AuthenticateOpts) {
    opts = {
      fetchUserInfo: false,
      ...opts,
    };

    return (
      req: RowndRequest,
      _: express.Response,
      next: express.NextFunction
    ) => {
      let authHeader = req.get('authorization');
      authHeader = authHeader?.replace(/^bearer /i, '');

      if (!authHeader) {
        let err = new Error(
          'Missing or badly formatted authorization header. Expected: "Authorization: Bearer <token>"'
        );
        return next(err);
      }

      // Hide the async nature of this function from Express
      (async (
        req: RowndRequest,
        _: express.Response,
        next: express.NextFunction
      ) => {
        try {
          let tokenObj = await validateToken(authHeader, { config });
          req.tokenObj = tokenObj as JWTPayload;

          if (opts.fetchUserInfo) {
            let userInfo = await fetchUserInfo(authHeader, config);
            req.user = userInfo.data;
          }

          next();
        } catch (err) {
          let wrappingError = new WrappedError(
            `The provided token was invalid. Reason: ${(err as Error).message}`
          );
          wrappingError.innerError = err as Error;
          wrappingError.statusCode = 401;
          next(wrappingError);
        }
      })(req, _, next);

      // validateToken(authHeader, { config })
      //   .then(() => {
      //     if (opts.fetchUserInfo) {
      //       return fetchUserInfo(authHeader!, config);
      //     }

      //     return null;
      //   })
      //   .then(() => next())
      //   .catch((err: any) => {
      //     let wrappingError = new WrappedError(`The provided token was invalid. Reason: ${err.message}`);
      //     wrappingError.innerError = err;
      //     wrappingError.statusCode = 401;
      //     next(wrappingError);
      //   });
    };
  }

  return {
    authenticate,
  };
}
