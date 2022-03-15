import { validateToken, fetchUserInfo, fetchAppConfig, createOrUpdateUser } from './lib/core';
import { createSmartLink } from './lib/smart_links';
import expressLib from './express';


const defaultConfig: TConfig = {
  api_url: 'https://api.rownd.io',
  app_key: process.env.ROWND_APP_KEY,
  app_secret: process.env.ROWND_APP_SECRET,
};

export function createInstance(config?: TConfig) {
  const instConfig = { ...defaultConfig, ...config };

  if (instConfig.app_key) {
    fetchAppConfig(instConfig)
      .then(app => instConfig._app = app)
      .catch(err => { throw new Error(`Failed to fetch app config: ${err.message}`); });
  }

  return {
    validateToken,
    fetchUserInfo: (opts: string | FetchUserInfoOpts) => fetchUserInfo(opts, instConfig),
    createOrUpdateUser: (user: RowndUser) => createOrUpdateUser(user, instConfig),
    createSmartLink: (opts: CreateSmartLinkOpts) => createSmartLink(opts, instConfig),
    express: expressLib(instConfig),
  };
}

const defaultInstance = createInstance();
export default defaultInstance;
export { defaultInstance as rownd };
