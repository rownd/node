import { fetchRowndWellKnownConfig, validateToken } from '../src/lib/core';

const testConfig = {
  api_url: 'https://api.us-east-2.devrownd.io',
}

describe('validate token', () => {
  it('fetches well known config', async () => {
    await fetchRowndWellKnownConfig(testConfig.api_url);
  });

  it('validates a token', async () => {
    await validateToken('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3N2U4Y2EwYi01Y2I0LTQwNmItYWM0Zi0xOWYzYjA2ZjhkMTEiLCJhdWQiOlsiYXBwOjMyMTk3NDM4NTU4Mzg1MDA2NCIsImh0dHBzOi8vYXBpLmRldi5yb3duZC5pbyJdLCJzdWIiOiJnb29nbGUtb2F1dGgyfDExODI0NTE1NDgzNDAzNDM2NjExMSIsImlhdCI6MTY0NDYxODExMSwiaHR0cHM6Ly9hdXRoLnJvd25kLmlvL2FwcF91c2VyX2lkIjoiY2VjMGIxYmQtODk5Yi00YWRhLTlmNTgtYTNjYzU2YjM4YzFjIiwiZXhwIjoxNjQ0NjIxNzExLCJpc3MiOiJodHRwczovL2FwaS5kZXYucm93bmQuaW8ifQ.ldt5O0HzH5i8tzLivf2BtxPnlswQbc5yNE21smIRlWYgfCVlrZ03F6SpAO0wiKgo-f5MoYoxVw5NoyGmzTwEHw', { config: testConfig });
  });
});
