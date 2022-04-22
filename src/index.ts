import {
  validateToken,
  fetchUserInfo,
  fetchAppConfig,
  createOrUpdateUser,
} from './lib/core';
import { createSmartLink } from './lib/smart_links';
import expressLib from './express';
import {
  CreateSmartLinkOpts,
  IRowndClient,
  RowndUser,
  TConfig,
  FetchUserInfoOpts,
} from './types';
import { createConfig } from './lib/config';

const defaultConfig = createConfig();

export function createInstance(config?: TConfig): IRowndClient {
  const instConfig = { ...defaultConfig, ...config };

  if (instConfig.app_key) {
    fetchAppConfig(instConfig)
      .then(app => (instConfig._app = app))
      .catch(err => {
        throw new Error(`Failed to fetch app config: ${err.message}`);
      });
  }

  return {
    validateToken: (token: string) =>
      validateToken(token, { config: instConfig }),
    fetchUserInfo: (opts: string | FetchUserInfoOpts) =>
      fetchUserInfo(opts, instConfig),
    createOrUpdateUser: (user: RowndUser) =>
      createOrUpdateUser(user, instConfig),
    createSmartLink: (opts: CreateSmartLinkOpts) =>
      createSmartLink(opts, instConfig),
    express: expressLib(instConfig),
  };
}

const defaultInstance = createInstance();
export default defaultInstance;
export { defaultInstance as rownd };
