import { createInstance } from '../src';
import { fetchAppConfig } from '../src/lib/core';
import { IRowndClient } from '../src/types';
import nock from 'nock';
import { MockAppConfigResponseType, setupMockAppConfig, setupMockJwksApi, setupMockOauthConfig } from './mocks';

const TOKEN: string =
  'eyJhbGciOiJFZERTQSIsImtpZCI6InNpZy0xNjQ0ODU5MTUwIn0.eyJqdGkiOiIwOGVkZTBlZC01NDRlLTQ2Y2ItOThmNi03NGE2NmYyMDY0ZGEiLCJhdWQiOlsiYXBwOjI5MDE2NzI4MTczMjgxMzMxNSIsImh0dHBzOi8vYXBpLmRldi5yb3duZC5pbyJdLCJzdWIiOiJhdXRoMHw2MWYzMDUzMjUxZjI0MjAwNjk0NTU5NzYiLCJpYXQiOjE2NTA2NTczNDQsImh0dHBzOi8vYXV0aC5yb3duZC5pby9hcHBfdXNlcl9pZCI6IjcxZjZjZWViLWVlMGEtNDQzNy05YjQ0LWU2MjI5ZGVmYmFiOCIsImh0dHBzOi8vYXV0aC5yb3duZC5pby9pc192ZXJpZmllZF91c2VyIjp0cnVlLCJpc3MiOiJodHRwczovL2FwaS5kZXYucm93bmQuaW8iLCJleHAiOjE2NTA2NjA5NDR9.-SNdqdbk_GLXYSFzwYgr4XOAjeEWsmoRPArFyjASHyvhylKHMdM5WvDrRDuMGlVVL8nkZZrrBRZjV0H09j8WCQ';

const testConfig = {
  api_url: 'http://api.mock.local',
};

describe('core tests', () => {
  let rowndInstance: IRowndClient;
  beforeAll(() => {
    rowndInstance = createInstance(testConfig);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('resiliently fetch app config', () => {
    it('fetches the app config', async () => {
      setupMockAppConfig();
      const appConfig = await fetchAppConfig(
        testConfig.api_url,
        'test-app-key'
      );
      expect(appConfig).toBeDefined();
      expect(appConfig.id).toBe('290167281732813315');
    });

    it('fetches the app config after retrying', async () => {
      jest.setTimeout(30000);

      setupMockAppConfig(MockAppConfigResponseType.ServerError);
      setupMockAppConfig(MockAppConfigResponseType.DelayedServerError);
      setupMockAppConfig(MockAppConfigResponseType.Success);

      try {
        const appConfig = await fetchAppConfig(
          'http://api.mock.local',
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
    it('throws on expired token', async () => {
      setupMockOauthConfig();
      setupMockJwksApi();
      setupMockAppConfig();
      await expect(rowndInstance.validateToken(TOKEN)).rejects.toThrow(Error);
    });
  });
});
