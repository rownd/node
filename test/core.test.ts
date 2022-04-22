import { fetchRowndWellKnownConfig, validateToken } from '../src/lib/core';

const TOKEN = '';

const testConfig = {
  api_url: 'https://api.us-east-2.dev.rownd.io',
};

describe('validate token', () => {
  it('fetches well known config', async () => {
    await fetchRowndWellKnownConfig(testConfig.api_url);
  });

  it('throws on expired token', async () => {
    await expect(validateToken(TOKEN, { config: testConfig })).rejects.toThrow(
      Error
    );
  });
});
