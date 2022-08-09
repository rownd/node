import got from './got';
import NodeCache from 'node-cache';
import * as jose from 'jose';
import { GetKeyFunction } from 'jose/dist/types/types';
import {
  FetchUserInfoOpts,
  RowndToken,
  RowndUser,
  TApp,
  TConfig,
  TTokenValidationPayload,
} from '../types';

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

export const CLAIM_USER_ID = 'https://auth.rownd.io/app_user_id';
export const CLAIM_IS_VERIFIED_USER = 'https://auth.rownd.io/is_verified_user';

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
): Promise<TTokenValidationPayload> {
  let authConfig = await fetchRowndWellKnownConfig(config.api_url);

  let keystore = await fetchRowndJwks(authConfig.jwks_uri);

  let verifyResp = await jose.jwtVerify(token, keystore);
  const payload = verifyResp.payload as RowndToken;

  return {
    decoded_token: payload,
    user_id: payload[CLAIM_USER_ID],
    access_token: token,
  };
}

export async function fetchUserInfo(
  opts: FetchUserInfoOpts,
  config: TConfig
): Promise<Record<string, any>> {
  let appId = opts?.app_id || config._app?.id;

  if (!appId) {
    throw new Error('An app_id must be provided');
  }

  let userId = opts.user_id;
  let headers: Record<string, string> = {};

  userId = opts.user_id;
  headers['x-rownd-app-key'] = config.app_key!;
  headers['x-rownd-app-secret'] = config.app_secret!;

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

export async function deleteUser(
  userId: String,
  config: TConfig
): Promise<void> {
  await got.delete(
    `${config.api_url}/applications/${config._app!.id}/users/${userId}/data`,
    {
      headers: {
        'x-rownd-app-key': config.app_key,
        'x-rownd-app-secret': config.app_secret,
        'content-type': 'application/json',
      },
    }
  );
}
