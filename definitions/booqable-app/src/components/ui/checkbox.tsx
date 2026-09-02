import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { Check, Minus } from 'lucide-react'

import { cn } from '@/lib/utils'

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer flex size-5 shrink-0 items-center justify-center rounded-[6px] border border-input bg-background shadow-xs transition-colors outline-none',
        'hover:border-primary',
        'focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring',
        'data-[checked]:border-primary data-[checked]:bg-primary data-[checked]:text-primary-foreground',
        'data-[indeterminate]:border-primary data-[indeterminate]:bg-primary data-[indeterminate]:text-primary-foreground',
        'disabled:pointer-events-none disabled:border-border disabled:bg-muted',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current data-[unchecked]:hidden">
        {props.indeterminate ? (
          <Minus className="size-3.5" strokeWidth={3} />
        ) : (
          <Check className="size-3.5" strokeWidth={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
