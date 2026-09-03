import { TokenHash } from './types.js';
export interface OAuthClientOptions {
    apiEndpoint: string;
    clientId: string;
    clientSecret: string;
    redirectUri?: string;
}
/**
 * OAuth2 client for Booqable API authentication.
 *
 * Handles the authorization-code flow and refresh-token exchanges against
 * the Booqable token endpoint, mirroring Booqable::OAuthClient.
 */
export declare class OAuthClient {
    /** OAuth2 token endpoint path, relative to the API endpoint. */
    static TOKEN_ENDPOINT: string;
    private options;
    constructor(options: OAuthClientOptions);
    /**
     * Exchanges an authorization code (from the OAuth callback) for an
     * access token hash.
     */
    getTokenFromCode(code: string, { scope }?: {
        scope?: string;
    }): Promise<TokenHash>;
    /** Exchanges a refresh token for a new access token hash. */
    refreshToken(token: TokenHash): Promise<TokenHash>;
    /**
     * Normalizes a stored token hash: computes epoch-seconds `expires_at`
     * from `expires_in`/`created_at` when absent, and coerces Date/string
     * expiries to epoch seconds (e.g. an ORM datetime handed back by readToken).
     */
    static normalizeToken(token: TokenHash): TokenHash;
    private tokenRequest;
}
