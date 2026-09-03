import { defaultOptions, normalizeOptions } from './options.js';
import { HttpClient } from './http.js';
import { ResourceProxy } from './resource-proxy.js';
import { OAuthAuth } from './auth/oauth.js';
import { OAuthClient } from './oauth-client.js';
import { parseResource } from './resource-parser.js';
import { resourceMethods } from './resources.js';
/**
 * Client for the Booqable API.
 *
 * Provides a JavaScript interface to interact with the Booqable rental
 * management API. The client can be configured with various authentication
 * methods including API keys, OAuth, and single-use tokens.
 *
 * @example Initialize with API key
 *   const client = new BooqableClient({
 *     apiKey: 'your_api_key',
 *     companyId: 'your_company_id',
 *   })
 *
 *   const orders = await client.orders.list({ include: 'customer' })
 *
 * @see https://developers.booqable.com/
 */
export class BooqableClient {
    options;
    http;
    constructor(options = {}) {
        // Use options passed in, but fall back to defaults (including env vars).
        this.options = { ...defaultOptions(), ...normalizeOptions(options) };
        this.http = new HttpClient(this.options);
        for (const [methodName, resourceName] of resourceMethods()) {
            Object.defineProperty(this, methodName, {
                get: () => new ResourceProxy(this.http, resourceName),
                enumerable: false,
                configurable: true,
            });
        }
    }
    /** Access a resource proxy by name (e.g. `client.resource('orders')`). */
    resource(name) {
        const match = resourceMethods().find(([methodName]) => methodName === name);
        if (!match)
            throw new Error(`Unknown resource: ${name}`);
        return new ResourceProxy(this.http, match[1]);
    }
    /** Make an HTTP GET request. Options become query params. */
    async get(path, data = {}) {
        return this.http.get(path, data);
    }
    /** Make an HTTP HEAD request. */
    async head(path, data = {}) {
        return this.http.head(path, data);
    }
    /** Make an HTTP POST request. */
    async post(path, data = {}) {
        return this.http.post(path, data);
    }
    /** Make an HTTP PUT request. */
    async put(path, data = {}) {
        return this.http.put(path, data);
    }
    /** Make an HTTP PATCH request. */
    async patch(path, data = {}) {
        return this.http.patch(path, data);
    }
    /** Make an HTTP DELETE request. */
    async delete(path, data = {}) {
        return this.http.delete(path, data);
    }
    /** Make a custom HTTP request to the Booqable API. */
    async request(method, path, data = {}) {
        return this.http.request(method, path, data);
    }
    /** Make a paginated GET request; returns the concatenated records. */
    async paginate(path, params = {}) {
        return this.http.paginate(path, params);
    }
    /** Rate limit information from the last response. */
    rateLimit() {
        return this.http.rateLimit();
    }
    /** The last HTTP response, or null if no request was made (or it failed). */
    get lastResponse() {
        return this.http.lastResponse;
    }
    /**
     * Completes the OAuth authorization-code flow: exchanges the code for an
     * access token and persists it via the configured `writeToken`.
     */
    async authenticateWithCode(code) {
        const token = await this.oauthClient().getTokenFromCode(code);
        await this.options.writeToken?.(token);
        return token;
    }
    /**
     * Parses a JSON:API payload (e.g. a webhook payload) into an object with
     * flattened attributes and populated relationships.
     */
    parseResource(payload) {
        return parseResource(payload, { strict: this.options.strictAttributes !== false });
    }
    /** Alias for {@link parseResource}. */
    deserializeResource(payload) {
        return this.parseResource(payload);
    }
    /** The OAuth client, when OAuth credentials are configured. */
    oauthClient() {
        const auth = this.http.auth();
        if (auth instanceof OAuthAuth)
            return auth.client;
        return new OAuthClient({
            apiEndpoint: this.http.apiEndpoint,
            clientId: requireOption(this.options.clientId, 'clientId'),
            clientSecret: requireOption(this.options.clientSecret, 'clientSecret'),
            redirectUri: this.options.redirectUri,
        });
    }
}
function requireOption(value, name) {
    if (!value)
        throw new Error(`OAuth is not configured. Provide \`${name}\` in Booqable configuration.`);
    return value;
}
