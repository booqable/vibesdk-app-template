import * as React from 'react'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

/*
  Boomerang Tag — square-cornered removable chips from the Figma "Tags" set,
  used for filters, tokens and multi-select values.
*/
function Tag({
  className,
  onRemove,
  children,
  ...props
}: React.ComponentProps<'span'> & { onRemove?: () => void }) {
  return (
    <span
      data-slot="tag"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-input bg-background py-0.5 pr-1 pl-2 text-sm font-medium text-secondary-foreground shadow-xs',
        className,
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className="inline-flex size-4 items-center justify-center rounded-[4px] text-gray-400 transition-colors hover:bg-muted hover:text-secondary-foreground focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none"
        >
          <X className="size-3" strokeWidth={2.5} />
        </button>
      )}
    </span>
  )
}

export { Tag }
