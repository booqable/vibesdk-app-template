import { AuthStrategy, RequestContext } from './strategy.js';
import { OAuthClient } from '../oauth-client.js';
import { AroundRefreshToken, ReadToken, WriteToken } from '../types.js';
export interface OAuthAuthOptions {
    clientId: string;
    clientSecret: string;
    apiEndpoint: string;
    redirectUri?: string;
    readToken?: ReadToken;
    writeToken?: WriteToken;
    aroundRefreshToken?: AroundRefreshToken;
}
/**
 * OAuth2 authentication.
 *
 * Reads the stored access token, refreshes it when it is expired or about
 * to expire, and adds it as a Bearer token. Mirrors
 * Booqable::Middleware::Auth::OAuth.
 */
export declare class OAuthAuth implements AuthStrategy {
    /**
     * Refresh the token this many seconds before it actually expires. A
     * request sent in the last moment of a token's life can still be
     * rejected once network latency or clock skew pushes it past the
     * expiry boundary server-side.
     */
    static REFRESH_BUFFER_SECONDS: number;
    readonly client: OAuthClient;
    private options;
    constructor(options: OAuthAuthOptions);
    apply(request: RequestContext): Promise<void>;
    /** Whether the token expires within the buffer, or has no usable expiry. */
    private expiresSoon;
    /**
     * Refreshes the expired token and persists the new one via writeToken.
     * A refresh failure always throws: the caller must never carry on with
     * a stale or missing token.
     */
    private refreshToken;
}
