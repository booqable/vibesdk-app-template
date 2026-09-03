// Booqable deploy-safe worker entry.
//
// The stock vite-reference entry loads `userRoutes` through a `@vite-ignore`
// *dynamic* import. That works under the vite dev server (the sandbox preview),
// but `vite build` leaves the import dangling and never emits a `userRoutes`
// module — so the `wrangler deploy`'d production worker fails every /api/*
// request with `No such module "userRoutes"`. We import `userRoutes`
// **statically** instead, so it bundles into the single deployed `index.js`.
//
// Add your routes in `userRoutes.ts`, not here.

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Env } from './core-utils';
import { userRoutes } from './userRoutes';
export * from './core-utils';

export type ClientErrorReport = { message: string; url: string; timestamp: string } & Record<string, unknown>;

const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());

app.use('/api/*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowHeaders: ['Content-Type', 'Authorization'] }));

app.get('/api/health', (c) => c.json({ success: true, data: { status: 'healthy', timestamp: new Date().toISOString() } }));

app.post('/api/client-errors', async (c) => {
  try {
    const e = await c.req.json<ClientErrorReport>();
    console.error('[CLIENT ERROR]', JSON.stringify({ timestamp: e.timestamp || new Date().toISOString(), message: e.message, url: e.url, stack: e.stack, componentStack: e.componentStack, errorBoundary: e.errorBoundary }, null, 2));
    return c.json({ success: true });
  } catch (error) {
    console.error('[CLIENT ERROR HANDLER] Failed:', error);
    return c.json({ success: false, error: 'Failed to process' }, 500);
  }
});

// Register the app's routes (Booqable wiring + anything added in userRoutes.ts).
userRoutes(app);

app.notFound((c) => c.json({ success: false, error: 'Not Found' }, 404));
app.onError((err, c) => { console.error(`[ERROR] ${err}`); return c.json({ success: false, error: 'Internal Server Error' }, 500); });

console.log(`Server is running`);

export default {
  async fetch(request, env, ctx) {
    return app.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
