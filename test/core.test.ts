import { fetchRowndWellKnownConfig } from '../src/lib/core';
import { createInstance } from '../src';
import { fetchAppConfig } from '../src/lib/core';
import { IRowndClient } from '../src/types';
import { server } from './mocks';

const TOKEN: string =
  'eyJhbGciOiJFZERTQSIsImtpZCI6InNpZy0xNjQ0ODU5MTUwIn0.eyJqdGkiOiIwOGVkZTBlZC01NDRlLTQ2Y2ItOThmNi03NGE2NmYyMDY0ZGEiLCJhdWQiOlsiYXBwOjI5MDE2NzI4MTczMjgxMzMxNSIsImh0dHBzOi8vYXBpLmRldi5yb3duZC5pbyJdLCJzdWIiOiJhdXRoMHw2MWYzMDUzMjUxZjI0MjAwNjk0NTU5NzYiLCJpYXQiOjE2NTA2NTczNDQsImh0dHBzOi8vYXV0aC5yb3duZC5pby9hcHBfdXNlcl9pZCI6IjcxZjZjZWViLWVlMGEtNDQzNy05YjQ0LWU2MjI5ZGVmYmFiOCIsImh0dHBzOi8vYXV0aC5yb3duZC5pby9pc192ZXJpZmllZF91c2VyIjp0cnVlLCJpc3MiOiJodHRwczovL2FwaS5kZXYucm93bmQuaW8iLCJleHAiOjE2NTA2NjA5NDR9.-SNdqdbk_GLXYSFzwYgr4XOAjeEWsmoRPArFyjASHyvhylKHMdM5WvDrRDuMGlVVL8nkZZrrBRZjV0H09j8WCQ';

const testConfig = {
  api_url: 'https://mock-api.local',
};

describe('core tests', () => {
  let rowndInstance: IRowndClient;
  beforeAll(() => {
    server.listen();
    rowndInstance = createInstance(testConfig);
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
    return new Promise(resolve => setTimeout(() => resolve(null), 100));
  });

  describe('resiliently fetch app config', () => {
    it('fetches the app config', async () => {
      const appConfig = await fetchAppConfig(
        testConfig.api_url,
        'test-app-key'
      );
      expect(appConfig).toBeDefined();
      expect(appConfig.id).toBe('290167281732813315');
    });

    it('fetches the app config after retrying', async () => {
      jest.setTimeout(30000);
      try {
        const appConfig = await fetchAppConfig(
          'https://mock-api-2.local',
          'test-app-key'
        );
        expect(appConfig).toBeDefined();
        expect(appConfig.id).toBe('290167281732813315');
      } catch (err) {
        console.error(err);
        fail('should not ever throw an error');
      }
    });
  });

  describe('validate token', () => {
    it('fetches well known config', async () => {
      let resp = await fetchRowndWellKnownConfig(testConfig.api_url);
      expect(resp).toBeDefined();
    });

    it('throws on expired token', async () => {
      await expect(rowndInstance.validateToken(TOKEN)).rejects.toThrow(Error);
    });
  });
});
