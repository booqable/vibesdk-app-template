/**
 * Server-side Booqable API client: OAuth token exchange, refresh, and
 * authenticated requests against the company's JSON:API (`/api/4`).
 */
import type { Env } from '../core-utils';

export type BooqableEnv = Env & {
    BOOQABLE_HOST?: string;          // e.g. https://acme.booqable.com
    BOOQABLE_CLIENT_ID?: string;     // OAuth application uid
    BOOQABLE_CLIENT_SECRET?: string; // OAuth application secret (also signs iframe tokens)
};

export interface BooqableTokens {
    access_token: string;
    refresh_token?: string;
    created_at?: number;
    expires_in?: number;
}

export function booqableConfigured(env: BooqableEnv): boolean {
    return Boolean(env.BOOQABLE_HOST && env.BOOQABLE_CLIENT_ID && env.BOOQABLE_CLIENT_SECRET);
}

const TOKEN_PATH = '/api/boomerang/oauth/token';

async function tokenRequest(env: BooqableEnv, params: Record<string, string>): Promise<BooqableTokens | null> {
    const response = await fetch(`${env.BOOQABLE_HOST}${TOKEN_PATH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: env.BOOQABLE_CLIENT_ID ?? '',
            client_secret: env.BOOQABLE_CLIENT_SECRET ?? '',
            ...params
        })
    });
    if (!response.ok) return null;
    return response.json<BooqableTokens>();
}

/** Exchanges an authorization code (from /api/oauth/callback) for tokens. */
export async function exchangeCode(env: BooqableEnv, code: string, redirectUri: string): Promise<BooqableTokens | null> {
    return tokenRequest(env, { grant_type: 'authorization_code', code, redirect_uri: redirectUri });
}

/** Refreshes an expired access token. */
export async function refreshTokens(env: BooqableEnv, refreshToken: string): Promise<BooqableTokens | null> {
    return tokenRequest(env, { grant_type: 'refresh_token', refresh_token: refreshToken });
}

export interface BooqableResponse {
    response: Response;
    /** Present when the access token was refreshed — persist it back into the session cookie. */
    refreshedTokens?: BooqableTokens;
}

/**
 * Performs an authenticated JSON:API request (path is relative to `/api/4`,
 * e.g. `/orders?page[size]=5`). Retries once through a token refresh on 401.
 */
export async function booqableRequest(
    env: BooqableEnv,
    tokens: BooqableTokens,
    path: string,
    init: RequestInit = {}
): Promise<BooqableResponse> {
    const call = (accessToken: string) => fetch(`${env.BOOQABLE_HOST}/api/4${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init.headers ?? {}),
            Authorization: `Bearer ${accessToken}`
        }
    });

    let response = await call(tokens.access_token);
    if (response.status !== 401 || !tokens.refresh_token) return { response };

    const refreshed = await refreshTokens(env, tokens.refresh_token);
    if (!refreshed) return { response };

    response = await call(refreshed.access_token);
    return { response, refreshedTokens: refreshed };
}
