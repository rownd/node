import { fetchRowndWellKnownConfig, validateToken } from '../src/lib/core';

const TOKEN: string =
  'eyJhbGciOiJFZERTQSIsImtpZCI6InNpZy0xNjQ0ODU5MTUwIn0.eyJqdGkiOiIwOGVkZTBlZC01NDRlLTQ2Y2ItOThmNi03NGE2NmYyMDY0ZGEiLCJhdWQiOlsiYXBwOjI5MDE2NzI4MTczMjgxMzMxNSIsImh0dHBzOi8vYXBpLmRldi5yb3duZC5pbyJdLCJzdWIiOiJhdXRoMHw2MWYzMDUzMjUxZjI0MjAwNjk0NTU5NzYiLCJpYXQiOjE2NTA2NTczNDQsImh0dHBzOi8vYXV0aC5yb3duZC5pby9hcHBfdXNlcl9pZCI6IjcxZjZjZWViLWVlMGEtNDQzNy05YjQ0LWU2MjI5ZGVmYmFiOCIsImh0dHBzOi8vYXV0aC5yb3duZC5pby9pc192ZXJpZmllZF91c2VyIjp0cnVlLCJpc3MiOiJodHRwczovL2FwaS5kZXYucm93bmQuaW8iLCJleHAiOjE2NTA2NjA5NDR9.-SNdqdbk_GLXYSFzwYgr4XOAjeEWsmoRPArFyjASHyvhylKHMdM5WvDrRDuMGlVVL8nkZZrrBRZjV0H09j8WCQ';

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
