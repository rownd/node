export type TConfig = {
  api_url: string;
  app_key?: string;
  app_secret?: string;
  timeout?: number;
  _app?: TApp;
};

export interface IRowndClient {
  validateToken: (token: string) => Promise<TTokenValidationPayload>;
  fetchUserInfo: (token: FetchUserInfoOpts) => Promise<TUserInfo>;
  createOrUpdateUser: (user: RowndUser) => Promise<RowndUser>;
  deleteUser: (userId: String) => Promise<void>;
  createSmartLink: (opts: TCreateSmartLinkOpts) => Promise<TSmartLink>;
  express: IRowndExpressClient;
  appConfig: Promise<TApp> | undefined;
}

interface IRowndExpressClient {
  authenticate: (opts: AuthenticateOpts) => void;
}

type TTokenValidationPayload = {
  decoded_token: RowndToken;
  user_id: string;
  access_token: string;
};

type RowndToken = JWTPayload & {
  jti: string;
  sub: string;
  aud: string[];
  iat: number;
  exp: number;
  iss: string;
  'https://auth.rownd.io/app_user_id': string;
  'https://auth.rownd.io/is_verified_user': boolean;
};

type TApp = {
  id: string;
  schema: any;
  config: any;
};

type FetchUserInfoOpts = {
  user_id: string;
  app_id?: string;
};

interface CreateSmartLinkOpts {
  email?: string;
  phone?: string;
  redirect_url: string;
  data?: Record<string, any>;
}

type SmartLink = {
  link: string;
  app_user_id: string;
};

type RowndUser = {
  id: string;
  data: Record<string, any>;
};
