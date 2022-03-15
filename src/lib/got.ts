import got from 'got';
import debugLib from 'debug';
import { pick } from 'lodash';

const debug = debugLib('rownd:got');

const instance = got.extend({
    hooks: {
        beforeRequest: [
            (options) => {
                debug('request', pick(options, ['method', 'url', 'headers', 'json', 'body']));
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
                debug('response', pick(response, ['method', 'url', 'path', 'host', 'headers', 'status', 'body']));

                return response;
            }
        ]
    }
});

export default instance;