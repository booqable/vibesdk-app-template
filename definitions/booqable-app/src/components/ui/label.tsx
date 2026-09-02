import * as React from 'react'

import { cn } from '@/lib/utils'

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium text-secondary-foreground select-none',
        'has-[+_:disabled]:text-gray-400 peer-disabled:text-gray-400',
        className,
      )}
      {...props}
    />
  )
}

export { Label }
