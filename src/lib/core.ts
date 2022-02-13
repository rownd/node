// import jwt from 'jsonwebtoken';
import got from 'got';
import NodeCache from 'node-cache';
import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';

const cache = new NodeCache({ stdTTL: 3600 });

let jwksClientInstance: any;

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
}

type ValidateTokenOpts = {
    config: TConfig;
}

export async function fetchRowndWellKnownConfig(apiUrl: string): Promise<WellKnownConfig> {
    if (cache.has('oauth-config')) {
        return cache.get('oauth-config') as WellKnownConfig;
    }

    let resp: WellKnownConfig = await got.get(`${apiUrl}/hub/auth/.well-known/oauth-authorization-server`).json();
    cache.set('oauth-config', resp);
    
    return resp;
}

function fetchRowndJwk(header:any, callback: Function) {
    jwksClientInstance.getSigningKey(header.kid, function(err: any, key: any) {
        var signingKey = key.publicKey || key.rsaPublicKey;
        callback(err, signingKey);
      });
}

export async function validateToken(token: string, { config }: ValidateTokenOpts): Promise<jwt.JwtPayload | string | void> {
    let authConfig = await fetchRowndWellKnownConfig(config.api_url);

    if (!jwksClientInstance) {
        jwksClientInstance = jwksClient({
            jwksUri: authConfig.jwks_uri,
        });
    }

    return new Promise((resolve, reject) => {
        jwt.verify(token, fetchRowndJwk, (err, decoded) => {
            if (err) {
                return reject(err);
            }

            resolve(decoded);
        });
    });
}
