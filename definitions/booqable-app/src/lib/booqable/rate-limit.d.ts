/**
 * Rate limit information from API responses.
 *
 * Contains rate limiting information extracted from HTTP response headers.
 * This information is available when rate limit errors occur, or from
 * {@link BooqableClient.rateLimit} to monitor API usage.
 */
export declare class RateLimit {
    /** Max tries per rate limit period. */
    limit: number | null;
    /** Remaining tries per rate limit period. */
    remaining: number | null;
    /** Number of seconds until the rate limit resets. */
    resetsIn: number | null;
    /**
     * Extract rate limit information from HTTP response headers.
     * Falls back to a value of 1 for missing headers, matching booqable.rb.
     */
    static fromHeaders(headers: Headers | Record<string, string> | undefined | null): RateLimit;
}
