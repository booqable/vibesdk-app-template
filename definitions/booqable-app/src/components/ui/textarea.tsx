import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-20 w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-md text-foreground shadow-xs transition-colors outline-none',
        'placeholder:text-gray-400',
        'focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:bg-muted disabled:text-gray-400',
        'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/30',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
