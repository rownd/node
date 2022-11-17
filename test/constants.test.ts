import { DEFAULT_API_USER_AGENT } from '../src/lib/constants';

describe('constants compile and resolve', () => {
    it('user agent string compiles', () => {
        expect(DEFAULT_API_USER_AGENT).toBeDefined();
    })
});
