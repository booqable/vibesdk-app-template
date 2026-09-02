# vibesdk-app-template

Booqable's starter template for the AI app builder (self-hosted
[VibeSDK](https://github.com/cloudflare/vibesdk) at booqableapps.com).

It packages two things into one VibeSDK template, `booqable-app`:

1. **Boomerang** — Booqable's design system (brand tokens, light/dark theming,
   and the component library), ported from the Figma-derived Next.js prototype
   to VibeSDK's `vite-reference` base (Vite + React + Hono worker, Tailwind v4).
2. **Booqable wiring** — iframe session verification (HS256 token from the
   back-office embed), OAuth code exchange + refresh against the company's
   Doorkeeper endpoints, and an authenticated proxy to the JSON:API (`/api/4`).

## Layout

Follows the [cloudflare/vibesdk-templates](https://github.com/cloudflare/vibesdk-templates)
definition format:

- `definitions/booqable-app.yaml` — template definition (base `vite-reference`,
  excludes the reference frontend, patches deps for Tailwind v4 + Base UI).
- `definitions/booqable-app/` — overlay files: `src/` (Boomerang + starter app),
  `worker/` (Booqable routes), `prompts/` (agent selection/usage guidance),
  `docs/boomerang/` (design-system reference for the agent), `public/brand/`.
- `scripts/deploy.sh` — builds and uploads all templates (upstream + this one)
  to the deployment's R2 bucket.

## Deploying to booqableapps.com

Prereqs: `git`, `python3`, `bun`, and `wrangler` authenticated against the
Booqable Cloudflare account (see `documentation/features/ai_app_builder_cloudflare_setup.md`
in booqable/booqable).

```sh
./scripts/deploy.sh                       # uploads to R2 bucket "vibesdk-templates"
R2_BUCKET_NAME=my-bucket ./scripts/deploy.sh
```

Then set `VIBESDK_APP_TEMPLATE=booqable-app` for the Rails app so
`App::AiProject::Create` selects this template for app projects.

## Runtime configuration of generated apps

Generated apps read three worker vars (unset ⇒ the starter screen shows a
"not configured" state):

- `BOOQABLE_HOST` — `https://{company}.booqable.com`
- `BOOQABLE_CLIENT_ID` / `BOOQABLE_CLIENT_SECRET` — the company-scoped app's
  OAuth credentials (created by `App::ProvisionCustom`).

Wiring these automatically into deployed apps is part of the publish flow
(roadmap in `documentation/features/ai_app_builder.md`).
