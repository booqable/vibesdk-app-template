import { AuthStrategy, RequestContext } from './strategy.js';
/**
 * API key authentication.
 *
 * Adds the API key as a Bearer token in the Authorization header if no
 * authorization header is already present.
 *
 * @see https://developers.booqable.com/#authentication-access-token
 */
export declare class ApiKeyAuth implements AuthStrategy {
    private apiKey;
    constructor(apiKey: string);
    apply(request: RequestContext): Promise<void>;
}
