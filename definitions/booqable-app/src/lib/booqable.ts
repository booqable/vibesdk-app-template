/**
 * Frontend Booqable helpers: iframe session bootstrap + Booqable API access
 * through the worker's authenticated proxy. No configuration needed — the
 * iframe token Booqable appends to the URL is the only credential.
 *
 * Auth is header-based, not cookie-based: the app renders in a cross-site
 * Booqable iframe where browsers block third-party cookie storage. The exchange
 * returns an opaque session handle that we keep in memory (below) and send as
 * `Authorization: Bearer <handle>` on same-origin calls to our own worker.
 *
 * Preferred API access is the `booqable` client below (the vendored
 * @booqable/client library, see ./booqable/VENDORED.md); `booqableApi()`
 * remains for raw JSON:API document access.
 */

import { BooqableClient, Unauthorized } from './booqable/index.js'

export interface BooqableStatus {
    connected: boolean;
    company: string | null;
    user_email: string | null;
    currency: string | null;
}

// In-memory session handle — deliberately not persisted (no cookie, no storage).
// It lives for the lifetime of the page and is re-fetched on reload / 401.
let sessionHandle: string | null = null;

function iframeToken(): string | null {
    return new URLSearchParams(window.location.search).get('token');
}

function authHeaders(): Record<string, string> {
    return sessionHandle ? { Authorization: `Bearer ${sessionHandle}` } : {};
}

/**
 * Call once on app load (and again when a request comes back 401). When the
 * app runs inside the Booqable back office, the iframe URL carries `?token=` —
 * the worker exchanges it with Booqable for short-lived API credentials and
 * returns a session handle we keep in memory. Safe to call outside the iframe
 * (no token → no-op).
 */
export async function initBooqableSession(): Promise<void> {
    const token = iframeToken();
    if (!token) return;

    const response = await fetch('/api/booqable/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    }).catch(() => null);
    if (!response?.ok) return;

    const body = await response.json().catch(() => null);
    if (body?.data?.session) sessionHandle = body.data.session as string;
}

export async function getBooqableStatus(): Promise<BooqableStatus | null> {
    const response = await fetch('/api/booqable/status', { headers: authHeaders() }).catch(() => null);
    if (!response?.ok) return null;
    const body = await response.json();
    return body?.data ?? null;
}

/**
 * The Booqable API client (vendored @booqable/client), routed through the
 * worker's authenticated proxy with the in-memory session handle. Responses
 * are deserialized JSON:API: attributes flattened onto the record, included
 * relationships populated, `*_at`/`*_on` fields parsed into Date objects.
 *
 *   const orders = await booqable.orders.list({
 *       include: 'customer',
 *       filter: { status: 'reserved' },
 *       sort: '-created_at',
 *       page: { size: 5 }
 *   });
 *   orders[0].customer.name
 *
 * Reading an attribute that is absent from the payload throws
 * `MissingAttribute` (typos fail loudly); attributes present with a null
 * value return null. Probe with `'key' in record` when a key may be absent.
 */
export const booqable = new BooqableClient({
    apiEndpoint: '/api/booqable/proxy',
    // Browsers forbid the User-Agent request header; don't attempt to set it.
    userAgent: '',
    auth: {
        async apply(request) {
            // Bootstrap the session lazily in case a request fires before the
            // app-load initBooqableSession() has completed (no token → no-op).
            if (!sessionHandle && iframeToken()) await initBooqableSession();
            Object.assign(request.headers, authHeaders());
        }
    }
});

// Session handles are short-lived: renew once and replay when the proxy
// answers 401. All client methods (resource proxies included) funnel through
// http.request, so patching it here covers every call.
const proxyHttp = booqable.http;
const originalRequest = proxyHttp.request.bind(proxyHttp);
proxyHttp.request = async (method: string, path: string, data: Record<string, any> = {}) => {
    try {
        return await originalRequest(method, path, data);
    } catch (error) {
        if (error instanceof Unauthorized && iframeToken()) {
            sessionHandle = null;
            await initBooqableSession();
            if (sessionHandle) return originalRequest(method, path, data);
        }
        throw error;
    }
};

/**
 * Requests a Booqable JSON:API resource (path relative to `/api/4`), e.g.
 *   booqableApi('/orders?page[size]=5&sort=-created_at')
 * Returns the raw parsed JSON:API document (no deserialization), or throws on
 * failure. Renews the session once on 401. Prefer the `booqable` client above;
 * use this for raw document access or non-GET calls with custom bodies.
 */
export async function booqableApi<T = any>(path: string, init: RequestInit = {}): Promise<T> {
    const send = () => fetch(`/api/booqable/proxy${path}`, {
        ...init,
        headers: { ...(init.headers ?? {}), ...authHeaders() }
    });

    let response = await send();

    if (response.status === 401 && iframeToken()) {
        await initBooqableSession();
        response = await send();
    }

    if (!response.ok) throw new Error(`Booqable API error ${response.status}`);
    return response.json() as Promise<T>;
}
