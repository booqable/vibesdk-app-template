/**
 * Server-side Booqable integration.
 *
 * The app needs no pre-configured secrets: Booqable embeds it in an iframe
 * with a signed `?token=`, and the worker exchanges that token at Booqable's
 * public endpoint (`POST {api_host}/api/app_builder/sessions`) for short-lived
 * API credentials plus the company identity.
 */

export interface BooqableSession {
    access_token: string;
    api_host: string;
    /** Epoch ms after which the access token is expired. */
    expires_at: number;
    company_id: string;
    slug: string;
    user_email: string | null;
    currency?: string;
    currency_position?: string;
    currency_format?: string;
    distance_unit?: string;
}

function base64UrlDecode(input: string): string {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
    return atob(base64);
}

/** Reads the (unverified) claims from the iframe JWT — verification happens on Booqable. */
export function unverifiedClaims(token: string): Record<string, unknown> | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    try {
        return JSON.parse(base64UrlDecode(parts[1]));
    } catch {
        return null;
    }
}

/**
 * Exchanges the iframe token for a session. The exchange endpoint host comes
 * from the token's own `api_host` claim; Booqable verifies the signature, so a
 * forged claim can only ever yield the forger's own credentials.
 */
export async function exchangeIframeToken(token: string): Promise<BooqableSession | null> {
    const claims = unverifiedClaims(token);
    const apiHost = typeof claims?.api_host === 'string' ? claims.api_host : null;
    if (!apiHost || !/^https?:\/\//.test(apiHost)) return null;

    const response = await fetch(`${apiHost}/api/app_builder/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    }).catch(() => null);
    if (!response?.ok) return null;

    const body = await response.json<{ data?: Record<string, unknown> }>().catch(() => null);
    const data = body?.data;
    if (!data?.access_token) return null;

    return {
        access_token: String(data.access_token),
        api_host: String(data.api_host ?? apiHost),
        expires_at: Date.now() + Number(data.expires_in ?? 3600) * 1000,
        company_id: String(data.company_id ?? ''),
        slug: String(data.slug ?? ''),
        user_email: (data.user_email as string | null) ?? null,
        currency: data.currency as string | undefined,
        currency_position: data.currency_position as string | undefined,
        currency_format: data.currency_format as string | undefined,
        distance_unit: data.distance_unit as string | undefined
    };
}

export function sessionExpired(session: BooqableSession): boolean {
    return Date.now() >= session.expires_at - 30_000;
}

/**
 * Performs an authenticated JSON:API request (path is relative to `/api/4`,
 * e.g. `/orders?page[size]=5`).
 */
export async function booqableRequest(session: BooqableSession, path: string, init: RequestInit = {}): Promise<Response> {
    return fetch(`${session.api_host}/api/4${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init.headers ?? {}),
            Authorization: `Bearer ${session.access_token}`
        }
    });
}
