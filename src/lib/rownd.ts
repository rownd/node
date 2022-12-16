import * as jose from 'jose';
import { createConfig } from './config';
import {
  CLAIM_USER_ID,
  fetchAppConfig,
  getRowndJwks,
  initCacheLifecycle,
} from './core';
import { createSmartLink } from './smart_links';
import {
  CreateSmartLinkOpts,
  FetchUserInfoOpts,
  IRowndClient,
  IRowndExpressClient,
  RowndToken,
  RowndUser,
  TApp,
  TConfig,
} from '../types';
import { RowndExpressClient } from '../express';
import NodeCache from 'node-cache';
import got from './got';

export class RowndInstance implements IRowndClient {
  private cache = new NodeCache({ stdTTL: 3600 });
  private config: TConfig;

  private initPromise?: Promise<TApp>;

  public appConfig: Promise<TApp> | undefined;

  public express: IRowndExpressClient;

  constructor(pConfig?: Partial<TConfig>) {
    this.config = createConfig(pConfig);

    initCacheLifecycle(this.config);

    this.express = new RowndExpressClient(this);

    this.initPromise = fetchAppConfig(this.config.api_url, this.config.app_key!)
      .then(app => (this.config._app = app))
      .catch(err => {
        throw new Error(`Failed to fetch app config: ${err.message}`);
      });
  }

  async validateToken(token: string) {
    let keystore = await getRowndJwks();

    let verifyResp = await jose.jwtVerify(token, keystore);
    const payload = verifyResp.payload as RowndToken;

    return {
      decoded_token: payload,
      user_id: payload[CLAIM_USER_ID],
      access_token: token,
    };
  }

  async fetchUserInfo(opts: FetchUserInfoOpts) {
    // Ensure we have the app config before fetching user info.
    await Promise.race([
      this.initPromise,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Request timed out')),
          this.config.timeout
        )
      ),
    ]);

    let appId = opts?.app_id || this.config._app?.id;

    if (!appId && opts?.access_token) {
      try {
        const decodedToken = jose.decodeJwt(opts.access_token);
        const appAudience = (decodedToken?.aud as string[])?.find((aud) => aud?.startsWith('app:'));

        appId = appAudience?.split(':')[1] || void 0;
      } catch (err) {
        // log error
      }
    }

    if (!appId) {
      throw new Error('An app_id must be provided');
    }

    let userId = opts.user_id;
    let headers: Record<string, string> = {};

    headers['x-rownd-app-key'] = this.config.app_key!;
    headers['x-rownd-app-secret'] = this.config.app_secret!;

    if (this.cache.has(`user:${userId}`)) {
      return this.cache.get(`user:${userId}`) as any;
    }

    let resp: Record<string, any> = await got
      .get(
        `${this.config.api_url}/applications/${appId}/users/${userId}/data`,
        {
          headers,
        }
      )
      .json();

    this.cache.set(`user:${userId}`, resp, 300);

    return resp;
  }

  async createOrUpdateUser(user: RowndUser) {
    // Ensure we have the app config before fetching user info, but don't wait forever
    await Promise.race([
      this.initPromise,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Request timed out')),
          this.config.timeout
        )
      ),
    ]);

    let resp: RowndUser = await got
      .put(
        `${this.config.api_url}/applications/${this.config._app!.id
        }/users/${user.id || user.data.user_id}/data`,
        {
          headers: {
            'x-rownd-app-key': this.config.app_key,
            'x-rownd-app-secret': this.config.app_secret,
            'content-type': 'application/json',
          },
          json: {
            data: user.data,
          },
        }
      )
      .json();

    return resp;
  }

  async deleteUser(userId: String) {
    await got.delete(
      `${this.config.api_url}/applications/${this.config._app!.id
      }/users/${userId}/data`,
      {
        headers: {
          'x-rownd-app-key': this.config.app_key,
          'x-rownd-app-secret': this.config.app_secret,
          'content-type': 'application/json',
        },
      }
    );
  }

  async createSmartLink(opts: CreateSmartLinkOpts) {
    return createSmartLink(opts, this.config);
  }
}
