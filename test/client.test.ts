import { createInstance } from '../src';
import { generateTestToken, server } from './mocks';
import * as jose from 'jose';
import { getKeys } from './mocks';
import { CLAIM_USER_ID } from '../src/lib/core';

// const TOKEN: string = process.env.TOKEN as string;

const testConfig = {
  api_url: 'https://mock-api.local',
  app_key: 'node-test-app-key',
  app_secret: 'node-test-app-secret'
};

// We're creating this instance before the mock server starts
// in order to test that retrieving the app config will retry.
// It will fail initially since the server isn't running until
// after the client instance is instantiated.
const client = createInstance(testConfig);

describe('user profile handling', () => {
  beforeAll(() => {
    server.listen();
  });

  beforeEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
    return new Promise(resolve => setTimeout(() => resolve(null), 100));
  });

  it('validate a good token', async () => {  
    const jwt = await generateTestToken();
    const tokenObj = await client.validateToken(jwt);
    expect(tokenObj.user_id).toBeDefined();
  });

  it('fetches a user before app config is ready', async () => {
    const user = await client.fetchUserInfo({ user_id: 'rownd-test-user-1' });
    expect(user.data).toBeDefined();
  }, 20000);  // set the test timeout to 20s to test retry logic, since the request will fire before the server is ready

  it('upserts a user', async () => {
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
    const link = await client.createSmartLink({
      email: 'someone@test.com',
      redirect_url: 'https://rownd.io',
      data: {},
    });

    expect(link).toBeDefined();
  });
});
