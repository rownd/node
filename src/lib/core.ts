import got from './got';
import NodeCache from 'node-cache';
import * as jose from 'jose';
import { GetKeyFunction } from 'jose/dist/types/types';
import { TApp, TConfig } from '../types';

type WellKnownConfig = {
  issuer: string;
  token_endpoint: string;
  jwks_uri: string;
  userinfo_endpoint: string;
  response_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
  grant_types_supported: string[];
  subject_types_supported: string[];
  scopes_supported: string[];
  token_endpoint_auth_methods_supported: string[];
  claims_supported: string[];
  code_challenge_methods_supported: string[];
  introspection_endpoint_auth_methods_supported: string[];
  request_parameter_supported: boolean;
  request_object_signing_alg_values_supported: string[];
};

const CACHE_KEY_OAUTH_CONFIG = 'oauth-config';
const CACHE_KEY_JWKS = 'jwks';
export const CLAIM_USER_ID = 'https://auth.rownd.io/app_user_id';
export const CLAIM_IS_VERIFIED_USER = 'https://auth.rownd.io/is_verified_user';

type TAppResp = {
  app: TApp;
};

const cache = new NodeCache({
  stdTTL: 3600,
  deleteOnExpire: false,  // if refresh/updates fail, we want to keep oauth and jwk config around until it works again
});

export async function initCacheLifecycle(config: TConfig): Promise<void> {
  // Initial fetch loop
  do {
    await fetchRowndWellKnownConfig(config.api_url);
  } while (!cache.has(CACHE_KEY_OAUTH_CONFIG));

  do {
    await fetchRowndJwks();
  } while (!cache.has(CACHE_KEY_JWKS));

  cache.on('expired', async (key, _) => {
    let fetchResult: any;
    do {
      switch (key) {
        case CACHE_KEY_OAUTH_CONFIG:
          fetchResult = await fetchRowndWellKnownConfig(config.api_url);

          break;

        case CACHE_KEY_JWKS:
          fetchResult = await fetchRowndJwks();
          break;

        default:
          console.warn(`Unknown cache key expired: ${key}`);
          return; // break the loop since nothing needs fetching
      }
    } while (!fetchResult);
  });
}

export async function fetchRowndWellKnownConfig(
  apiUrl: string
): Promise<WellKnownConfig> {
  let resp: WellKnownConfig = await got
    .get(`${apiUrl}/hub/auth/.well-known/oauth-authorization-server`)
    .json();
  cache.set(CACHE_KEY_OAUTH_CONFIG, resp);

  return resp;
}

async function getRowndWellKnownConfig(): Promise<WellKnownConfig> {
  if (cache.has(CACHE_KEY_OAUTH_CONFIG)) {
    return cache.get(CACHE_KEY_OAUTH_CONFIG) as WellKnownConfig;
  }

  return new Promise((resolve, reject) => {
    const rejectTimeout = setTimeout(() => reject(new Error('Timed out waiting for OAuth config')), 5000);
    function receiveConfigListener(key: string, value: any) {
      if (key !== CACHE_KEY_OAUTH_CONFIG) {
        return;
      }

      clearTimeout(rejectTimeout);
      cache.removeListener('set', receiveConfigListener);
      resolve(value as WellKnownConfig)
    }

    cache.on('set', receiveConfigListener)
  });
}

export async function fetchRowndJwks(): Promise<void> {
  const oauthConfig = await getRowndWellKnownConfig();
  // if (cache.has('jwks') && (cache.getTtl('jwks') || 0) > Date.now()) {
  //   return jose.createLocalJWKSet(cache.get('jwks') as jose.JSONWebKeySet);
  // }

  let jwkSet: GetKeyFunction<jose.JWSHeaderParameters, jose.FlattenedJWSInput>;

  try {
    let resp: jose.JSONWebKeySet = await got.get(oauthConfig.jwks_uri).json();
    jwkSet = jose.createLocalJWKSet(resp);
    cache.set('jwks', resp);
  } catch (err) {
    console.error('Failed fetching Rownd JWKset', err);
  }
}

export async function getRowndJwks(): Promise<GetKeyFunction<jose.JWSHeaderParameters, jose.FlattenedJWSInput>> {
  if (cache.has(CACHE_KEY_JWKS)) {
    return jose.createLocalJWKSet(cache.get(CACHE_KEY_JWKS) as jose.JSONWebKeySet);
  }

  // Wait for JWKs to be fetched and cached, but not forever
  return new Promise((resolve, reject) => {
    const rejectTimeout = setTimeout(() => reject(new Error('Timed out waiting for JWKs')), 8000);
    function receiveJwksListener(key: string, value: any) {
      if (key !== CACHE_KEY_JWKS) {
        return;
      }

      clearTimeout(rejectTimeout);
      cache.removeListener('set', receiveJwksListener);
      resolve(jose.createLocalJWKSet(value as jose.JSONWebKeySet));
    }

    cache.on('set', receiveJwksListener);
  });
}

export async function fetchAppConfig(
  apiUrl: string,
  appKey: string
): Promise<TApp> {
  let resp: TAppResp = await got
    .get(`${apiUrl}/hub/app-config`, {
      headers: {
        'x-rownd-app-key': appKey,
      },
      retry: {
        limit: Infinity, // retry forever so we hopefully don't leave the system in a bad state permanently
      },
    })
    .json();

  return resp.app;
}
