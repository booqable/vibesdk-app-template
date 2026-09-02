import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'

import { cn } from '@/lib/utils'

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn('grid gap-2.5', className)}
      {...props}
    />
  )
}

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio"
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-full border border-input bg-background shadow-xs transition-colors outline-none',
        'hover:border-primary',
        'focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring',
        'data-[checked]:border-primary data-[checked]:bg-primary',
        'disabled:pointer-events-none disabled:border-border disabled:bg-muted',
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator className="flex data-[unchecked]:hidden">
        <span className="size-2 rounded-full bg-primary-foreground" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
