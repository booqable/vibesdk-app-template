/**
 * Minimal JWT signing on top of Web Crypto (crypto.subtle), so it works in
 * Node.js, browsers, and edge runtimes without any dependency.
 *
 * Supports the algorithms Booqable request signing accepts:
 * HS256 (HMAC), RS256 (RSA, PKCS#8 PEM), and ES256 (ECDSA P-256, PKCS#8 PEM).
 */
export declare function base64UrlEncode(data: Uint8Array): string;
export declare function sha256(data: string | Uint8Array): Promise<Uint8Array>;
/** Strict (padded, non-url) base64 of a SHA-256 digest, matching Ruby's Base64.strict_encode64. */
export declare function base64Encode(data: Uint8Array): string;
/**
 * Signs a JWT with the given header, payload, algorithm, and key.
 *
 * RS256/ES256 keys must be PEM-encoded PKCS#8 private keys
 * (`-----BEGIN PRIVATE KEY-----`).
 */
export declare function signJwt(header: Record<string, unknown>, payload: Record<string, unknown>, algorithm: string, key: string): Promise<string>;
