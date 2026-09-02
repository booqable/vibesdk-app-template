import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/*
  Boomerang Badge — pill status labels from the Figma "Badges" set.
  Subtle tonal fills with a matching dot; colors map to semantic tokens.
*/
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        gray: 'border-border bg-muted text-secondary-foreground',
        brand: 'border-brand-200 bg-brand-50 text-brand-700',
        success: 'border-transparent bg-success-subtle text-success-foreground',
        warning: 'border-transparent bg-warning-subtle text-warning-foreground',
        destructive: 'border-transparent bg-destructive-subtle text-destructive',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'gray',
      size: 'md',
    },
  },
)

const dotColor: Record<string, string> = {
  gray: 'bg-gray-400',
  brand: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
}

function Badge({
  className,
  variant = 'gray',
  size,
  dot = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { dot?: boolean }) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    >
      {dot && (
        <span
          className={cn('size-1.5 shrink-0 rounded-full', dotColor[variant ?? 'gray'])}
          aria-hidden="true"
        />
      )}
      {props.children}
    </span>
  )
}

export { Badge, badgeVariants }
