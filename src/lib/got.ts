import got from 'got';
import debugLib from 'debug';

const debug = debugLib('rownd:got');

const instance = got.extend({
    hooks: {
        beforeRequest: [
            (options) => {
                debug('request', options);
            }
        ],
        beforeError: [
            (error) => {
                debug('error', error);
                return error;
            }
        ],
        afterResponse: [
            (response, _) => {
                debug('response', response);

                return response;
            }
        ]
    }
});

export default instance;