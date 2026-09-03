/**
 * Frontend Booqable helpers: iframe session bootstrap + JSON:API access
 * through the worker's authenticated proxy. No configuration needed — the
 * iframe token Booqable appends to the URL is the only credential.
 *
 * Auth is header-based, not cookie-based: the app renders in a cross-site
 * Booqable iframe where browsers block third-party cookie storage. The exchange
 * returns an opaque session handle that we keep in memory (below) and send as
 * `Authorization: Bearer <handle>` on same-origin calls to our own worker.
 */

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
 * Requests a Booqable JSON:API resource (path relative to `/api/4`), e.g.
 *   booqableApi('/orders?page[size]=5&sort=-created_at')
 * Renews the session once on 401 (tokens are short-lived). Returns the parsed
 * JSON:API document, or throws on failure.
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
