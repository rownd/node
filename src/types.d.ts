type TConfig = {
  api_url: string;
  app_key?: string;
  app_secret?: string;
  _app?: TApp;
};

type RowndToken = {
  jti: string;
  sub: string;
  aud: string[];
  iat: number;
  exp: number;
  iss: string;
};

type TApp = {
  id: string;
  schema: any;
  config: any;
};

type FetchUserInfoOpts = {
  token?: string;
  user_id?: string;
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
}

type RowndUser = {
  id: string;
  data: Record<string, any>;
};
