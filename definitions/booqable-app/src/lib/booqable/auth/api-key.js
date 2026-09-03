/**
 * API key authentication.
 *
 * Adds the API key as a Bearer token in the Authorization header if no
 * authorization header is already present.
 *
 * @see https://developers.booqable.com/#authentication-access-token
 */
export class ApiKeyAuth {
    apiKey;
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async apply(request) {
        if (!request.headers['Authorization']) {
            request.headers['Authorization'] = `Bearer ${this.apiKey}`;
        }
    }
}
