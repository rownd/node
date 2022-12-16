import { createInstance } from '../src';
import { generateTestToken, getKeys, setupMockAppConfig, setupMockJwksApi, setupMockMagicLink, setupMockOauthConfig } from './mocks';
import { _cache, CACHE_KEY_JWKS } from '../src/lib/core';
import nock from 'nock';
import * as jose from 'jose';

// const TOKEN: string = process.env.TOKEN as string;

const testConfig = {
  api_url: 'http://api.mock.local',
  app_key: 'node-test-app-key',
  app_secret: 'node-test-app-secret',
};

// We're creating this instance before the mock server starts
// in order to test that retrieving the app config will retry.
// It will fail initially since the server isn't running until
// after the client instance is instantiated.
const client = createInstance(testConfig);

describe('user profile handling', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  it('validate a good token', async () => {
    let keys = await getKeys();
    let jwk = await jose.exportJWK(keys.publicKey);
    _cache.set(CACHE_KEY_JWKS, { keys: [jwk] });

    const jwt = await generateTestToken();
    const tokenObj = await client.validateToken(jwt);
    expect(tokenObj.user_id).toBeDefined();
  });

  it('fetches a user before app config is ready', async () => {
    const client2 = createInstance(testConfig);
    const userPromise = await client2.fetchUserInfo({ user_id: 'rownd-test-user-1' });

    setupMockAppConfig();

    const user = await userPromise;
    expect(user.data).toBeDefined();
  }, 20000); // set the test timeout to 20s to test retry logic, since the request will fire before the server is ready

  it('upserts a user', async () => {
    setupMockAppConfig();
    setupMockOauthConfig();
    setupMockJwksApi();
    const originalUser = await client.fetchUserInfo({
      user_id: 'rownd-test-user-1',
    });

    // Make sure the user has an email address
    originalUser.data.email = 'testuser@rownd.app';

    try {
      const updatedUser = await client.createOrUpdateUser(originalUser);

      expect(updatedUser.data).toBeDefined();
    } catch (err) {
      var error: any = err;
      fail(error.message + ': ' + error?.response?.body);
    }
  });

  it('creates a login link', async () => {
    setupMockMagicLink();
    const link = await client.createSmartLink({
      email: 'someone@test.com',
      redirect_url: 'https://rownd.io',
      data: {},
    });

    expect(link).toBeDefined();
  });
});
