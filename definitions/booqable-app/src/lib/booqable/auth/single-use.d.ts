import { AuthStrategy, RequestContext } from './strategy.js';
export interface SingleUseAuthOptions {
    singleUseToken: string;
    singleUseTokenAlgorithm?: string;
    singleUseTokenPrivateKey?: string;
    singleUseTokenExpirationPeriod?: number;
    singleUseTokenCompanyId?: string;
    singleUseTokenUserId?: string;
    apiEndpoint?: string;
}
/**
 * Single-use JWT token authentication (request signing).
 *
 * Generates a unique JWT per request, binding it to the request method,
 * path, and body hash to prevent replay attacks. Mirrors
 * Booqable::Middleware::Auth::SingleUse.
 *
 * Supports HS256 (HMAC secret), RS256 (RSA), and ES256 (ECDSA) — RSA and
 * ECDSA keys must be PEM-encoded PKCS#8 (`-----BEGIN PRIVATE KEY-----`).
 *
 * @see https://developers.booqable.com/#authentication-request-signing
 */
export declare class SingleUseAuth implements AuthStrategy {
    /** Token kind identifier for the JWT header. */
    static KIND: string;
    /** Default domain for issuer URL construction. */
    static BOOQABLE_DOMAIN: string;
    private kid;
    private alg;
    private exp;
    private aud;
    private sub;
    private privateKey;
    private apiEndpoint?;
    constructor(options: SingleUseAuthOptions);
    apply(request: RequestContext): Promise<void>;
    private generateToken;
    /**
     * Hashes the HTTP method, full path (with query string), and body so
     * each token is bound to the specific request being made. Matches the
     * digest booqable.rb produces.
     */
    private generateData;
    private iss;
    private slug;
}
