# Usage – Booqable App

A Vite + React + Hono (Cloudflare Workers) starter for **custom Booqable apps**:
tools that run embedded in the Booqable back office and talk to the company's
Booqable account through its JSON:API.

## Project structure

- `src/` — React frontend using **Boomerang**, Booqable's design system.
- `worker/userRoutes.ts` — Hono routes. The Booqable wiring lives here; add new
  API routes below it. **Never modify `worker/index.ts` or `worker/core-utils.ts`.**
- `worker/booqable/` — Booqable integration internals (JWT verification, OAuth
  token exchange/refresh, API client). Treat as a library: use it, don't rewrite it.
- `src/lib/booqable.ts` — frontend helpers (`initBooqableSession`,
  `getBooqableStatus`, `booqableApi`).
- `docs/boomerang/` — the design system reference (foundations, components,
  brand assets). Read it before building UI.

## Boomerang design system (MUST follow)

- Import components from `@/components/ui/*` (button, input, textarea, label,
  checkbox, radio-group, switch, badge, tag, card, alert, tabs, tooltip, avatar,
  separator). Brand assets: `@/components/brand-logo`; theming:
  `@/components/theme-provider` and `@/components/theme-toggle`.
- **Use tokens, never raw values.** The palette, radii, type scale and
  elevation live in `tailwind.config.js`; the semantic light/dark values are
  CSS variables in `src/index.css`. Use classes that map to them
  (`bg-primary`, `text-muted-foreground`, `text-fg-muted`, `rounded-xl`,
  `text-display-md`, `shadow-md`) — no hex codes or pixel values.
- **Support light and dark.** Keep `ThemeProvider` mounted (see `src/main.tsx`)
  and use semantic tokens so both themes work; never hardcode one mode's color.
- **Extend, don't fork**: shared style changes belong in the token layer
  (`tailwind.config.js` / the CSS variables in `src/index.css`), not per-page
  overrides.

## Booqable integration

**Zero configuration.** No environment variables or API keys are needed — the
iframe token Booqable appends to the app's URL is the only credential.

Flow (already wired — keep it):
1. Booqable opens the app in an iframe with `?token=<JWT>`. The frontend calls
   `initBooqableSession()` on load (see `src/pages/HomePage.tsx`), which POSTs
   the token to `/api/booqable/session`.
2. The worker exchanges it at Booqable's session endpoint
   (`POST {api_host}/api/app_builder/sessions`) — Booqable verifies the
   signature and returns a short-lived API access token plus the company
   identity (slug, user email, currency context), stored in an HttpOnly cookie.
3. The frontend reaches the Booqable API through the authenticated proxy:
   `booqableApi('/orders?page[size]=5&sort=-created_at')` →
   `GET /api/booqable/proxy/orders?…` → `{api_host}/api/4/orders?…`.
   Sessions are short-lived; `booqableApi` renews once automatically on 401.

`GET /api/booqable/status` reports `{connected, company, user_email, currency}` —
use it to render helpful empty states (see the starter `HomePage.tsx`).

**Important — automated screenshots have no Booqable session.** The build
system inspects the app with a headless browser that opens the preview URL
without the iframe token, so `connected` is false there. Every screen must
render a complete, styled UI in that state (realistic empty states or clearly
labeled sample placeholders) — never a blank page, spinner-forever, or error.
Do not "fix" missing data you observe in screenshots; it is the expected
disconnected state.

**Deployed apps additionally receive** `BOOQABLE_HOST`, `BOOQABLE_CLIENT_ID`
and `BOOQABLE_CLIENT_SECRET` as worker secrets (Booqable sets them at publish).
The session exchange above remains the default auth path; the credentials are
for advanced flows — e.g. running the standard OAuth authorization-code flow
when the app later serves multiple companies. Never expose them to the
frontend or log them.

## Booqable JSON:API essentials

- Base path `/api/4` (JSON:API: `data`, `attributes`, `relationships`;
  `filter[...]`, `page[number|size]`, `sort`, `include` query params).
- Key resources: `orders`, `products`, `product_groups`, `customers`,
  `plannings` (pickups/returns), `stock_items`, `invoices`, `payments`,
  `locations`, `employees`.
- Full reference: https://developers.booqable.com
- Always render money using the session's `currency` context; amounts are in cents
  (`*_in_cents` attributes).

## Rules

- Keep the session bootstrap (`initBooqableSession()` on app load) in place.
- Keep the routes `/api/booqable/session`, `/api/booqable/status`,
  `/api/oauth/callback`, and `/api/booqable/proxy/*` intact.
- Never store or log the iframe token or access tokens anywhere else.
- Build the user's requested app in `src/` — the starter `HomePage.tsx` is a
  "Bo is building your app" placeholder; replace it with the requested app
  (add routes in `src/main.tsx`), keeping the `initBooqableSession()` bootstrap
  and a helpful state when `status.connected` is false.
- **DO NOT MODIFY CORS OR OVERRIDE ERROR HANDLERS.**
