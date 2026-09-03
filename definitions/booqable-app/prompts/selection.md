## Template Selection – Booqable App

Use this template when the user wants:
- A **custom app for their Booqable account** — a tool that runs embedded in the
  Booqable back office (rental management software) and works with their rental
  data: orders, products, customers, inventory, availability.
- Anything described as "an app for my Booqable account", "a dashboard for my
  rentals", "a planner for pickups/returns/deliveries", or an internal tool for
  a rental business built through Booqable's AI app builder.
- UI that matches Booqable's look and feel — this template ships the full
  **shadcn/ui** component set re-themed to Booqable's **Boomerang** palette
  (brand blue #136deb, blue-tinted neutrals, light mode only).

What is pre-wired (keep it working):
- Iframe session bootstrap: Booqable embeds the app in an iframe with a signed
  `?token=` — the starter verifies it server-side and starts a session. Auth is
  header-based (a session handle kept in memory), not cookies, because the
  cross-site iframe blocks third-party cookie storage.
- An authenticated proxy to the Booqable JSON:API: the frontend calls
  `booqableApi('/orders?...')` and the worker forwards it with the session's
  access token.

Prefer another template when:
- The user wants a general-purpose website or an app unrelated to Booqable.
- The user wants a slide deck or presentation.
