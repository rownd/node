import nock from 'nock';
import { mockJwks, mockOauthConfig } from './mocks';
import { _cache, fetchRowndWellKnownConfig, CACHE_KEY_OAUTH_CONFIG, CACHE_KEY_JWKS, fetchRowndJwks } from '../src/lib/core';

describe('reliably handles jwk retrieval', () => {

  beforeEach(() => {
    _cache.flushAll();
    nock.cleanAll();
  });

  it('fetches oauth config and sets the cache', async () => {
    nock('http://api.mock.local')
      .get('/hub/auth/.well-known/oauth-authorization-server')
      .reply(200, mockOauthConfig);

    expect(_cache.has(CACHE_KEY_OAUTH_CONFIG)).toBe(false);
    await fetchRowndWellKnownConfig('http://api.mock.local');
    expect(_cache.has(CACHE_KEY_OAUTH_CONFIG)).toBe(true);
  });

  it('fetches jwks and sets the cache', async () => {
    _cache.set(CACHE_KEY_OAUTH_CONFIG, mockOauthConfig);
    nock('http://api.mock.local')
      .get('/hub/auth/keys')
      .reply(200, mockJwks);

    expect(_cache.has(CACHE_KEY_JWKS)).toBe(false);
    await fetchRowndJwks();
    expect(_cache.has(CACHE_KEY_JWKS)).toBe(true);
  });

  it('does not overwrite valid jwks in cache', async () => {
    _cache.set(CACHE_KEY_OAUTH_CONFIG, mockOauthConfig);
    _cache.set(CACHE_KEY_JWKS, mockJwks);
    nock('http://api.mock.local')
      .get('/hub/auth/keys')
      .reply(200, {});

    await fetchRowndJwks();
    expect(_cache.has(CACHE_KEY_JWKS)).toBe(true);
  });

  it('does not delete expired keys from cache', async () => {
    _cache.set(CACHE_KEY_OAUTH_CONFIG, mockOauthConfig, 1);
    _cache.set(CACHE_KEY_JWKS, mockJwks, 1);

    await new Promise(resolve => setTimeout(resolve, 2000));

    expect(_cache.has(CACHE_KEY_JWKS)).toBe(true);
  });
});