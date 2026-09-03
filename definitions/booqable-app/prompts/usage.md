# Usage – Booqable App

A Vite + React + Hono (Cloudflare Workers) starter for **custom Booqable apps**:
tools that run embedded in the Booqable back office and talk to the company's
Booqable account through its JSON:API.

## Project structure

- `src/` — React frontend using **Boomerang**, Booqable's design system.
- `worker/userRoutes.ts` — Hono routes **and** the Booqable integration
  (iframe-token exchange, session cookie, JSON:API proxy). Add new API routes
  below the existing ones. This file must stay **self-contained**: the platform
  loads it via a dynamic import, so it ships as a standalone worker module — a
  runtime `import` of any other local file breaks the deploy with `No such
  module`. Keep helpers inline here; the only safe local import is the type-only
  `Env` from `./core-utils`. **Never modify `worker/index.ts` or `worker/core-utils.ts`,
  and never add extra files under `worker/`.**
- `src/lib/booqable.ts` — the `booqable` API client plus frontend helpers
  (`initBooqableSession`, `getBooqableStatus`, `booqableApi`).
- `src/lib/booqable/` — the vendored `@booqable/client` library the client is
  built on. **Never edit or delete files in this directory.**
- `docs/boomerang/` — the design system reference (foundations, components,
  brand assets). Read it before building UI.

## Design system — shadcn/ui, themed to Booqable (MUST follow)

- The UI kit is the **standard shadcn/ui** set, re-themed to Booqable's
  Boomerang palette via tokens. Import from `@/components/ui/*` and use the
  normal shadcn APIs you already know — e.g. `Button` variants are
  `default` (brand blue) · `secondary` · `outline` · `ghost` · `destructive` ·
  `link`. The **full** set is available: button, input, textarea, label,
  checkbox, radio-group, switch, select, slider, toggle, toggle-group, badge,
  card, alert, alert-dialog, dialog, sheet, drawer, popover, hover-card,
  tooltip, dropdown-menu, context-menu, menubar, navigation-menu, command,
  tabs, accordion, collapsible, table, calendar, form, breadcrumb, pagination,
  avatar, progress, skeleton, separator, scroll-area, aspect-ratio, resizable,
  carousel, chart (recharts), input-otp, and toasts via `sonner`. **Do not
  hand-roll tables/selects/dialogs** — import the component. (No `sidebar` — an
  embedded app has no sidebar. Brand mark: `@/components/brand-logo`.)
- **Use tokens, never raw values.** Semantic colors are CSS variables in
  `src/index.css` (RGB channels) surfaced as Tailwind utilities in
  `tailwind.config.js`. Use the shadcn token classes — `bg-primary`,
  `text-primary-foreground`, `bg-secondary`, `text-muted-foreground`,
  `bg-card`, `border-border`, `bg-accent`, `rounded-lg`, `text-display-md`,
  `shadow-md`, and opacity modifiers like `bg-primary/90` — no hex codes or
  pixel values.
- **Light mode only.** Booqable only supports light mode. Do NOT add a dark
  theme, a theme toggle, or `dark:` utility variants; there is no `.dark` token
  set and no theme provider.
- **Extend, don't fork**: shared style changes belong in the token layer
  (`tailwind.config.js` / the CSS variables in `src/index.css`), not per-page
  overrides.
- **No Booqable-branded chrome.** The app renders inside the Booqable back
  office (iframe), so never add a Booqable logo, header bar, or footer — start
  with the app's own content edge-to-edge. `BrandLogo` exists only for rare
  standalone contexts.

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
   identity (slug, user email, currency context). The worker hands the frontend
   an opaque session handle; the frontend keeps it in memory and sends it as
   `Authorization: Bearer <handle>` on later calls. No cookies are used (the
   cross-site iframe blocks third-party cookie storage).
3. The frontend reaches the Booqable API through the authenticated proxy via
   the **`booqable` client** (preferred) or `booqableApi()` for raw documents.
   Both attach the session header and renew the session once on 401.

```typescript
import { booqable } from '@/lib/booqable';

// Records come back deserialized: attributes flattened onto the record,
// included relationships populated, *_at/*_on fields parsed into Date objects.
const orders = await booqable.orders.list({
    include: 'customer',
    filter: { status: 'reserved' },
    sort: '-created_at',
    page: { size: 5 }
});
orders[0].number
orders[0].customer.name

const order = await booqable.orders.find(id, { include: 'customer' });
const customer = await booqable.customers.create({ name: 'Jane', email: 'jane@x.com' });
await booqable.customers.update(customer.id, { name: 'Jane Doe' });
await booqable.customers.delete(customer.id);
```

   Every JSON:API resource is available the same way (`booqable.products`,
   `booqable.plannings`, `booqable.stock_items`, …). Failures throw typed
   errors importable from `@/lib/booqable/index.js` (`NotFound`,
   `UnprocessableEntity`, `Unauthorized`, … all subclasses of `BooqableError`,
   with `.errors` carrying JSON:API validation details). **Reading an attribute
   that is absent from the payload throws `MissingAttribute`** — typos fail
   loudly; attributes present with a null value return null, and
   `'key' in record` probes safely. When the app has no Booqable session
   (e.g. the disconnected screenshot state), calls throw `Unauthorized` — gate
   data fetching on `getBooqableStatus()`.

   For raw JSON:API documents or custom request bodies there is still
   `booqableApi('/orders?page[size]=5&sort=-created_at')` →
   `GET /api/booqable/proxy/orders?…` → `{api_host}/api/4/orders?…`.

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

- Keep the session bootstrap (`initBooqableSession()` on app load) in place, and
  always reach the API through the `booqable` client (or `booqableApi()`) so the
  session header is attached. Never edit the vendored `src/lib/booqable/`
  directory.
- Keep the routes `/api/booqable/session`, `/api/booqable/status`,
  `/api/oauth/callback`, and `/api/booqable/proxy/*` intact, and keep auth
  header-based — never add cookies (the cross-site iframe blocks them).
- Never store or log the iframe token or access tokens anywhere else.
- Build the user's requested app in `src/` — the starter `HomePage.tsx` is a
  "Bo is building your app" placeholder; replace it with the requested app
  (add routes in `src/main.tsx`), keeping the `initBooqableSession()` bootstrap
  and a helpful state when `status.connected` is false.
- **DO NOT MODIFY CORS OR OVERRIDE ERROR HANDLERS.**
