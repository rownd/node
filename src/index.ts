import {
  validateToken,
  fetchUserInfo,
  fetchAppConfig,
  createOrUpdateUser,
  CLAIM_USER_ID,
  CLAIM_IS_VERIFIED_USER,
  deleteUser,
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

const claims = {
  CLAIM_USER_ID,
  CLAIM_IS_VERIFIED_USER,
};

function createInstance(config?: TConfig): IRowndClient {
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
    fetchUserInfo: (opts: FetchUserInfoOpts) => fetchUserInfo(opts, instConfig),
    createOrUpdateUser: (user: RowndUser) =>
      createOrUpdateUser(user, instConfig),
    deleteUser: (userId: String) => deleteUser(userId, instConfig),
    createSmartLink: (opts: CreateSmartLinkOpts) =>
      createSmartLink(opts, instConfig),
    express: expressLib(instConfig),
  };
}

export { createInstance, claims };
