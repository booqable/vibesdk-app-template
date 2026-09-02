# Assets

## Brand marks

Real Booqable marks exported from the Figma library live in the starter under
`public/brand/`:

| Asset | Path | Notes |
| --- | --- | --- |
| Logomark (the "boomerang" glyph) | `public/brand/logomark.svg` | Monochrome `#131314`; inverts in dark mode. |
| Wordmark ("Booqable") | `public/brand/wordmark.svg` | Monochrome `#131314`; inverts in dark mode. |

Use the `BrandLogo` component (`@/components/brand-logo`) rather than referencing
the files directly:

```tsx
<BrandLogo />                     {/* logomark + wordmark, default h-6 */}
<BrandLogo showWordmark={false} /> {/* logomark only */}
<BrandLogo className="h-8" />      {/* scale via wrapper height */}
```

`BrandLogo` applies `dark:invert` so the marks stay legible in both themes.

## Rules

- **Never** substitute a placeholder or stock logo for the Booqable brand. If a
  larger or differently-colored mark is needed, export it from the Figma library
  and add it to `public/brand/`.
- Both provided marks are monochrome; do not recolor them to brand blue unless a
  brand-approved colored mark is supplied.
- Icons throughout the system use `lucide-react`. There is no bundled custom icon
  set from Figma; if the design calls for a specific Booqable glyph that lucide
  lacks, export it from Figma rather than approximating. `[VERIFY]` any
  icon-for-icon fidelity against the Figma source.
