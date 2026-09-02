# Foundations

All tokens are defined in `app/globals.css` (Tailwind v4 `@theme inline` + `:root`
/ `.dark` CSS variables). Use the Tailwind class that maps to a token; never write
raw hex or pixel values.

## Color

### Brand blue scale (exact Figma hex)

`brand-25 #f5f9ff` · `brand-50 #edf5ff` · `brand-100 #e2efff` · `brand-200 #ddebff`
· `brand-300 #bbdbfa` · `brand-400 #86c2ff` · `brand-500 #5a9fff` ·
`brand-600 #136deb` · `brand-700 #2466c3` · `brand-800 #3061a6` · `brand-900 #36537c`

Primary action color is `#136deb` (brand-600); hover is `#2466c3` (brand-700).
Classes: `bg-brand-50`, `text-brand-700`, `border-brand-200`, etc.

### Neutral (blue-tinted gray) scale

`gray-25 #f8fafc` → `gray-900 #131414`. Text, borders, and surfaces derive from
this scale. Classes: `bg-gray-50`, `text-gray-500`, `border-gray-200`.

### Semantic tokens (light / dark aware — always prefer these)

- Surface: `bg-background`, `text-foreground`, `bg-card`, `bg-popover`, `bg-muted`
- Action: `bg-primary` / `text-primary-foreground` / `bg-primary-hover`
- Text: `text-foreground`, `text-muted-foreground`, plus aliases `text-fg`,
  `text-fg-muted`, `text-fg-subtle`
- Border: `border-border` (default), `border-border-strong`, `border-input` (fields)
- Focus ring: `ring-ring` (`#5a9fff`)
- Link: `text-link`
- Status: `destructive` (`#e51c2c`), `success` (`#40a14f`), `warning` (`#e08700`),
  each with `-foreground` and `-subtle` variants for tonal fills.

Light and dark values live under `:root` and `.dark` in `app/globals.css`.
**`[VERIFY]` the dark palette** — the Figma library is light-first, so dark
neutrals (`#0c0e12`..`#2e3338`) were derived from its dark gray tokens.

## Typography

Type family is **Proxima Nova** in Figma. It is commercial and cannot be bundled;
the runtime stack is `var(--font-proxima), 'Mulish', ui-sans-serif, system-ui`.
The starter loads **Mulish** via `next/font` in `app/layout.tsx` as the closest
free match. **`[VERIFY]`** — to ship real Proxima Nova, self-host the licensed
font files and set `--font-proxima`.

Type scale (utility → size / line-height, from the Figma specimen):

- `text-display-2xl` 4.5rem/5.625rem · `text-display-xl` 3.75/4.5 ·
  `text-display-lg` 3/3.75 · `text-display-md` 2.25/2.75 · `text-display-sm`
  1.875/2.375 · `text-display-xs` 1.5/2
- `text-xl` 1.25/1.875 · `text-lg` 1.125/1.75 · `text-md` 1/1.5 ·
  `text-sm` 0.875/1.25 · `text-xs` 0.75/1.125

Display sizes carry `-0.02em` tracking. Weights: 400 (`font-normal`), 500
(`font-medium`), 600 (`font-semibold`), 700 (`font-bold`).

## Radii

Figma uses 8 (controls), 12 (cards), 20 (sections). Mapped: `rounded-md` 8px,
`rounded-xl` 12px, `rounded-3xl` 20px (`rounded-sm` 6px, `rounded-2xl` 16px).
Badges/pills use `rounded-full`.

## Elevation

`shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-lg` — subtle `rgba(10,13,18,…)`
shadows from the Figma button/card styles. Controls use `shadow-xs`; raised
cards/popovers use `shadow-md`/`shadow-lg`.

## Spacing & layout

Standard Tailwind 4px spacing scale. Compose layouts with flexbox/grid utilities
and the system's container (`mx-auto max-w-6xl px-4 sm:px-6`). Respect the type
scale and radii rather than arbitrary values.

## Theming

`ThemeProvider` (`@/components/theme-provider`) applies a `.dark` class on
`<html>` and persists the choice; `useTheme()` exposes `{ theme, setTheme,
resolvedTheme }`. `ThemeToggle` (`@/components/theme-toggle`) is a ready-made
light/dark switch. Both are mounted in the starter's `app/layout.tsx` /
`app/page.tsx`. Build every screen against semantic tokens so it works in both
modes automatically.
