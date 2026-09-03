import { apiEndpointFor } from './options.js';
import { BooqableError, raiseForResponse } from './errors.js';
import { JsonApiSerializer } from './json-api-serializer.js';
import { RateLimit } from './rate-limit.js';
import { ApiKeyAuth } from './auth/api-key.js';
import { OAuthAuth } from './auth/oauth.js';
import { SingleUseAuth } from './auth/single-use.js';
/** Default retry behavior, mirroring booqable.rb's Faraday::Retry options. */
const RETRY_OPTIONS = {
    /** Maximum number of retries (total of 3 attempts including the first). */
    max: 2,
    /** Milliseconds to wait before retrying. */
    interval: 2000,
    /** Randomize the interval by this amount. */
    intervalRandomness: 0.5,
    /** Multiply the interval by this factor on each retry. */
    backoffFactor: 2,
    /** Idempotent methods eligible for retry. */
    methods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'],
};
/**
 * HTTP layer for {@link BooqableClient}.
 *
 * Handles authentication, retries, pagination, rate limiting, error
 * raising, and JSON:API response parsing on top of the global fetch —
 * no Node-specific APIs, so it runs in Node.js, browsers, and edge
 * runtimes such as Cloudflare Workers.
 */
export class HttpClient {
    options;
    lastResponse = null;
    authStrategy;
    constructor(options) {
        this.options = options;
    }
    /** The complete API endpoint URL. */
    get apiEndpoint() {
        return apiEndpointFor(this.options);
    }
    /** Make an HTTP GET request. Non-header options become query params. */
    async get(path, data = {}) {
        return this.request('GET', path, data);
    }
    /** Make an HTTP HEAD request. Non-header options become query params. */
    async head(path, data = {}) {
        return this.request('HEAD', path, data);
    }
    /** Make an HTTP POST request with a JSON:API body. */
    async post(path, data = {}) {
        return this.request('POST', path, data);
    }
    /** Make an HTTP PUT request with a JSON:API body. */
    async put(path, data = {}) {
        return this.request('PUT', path, data);
    }
    /** Make an HTTP PATCH request with a JSON:API body. */
    async patch(path, data = {}) {
        return this.request('PATCH', path, data);
    }
    /** Make an HTTP DELETE request. */
    async delete(path, data = {}) {
        return this.request('DELETE', path, data);
    }
    /**
     * Make an HTTP request to the Booqable API.
     *
     * For GET/HEAD the data object becomes the query string; for other
     * methods it is sent as the JSON:API request body. A `headers` key is
     * lifted into the request headers for every method. Returns the decoded
     * response document.
     *
     * @throws {BooqableError} for API errors or HTTP failures
     */
    async request(method, path, data = {}) {
        const { headers: extraHeaders, ...rest } = data;
        const httpMethod = method.toUpperCase();
        let url = this.urlFor(path);
        let body;
        if (httpMethod === 'GET' || httpMethod === 'HEAD') {
            const query = buildQuery(rest);
            if (query)
                url += `${url.includes('?') ? '&' : '?'}${query}`;
        }
        else if (Object.keys(rest).length > 0) {
            body = JsonApiSerializer.encode(rest);
        }
        try {
            const response = await this.performWithRetries(httpMethod, url, body, extraHeaders);
            return response.data;
        }
        catch (error) {
            if (error instanceof BooqableError)
                this.lastResponse = null;
            throw error;
        }
    }
    /**
     * Make a paginated GET request.
     *
     * Requests page stats and, when `autoPaginate` is enabled, keeps fetching
     * pages until every record is loaded (or the rate limit is exhausted).
     * Returns the concatenated `data` array.
     */
    async paginate(path, params = {}) {
        const options = { ...params };
        if (this.options.perPage || this.options.autoPaginate) {
            options.page = { ...(options.page ?? {}) };
            options.page.size ??= this.options.perPage ?? (this.options.autoPaginate ? 25 : undefined);
            options.page.number ??= 1;
            options.stats ??= { total: 'count' };
        }
        const document = await this.request('GET', path, options);
        const data = Array.isArray(document?.data) ? document.data : document?.data != null ? [document.data] : [];
        if (this.options.autoPaginate) {
            let total = this.totalFromStats();
            while (total != null && total > data.length && (this.rateLimit().remaining ?? 0) > 0) {
                options.page.number += 1;
                const nextDocument = await this.request('GET', path, { ...options });
                const nextData = nextDocument?.data;
                if (!Array.isArray(nextData) || nextData.length === 0)
                    break;
                data.push(...nextData);
                total = this.totalFromStats();
            }
        }
        return data;
    }
    /** Rate limit information from the last response. */
    rateLimit() {
        return RateLimit.fromHeaders(this.lastResponse?.headers);
    }
    /** The configured authentication strategy (custom > OAuth > API key > single-use). */
    auth() {
        if (this.authStrategy !== undefined)
            return this.authStrategy;
        const options = this.options;
        if (options.auth) {
            this.authStrategy = options.auth;
        }
        else if (options.clientId && options.clientSecret) {
            this.authStrategy = new OAuthAuth({
                clientId: options.clientId,
                clientSecret: options.clientSecret,
                apiEndpoint: this.apiEndpoint,
                redirectUri: options.redirectUri,
                readToken: options.readToken,
                writeToken: options.writeToken,
                aroundRefreshToken: options.aroundRefreshToken,
            });
        }
        else if (options.apiKey) {
            this.authStrategy = new ApiKeyAuth(options.apiKey);
        }
        else if (options.singleUseToken) {
            this.authStrategy = new SingleUseAuth({
                singleUseToken: options.singleUseToken,
                singleUseTokenAlgorithm: options.singleUseTokenAlgorithm,
                singleUseTokenPrivateKey: options.singleUseTokenPrivateKey || options.singleUseTokenSecret,
                singleUseTokenExpirationPeriod: options.singleUseTokenExpirationPeriod,
                singleUseTokenCompanyId: options.singleUseTokenCompanyId,
                singleUseTokenUserId: options.singleUseTokenUserId,
                apiEndpoint: this.apiEndpoint,
            });
        }
        else {
            this.authStrategy = null;
        }
        return this.authStrategy;
    }
    /** Waits before a retry; overridable in tests. */
    async sleep(milliseconds) {
        await new Promise((resolve) => setTimeout(resolve, milliseconds));
    }
    urlFor(path) {
        const relative = String(path).replace(/^\//, '');
        return `${this.apiEndpoint}/${relative}`;
    }
    defaultHeaders() {
        const headers = {
            Accept: this.options.defaultMediaType,
            'Content-Type': this.options.defaultMediaType,
        };
        if (this.options.userAgent)
            headers['User-Agent'] = this.options.userAgent;
        return headers;
    }
    async performWithRetries(method, url, body, extraHeaders) {
        const maxRetries = this.options.noRetries || !RETRY_OPTIONS.methods.includes(method) ? 0 : RETRY_OPTIONS.max;
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            if (attempt > 0) {
                const backoff = RETRY_OPTIONS.interval * RETRY_OPTIONS.backoffFactor ** (attempt - 1);
                await this.sleep(backoff + backoff * RETRY_OPTIONS.intervalRandomness * Math.random());
            }
            // Auth is re-applied per attempt: single-use tokens are unique per
            // request, and OAuth tokens may need a refresh between attempts.
            const context = {
                method,
                url,
                headers: { ...this.defaultHeaders(), ...(extraHeaders ?? {}) },
                body,
            };
            await this.auth()?.apply(context);
            if (this.options.debug)
                console.log(`[booqable] ${method} ${url}`);
            let response;
            try {
                response = await fetch(url, {
                    method,
                    headers: context.headers,
                    body: context.body,
                });
            }
            catch (error) {
                // Network failure — retry when attempts remain.
                lastError = error;
                continue;
            }
            const text = method === 'HEAD' ? '' : await response.text();
            if (this.options.debug)
                console.log(`[booqable] ${response.status} ${method} ${url}`);
            if (response.status >= 500 && attempt < maxRetries)
                continue;
            // Errors are raised from the raw response, before decoding — the
            // typed error parses the body itself (tolerating invalid JSON).
            raiseForResponse({
                status: response.status,
                headers: response.headers,
                body: text,
                url,
                method,
                requestBody: body,
            });
            const contentType = response.headers.get('content-type') || '';
            let decoded = text;
            if (/json/.test(contentType) || text.trim().startsWith('{')) {
                try {
                    decoded = JsonApiSerializer.decode(text);
                }
                catch {
                    decoded = text;
                }
            }
            this.lastResponse = {
                status: response.status,
                headers: response.headers,
                data: decoded,
                body: text,
                url,
                method,
            };
            return this.lastResponse;
        }
        throw lastError instanceof Error ? lastError : new Error(`Request failed: ${method} ${url}`);
    }
    totalFromStats() {
        const stats = this.lastResponse?.data?.meta?.stats;
        const count = stats?.total?.count;
        return typeof count === 'number' ? count : null;
    }
}
function buildQuery(params) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        appendQueryParam(search, key, value);
    }
    return search.toString();
}
function appendQueryParam(search, key, value) {
    if (value === undefined || value === null)
        return;
    if (Array.isArray(value)) {
        search.append(key, value.join(','));
    }
    else if (value instanceof Date) {
        search.append(key, value.toISOString());
    }
    else if (typeof value === 'object') {
        for (const [nestedKey, nestedValue] of Object.entries(value)) {
            appendQueryParam(search, `${key}[${nestedKey}]`, nestedValue);
        }
    }
    else {
        search.append(key, String(value));
    }
}
