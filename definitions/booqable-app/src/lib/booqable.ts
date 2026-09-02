/**
 * Frontend Booqable helpers: iframe session bootstrap + JSON:API access
 * through the worker's authenticated proxy. No configuration needed — the
 * iframe token Booqable appends to the URL is the only credential.
 */

export interface BooqableStatus {
    connected: boolean;
    company: string | null;
    user_email: string | null;
    currency: string | null;
}

function iframeToken(): string | null {
    return new URLSearchParams(window.location.search).get('token');
}

/**
 * Call once on app load (and again when a request comes back 401). When the
 * app runs inside the Booqable back office, the iframe URL carries `?token=` —
 * the worker exchanges it with Booqable for short-lived API credentials.
 * Safe to call outside the iframe (no token → no-op).
 */
export async function initBooqableSession(): Promise<void> {
    const token = iframeToken();
    if (!token) return;

    await fetch('/api/booqable/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    }).catch(() => undefined);
}

export async function getBooqableStatus(): Promise<BooqableStatus | null> {
    const response = await fetch('/api/booqable/status').catch(() => null);
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
    let response = await fetch(`/api/booqable/proxy${path}`, init);

    if (response.status === 401 && iframeToken()) {
        await initBooqableSession();
        response = await fetch(`/api/booqable/proxy${path}`, init);
    }

    if (!response.ok) throw new Error(`Booqable API error ${response.status}`);
    return response.json() as Promise<T>;
}
