import { createInstance } from '../src';
import { createConfig } from '../src/lib/config';
import { TConfig } from '../src/types';

// const TOKEN: string = process.env.TOKEN as string;

const testConfig: TConfig = createConfig({
  api_url: process.env.API_URL,
  app_key: process.env.APP_KEY,
  app_secret: process.env.APP_SECRET,
});

const client = createInstance(testConfig);

describe('user profile handling', () => {
  beforeAll(() => {
    return client.appConfig; // ensure app config has been fetched
  });
  // it('validate a good token', async () => {
  //   const tokenObj = await client.validateToken(TOKEN);
  //   expect(tokenObj.user_id).toBeDefined();
  // });

  it('fetches a user', async () => {
    const user = await client.fetchUserInfo({ user_id: 'mth-test-user-1' });
    expect(user.data).toBeDefined();
  });

  it('upserts a user', async () => {
    const originalUser = await client.fetchUserInfo({
      user_id: 'mth-test-user-1',
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
