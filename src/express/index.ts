import * as express from 'express';
import { validateToken, fetchUserInfo } from '../lib/core';
import { WrappedError } from '../errors';
import { TConfig, TTokenValidationPayload } from '../types';

type AuthenticateOpts = {
  fetchUserInfo?: boolean;
  errOnInvalidToken?: boolean;
};

type RowndRequest = express.Request & {
  authenticated: boolean;
  isAuthenticated: boolean;
  tokenInfo: TTokenValidationPayload;
  user?: {
    [key: string]: any;
  };
};

export default function expressLib(config: TConfig) {
  function authenticate(opts: AuthenticateOpts) {
    opts = {
      fetchUserInfo: false,
      errOnInvalidToken: true,
      ...opts,
    };

    return (
      req: RowndRequest,
      _: express.Response,
      next: express.NextFunction
    ) => {
      req.authenticated = req.isAuthenticated = false;
      let authHeader = req.get('authorization');
      authHeader = authHeader?.replace(/^bearer /i, '');

      if (!authHeader) {
        let err = new Error(
          'Missing or badly formatted authorization header. Expected: "Authorization: Bearer <token>"'
        );
        return opts.errOnInvalidToken ? next(err) : next();
      }

      // Hide the async nature of this function from Express
      (async (
        req: RowndRequest,
        _: express.Response,
        next: express.NextFunction
      ) => {
        try {
          let tokenInfo = await validateToken(authHeader, { config });
          req.tokenInfo = tokenInfo;
          req.authenticated = req.isAuthenticated = true;

          if (opts.fetchUserInfo) {
            let userInfo = await fetchUserInfo(
              { user_id: tokenInfo.user_id },
              config
            );
            req.user = userInfo.data;
          }

          next();
        } catch (err) {
          let wrappingError = new WrappedError(
            `The provided token was invalid. Reason: ${(err as Error).message}`
          );
          wrappingError.innerError = err as Error;
          wrappingError.statusCode = 401;
          opts.errOnInvalidToken ? next(wrappingError) : next();
        }
      })(req, _, next);
    };
  }

  return {
    authenticate,
  };
}
