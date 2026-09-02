/**
 * Booqable iframe token verification + signed-cookie helpers.
 *
 * Booqable embeds the app in the back office and appends `?token=<JWT>` to the
 * iframe URL. The token is an HS256 JWT signed with the app's OAuth client
 * secret, carrying the company identity and formatting context.
 */

export interface BooqableIdentity {
    company_id: string;
    slug: string;
    user_email: string | null;
    currency?: string;
    currency_position?: string;
    currency_format?: string;
    distance_unit?: string;
    [key: string]: unknown;
}

const encoder = new TextEncoder();

function base64UrlDecode(input: string): Uint8Array {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
    const raw = atob(base64);
    return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

function base64UrlEncode(bytes: Uint8Array): string {
    let raw = '';
    bytes.forEach((byte) => { raw += String.fromCharCode(byte); });
    return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmacKey(secret: string): Promise<CryptoKey> {
    return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function hmacSign(secret: string, data: string): Promise<string> {
    const signature = await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(data));
    return base64UrlEncode(new Uint8Array(signature));
}

async function hmacVerify(secret: string, data: string, signature: string): Promise<boolean> {
    try {
        return crypto.subtle.verify('HMAC', await hmacKey(secret), base64UrlDecode(signature), encoder.encode(data));
    } catch {
        return false;
    }
}

/** Verifies a Booqable iframe JWT (HS256, signed with the OAuth client secret). */
export async function verifyBooqableToken(token: string, secret: string): Promise<BooqableIdentity | null> {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    if (!(await hmacVerify(secret, `${header}.${payload}`, signature))) return null;

    try {
        const claims = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload))) as BooqableIdentity & { exp?: number };
        if (claims.exp && claims.exp < Date.now() / 1000) return null;
        return claims;
    } catch {
        return null;
    }
}

/** Serializes a value into an HMAC-signed cookie payload. */
export async function signCookieValue(value: unknown, secret: string): Promise<string> {
    const data = base64UrlEncode(encoder.encode(JSON.stringify(value)));
    const signature = await hmacSign(secret, data);
    return `${data}.${signature}`;
}

/** Reads back a signed cookie payload; null when missing or tampered. */
export async function readCookieValue<T>(cookie: string | undefined, secret: string): Promise<T | null> {
    if (!cookie) return null;

    const [data, signature] = cookie.split('.');
    if (!data || !signature) return null;
    if (!(await hmacVerify(secret, data, signature))) return null;

    try {
        return JSON.parse(new TextDecoder().decode(base64UrlDecode(data))) as T;
    } catch {
        return null;
    }
}
