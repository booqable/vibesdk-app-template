import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { Env } from './core-utils';
import { BooqableSession, exchangeIframeToken, booqableRequest, sessionExpired } from './booqable/client';

const SESSION_COOKIE = 'bq_session';

// The app renders inside a Booqable back-office iframe → third-party cookie.
const COOKIE_OPTIONS = { httpOnly: true, secure: true, sameSite: 'None', path: '/' } as const;

function readSession(c: any): BooqableSession | null {
    const raw = getCookie(c, SESSION_COOKIE);
    if (!raw) return null;

    try {
        return JSON.parse(atob(raw)) as BooqableSession;
    } catch {
        return null;
    }
}

export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Booqable wiring below — keep these routes; add your own after them.
    // **DO NOT MODIFY CORS OR OVERRIDE ERROR HANDLERS**

    // Connection state for the frontend.
    app.get('/api/booqable/status', async (c) => {
        const session = readSession(c);
        const live = session !== null && !sessionExpired(session);

        return c.json({
            success: true,
            data: {
                connected: live,
                company: session?.slug ?? null,
                user_email: session?.user_email ?? null,
                currency: session?.currency ?? null
            }
        });
    });

    // Called by the frontend on load with the `token` query param Booqable
    // appends to the iframe URL. Booqable verifies it and returns short-lived
    // API credentials, stored in an HttpOnly cookie.
    app.post('/api/booqable/session', async (c) => {
        const { token } = await c.req.json<{ token?: string }>().catch(() => ({ token: undefined }));
        if (!token) return c.json({ success: false, error: 'token is required' }, 400);

        const session = await exchangeIframeToken(token);
        if (!session) return c.json({ success: false, error: 'invalid token' }, 401);

        setCookie(c, SESSION_COOKIE, btoa(JSON.stringify(session)), COOKIE_OPTIONS);
        return c.json({ success: true, data: { company: session.slug, user_email: session.user_email, currency: session.currency } });
    });

    // Registered OAuth redirect target (unused by the session flow — kept so
    // the manifest's redirect URI always lands somewhere sensible).
    app.get('/api/oauth/callback', (c) => c.redirect('/'));

    // Authenticated passthrough to the Booqable JSON:API (`/api/4/...`).
    // The frontend calls e.g. GET /api/booqable/proxy/orders?page[size]=5.
    app.all('/api/booqable/proxy/*', async (c) => {
        const session = readSession(c);
        if (!session || sessionExpired(session)) {
            deleteCookie(c, SESSION_COOKIE, { path: '/' });
            return c.json({ success: false, error: 'session expired' }, 401);
        }

        const url = new URL(c.req.url);
        const path = url.pathname.replace('/api/booqable/proxy', '') + url.search;
        const response = await booqableRequest(session, path, {
            method: c.req.method,
            body: ['GET', 'HEAD'].includes(c.req.method) ? undefined : await c.req.raw.clone().text()
        });

        if (response.status === 401) {
            deleteCookie(c, SESSION_COOKIE, { path: '/' });
        }

        return new Response(response.body, {
            status: response.status,
            headers: { 'Content-Type': response.headers.get('Content-Type') ?? 'application/json' }
        });
    });
}
