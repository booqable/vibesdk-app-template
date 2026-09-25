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

import { toast } from 'sonner'

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

export type FlashType = 'success' | 'error';

// The back office loads the app in a cross-origin iframe, so the referrer the
// browser sends carries the host's origin (and nothing more). Fall back to any
// origin when the referrer is withheld; the payload is only a toast message.
function hostOrigin(): string {
    try {
        return document.referrer ? new URL(document.referrer).origin : '*';
    } catch {
        return '*';
    }
}

/**
 * Reports the outcome of an action with the same toast the rest of Booqable
 * uses. Inside the back office the message is handed to the host page, which
 * renders it above the iframe like it does for every other app. Standalone
 * (direct preview, automated screenshots) it falls back to a local toast so the
 * feedback is still visible.
 *
 *   await booqable.orders.update(order.id, { tag_list: ['priority'] });
 *   flash('success', 'Order marked as priority');
 */
export function flash(type: FlashType, message: string): void {
    if (window.parent !== window) {
        window.parent.postMessage(
            { eventName: 'SET_FLASH_MESSAGE', payload: { type, message } },
            hostOrigin()
        );
        return;
    }

    toast[type](message);
}

let iframeHeightObserved = false;

/**
 * Booqable embeds the app in an iframe that keeps its initial height until the
 * app reports its own, so anything below that height is clipped. Call once on
 * app load (`src/main.tsx`); it keeps the iframe sized to the page from then
 * on. No-op outside an iframe.
 */
export function observeIframeHeight(): void {
    if (window.parent === window || iframeHeightObserved) return;
    iframeHeightObserved = true;

    let frame = 0;
    let reportedHeight: number | null = null;

    // `scrollHeight` leaves out the body's own margins.
    const contentHeight = () => {
        const { marginTop, marginBottom } = getComputedStyle(document.body);
        return Math.ceil(document.body.scrollHeight + parseFloat(marginTop) + parseFloat(marginBottom));
    };

    const report = () => {
        const height = contentHeight();
        if (height === reportedHeight) return;

        reportedHeight = height;
        window.parent.postMessage({ eventName: 'SET_IFRAME_HEIGHT', payload: { height } }, hostOrigin());
    };

    const scheduleReport = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(report);
    };

    new ResizeObserver(scheduleReport).observe(document.body);

    // Catches content that overflows the body box, such as a popover.
    new MutationObserver(scheduleReport).observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true
    });

    scheduleReport();
}
