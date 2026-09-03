import { cn } from '@/lib/utils'

/*
  Booqable brand lockup. Uses the real logomark + wordmark SVGs exported from
  the Boomerang Figma library (public/brand). Both marks are monochrome
  (#131314) — Booqable is light mode only, so no inversion is needed.
*/
export function BrandLogo({
  className,
  showWordmark = true,
}: {
  className?: string
  showWordmark?: boolean
}) {
  return (
    <span className={cn('inline-flex h-6 items-center gap-2', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logomark.svg"
        alt="Booqable"
        className="h-full w-auto"
      />
      {showWordmark && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/brand/wordmark.svg"
          alt=""
          aria-hidden="true"
          className="h-[72%] w-auto"
        />
      )}
    </span>
  )
}
