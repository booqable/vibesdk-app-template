# Components

The UI kit is the **standard shadcn/ui** component set (Radix primitives +
Tailwind + `class-variance-authority`; icons from `lucide-react`), re-themed to
Booqable's Boomerang palette. Import through the `@/` alias:

```tsx
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog'
```

Use the APIs exactly as documented at **https://ui.shadcn.com** — the theming
below doesn't change any component's props, only its colors/rounding.

## Available components

`accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `badge`,
`breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`,
`collapsible`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`,
`form`, `hover-card`, `input`, `input-otp`, `label`, `menubar`,
`navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`,
`resizable`, `scroll-area`, `select`, `separator`, `sheet`, `skeleton`,
`slider`, `sonner` (toasts), `switch`, `table`, `tabs`, `textarea`,
`toggle`, `toggle-group`, `tooltip`.

Plus the Booqable-specific `BrandLogo` (`@/components/brand-logo`).

**Not included:** `sidebar` (an embedded Booqable app has no sidebar). There is
no separate "Tag" — use `Badge`.

Don't hand-roll primitives (tables, selects, dialogs, dropdowns, toasts) — the
component exists; import it.

## Variant conventions (unchanged from shadcn)

- **Button** — `variant`: `default` (brand blue) · `secondary` (quiet grey) ·
  `outline` · `ghost` · `destructive` · `link`. `size`: `default` · `sm` ·
  `lg` · `icon`.
- **Badge** — `variant`: `default` · `secondary` · `destructive` · `outline`.
- **Alert** — `variant`: `default` · `destructive`.
- Everything else uses its standard shadcn API.

## Booqable theming

- **Brand colour** is `--primary` (#136deb). `default` buttons, active states,
  focus rings and links are Booqable blue.
- **Light mode only.** There is no `.dark` block and no theme provider — never
  add a dark theme, a theme toggle, or `dark:` variants.
- **Style through tokens**, never raw values: `bg-primary`,
  `text-primary-foreground`, `bg-secondary`, `text-muted-foreground`, `bg-card`,
  `bg-accent`, `border-border`, `rounded-lg`, plus opacity modifiers like
  `bg-primary/90`. Type scale extras: `text-display-2xl … text-display-xs` for
  headings; body text uses the standard `text-sm` / `text-base` / `text-lg`.
- Shared visual changes belong in the token layer (`tailwind.config.js` /
  `src/index.css`), not per-component overrides.
- Font is **Mulish** (loaded in `main.tsx`), Booqable's closest free match for
  Proxima Nova.
