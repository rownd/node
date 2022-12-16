import nock from 'nock';
import * as jose from 'jose';
import { CLAIM_USER_ID } from '../src/lib/core';
import * as timers from 'awaitable-timers';

// Init JWK
let keyPair: Promise<jose.GenerateKeyPairResult> = jose.generateKeyPair(
  'EdDSA',
  { crv: 'Ed25519' }
);

export async function getKeys() {
  return keyPair;
}

export async function generateTestToken() {
  const keys = await getKeys();
  const jwt = await new jose.SignJWT({
    [CLAIM_USER_ID]: 'rownd-test-user-1',
  })
    .setProtectedHeader({ alg: 'EdDSA' })
    .setIssuedAt()
    .setIssuer('dev.rownd.io')
    .setAudience('app:290167281732813315')
    .setExpirationTime('1h')
    .sign(keys.privateKey);

  return jwt;
}

export const mockOauthConfig = {
  "issuer": "http://api.mock.local",
  "token_endpoint": "http://api.mock.local/hub/auth/token",
  "jwks_uri": "http://api.mock.local/hub/auth/keys",
  "userinfo_endpoint": "http://api.mock.local/me",
  "response_types_supported": [
    "token"
  ],
  "id_token_signing_alg_values_supported": [
    "EdDSA"
  ],
  "grant_types_supported": [
    "refresh_token"
  ],
  "subject_types_supported": [
    "public"
  ],
  "scopes_supported": [],
  "token_endpoint_auth_methods_supported": [
    "none"
  ],
  "claims_supported": [
    "ver",
    "jti",
    "iss",
    "aud",
    "iat",
    "exp",
    "cid",
    "uid",
    "scp",
    "sub",
    "https://auth.rownd.io/app_user_id",
    "https://auth.rownd.io/jwt_type"
  ],
  "code_challenge_methods_supported": [
    "S256"
  ],
  "introspection_endpoint_auth_methods_supported": [
    "client_secret_basic",
    "client_secret_post",
    "client_secret_jwt",
    "private_key_jwt",
    "none"
  ],
  "revocation_endpoint_auth_methods_supported": [
    "none"
  ],
  "request_parameter_supported": true,
  "request_object_signing_alg_values_supported": [
    "EdDSA"
  ]
};

export const mockJwks = {
  "keys": [
    {
      "kty": "OKP",
      "use": "sig",
      "crv": "Ed25519",
      "kid": "sig-1644859150",
      "x": "5PH1vEwUonY7SeClX8RGMOVvCva3ZhzlVdkitFE5inU",
      "alg": "EdDSA"
    }
  ]
};

const appConfig = {
  app: {
    name: 'Rownd (dev)',
    id: '290167281732813315',
    schema: {
      email: {
        display_name: 'Email',
        type: 'string',
        data_category: 'pii_basic',
        required: false,
        owned_by: 'user',
        user_visible: true,
        revoke_after: '1 month',
        required_retention: 'none',
        collection_justification:
          'This piece of personal data is needed to make your customer experience the best it can be.  We do not resell this data.',
        opt_out_warning:
          'By turning off your e-mail, your account will no longer work as designed.  You may not be able to log-in, get updates, or reset your password',
      },
      first_name: {
        display_name: 'First name',
        type: 'string',
        data_category: 'pii_basic',
        required: false,
        owned_by: 'user',
        user_visible: true,
        revoke_after: '1 month',
        required_retention: 'none',
        collection_justification:
          'We collect this data to personalize your Rownd experience. ',
        opt_out_warning: 'We will not be able to call you by your first name. ',
        third_party_sharing: false,
      },
      last_name: {
        display_name: 'Last name',
        type: 'string',
        data_category: 'pii_basic',
        required: false,
        owned_by: 'user',
        user_visible: true,
        revoke_after: '1 month',
        required_retention: 'none',
        collection_justification: '',
        opt_out_warning: '',
      },
      zip_code: {
        display_name: 'Zip code',
        type: 'string',
        data_category: 'pii_basic',
        required: false,
        owned_by: 'user',
        user_visible: true,
        revoke_after: '1 month',
        required_retention: 'none',
        collection_justification: '',
        opt_out_warning: '',
      },
      phone_number: {
        display_name: 'Phone number',
        type: 'string',
        data_category: 'pii_basic',
        required: false,
        owned_by: 'user',
        user_visible: true,
        revoke_after: '1 month',
        required_retention: 'none',
        collection_justification:
          'This piece of personal data is needed to make your customer experience the best it can be.  We do not resell this data.',
      },
      crypto_wallet_address: {
        display_name: 'Wallet Address',
        type: 'string',
        data_category: 'custom',
        required: false,
        owned_by: 'app',
        user_visible: false,
        revoke_after: 'never',
        required_retention: 'none',
        collection_justification: '',
        opt_out_warning: '',
      },
      google_id: {
        display_name: 'Google ID',
        type: 'string',
        data_category: 'custom',
        required: false,
        owned_by: 'app',
        user_visible: false,
        revoke_after: 'never',
        required_retention: 'none',
        collection_justification: '',
        opt_out_warning: '',
      },
    },
    user_verification_field: 'email',
    user_verification_fields: ['email', 'phone_number', 'google_id'],
    icon: 'https://storage-dev.rownd.io/icon-app-290167281732813315',
    config: {
      hub: {
        customizations: {
          rounded_corners: true,
          offset_y: 72,
          visual_swoops: true,
          blur_background: true,
          dark_mode: 'disabled',
        },
        auth: {
          audience: ['https://api.dev.rownd.io'],
          sign_in_methods: {
            email: { enabled: true },
            phone: { enabled: true },
            apple: { enabled: false, client_id: '' },
            google: {
              enabled: true,
              client_id:
                '437354109064-pmkrcopm4r88dm6jluf8av0ds06mps9k.apps.googleusercontent.com',
              client_secret: '********',
              ios_client_id: '',
              scopes: [''],
            },
            crypto_wallet: { enabled: false },
          },
          show_app_icon: false,
        },
      },
      content_gates: [],
    },
  },
};

