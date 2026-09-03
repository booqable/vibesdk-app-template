import { ClientOptions, LastResponse } from './types.js';
import { RateLimit } from './rate-limit.js';
import { AuthStrategy } from './auth/strategy.js';
interface RequestData {
    headers?: Record<string, string>;
    [key: string]: any;
}
/**
 * HTTP layer for {@link BooqableClient}.
 *
 * Handles authentication, retries, pagination, rate limiting, error
 * raising, and JSON:API response parsing on top of the global fetch —
 * no Node-specific APIs, so it runs in Node.js, browsers, and edge
 * runtimes such as Cloudflare Workers.
 */
export declare class HttpClient {
    readonly options: ClientOptions;
    lastResponse: LastResponse | null;
    private authStrategy;
    constructor(options: ClientOptions);
    /** The complete API endpoint URL. */
    get apiEndpoint(): string;
    /** Make an HTTP GET request. Non-header options become query params. */
    get(path: string, data?: RequestData): Promise<any>;
    /** Make an HTTP HEAD request. Non-header options become query params. */
    head(path: string, data?: RequestData): Promise<any>;
    /** Make an HTTP POST request with a JSON:API body. */
    post(path: string, data?: RequestData): Promise<any>;
    /** Make an HTTP PUT request with a JSON:API body. */
    put(path: string, data?: RequestData): Promise<any>;
    /** Make an HTTP PATCH request with a JSON:API body. */
    patch(path: string, data?: RequestData): Promise<any>;
    /** Make an HTTP DELETE request. */
    delete(path: string, data?: RequestData): Promise<any>;
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
    request(method: string, path: string, data?: RequestData): Promise<any>;
    /**
     * Make a paginated GET request.
     *
     * Requests page stats and, when `autoPaginate` is enabled, keeps fetching
     * pages until every record is loaded (or the rate limit is exhausted).
     * Returns the concatenated `data` array.
     */
    paginate(path: string, params?: RequestData): Promise<any[]>;
    /** Rate limit information from the last response. */
    rateLimit(): RateLimit;
    /** The configured authentication strategy (custom > OAuth > API key > single-use). */
    auth(): AuthStrategy | null;
    /** Waits before a retry; overridable in tests. */
    sleep(milliseconds: number): Promise<void>;
    private urlFor;
    private defaultHeaders;
    private performWithRetries;
    private totalFromStats;
}
export {};
