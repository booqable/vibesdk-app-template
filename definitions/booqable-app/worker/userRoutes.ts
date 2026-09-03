import { Hono } from "hono";
import { Env } from './core-utils';

// -----------------------------------------------------------------------------
// Booqable server-side integration.
//
// This file MUST stay self-contained: the platform loads `userRoutes` through a
// dynamic import, so it is shipped as a standalone worker module. Any runtime
// `import` of another local file (e.g. a `./booqable/*` helper) would NOT be
// bundled and the deployed worker would fail with `No such module`. Keep every
// helper below inline — only the type-only `Env` import above is safe (types
// are erased at build time). Add your own routes at the bottom.
//
// Auth is header-based, not cookie-based: the app renders inside a cross-site
// Booqable iframe, where browsers block third-party cookie storage. The session
// exchange returns an opaque session handle; the frontend keeps it in memory
// (see `src/lib/booqable.ts`) and sends it as `Authorization: Bearer <handle>`
// on same-origin calls to this worker. Do NOT reintroduce cookies.
// -----------------------------------------------------------------------------

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
function unverifiedClaims(token: string): Record<string, unknown> | null {
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
async function exchangeIframeToken(token: string): Promise<BooqableSession | null> {
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

function sessionExpired(session: BooqableSession): boolean {
    return Date.now() >= session.expires_at - 30_000;
}

/**
 * Performs an authenticated JSON:API request (path is relative to `/api/4`,
 * e.g. `/orders?page[size]=5`).
 */
async function booqableRequest(session: BooqableSession, path: string, init: RequestInit = {}): Promise<Response> {
    return fetch(`${session.api_host}/api/4${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init.headers ?? {}),
            Authorization: `Bearer ${session.access_token}`
        }
    });
}

// The session handle is the session object, base64-encoded. It is opaque to the
// frontend (which only echoes it back) and readable only by this worker.
function encodeSession(session: BooqableSession): string {
    return btoa(JSON.stringify(session));
}

function decodeSession(handle: string): BooqableSession | null {
    try {
        return JSON.parse(atob(handle)) as BooqableSession;
    } catch {
        return null;
    }
}

// Reads the session from the `Authorization: Bearer <handle>` header the
// frontend attaches after the exchange.
function readSession(c: any): BooqableSession | null {
    const header = c.req.header('Authorization') ?? '';
    const handle = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!handle) return null;

    const session = decodeSession(handle);
    return session && !sessionExpired(session) ? session : null;
}

export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Booqable wiring below — keep these routes; add your own after them.
    // **DO NOT MODIFY CORS OR OVERRIDE ERROR HANDLERS**

    // Connection state for the frontend.
    app.get('/api/booqable/status', async (c) => {
        const session = readSession(c);

        return c.json({
            success: true,
            data: {
                connected: session !== null,
                company: session?.slug ?? null,
                user_email: session?.user_email ?? null,
                currency: session?.currency ?? null
            }
        });
    });

    // Called by the frontend on load with the `token` query param Booqable
    // appends to the iframe URL. Booqable verifies it and returns short-lived
    // API credentials; the frontend stores the returned `session` handle in
    // memory and sends it back as a Bearer token on subsequent calls.
    app.post('/api/booqable/session', async (c) => {
        const { token } = await c.req.json<{ token?: string }>().catch(() => ({ token: undefined }));
        if (!token) return c.json({ success: false, error: 'token is required' }, 400);

        const session = await exchangeIframeToken(token);
        if (!session) return c.json({ success: false, error: 'invalid token' }, 401);

        return c.json({
            success: true,
            data: {
                session: encodeSession(session),
                company: session.slug,
                user_email: session.user_email,
                currency: session.currency
            }
        });
    });

    // Registered OAuth redirect target (unused by the session flow — kept so
    // the manifest's redirect URI always lands somewhere sensible).
    app.get('/api/oauth/callback', (c) => c.redirect('/'));

    // Authenticated passthrough to the Booqable JSON:API (`/api/4/...`).
    // The frontend calls e.g. GET /api/booqable/proxy/orders?page[size]=5 with
    // the session handle as a Bearer token.
    app.all('/api/booqable/proxy/*', async (c) => {
        const session = readSession(c);
        if (!session) return c.json({ success: false, error: 'session expired' }, 401);

        const url = new URL(c.req.url);
        const path = url.pathname.replace('/api/booqable/proxy', '') + url.search;
        const response = await booqableRequest(session, path, {
            method: c.req.method,
            body: ['GET', 'HEAD'].includes(c.req.method) ? undefined : await c.req.raw.clone().text()
        });

        return new Response(response.body, {
            status: response.status,
            headers: { 'Content-Type': response.headers.get('Content-Type') ?? 'application/json' }
        });
    });
}
