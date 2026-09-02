# Components

All components are a copy-in library under `assets/starter/components/ui/` and are
imported through the `@/` alias. They are built on `@base-ui/react` primitives;
icons come from `lucide-react`. Source paths below are relative to the starter.

## Index

| Component | Import | Source |
| --- | --- | --- |
| Button | `@/components/ui/button` | `components/ui/button.tsx` |
| Input | `@/components/ui/input` | `components/ui/input.tsx` |
| Textarea | `@/components/ui/textarea` | `components/ui/textarea.tsx` |
| Label | `@/components/ui/label` | `components/ui/label.tsx` |
| Checkbox | `@/components/ui/checkbox` | `components/ui/checkbox.tsx` |
| RadioGroup | `@/components/ui/radio-group` | `components/ui/radio-group.tsx` |
| Switch | `@/components/ui/switch` | `components/ui/switch.tsx` |
| Badge | `@/components/ui/badge` | `components/ui/badge.tsx` |
| Tag | `@/components/ui/tag` | `components/ui/tag.tsx` |
| Card | `@/components/ui/card` | `components/ui/card.tsx` |
| Alert | `@/components/ui/alert` | `components/ui/alert.tsx` |
| Tabs | `@/components/ui/tabs` | `components/ui/tabs.tsx` |
| Tooltip | `@/components/ui/tooltip` | `components/ui/tooltip.tsx` |
| Avatar | `@/components/ui/avatar` | `components/ui/avatar.tsx` |
| Separator | `@/components/ui/separator` | `components/ui/separator.tsx` |
| BrandLogo | `@/components/brand-logo` | `components/brand-logo.tsx` |

## Button

`variant`: `primary` (default) · `secondary` · `tertiary` · `destructive` ·
`link` · `link-gray`. **No `ghost`, `outline`, or `default`.**
`size`: `sm` · `md` (default) · `lg` · `xl`.
`iconOnly?: boolean` (square icon buttons), `loading?: boolean` (shows a spinner
and disables). Extends `@base-ui/react` Button props.

```tsx
<Button>Create order</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="tertiary" size="sm">Details</Button>
<Button variant="destructive">Delete</Button>
<Button iconOnly aria-label="Settings"><Settings /></Button>
<Button loading>Saving</Button>
```

## Input / Textarea / Label

`Input` and `Textarea` wrap the base-ui `Input` / a native `textarea`; pass native
props (`type`, `placeholder`, `value`, `defaultValue`, `disabled`,
`aria-invalid`). Focus ring and invalid states are token-driven. Pair with `Label`
(`htmlFor` → field `id`). Label dims automatically for disabled siblings.

```tsx
<div className="grid gap-1.5">
  <Label htmlFor="email">Email address</Label>
  <Input id="email" type="email" placeholder="jane@acme.com" />
</div>
```

## Checkbox / RadioGroup / Switch

- `Checkbox` — base-ui Checkbox; use `checked`/`defaultChecked`/`onCheckedChange`,
  and `indeterminate` for the mixed state.
- `RadioGroup` + `RadioGroupItem` — set `defaultValue`/`value` on the group and a
  `value` on each item; wire each item to a `Label` via `id`.
- `Switch` — base-ui Switch; `checked`/`onCheckedChange`.

```tsx
<Checkbox id="deposit" defaultChecked />
<RadioGroup defaultValue="pickup">
  <div className="flex items-center gap-2.5">
    <RadioGroupItem value="pickup" id="r-pickup" />
    <Label htmlFor="r-pickup" className="font-normal">In-store pickup</Label>
  </div>
</RadioGroup>
<Switch checked={notify} onCheckedChange={setNotify} />
```

## Badge / Tag

`Badge` `variant`: `gray` (default) · `brand` · `success` · `warning` ·
`destructive`. **No `info` or `neutral`** — use `brand` / `gray`.
`size`: `sm` · `md` (default) · `lg`. `dot?: boolean` adds a leading status dot.

`Tag` is a square-cornered, removable chip for filters/tokens. Pass `onRemove` to
render the dismiss button.

```tsx
<Badge variant="success" dot>Confirmed</Badge>
<Badge variant="gray">Net 30</Badge>
<Tag onRemove={() => remove(id)}>Camera kit</Tag>
```

## Card

Compound: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`,
`CardFooter`. Rounded-xl surface with divided header/footer.

```tsx
<Card>
  <CardHeader>
    <CardTitle>New rental order</CardTitle>
    <CardDescription>Create a reservation.</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
  <CardFooter className="justify-end gap-3">
    <Button variant="secondary">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

## Alert

`variant`: `info` (default) · `success` · `warning` · `destructive`. Compound:
`Alert`, `AlertIcon`, `AlertContent`, `AlertTitle`, `AlertDescription`. Has
`role="alert"`; the icon slot is colored per variant.

```tsx
<Alert variant="info">
  <AlertIcon><Info /></AlertIcon>
  <AlertContent>
    <AlertTitle>Deposit held</AlertTitle>
    <AlertDescription>A refundable deposit is on file.</AlertDescription>
  </AlertContent>
</Alert>
```

## Tabs

`Tabs`, `TabsList`, `TabsTab`, `TabsIndicator`, `TabsPanel` (base-ui). Set
`defaultValue`/`value` on `Tabs`; `value` on each `TabsTab` and `TabsPanel`. Add
`TabsIndicator` **inside** `TabsList` for the animated underline.

```tsx
<Tabs defaultValue="details">
  <TabsList>
    <TabsTab value="details">Details</TabsTab>
    <TabsTab value="items">Items</TabsTab>
    <TabsIndicator />
  </TabsList>
  <TabsPanel value="details">…</TabsPanel>
  <TabsPanel value="items">…</TabsPanel>
</Tabs>
```

## Tooltip

`TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent` (base-ui). Wrap in
a `TooltipProvider`. To use a design-system component as the trigger, pass it via
the base-ui `render` prop (do not nest as children, and there is no `content` prop).

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant="tertiary" size="sm">Why?</Button>} />
    <TooltipContent>Deposit is refundable on return</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## Avatar / Separator

`Avatar`, `AvatarImage`, `AvatarFallback` (base-ui) — image with a fallback for
initials. `Separator` — horizontal (default) or `orientation="vertical"` divider.

```tsx
<Avatar>
  <AvatarImage src={user.avatar} alt={user.name} />
  <AvatarFallback>JC</AvatarFallback>
</Avatar>
<Separator />
```

## Common mistakes / never invent

- Don't use `variant="ghost"|"outline"|"default"` on `Button` — it has none.
  `tertiary` is the low-emphasis variant.
- Don't use `Badge variant="info"|"neutral"` — use `brand` / `gray`.
- Don't pass a `content` prop to `Tooltip`; use the compound parts + `render`.
- Don't hardcode colors, radii, or font sizes — use tokens
  (see `references/foundations.md`).
- Don't add variants, sizes, or props that aren't listed here. If a needed
  variant is missing, extend the component's `cva` config in the starter rather
  than faking a class on the call site.
