import got from './got';
import NodeCache from 'node-cache';
import * as jose from 'jose';
import { GetKeyFunction } from 'jose/dist/types/types';
import { TApp } from '../types';

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

export async function fetchRowndJwks(
  jwksUrl: string
): Promise<GetKeyFunction<jose.JWSHeaderParameters, jose.FlattenedJWSInput>> {
  if (cache.has('jwks')) {
    return jose.createLocalJWKSet(cache.get('jwks') as jose.JSONWebKeySet);
  }

  let resp: jose.JSONWebKeySet = await got.get(jwksUrl).json();
  cache.set('jwks', resp);

  return jose.createLocalJWKSet(resp);
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
      }
    })
    .json();

  return resp.app;
}
