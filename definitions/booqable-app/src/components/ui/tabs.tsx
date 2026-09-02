import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'

import { cn } from '@/lib/utils'

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root data-slot="tabs" className={cn('flex flex-col gap-4', className)} {...props} />
  )
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'relative flex items-center gap-1 border-b border-border',
        className,
      )}
      {...props}
    />
  )
}

function TabsTab({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-tab"
      className={cn(
        'inline-flex items-center gap-2 whitespace-nowrap px-3 pb-3 text-sm font-semibold text-muted-foreground transition-colors outline-none',
        'hover:text-secondary-foreground',
        'focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:ring-ring',
        'data-[selected]:text-primary',
        className,
      )}
      {...props}
    />
  )
}

function TabsIndicator({ className, ...props }: TabsPrimitive.Indicator.Props) {
  return (
    <TabsPrimitive.Indicator
      data-slot="tabs-indicator"
      className={cn(
        'absolute bottom-0 left-0 h-0.5 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] rounded-full bg-primary transition-all duration-200',
        className,
      )}
      {...props}
    />
  )
}

function TabsPanel({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-panel"
      className={cn('outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTab, TabsIndicator, TabsPanel }