export function setupMockOauthConfig(): nock.Scope {
  return nock('http://api.mock.local')
    .get('/hub/auth/.well-known/oauth-authorization-server')
    .reply(200, mockOauthConfig);
}

export function setupMockJwksApi(): nock.Scope {
  return nock('http://api.mock.local')
    .get('/hub/auth/keys')
    .reply(200, async () => {
      let keys = await getKeys();
      let jwk = await jose.exportJWK(keys.publicKey);
      return {
        keys: [jwk],
      }
    });
}

export function setupMockMagicLink(): nock.Scope {
  return nock('http://api.mock.local')
    .post('/hub/auth/magic')
    .reply(200, {
      link: 'http://api.mock.local/hub/auth/magic/complete',
      app_user_id: 'test-app-user-1',
    });
}

export function setupMockUserGet(userId: string = 'rownd-test-user-1'): nock.Scope {
  return nock('http://api.mock.local')
    .get(`/applications/290167281732813315/users/${userId}/data`)
    .reply(200, {
      data: {
        email: 'juliet@rose.co',
        user_id: 'rownd-test-user-1',
        first_name: 'Juliet',
        last_name: 'Rose',
        phone_number: '+15555551212',
        zip_code: '90210',
      },
      redacted: ['zip_code'],
      revoke_after: {
        zip_code: '2022-08-15T16:30:39.326Z',
      },
      retain_until: {
        email: '2022-03-01T22:13:24.833Z',
      },
      meta: {
        modified: '2022-11-08T04:09:20.828Z',
        first_sign_in: '2022-10-25T18:04:18.503Z',
        first_sign_in_method: 'token_refresh',
        last_sign_in: '2022-11-09T02:55:19.464Z',
        last_sign_in_method: 'token_refresh',
      },
      verified_data: {
        email: 'mhamann@rownd.io',
        phone_number: '+19192495211',
      },
    });
}

export function setupMockUserPut(userId: string = 'rownd-test-user-1'): nock.Scope {
  return nock('http://api.mock.local')
    .put(`/applications/290167281732813315/users/${userId}/data`)
    .reply(200, {
      data: {
        email: 'testuser@rownd.app',
        user_id: '71f6ceeb-ee0a-4437-9b44-e6229defbab8',
        first_name: 'Juliet',
        last_name: 'Rose',
        phone_number: '+15555551212',
        zip_code: '90210',
      },
      redacted: ['zip_code'],
      revoke_after: {
        zip_code: '2022-08-15T16:30:39.326Z',
      },
      retain_until: {
        email: '2022-03-01T22:13:24.833Z',
      },
      meta: {
        modified: '2022-11-08T04:09:20.828Z',
        first_sign_in: '2022-10-25T18:04:18.503Z',
        first_sign_in_method: 'token_refresh',
        last_sign_in: '2022-11-09T02:55:19.464Z',
        last_sign_in_method: 'token_refresh',
      },
      verified_data: {
        email: 'mhamann@rownd.io',
        phone_number: '+19192495211',
      },
    });

}

// let appConfigRetryCounter = 0;
// const handlers = [

//   rest.get('https://mock-api-2.local/hub/app-config', async (_, res, ctx) => {
//     appConfigRetryCounter++;
//     switch (appConfigRetryCounter) {
//       case 1:
//       case 2:
//       case 3:
//       case 4:
//         await timers.setTimeout(2500);
//         return res(ctx.status(500), ctx.text(''));
//       default:
//         return res(ctx.json(appConfig));
//     }
//   }),
// ];

export enum MockAppConfigResponseType {
  Success,
  DelayedServerError,
  ServerError
}

export function setupMockAppConfig(respType: MockAppConfigResponseType = MockAppConfigResponseType.Success): nock.Scope {
  let scope = nock('http://api.mock.local')
    .get('/hub/app-config');

  switch (respType) {
    case MockAppConfigResponseType.DelayedServerError:
      return scope.reply(500, async () => {
        await timers.setTimeout(2500);
        return {
          error: 'server_error',
          message: 'Server error',
        }
      });

    case MockAppConfigResponseType.ServerError:
      return scope.reply(500, {
        error: 'server_error',
        message: 'Server error',
      });

    case MockAppConfigResponseType.Success:
    default:
      return scope.reply(200, appConfig);
  }


  // return scope;
}
