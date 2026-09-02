import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { Env } from './core-utils';
import { verifyBooqableToken, signCookieValue, readCookieValue, BooqableIdentity } from './booqable/jwt';
import { booqableConfigured, booqableRequest, exchangeCode, BooqableEnv, BooqableTokens } from './booqable/client';

const IDENTITY_COOKIE = 'bq_identity';
const TOKENS_COOKIE = 'bq_tokens';

// The app renders inside a Booqable back-office iframe → third-party cookies.
const COOKIE_OPTIONS = { httpOnly: true, secure: true, sameSite: 'None', path: '/' } as const;

const secret = (env: BooqableEnv) => env.BOOQABLE_CLIENT_SECRET ?? '';

async function identityFrom(c: { req: { raw: Request } } & any): Promise<BooqableIdentity | null> {
    return readCookieValue<BooqableIdentity>(getCookie(c, IDENTITY_COOKIE), secret(c.env));
}

async function tokensFrom(c: any): Promise<BooqableTokens | null> {
    return readCookieValue<BooqableTokens>(getCookie(c, TOKENS_COOKIE), secret(c.env));
}

export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Booqable wiring below — keep these routes; add your own after them.
    // **DO NOT MODIFY CORS OR OVERRIDE ERROR HANDLERS**

    // Configuration/connection state for the frontend.
    app.get('/api/booqable/status', async (c) => {
        const env = c.env as BooqableEnv;
        const identity = await identityFrom(c);
        const tokens = await tokensFrom(c);

        return c.json({
            success: true,
            data: {
                configured: booqableConfigured(env),
                embedded: Boolean(identity),
                connected: Boolean(tokens),
                company: identity?.slug ?? null,
                user_email: identity?.user_email ?? null,
                currency: identity?.currency ?? null
            }
        });
    });

    // Called by the frontend on load with the `token` query param Booqable
    // appends to the iframe URL. Verifies it and starts a signed session.
    app.post('/api/booqable/session', async (c) => {
        const env = c.env as BooqableEnv;
        if (!secret(env)) return c.json({ success: false, error: 'Booqable is not configured' }, 503);

        const { token } = await c.req.json<{ token?: string }>().catch(() => ({ token: undefined }));
        if (!token) return c.json({ success: false, error: 'token is required' }, 400);

        const identity = await verifyBooqableToken(token, secret(env));
        if (!identity) return c.json({ success: false, error: 'invalid token' }, 401);

        setCookie(c, IDENTITY_COOKIE, await signCookieValue(identity, secret(env)), COOKIE_OPTIONS);
        return c.json({ success: true, data: identity });
    });

    // OAuth redirect target. Booqable's install flow sends the user here with
    // an authorization code; exchange it and store tokens in a signed cookie.
    app.get('/api/oauth/callback', async (c) => {
        const env = c.env as BooqableEnv;
        const code = c.req.query('code');
        if (!code || !booqableConfigured(env)) return c.redirect('/?oauth=failed');

        const redirectUri = `${new URL(c.req.url).origin}/api/oauth/callback`;
        const tokens = await exchangeCode(env, code, redirectUri);
        if (!tokens) return c.redirect('/?oauth=failed');

        setCookie(c, TOKENS_COOKIE, await signCookieValue(tokens, secret(env)), COOKIE_OPTIONS);
        return c.redirect('/?oauth=connected');
    });

    // Authenticated passthrough to the Booqable JSON:API (`/api/4/...`).
    // The frontend calls e.g. GET /api/booqable/proxy/orders?page[size]=5.
    app.all('/api/booqable/proxy/*', async (c) => {
        const env = c.env as BooqableEnv;
        const tokens = await tokensFrom(c);
        if (!tokens) return c.json({ success: false, error: 'not connected to Booqable' }, 401);

        const url = new URL(c.req.url);
        const path = url.pathname.replace('/api/booqable/proxy', '') + url.search;
        const { response, refreshedTokens } = await booqableRequest(env, tokens, path, {
            method: c.req.method,
            body: ['GET', 'HEAD'].includes(c.req.method) ? undefined : await c.req.raw.clone().text()
        });

        if (refreshedTokens) {
            setCookie(c, TOKENS_COOKIE, await signCookieValue(refreshedTokens, secret(env)), COOKIE_OPTIONS);
        }

        return new Response(response.body, {
            status: response.status,
            headers: { 'Content-Type': response.headers.get('Content-Type') ?? 'application/json' }
        });
    });
}
