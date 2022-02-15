import { fetchRowndWellKnownConfig, validateToken } from '../src/lib/core';

const testConfig = {
  api_url: 'https://api.us-east-2.dev.rownd.io',
};

describe('validate token', () => {
  it('fetches well known config', async () => {
    await fetchRowndWellKnownConfig(testConfig.api_url);
  });

  it('throws on expired token', async () => {
    await expect(
      validateToken(
        'eyJhbGciOiJFZERTQSJ9.eyJqdGkiOiJkZDA5MjU3My1lMTU4LTRjZTktOWQwYy04ZTQzMDUwYjM1NmEiLCJhdWQiOlsiYXBwOjMyMTk3NDM4NTU4Mzg1MDA2NCIsImh0dHBzOi8vYXBpLmRldi5yb3duZC5pbyJdLCJzdWIiOiJhdXRoMHw2MWYzMDUzMjUxZjI0MjAwNjk0NTU5NzYiLCJpYXQiOjE2NDQ4OTc2MjEsImh0dHBzOi8vYXV0aC5yb3duZC5pby9hcHBfdXNlcl9pZCI6ImUzYWMwYTI3LTRkYmQtNDgxYi1hNjUxLTgxMjU2MGJlNDgxNSIsImlzcyI6Imh0dHBzOi8vYXBpLmRldi5yb3duZC5pbyIsImV4cCI6MTY0NDkwMTIyMX0.kalHuJKVV-eqj4WK-r1QRvqM8aoNxcmG_TA_Bdbc-FrQFqnhQvAr7Gi_rFHHuoq_c7Bg4EqFm8RIqjInooqjAg',
        { config: testConfig }
      )
    ).rejects.toThrow(Error);
  });
});
