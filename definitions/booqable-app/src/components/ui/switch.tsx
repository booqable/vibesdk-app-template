import { Switch as SwitchPrimitive } from '@base-ui/react/switch'

import { cn } from '@/lib/utils'

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-gray-200 p-0.5 transition-colors outline-none',
        'focus-visible:ring-[3px] focus-visible:ring-ring',
        'data-[checked]:bg-primary',
        'disabled:pointer-events-none disabled:opacity-60',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-4 rounded-full bg-background shadow-sm ring-0 transition-transform data-[checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
