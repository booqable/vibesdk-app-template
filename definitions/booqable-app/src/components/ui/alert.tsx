import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/*
  Boomerang Alert — inline notifications from the Figma "Alerts & notifications"
  patterns. Tonal container with an accent left edge per semantic status.
*/
const alertVariants = cva(
  'relative flex w-full gap-3 rounded-lg border p-4 text-sm',
  {
    variants: {
      variant: {
        info: 'border-brand-200 bg-brand-50 text-brand-900 [&_[data-slot=alert-icon]]:text-primary',
        success:
          'border-transparent bg-success-subtle text-success-foreground [&_[data-slot=alert-icon]]:text-success',
        warning:
          'border-transparent bg-warning-subtle text-warning-foreground [&_[data-slot=alert-icon]]:text-warning',
        destructive:
          'border-transparent bg-destructive-subtle text-destructive [&_[data-slot=alert-icon]]:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant, className }))}
      {...props}
    />
  )
}

function AlertIcon({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-icon"
      className={cn('mt-0.5 shrink-0 [&_svg]:size-5', className)}
      {...props}
    />
  )
}

function AlertContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-1 flex-col gap-1', className)} {...props} />
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('font-semibold', className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('opacity-90', className)} {...props} />
}

export { Alert, AlertIcon, AlertContent, AlertTitle, AlertDescription }
