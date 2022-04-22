import got from './got';
import NodeCache from 'node-cache';
import * as jose from 'jose';
import { GetKeyFunction } from 'jose/dist/types/types';
import { FetchUserInfoOpts, RowndUser, TApp, TConfig } from '../types';

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

type ValidateTokenOpts = {
  config: TConfig;
};

type TAppResp = {
  app: TApp;
};

const cache = new NodeCache({ stdTTL: 3600 });

export async function fetchRowndWellKnownConfig(
  apiUrl: string
): Promise<WellKnownConfig> {
  if (cache.has('oauth-config')) {
    return cache.get('oauth-config') as WellKnownConfig;
  }

  let resp: WellKnownConfig = await got
    .get(`${apiUrl}/hub/auth/.well-known/oauth-authorization-server`)
    .json();
  cache.set('oauth-config', resp);

  return resp;
}

async function fetchRowndJwks(
  jwksUrl: string
): Promise<GetKeyFunction<jose.JWSHeaderParameters, jose.FlattenedJWSInput>> {
  if (cache.has('jwks')) {
    return jose.createLocalJWKSet(cache.get('jwks') as jose.JSONWebKeySet);
  }

  let resp: jose.JSONWebKeySet = await got.get(jwksUrl).json();
  cache.set('jwks', resp);

  return jose.createLocalJWKSet(resp);
}

export async function validateToken(
  token: string,
  { config }: ValidateTokenOpts
): Promise<jose.JWTPayload | string | void> {
  let authConfig = await fetchRowndWellKnownConfig(config.api_url);

  let keystore = await fetchRowndJwks(authConfig.jwks_uri);

  let verifyResp = await jose.jwtVerify(token, keystore);
  const payload = verifyResp.payload;
  payload.access_token = token;

  return payload;
}

export async function fetchUserInfo(
  opts: FetchUserInfoOpts | string,
  config: TConfig
): Promise<Record<string, any>> {
  let token = typeof opts === 'string' ? opts : opts.token;

  let appId = config._app?.id || (typeof opts !== 'string' && opts.app_id);
  let userId = typeof opts !== 'string' && opts.user_id;
  let headers: Record<string, string> = {};

  if (token) {
    let decodedToken = jose.decodeJwt(token);

    if (!decodedToken.aud) {
      throw new Error('No audience found in token. Is this a valid token?');
    }

    let appAudience = (decodedToken.aud as string[]).find(a =>
      a.startsWith('app:')
    );

    if (!appAudience) {
      throw new Error('No app audience found in token. Is this a valid token?');
    }

    appId = appAudience.split(':')[1];
    userId = decodedToken['https://auth.rownd.io/app_user_id'] as string;
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    userId = typeof opts !== 'string' && opts.user_id;
    headers['x-rownd-app-key'] = config.app_key!;
    headers['x-rownd-app-secret'] = config.app_secret!;
  }

  if (cache.has(`user:${userId}`)) {
    return cache.get(`user:${userId}`) as any;
  }

  let resp: Record<string, any> = await got
    .get(`${config.api_url}/applications/${appId}/users/${userId}/data`, {
      headers,
    })
    .json();

  cache.set(`user:${userId}`, resp, 300);

  return resp;
}

export async function fetchAppConfig(config: TConfig): Promise<TApp> {
  let resp: TAppResp = await got
    .get(`${config.api_url}/hub/app-config`, {
      headers: {
        'x-rownd-app-key': config.app_key,
      },
    })
    .json();
  return resp.app;
}

export async function createOrUpdateUser(
  user: RowndUser,
  config: TConfig
): Promise<RowndUser> {
  let resp: RowndUser = await got
    .put(
      `${config.api_url}/applications/${config._app!.id}/users/${user.id}/data`,
      {
        headers: {
          'x-rownd-app-key': config.app_key,
          'x-rownd-app-secret': config.app_secret,
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
