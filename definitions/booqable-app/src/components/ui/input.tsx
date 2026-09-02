import { Input as InputPrimitive } from '@base-ui/react/input'

import { cn } from '@/lib/utils'

function Input({ className, ...props }: InputPrimitive.Props) {
  return (
    <InputPrimitive
      data-slot="input"
      className={cn(
        'flex h-10 w-full min-w-0 rounded-md border border-input bg-background px-3.5 py-2 text-md text-foreground shadow-xs transition-colors outline-none',
        'placeholder:text-gray-400 selection:bg-primary selection:text-primary-foreground',
        'focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:bg-muted disabled:text-gray-400',
        'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/30',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
