import * as express from 'express';
import { WrappedError } from '../errors';
import { IRowndExpressClient, TTokenValidationPayload } from '../types';
import { RowndInstance } from '../lib/rownd';

type AuthenticateOpts = {
  fetchUserInfo?: boolean;
  errOnInvalidToken?: boolean;
  errOnMissingUser?: boolean;
};

type RowndRequest = express.Request & {
  authenticated: boolean;
  isAuthenticated: boolean;
  tokenInfo: TTokenValidationPayload;
  user?: {
    [key: string]: any;
  };
};

export class RowndExpressClient implements IRowndExpressClient {
  private rownd: RowndInstance;

  constructor(rownd: RowndInstance) {
    this.rownd = rownd;
    this.authenticate = this.authenticate.bind(this); // Hack to allow safe destructuring
  }

  authenticate(opts: AuthenticateOpts) {
    opts = {
      fetchUserInfo: false,
      errOnInvalidToken: true,
      errOnMissingUser: false,
      ...opts,
    };

    return (
      req: RowndRequest,
      _: express.Response,
      next: express.NextFunction
    ) => {
      const plugin = this;
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
        let tokenInfo;
        try {
          tokenInfo = await plugin.rownd.validateToken(authHeader);
          req.tokenInfo = tokenInfo;
          req.authenticated = req.isAuthenticated = true;
        } catch (err) {
          let wrappingError = new WrappedError(
            `The provided token was invalid. Reason: ${(err as Error).message}`
          );
          wrappingError.innerError = err as Error;
          wrappingError.statusCode = 401;
          return opts.errOnInvalidToken ? next(wrappingError) : next();
        }

        if (opts.fetchUserInfo) {
          try {
            let userInfo = await plugin.rownd.fetchUserInfo({
              user_id: tokenInfo.user_id,
            });
            req.user = userInfo.data;
          } catch (err) {
            if (opts.errOnMissingUser) {
              let wrappingError = new WrappedError(
                `The user '${tokenInfo.user_id}' could not be retrieved. Reason: ${(err as Error).message}`
              );
              wrappingError.innerError = err as Error;
              wrappingError.statusCode = 404;
              return next(wrappingError);
            }
          }
        }

        next();
      })(req, _, next);
    };
  }
}
