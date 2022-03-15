import { WrappedError } from '../errors';
import got from './got';

export async function createSmartLink({ email, phone, redirect_url, data }: CreateSmartLinkOpts, config: TConfig): Promise<SmartLink> {
    try {
        let resp: SmartLink = await got.post(`${config.api_url}/hub/auth/magic`, {
            headers: {
                'x-rownd-app-key': config.app_key,
                'x-rownd-app-secret': config.app_secret,
            },
            json: {
                verification_mode: email ? 'email' : 'phone',
                redirect_url: redirect_url,
                data: {
                    email,
                    phone,
                    ...data,
                }
            },
        }).json();

        return resp;
    } catch (err) {
        let wrappingError = new WrappedError(
            `Failed to generate the requested smart link. Reason: ${(err as Error).message}`
        );
        wrappingError.innerError = err as Error;
        wrappingError.statusCode = (err as any).statusCode || 500;
        throw wrappingError;
    }
}
